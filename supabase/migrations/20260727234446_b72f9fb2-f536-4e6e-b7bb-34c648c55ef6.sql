-- 1. Private legal details table
CREATE TABLE public.company_legal (
  company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_person text,
  registration_number text,
  tax_number text,
  legal_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_legal TO authenticated;
GRANT ALL ON public.company_legal TO service_role;

ALTER TABLE public.company_legal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read company legal" ON public.company_legal
  FOR SELECT TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()));

CREATE POLICY "admins write company legal" ON public.company_legal
  FOR INSERT TO authenticated
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));

CREATE POLICY "admins update company legal" ON public.company_legal
  FOR UPDATE TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()))
  WITH CHECK (app_private.is_company_admin(company_id, auth.uid()));

CREATE POLICY "admins delete company legal" ON public.company_legal
  FOR DELETE TO authenticated
  USING (app_private.is_company_admin(company_id, auth.uid()));

CREATE TRIGGER company_legal_set_updated_at
  BEFORE UPDATE ON public.company_legal
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Migrate existing values out of the publicly readable companies row
INSERT INTO public.company_legal (company_id, contact_person, registration_number, tax_number, legal_address)
SELECT id, contact_person, registration_number, tax_number, legal_address
  FROM public.companies
 WHERE contact_person IS NOT NULL
    OR registration_number IS NOT NULL
    OR tax_number IS NOT NULL
    OR legal_address IS NOT NULL
ON CONFLICT (company_id) DO NOTHING;

ALTER TABLE public.companies
  DROP COLUMN contact_person,
  DROP COLUMN registration_number,
  DROP COLUMN tax_number,
  DROP COLUMN legal_address;

-- 3. Restrict membership bootstrap to owner self-insert only
DROP POLICY IF EXISTS "owner bootstraps membership" ON public.company_members;

CREATE POLICY "owner bootstraps own membership" ON public.company_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'owner'
    AND EXISTS (
      SELECT 1 FROM public.companies c
       WHERE c.id = company_members.company_id
         AND c.owner_id = auth.uid()
    )
  );