-- 1. Hidden schema for RLS helper functions (not exposed via the Data API)
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.is_company_member(_company_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members m
    WHERE m.company_id = _company_id AND m.user_id = _user_id AND m.status = 'active');
$$;

CREATE OR REPLACE FUNCTION app_private.is_company_admin(_company_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members m
    WHERE m.company_id = _company_id AND m.user_id = _user_id
      AND m.status = 'active' AND m.role IN ('owner','admin'));
$$;

CREATE OR REPLACE FUNCTION app_private.is_company_manager(_company_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members m
    WHERE m.company_id = _company_id AND m.user_id = _user_id
      AND m.status = 'active' AND m.role IN ('owner','admin','manager'));
$$;

CREATE OR REPLACE FUNCTION app_private.my_department(_company_id uuid, _user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.department_id FROM public.company_members m
   WHERE m.company_id = _company_id AND m.user_id = _user_id LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION app_private.is_company_member(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_company_admin(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_company_manager(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.my_department(uuid, uuid) TO anon, authenticated, service_role;

-- 2. Repoint every policy at the hidden helpers
DROP POLICY "public reads published companies" ON public.companies;
CREATE POLICY "public reads published companies" ON public.companies FOR SELECT
  USING (is_published = true OR app_private.is_company_member(id, auth.uid()));
DROP POLICY "admins update companies" ON public.companies;
CREATE POLICY "admins update companies" ON public.companies FOR UPDATE TO authenticated
  USING (app_private.is_company_admin(id, auth.uid()))
  WITH CHECK (app_private.is_company_admin(id, auth.uid()));

DROP POLICY "public reads departments" ON public.company_departments;
CREATE POLICY "public reads departments" ON public.company_departments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.is_published)
         OR app_private.is_company_member(company_id, auth.uid()));
DROP POLICY "admins manage departments" ON public.company_departments;
CREATE POLICY "admins manage departments" ON public.company_departments FOR ALL TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()))
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));

DROP POLICY "members read own company members" ON public.company_members;
CREATE POLICY "members read own company members" ON public.company_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR app_private.is_company_member(company_id, auth.uid()));
DROP POLICY "owner bootstraps membership" ON public.company_members;
CREATE POLICY "owner bootstraps membership" ON public.company_members FOR INSERT TO authenticated
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid()));
DROP POLICY "admins update members" ON public.company_members;
CREATE POLICY "admins update members" ON public.company_members FOR UPDATE TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid())
    OR (app_private.is_company_manager(company_id, auth.uid()) AND department_id = app_private.my_department(company_id, auth.uid())))
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid())
    OR (app_private.is_company_manager(company_id, auth.uid()) AND department_id = app_private.my_department(company_id, auth.uid())));
DROP POLICY "admins delete members" ON public.company_members;
CREATE POLICY "admins delete members" ON public.company_members FOR DELETE TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()));

-- invitations: admin-only, no spoofable email-claim matching
DROP POLICY "admins read invitations" ON public.company_invitations;
CREATE POLICY "admins read invitations" ON public.company_invitations FOR SELECT TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()));
DROP POLICY "invite update" ON public.company_invitations;
CREATE POLICY "admins update invitations" ON public.company_invitations FOR UPDATE TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()))
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));
DROP POLICY "admins create invitations" ON public.company_invitations;
CREATE POLICY "admins create invitations" ON public.company_invitations FOR INSERT TO authenticated
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));
DROP POLICY "admins delete invitations" ON public.company_invitations;
CREATE POLICY "admins delete invitations" ON public.company_invitations FOR DELETE TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()));

DROP POLICY "public reads branches" ON public.company_branches;
CREATE POLICY "public reads branches" ON public.company_branches FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.is_published)
         OR app_private.is_company_member(company_id, auth.uid()));
DROP POLICY "admins manage branches" ON public.company_branches;
CREATE POLICY "admins manage branches" ON public.company_branches FOR ALL TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()))
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));

DROP POLICY "public reads brand assets" ON public.company_brand_assets;
CREATE POLICY "public reads brand assets" ON public.company_brand_assets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.is_published)
         OR app_private.is_company_member(company_id, auth.uid()));
DROP POLICY "admins manage brand assets" ON public.company_brand_assets;
CREATE POLICY "admins manage brand assets" ON public.company_brand_assets FOR ALL TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()))
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));

DROP POLICY "public reads public fields" ON public.company_custom_fields;
CREATE POLICY "public reads public fields" ON public.company_custom_fields FOR SELECT
  USING ((visibility = 'public'::field_visibility
          AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.is_published))
         OR app_private.is_company_member(company_id, auth.uid()));
DROP POLICY "admins manage custom fields" ON public.company_custom_fields;
CREATE POLICY "admins manage custom fields" ON public.company_custom_fields FOR ALL TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()))
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));

DROP POLICY "read approved templates" ON public.company_templates;
CREATE POLICY "read approved templates" ON public.company_templates FOR SELECT
  USING ((is_approved = true
          AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.is_published))
         OR app_private.is_company_member(company_id, auth.uid()));
DROP POLICY "admins manage templates" ON public.company_templates;
CREATE POLICY "admins manage templates" ON public.company_templates FOR ALL TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()))
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));

DROP POLICY "company members read company cards" ON public.cards;
CREATE POLICY "company members read company cards" ON public.cards FOR SELECT TO authenticated
  USING (company_id IS NOT NULL AND app_private.is_company_member(company_id, auth.uid()));
DROP POLICY "company admins manage company cards" ON public.cards;
CREATE POLICY "company admins manage company cards" ON public.cards FOR ALL TO authenticated
  USING (company_id IS NOT NULL AND app_private.is_company_admin(company_id, auth.uid()))
  WITH CHECK (company_id IS NOT NULL AND app_private.is_company_admin(company_id, auth.uid()));

DROP POLICY "admins read audit logs" ON public.company_audit_logs;
CREATE POLICY "admins read audit logs" ON public.company_audit_logs FOR SELECT TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()));
DROP POLICY "members write audit logs" ON public.company_audit_logs;
CREATE POLICY "members write audit logs" ON public.company_audit_logs FOR INSERT TO authenticated
  WITH CHECK (app_private.is_company_member(company_id, auth.uid()) AND actor_id = auth.uid());

-- 3. Storage: avatars bucket no longer world-readable
DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
CREATE POLICY "avatars owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars company member read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars'
    AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND app_private.is_company_member(((storage.foldername(name))[1])::uuid, auth.uid()));

DROP POLICY IF EXISTS "avatars company admin insert" ON storage.objects;
CREATE POLICY "avatars company admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars'
    AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND app_private.is_company_admin(((storage.foldername(name))[1])::uuid, auth.uid()));
DROP POLICY IF EXISTS "avatars company admin update" ON storage.objects;
CREATE POLICY "avatars company admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars'
    AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND app_private.is_company_admin(((storage.foldername(name))[1])::uuid, auth.uid()));
DROP POLICY IF EXISTS "avatars company admin delete" ON storage.objects;
CREATE POLICY "avatars company admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars'
    AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND app_private.is_company_admin(((storage.foldername(name))[1])::uuid, auth.uid()));

-- 4. Drop the now-unused public SECURITY DEFINER helpers and RPC
DROP FUNCTION IF EXISTS public.increment_template_use(uuid);
DROP FUNCTION IF EXISTS public.company_role_of(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_company_admin(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_company_manager(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_company_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.my_department(uuid, uuid);

-- 5. Profiles: anonymous visitors only see basic public columns
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, username, display_name, avatar_url, created_at) ON public.profiles TO anon;