-- A soft delete makes the new row invisible under the SELECT policy. PostgreSQL
-- rejects the ordinary client UPDATE. Keep deleted rows hidden; expose narrowly
-- scoped commands with the same owner/team authorization as existing UPDATE RLS.
CREATE FUNCTION public.soft_delete_company(_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.companies SET deleted_at = now()
  WHERE id = _id AND deleted_at IS NULL
    AND auth.uid() IS NOT NULL AND public.can_access_owner(owner_id);
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;
CREATE FUNCTION public.soft_delete_contact(_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.contacts SET deleted_at = now()
  WHERE id = _id AND deleted_at IS NULL
    AND auth.uid() IS NOT NULL AND public.can_access_owner(owner_id);
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;
CREATE FUNCTION public.soft_delete_deal(_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.deals SET deleted_at = now()
  WHERE id = _id AND deleted_at IS NULL
    AND auth.uid() IS NOT NULL AND public.can_access_owner(owner_id);
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;
REVOKE ALL ON FUNCTION public.soft_delete_company(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.soft_delete_contact(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.soft_delete_deal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.soft_delete_company(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_contact(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_deal(uuid) TO authenticated;
