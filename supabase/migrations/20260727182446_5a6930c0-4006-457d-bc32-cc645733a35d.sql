-- 1) Require published company for public reads of custom fields and templates
DROP POLICY IF EXISTS "public reads public fields" ON public.company_custom_fields;
CREATE POLICY "public reads public fields"
ON public.company_custom_fields
FOR SELECT
USING (
  (
    visibility = 'public'::field_visibility
    AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_custom_fields.company_id AND c.is_published)
  )
  OR public.is_company_member(company_id, auth.uid())
);

DROP POLICY IF EXISTS "read approved templates" ON public.company_templates;
CREATE POLICY "read approved templates"
ON public.company_templates
FOR SELECT
USING (
  (
    is_approved = true
    AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_templates.company_id AND c.is_published)
  )
  OR public.is_company_member(company_id, auth.uid())
);

-- 2) Least privilege on SECURITY DEFINER functions
-- Unused by app and by RLS: nobody in the API roles should call it
REVOKE ALL ON FUNCTION public.company_role_of(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Only referenced by policies evaluated for signed-in users
REVOKE ALL ON FUNCTION public.is_company_admin(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_company_manager(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_department(uuid, uuid) FROM PUBLIC, anon;

-- Counter RPC is only meaningful for signed-in users
REVOKE ALL ON FUNCTION public.increment_template_use(uuid) FROM PUBLIC, anon;

-- Needed by public-read policies, but not by arbitrary PUBLIC role grants
REVOKE ALL ON FUNCTION public.is_company_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_company_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_manager(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_department(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_template_use(uuid) TO authenticated;