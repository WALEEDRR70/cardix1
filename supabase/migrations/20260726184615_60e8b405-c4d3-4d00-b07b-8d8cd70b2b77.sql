
REVOKE ALL ON FUNCTION public.is_company_member(uuid, uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.is_company_admin(uuid, uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.is_company_manager(uuid, uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.company_role_of(uuid, uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.my_department(uuid, uuid) FROM anon, authenticated, public;
