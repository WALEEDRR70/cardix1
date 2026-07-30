DROP POLICY IF EXISTS "Translations are publicly readable" ON public.content_translations;

CREATE POLICY "Translations readable for published entities"
ON public.content_translations
FOR SELECT
TO anon, authenticated
USING (
  (entity_type = 'card' AND EXISTS (
    SELECT 1 FROM public.cards c
    WHERE c.id = content_translations.entity_id AND c.is_published = true
  ))
  OR (entity_type IN ('company','service') AND EXISTS (
    SELECT 1 FROM public.companies co
    WHERE co.id = content_translations.entity_id AND co.is_published = true
  ))
);