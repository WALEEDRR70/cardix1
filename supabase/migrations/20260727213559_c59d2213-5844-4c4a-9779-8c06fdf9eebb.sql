ALTER TABLE public.design_templates
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'mixed',
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

ALTER TABLE public.design_templates
  DROP CONSTRAINT IF EXISTS design_templates_audience_check;

ALTER TABLE public.design_templates
  ADD CONSTRAINT design_templates_audience_check
  CHECK (audience IN ('personal', 'employee', 'mixed'));

CREATE INDEX IF NOT EXISTS design_templates_audience_idx ON public.design_templates (audience);