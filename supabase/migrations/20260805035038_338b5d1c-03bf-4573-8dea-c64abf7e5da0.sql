GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_gerente() TO authenticated;
GRANT EXECUTE ON FUNCTION public.team_member_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_owner(uuid) TO authenticated;