CREATE TABLE public.template_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  template_id uuid NOT NULL REFERENCES public.design_templates(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, template_id)
);

GRANT SELECT, INSERT, DELETE ON public.template_favorites TO authenticated;
GRANT ALL ON public.template_favorites TO service_role;

ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.template_favorites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.template_favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.template_favorites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_template_favorites_user ON public.template_favorites(user_id);