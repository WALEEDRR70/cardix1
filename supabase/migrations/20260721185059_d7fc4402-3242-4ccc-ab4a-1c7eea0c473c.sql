
ALTER TABLE public.saved_cards
  ADD COLUMN IF NOT EXISTS template text NOT NULL DEFAULT 'luxury',
  ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '#7c34ff',
  ADD COLUMN IF NOT EXISTS socials jsonb NOT NULL DEFAULT '{}'::jsonb;
