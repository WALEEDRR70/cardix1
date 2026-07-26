ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS active_company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_type_check CHECK (account_type IN ('personal','company'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;