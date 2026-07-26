GRANT EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_company_admin(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_company_manager(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.company_role_of(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.my_department(uuid, uuid) TO authenticated, anon, service_role;