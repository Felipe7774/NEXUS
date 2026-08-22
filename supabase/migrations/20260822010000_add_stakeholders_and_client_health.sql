-- CLIENT HEALTH FIELDS (companies)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS needs_summary text,
  ADD COLUMN IF NOT EXISTS objectives text,
  ADD COLUMN IF NOT EXISTS satisfaction_score smallint CHECK (satisfaction_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS churn_risk_level text NOT NULL DEFAULT 'bajo' CHECK (churn_risk_level IN ('bajo','medio','alto')),
  ADD COLUMN IF NOT EXISTS next_recommended_action text,
  ADD COLUMN IF NOT EXISTS next_recommended_action_due date;

-- CLIENT DOCUMENTS
CREATE TABLE public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'otro' CHECK (file_type IN ('cotizacion','contrato','factura','otro')),
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT client_documents_owner_check CHECK (company_id IS NOT NULL OR contact_id IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_documents TO authenticated;
GRANT ALL ON public.client_documents TO service_role;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_documents_select" ON public.client_documents FOR SELECT TO authenticated
  USING (
    (company_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND public.can_access_owner(c.owner_id)))
    OR (contact_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.contacts ct WHERE ct.id = contact_id AND public.can_access_owner(ct.owner_id)))
  );
CREATE POLICY "client_documents_insert" ON public.client_documents FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "client_documents_delete" ON public.client_documents FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_admin());

CREATE INDEX idx_client_documents_company ON public.client_documents (company_id);
CREATE INDEX idx_client_documents_contact ON public.client_documents (contact_id);

-- STAKEHOLDERS
CREATE TABLE public.stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  relationship_type text NOT NULL DEFAULT 'otro' CHECK (relationship_type IN ('decisor','tecnico','economico','usuario_final','otro')),
  stakeholder_type text NOT NULL DEFAULT 'cliente' CHECK (stakeholder_type IN ('interno','cliente','proveedor','regulador')),
  power_level text NOT NULL DEFAULT 'medio' CHECK (power_level IN ('bajo','medio','alto')),
  interest_level text NOT NULL DEFAULT 'medio' CHECK (interest_level IN ('bajo','medio','alto')),
  influence_level text CHECK (influence_level IN ('bajo','medio','alto')),
  position text NOT NULL DEFAULT 'neutral' CHECK (position IN ('promotor','neutral','indeciso','opositor')),
  decision_authority boolean NOT NULL DEFAULT false,
  needs_expectations text,
  main_concerns text,
  communication_strategy text,
  contact_frequency text CHECK (contact_frequency IN ('semanal','quincenal','mensual','trimestral')),
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  next_action text,
  next_action_due date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, deal_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stakeholders TO authenticated;
GRANT ALL ON public.stakeholders TO service_role;
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER stakeholders_updated_at BEFORE UPDATE ON public.stakeholders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "stakeholders_select" ON public.stakeholders FOR SELECT TO authenticated
  USING (public.can_access_owner(owner_id));
CREATE POLICY "stakeholders_insert" ON public.stakeholders FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "stakeholders_update" ON public.stakeholders FOR UPDATE TO authenticated
  USING (public.can_access_owner(owner_id)) WITH CHECK (public.can_access_owner(owner_id));
CREATE POLICY "stakeholders_delete" ON public.stakeholders FOR DELETE TO authenticated
  USING (public.can_access_owner(owner_id));

CREATE INDEX idx_stakeholders_company ON public.stakeholders (company_id);
CREATE INDEX idx_stakeholders_deal ON public.stakeholders (deal_id);
CREATE INDEX idx_stakeholders_owner ON public.stakeholders (owner_id);

-- STAKEHOLDER RELATIONSHIPS (for the relationship graph)
CREATE TABLE public.stakeholder_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id_a uuid NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  stakeholder_id_b uuid NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'relacionado_con' CHECK (relationship_type IN ('reporta_a','influye_sobre','par_de','relacionado_con')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stakeholder_relationships_distinct CHECK (stakeholder_id_a <> stakeholder_id_b),
  UNIQUE (stakeholder_id_a, stakeholder_id_b, relationship_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stakeholder_relationships TO authenticated;
GRANT ALL ON public.stakeholder_relationships TO service_role;
ALTER TABLE public.stakeholder_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stakeholder_relationships_select" ON public.stakeholder_relationships FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.stakeholders s WHERE s.id = stakeholder_id_a AND public.can_access_owner(s.owner_id))
    OR EXISTS (SELECT 1 FROM public.stakeholders s WHERE s.id = stakeholder_id_b AND public.can_access_owner(s.owner_id))
  );
CREATE POLICY "stakeholder_relationships_write" ON public.stakeholder_relationships FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.stakeholders s WHERE s.id = stakeholder_id_a AND public.can_access_owner(s.owner_id))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.stakeholders s WHERE s.id = stakeholder_id_a AND public.can_access_owner(s.owner_id))
  );

-- CLIENT VALUE SUMMARY (cotizaciones, compras y valor generado, derivado de deals)
CREATE VIEW public.company_value_summary
WITH (security_invoker = true) AS
SELECT
  company_id,
  count(*) FILTER (WHERE status = 'won') AS deals_ganados,
  coalesce(sum(amount) FILTER (WHERE status = 'won'), 0) AS valor_generado,
  count(*) FILTER (WHERE status = 'open') AS oportunidades_abiertas,
  coalesce(sum(amount) FILTER (WHERE status = 'open'), 0) AS valor_en_pipeline
FROM public.deals
WHERE deleted_at IS NULL AND company_id IS NOT NULL
GROUP BY company_id;

GRANT SELECT ON public.company_value_summary TO authenticated;
GRANT ALL ON public.company_value_summary TO service_role;
