ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS design jsonb;

CREATE TABLE IF NOT EXISTS public.card_design_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text,
  design jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.card_design_versions TO authenticated;
GRANT ALL ON public.card_design_versions TO service_role;

ALTER TABLE public.card_design_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners read design versions" ON public.card_design_versions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owners write design versions" ON public.card_design_versions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "owners delete design versions" ON public.card_design_versions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS card_design_versions_card_idx
  ON public.card_design_versions (card_id, created_at DESC);