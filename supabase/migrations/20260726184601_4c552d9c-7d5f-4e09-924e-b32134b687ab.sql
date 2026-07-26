
-- ============ ENUMS ============
CREATE TYPE public.company_role AS ENUM ('owner','admin','manager','employee','viewer');
CREATE TYPE public.member_status AS ENUM ('active','inactive','suspended','former');
CREATE TYPE public.invitation_status AS ENUM ('pending','accepted','revoked','expired');
CREATE TYPE public.card_type AS ENUM ('personal','company','employee');
CREATE TYPE public.field_permission AS ENUM ('company_locked','employee_editable');
CREATE TYPE public.field_visibility AS ENUM ('public','private','company_only');

-- ============ COMPANIES ============
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  legal_name text,
  description text,
  logo_url text,
  cover_url text,
  website text,
  phone text,
  email text,
  address text,
  brand_primary text NOT NULL DEFAULT '#7c34ff',
  brand_secondary text NOT NULL DEFAULT '#2c125a',
  font_heading text,
  font_body text,
  default_template text NOT NULL DEFAULT 'luxury',
  theme text NOT NULL DEFAULT 'dark',
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_domain text,
  is_verified boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  show_employees boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT ON public.companies TO anon;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- ============ DEPARTMENTS ============
CREATE TABLE public.company_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_departments TO authenticated;
GRANT SELECT ON public.company_departments TO anon;
GRANT ALL ON public.company_departments TO service_role;
ALTER TABLE public.company_departments ENABLE ROW LEVEL SECURITY;

-- ============ MEMBERS ============
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.company_role NOT NULL DEFAULT 'employee',
  status public.member_status NOT NULL DEFAULT 'active',
  department_id uuid REFERENCES public.company_departments(id) ON DELETE SET NULL,
  job_title text,
  corporate_email text,
  phone text,
  employee_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members m
    WHERE m.company_id = _company_id AND m.user_id = _user_id AND m.status = 'active');
$$;

CREATE OR REPLACE FUNCTION public.company_role_of(_company_id uuid, _user_id uuid)
RETURNS public.company_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.role FROM public.company_members m
   WHERE m.company_id = _company_id AND m.user_id = _user_id AND m.status = 'active' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members m
    WHERE m.company_id = _company_id AND m.user_id = _user_id
      AND m.status = 'active' AND m.role IN ('owner','admin'));
$$;

CREATE OR REPLACE FUNCTION public.is_company_manager(_company_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members m
    WHERE m.company_id = _company_id AND m.user_id = _user_id
      AND m.status = 'active' AND m.role IN ('owner','admin','manager'));
$$;

CREATE OR REPLACE FUNCTION public.my_department(_company_id uuid, _user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.department_id FROM public.company_members m
   WHERE m.company_id = _company_id AND m.user_id = _user_id LIMIT 1;
$$;

-- ============ COMPANIES POLICIES ============
CREATE POLICY "public reads published companies" ON public.companies
  FOR SELECT USING (is_published = true OR public.is_company_member(id, auth.uid()));
CREATE POLICY "users create companies" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "admins update companies" ON public.companies
  FOR UPDATE TO authenticated USING (public.is_company_admin(id, auth.uid()))
  WITH CHECK (public.is_company_admin(id, auth.uid()));
CREATE POLICY "owner deletes company" ON public.companies
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ============ DEPARTMENT POLICIES ============
CREATE POLICY "public reads departments" ON public.company_departments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.is_published)
                    OR public.is_company_member(company_id, auth.uid()));
CREATE POLICY "admins manage departments" ON public.company_departments
  FOR ALL TO authenticated USING (public.is_company_admin(company_id, auth.uid()))
  WITH CHECK (public.is_company_admin(company_id, auth.uid()));

-- ============ MEMBER POLICIES ============
CREATE POLICY "members read own company members" ON public.company_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_company_member(company_id, auth.uid()));
CREATE POLICY "owner bootstraps membership" ON public.company_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_company_admin(company_id, auth.uid())
              OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid()));
CREATE POLICY "admins update members" ON public.company_members
  FOR UPDATE TO authenticated
  USING (public.is_company_admin(company_id, auth.uid())
         OR (public.is_company_manager(company_id, auth.uid())
             AND department_id = public.my_department(company_id, auth.uid())))
  WITH CHECK (public.is_company_admin(company_id, auth.uid())
         OR (public.is_company_manager(company_id, auth.uid())
             AND department_id = public.my_department(company_id, auth.uid())));
CREATE POLICY "admins delete members" ON public.company_members
  FOR DELETE TO authenticated USING (public.is_company_admin(company_id, auth.uid()));

-- ============ INVITATIONS ============
CREATE TABLE public.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  job_title text,
  phone text,
  department_id uuid REFERENCES public.company_departments(id) ON DELETE SET NULL,
  role public.company_role NOT NULL DEFAULT 'employee',
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status public.invitation_status NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_invitations TO authenticated;
GRANT ALL ON public.company_invitations TO service_role;
ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read invitations" ON public.company_invitations
  FOR SELECT TO authenticated
  USING (public.is_company_admin(company_id, auth.uid())
         OR lower(email) = lower(COALESCE((auth.jwt() ->> 'email'), '')));
CREATE POLICY "admins create invitations" ON public.company_invitations
  FOR INSERT TO authenticated WITH CHECK (public.is_company_admin(company_id, auth.uid()));
CREATE POLICY "invite update" ON public.company_invitations
  FOR UPDATE TO authenticated
  USING (public.is_company_admin(company_id, auth.uid())
         OR lower(email) = lower(COALESCE((auth.jwt() ->> 'email'), '')))
  WITH CHECK (public.is_company_admin(company_id, auth.uid())
         OR lower(email) = lower(COALESCE((auth.jwt() ->> 'email'), '')));
CREATE POLICY "admins delete invitations" ON public.company_invitations
  FOR DELETE TO authenticated USING (public.is_company_admin(company_id, auth.uid()));

-- ============ BRANCHES ============
CREATE TABLE public.company_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  city text,
  country text,
  phone text,
  email text,
  map_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_branches TO authenticated;
GRANT SELECT ON public.company_branches TO anon;
GRANT ALL ON public.company_branches TO service_role;
ALTER TABLE public.company_branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads branches" ON public.company_branches
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.is_published)
                    OR public.is_company_member(company_id, auth.uid()));
CREATE POLICY "admins manage branches" ON public.company_branches
  FOR ALL TO authenticated USING (public.is_company_admin(company_id, auth.uid()))
  WITH CHECK (public.is_company_admin(company_id, auth.uid()));

-- ============ TEMPLATES ============
CREATE TABLE public.company_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  template text NOT NULL DEFAULT 'luxury',
  accent_color text NOT NULL DEFAULT '#7c34ff',
  is_default boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_templates TO authenticated;
GRANT SELECT ON public.company_templates TO anon;
GRANT ALL ON public.company_templates TO service_role;
ALTER TABLE public.company_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read approved templates" ON public.company_templates
  FOR SELECT USING (is_approved = true OR public.is_company_member(company_id, auth.uid()));
CREATE POLICY "admins manage templates" ON public.company_templates
  FOR ALL TO authenticated USING (public.is_company_admin(company_id, auth.uid()))
  WITH CHECK (public.is_company_admin(company_id, auth.uid()));

-- ============ BRAND ASSETS ============
CREATE TABLE public.company_brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'logo',
  label text,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_brand_assets TO authenticated;
GRANT SELECT ON public.company_brand_assets TO anon;
GRANT ALL ON public.company_brand_assets TO service_role;
ALTER TABLE public.company_brand_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads brand assets" ON public.company_brand_assets
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.is_published)
                    OR public.is_company_member(company_id, auth.uid()));
CREATE POLICY "admins manage brand assets" ON public.company_brand_assets
  FOR ALL TO authenticated USING (public.is_company_admin(company_id, auth.uid()))
  WITH CHECK (public.is_company_admin(company_id, auth.uid()));

-- ============ CUSTOM FIELDS ============
CREATE TABLE public.company_custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  is_required boolean NOT NULL DEFAULT false,
  permission public.field_permission NOT NULL DEFAULT 'employee_editable',
  visibility public.field_visibility NOT NULL DEFAULT 'public',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_custom_fields TO authenticated;
GRANT SELECT ON public.company_custom_fields TO anon;
GRANT ALL ON public.company_custom_fields TO service_role;
ALTER TABLE public.company_custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads public fields" ON public.company_custom_fields
  FOR SELECT USING (visibility = 'public' OR public.is_company_member(company_id, auth.uid()));
CREATE POLICY "admins manage custom fields" ON public.company_custom_fields
  FOR ALL TO authenticated USING (public.is_company_admin(company_id, auth.uid()))
  WITH CHECK (public.is_company_admin(company_id, auth.uid()));

-- ============ CARDS EXTENSIONS ============
ALTER TABLE public.cards
  ADD COLUMN card_type public.card_type NOT NULL DEFAULT 'personal',
  ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN department_id uuid REFERENCES public.company_departments(id) ON DELETE SET NULL,
  ADD COLUMN is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN extension text,
  ADD COLUMN working_hours text,
  ADD COLUMN languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN custom_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN is_verified boolean NOT NULL DEFAULT false;
CREATE INDEX cards_company_id_idx ON public.cards(company_id);
CREATE UNIQUE INDEX cards_company_slug_idx ON public.cards(company_id, slug) WHERE company_id IS NOT NULL;

CREATE POLICY "company members read company cards" ON public.cards
  FOR SELECT TO authenticated
  USING (company_id IS NOT NULL AND public.is_company_member(company_id, auth.uid()));
CREATE POLICY "company admins manage company cards" ON public.cards
  FOR ALL TO authenticated
  USING (company_id IS NOT NULL AND public.is_company_admin(company_id, auth.uid()))
  WITH CHECK (company_id IS NOT NULL AND public.is_company_admin(company_id, auth.uid()));

-- ============ CARD EVENTS ANALYTICS ============
ALTER TABLE public.card_events
  ADD COLUMN country text,
  ADD COLUMN city text,
  ADD COLUMN device text;

-- ============ AUDIT LOGS ============
CREATE TABLE public.company_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.company_audit_logs TO authenticated;
GRANT ALL ON public.company_audit_logs TO service_role;
ALTER TABLE public.company_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit logs" ON public.company_audit_logs
  FOR SELECT TO authenticated USING (public.is_company_admin(company_id, auth.uid()));
CREATE POLICY "members write audit logs" ON public.company_audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id, auth.uid()) AND actor_id = auth.uid());

-- ============ UPDATED_AT TRIGGERS ============
CREATE TRIGGER set_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_company_departments_updated_at BEFORE UPDATE ON public.company_departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_company_members_updated_at BEFORE UPDATE ON public.company_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_company_invitations_updated_at BEFORE UPDATE ON public.company_invitations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_company_branches_updated_at BEFORE UPDATE ON public.company_branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_company_templates_updated_at BEFORE UPDATE ON public.company_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_company_brand_assets_updated_at BEFORE UPDATE ON public.company_brand_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_company_custom_fields_updated_at BEFORE UPDATE ON public.company_custom_fields FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
