CREATE OR REPLACE FUNCTION app_private.is_company_admin(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, app_private
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies c
     WHERE c.id = _company_id AND c.owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.company_members m
     WHERE m.company_id = _company_id AND m.user_id = _user_id
       AND m.status = 'active' AND m.role IN ('owner','admin')
  );
$$;

UPDATE public.company_members m
   SET role = 'owner', status = 'active', updated_at = now()
  FROM public.companies c
 WHERE c.id = m.company_id
   AND c.owner_id = m.user_id
   AND m.role <> 'owner';