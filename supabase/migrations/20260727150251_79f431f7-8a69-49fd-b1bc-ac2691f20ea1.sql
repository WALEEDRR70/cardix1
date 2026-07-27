CREATE TABLE public.design_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  author_name text,
  title text NOT NULL,
  description text,
  tags text[] NOT NULL DEFAULT '{}',
  design jsonb NOT NULL,
  preview_url text,
  is_public boolean NOT NULL DEFAULT true,
  use_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.design_templates TO authenticated;
GRANT SELECT ON public.design_templates TO anon;
GRANT ALL ON public.design_templates TO service_role;

ALTER TABLE public.design_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public templates are viewable by everyone"
  ON public.design_templates FOR SELECT
  USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "Authors can publish templates"
  ON public.design_templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their templates"
  ON public.design_templates FOR UPDATE TO authenticated
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their templates"
  ON public.design_templates FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

CREATE TRIGGER design_templates_updated_at
  BEFORE UPDATE ON public.design_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX design_templates_public_idx ON public.design_templates (is_public, created_at DESC);
CREATE INDEX design_templates_author_idx ON public.design_templates (author_id);

CREATE OR REPLACE FUNCTION public.increment_template_use(_template_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.design_templates
     SET use_count = use_count + 1
   WHERE id = _template_id AND is_public = true;
$$;

GRANT EXECUTE ON FUNCTION public.increment_template_use(uuid) TO anon, authenticated;