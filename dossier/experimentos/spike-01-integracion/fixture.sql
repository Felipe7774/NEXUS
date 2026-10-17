-- SOLO para Supabase local desechable de CI. No es una migracion de produccion.
BEGIN;
CREATE TABLE public.m5_spike_events (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  from_stage_id uuid NOT NULL REFERENCES public.stages(id),
  to_stage_id uuid NOT NULL REFERENCES public.stages(id),
  mode text NOT NULL CHECK (mode IN ('sync', 'async')),
  event_type text NOT NULL DEFAULT 'crm.deal.stage_changed.v1'
    CHECK (event_type = 'crm.deal.stage_changed.v1'),
  schema_version integer NOT NULL DEFAULT 1 CHECK (schema_version = 1),
  enqueued_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  delivered_at timestamptz
);
ALTER TABLE public.m5_spike_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.m5_spike_events TO authenticated;
GRANT ALL ON public.m5_spike_events TO service_role;
CREATE POLICY m5_spike_owner ON public.m5_spike_events TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.owner_id = auth.uid()
  ));

CREATE FUNCTION public.m5_spike_move(
  p_deal_id uuid, p_stage_id uuid, p_mode text, p_event_id uuid
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE d public.deals; e public.m5_spike_events;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
  SELECT * INTO d FROM public.deals WHERE id = p_deal_id AND owner_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'deal unavailable to caller' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.stages WHERE id = p_stage_id AND pipeline_id = d.pipeline_id) THEN
    RAISE EXCEPTION 'stage outside deal pipeline' USING ERRCODE='22023';
  END IF;
  IF p_mode NOT IN ('sync','async') THEN RAISE EXCEPTION 'invalid mode' USING ERRCODE='22023'; END IF;
  SELECT * INTO e FROM public.m5_spike_events WHERE id = p_event_id;
  IF FOUND THEN
    IF e.deal_id <> p_deal_id OR e.to_stage_id <> p_stage_id OR e.mode <> p_mode THEN
      RAISE EXCEPTION 'event id reused for different command' USING ERRCODE='22023';
    END IF;
    RETURN to_jsonb(e);
  END IF;
  UPDATE public.deals SET stage_id = p_stage_id WHERE id = d.id;
  INSERT INTO public.m5_spike_events (id,owner_id,deal_id,from_stage_id,to_stage_id,mode)
    VALUES (p_event_id,auth.uid(),d.id,d.stage_id,p_stage_id,p_mode) RETURNING * INTO e;
  RETURN to_jsonb(e);
END; $$;

CREATE FUNCTION public.m5_spike_deliver(p_event_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE e public.m5_spike_events;
BEGIN
  SELECT * INTO e FROM public.m5_spike_events
    WHERE id = p_event_id AND owner_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'event unavailable to caller' USING ERRCODE='42501'; END IF;
  IF e.delivered_at IS NULL THEN
    INSERT INTO public.activities (id,type,subject,created_by,assigned_to,deal_id)
      VALUES (e.id,'tarea','[M5 spike] Seguimiento tras cambio de etapa',auth.uid(),auth.uid(),e.deal_id)
      ON CONFLICT (id) DO NOTHING;
    IF NOT EXISTS (SELECT 1 FROM public.activities
      WHERE id=e.id AND deal_id=e.deal_id AND created_by=auth.uid() AND assigned_to=auth.uid()) THEN
      RAISE EXCEPTION 'activity id conflict' USING ERRCODE='22023';
    END IF;
    UPDATE public.m5_spike_events SET delivered_at=clock_timestamp() WHERE id=e.id RETURNING * INTO e;
  END IF;
  RETURN to_jsonb(e);
END; $$;
REVOKE ALL ON FUNCTION public.m5_spike_move(uuid,uuid,text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.m5_spike_deliver(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.m5_spike_move(uuid,uuid,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.m5_spike_deliver(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
