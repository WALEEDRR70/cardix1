CREATE TABLE public.content_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL CHECK (entity_type IN ('card','company','service')),
  entity_id uuid NOT NULL,
  entity_key text NOT NULL DEFAULT '',
  locale text NOT NULL,
  source_hash text NOT NULL,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, entity_key, locale)
);

CREATE INDEX content_translations_lookup_idx ON public.content_translations (entity_type, entity_id, locale);

GRANT SELECT ON public.content_translations TO anon;
GRANT SELECT ON public.content_translations TO authenticated;
GRANT ALL ON public.content_translations TO service_role;

ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Translations are publicly readable"
ON public.content_translations FOR SELECT
TO anon, authenticated
USING (true);

CREATE TRIGGER content_translations_set_updated_at
BEFORE UPDATE ON public.content_translations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();