-- ENUMS
DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','gerente','vendedor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  avatar_url text,
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.profiles AS profile
SET email = COALESCE(
  (SELECT auth_user.email FROM auth.users AS auth_user WHERE auth_user.id = profile.id),
  CONCAT('legacy-', profile.id::text, '@nexo.invalid')
)
WHERE profile.email IS NULL;
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_key ON public.profiles (lower(email));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_gerente()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'gerente');
$$;

CREATE OR REPLACE FUNCTION public.team_member_ids(_uid uuid)
RETURNS TABLE (id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _uid
  UNION
  SELECT p.id FROM public.profiles p WHERE p.manager_id = _uid;
$$;

CREATE OR REPLACE FUNCTION public.can_access_owner(_owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
    OR _owner = auth.uid()
    OR (public.has_role(auth.uid(), 'gerente')
        AND _owner IN (SELECT t.id FROM public.team_member_ids(auth.uid()) t));
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PROFILES POLICIES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_admin" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated
  USING (public.is_admin());

-- USER ROLES POLICIES
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'vendedor')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- COMPANIES
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  website text,
  phone text,
  address text,
  city text,
  country text,
  employee_count int,
  annual_revenue numeric,
  status text NOT NULL DEFAULT 'prospecto' CHECK (status IN ('prospecto','activo','inactivo','churn')),
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "companies_select" ON public.companies FOR SELECT TO authenticated
  USING (public.can_access_owner(owner_id) AND (deleted_at IS NULL OR public.is_admin()));
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "companies_update" ON public.companies FOR UPDATE TO authenticated
  USING (public.can_access_owner(owner_id)) WITH CHECK (public.can_access_owner(owner_id));
CREATE POLICY "companies_delete" ON public.companies FOR DELETE TO authenticated
  USING (public.can_access_owner(owner_id));

-- CONTACTS
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  mobile text,
  job_title text,
  is_primary boolean NOT NULL DEFAULT false,
  lifecycle_stage text NOT NULL DEFAULT 'lead' CHECK (lifecycle_stage IN ('lead','contactado','calificado','oportunidad','cliente','perdido')),
  source text CHECK (source IN ('web','referido','evento','llamada_fria','redes','otro')),
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "contacts_select" ON public.contacts FOR SELECT TO authenticated
  USING (public.can_access_owner(owner_id) AND (deleted_at IS NULL OR public.is_admin()));
CREATE POLICY "contacts_insert" ON public.contacts FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "contacts_update" ON public.contacts FOR UPDATE TO authenticated
  USING (public.can_access_owner(owner_id)) WITH CHECK (public.can_access_owner(owner_id));
CREATE POLICY "contacts_delete" ON public.contacts FOR DELETE TO authenticated
  USING (public.can_access_owner(owner_id));

-- PIPELINES / STAGES
CREATE TABLE public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipelines TO authenticated;
GRANT ALL ON public.pipelines TO service_role;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER pipelines_updated_at BEFORE UPDATE ON public.pipelines FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "pipelines_select" ON public.pipelines FOR SELECT TO authenticated USING (true);
CREATE POLICY "pipelines_admin" ON public.pipelines FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  position int NOT NULL,
  default_probability int NOT NULL DEFAULT 0 CHECK (default_probability BETWEEN 0 AND 100),
  type text NOT NULL DEFAULT 'open' CHECK (type IN ('open','won','lost')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stages TO authenticated;
GRANT ALL ON public.stages TO service_role;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER stages_updated_at BEFORE UPDATE ON public.stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "stages_select" ON public.stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "stages_admin" ON public.stages FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- DEALS
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id),
  stage_id uuid NOT NULL REFERENCES public.stages(id),
  amount numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'COP',
  probability int NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date date,
  position int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','won','lost')),
  lost_reason text,
  closed_at timestamptz,
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "deals_select" ON public.deals FOR SELECT TO authenticated
  USING (public.can_access_owner(owner_id) AND (deleted_at IS NULL OR public.is_admin()));
CREATE POLICY "deals_insert" ON public.deals FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "deals_update" ON public.deals FOR UPDATE TO authenticated
  USING (public.can_access_owner(owner_id)) WITH CHECK (public.can_access_owner(owner_id));
CREATE POLICY "deals_delete" ON public.deals FOR DELETE TO authenticated
  USING (public.can_access_owner(owner_id));

-- ACTIVITIES
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('llamada','reunion','email','tarea','nota')),
  subject text NOT NULL,
  description text,
  due_at timestamptz,
  completed_at timestamptz,
  priority text NOT NULL DEFAULT 'media' CHECK (priority IN ('baja','media','alta')),
  assigned_to uuid NOT NULL REFERENCES public.profiles(id),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "activities_select" ON public.activities FOR SELECT TO authenticated
  USING (public.can_access_owner(assigned_to) OR public.can_access_owner(created_by));
CREATE POLICY "activities_insert" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (assigned_to = auth.uid() OR public.can_access_owner(assigned_to)));
CREATE POLICY "activities_update" ON public.activities FOR UPDATE TO authenticated
  USING (public.can_access_owner(assigned_to) OR public.can_access_owner(created_by))
  WITH CHECK (public.can_access_owner(assigned_to) OR public.can_access_owner(created_by));
CREATE POLICY "activities_delete" ON public.activities FOR DELETE TO authenticated
  USING (public.can_access_owner(assigned_to) OR public.can_access_owner(created_by));

-- DEAL STAGE HISTORY
CREATE TABLE public.deal_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES public.stages(id) ON DELETE SET NULL,
  to_stage_id uuid NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.deal_stage_history TO authenticated;
GRANT ALL ON public.deal_stage_history TO service_role;
ALTER TABLE public.deal_stage_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deal_stage_history_select" ON public.deal_stage_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND public.can_access_owner(d.owner_id)));

-- DEAL STAGE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_deal_stage_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_stage_history (deal_id, from_stage_id, to_stage_id, changed_by)
    VALUES (NEW.id, NULL, NEW.stage_id, auth.uid());
    RETURN NEW;
  END IF;
  IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
    INSERT INTO public.deal_stage_history (deal_id, from_stage_id, to_stage_id, changed_by)
    VALUES (NEW.id, OLD.stage_id, NEW.stage_id, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.apply_deal_stage_defaults()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record;
BEGIN
  IF TG_OP = 'INSERT' OR NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
    SELECT * INTO s FROM public.stages WHERE id = NEW.stage_id;
    IF s.id IS NOT NULL THEN
      NEW.probability := s.default_probability;
      IF s.type = 'won' THEN
        NEW.status := 'won';
        NEW.closed_at := COALESCE(NEW.closed_at, now());
      ELSIF s.type = 'lost' THEN
        NEW.status := 'lost';
        NEW.closed_at := COALESCE(NEW.closed_at, now());
      ELSE
        NEW.status := 'open';
        NEW.closed_at := NULL;
        NEW.lost_reason := NULL;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER deals_stage_defaults BEFORE INSERT OR UPDATE ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.apply_deal_stage_defaults();
CREATE TRIGGER deals_stage_history AFTER INSERT OR UPDATE ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.handle_deal_stage_change();

-- TAGS
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_select" ON public.tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "tags_admin" ON public.tags FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.taggables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  taggable_type text NOT NULL CHECK (taggable_type IN ('contact','company','deal')),
  taggable_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tag_id, taggable_type, taggable_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.taggables TO authenticated;
GRANT ALL ON public.taggables TO service_role;
ALTER TABLE public.taggables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "taggables_select" ON public.taggables FOR SELECT TO authenticated USING (true);
CREATE POLICY "taggables_write" ON public.taggables FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- INDEXES
CREATE INDEX idx_companies_owner ON public.companies (owner_id);
CREATE INDEX idx_contacts_owner ON public.contacts (owner_id);
CREATE INDEX idx_contacts_company ON public.contacts (company_id);
CREATE INDEX idx_deals_owner ON public.deals (owner_id);
CREATE INDEX idx_deals_stage ON public.deals (stage_id);
CREATE INDEX idx_activities_assigned ON public.activities (assigned_to);
CREATE INDEX idx_stage_history_deal ON public.deal_stage_history (deal_id);

-- SEED
INSERT INTO public.pipelines (id, name, is_default)
VALUES ('11111111-1111-1111-1111-111111111111', 'Ventas B2B', true);

INSERT INTO public.stages (pipeline_id, name, position, default_probability, type) VALUES
('11111111-1111-1111-1111-111111111111','Prospecto',1,10,'open'),
('11111111-1111-1111-1111-111111111111','Contacto inicial',2,25,'open'),
('11111111-1111-1111-1111-111111111111','Calificado',3,40,'open'),
('11111111-1111-1111-1111-111111111111','Propuesta enviada',4,60,'open'),
('11111111-1111-1111-1111-111111111111','Negociación',5,80,'open'),
('11111111-1111-1111-1111-111111111111','Ganado',6,100,'won'),
('11111111-1111-1111-1111-111111111111','Perdido',7,0,'lost');
