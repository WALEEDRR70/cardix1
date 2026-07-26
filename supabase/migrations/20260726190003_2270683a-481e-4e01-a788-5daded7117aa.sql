-- Helper: can an analytics event be recorded for this card?
CREATE OR REPLACE FUNCTION public.card_accepts_events(_card_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cards c
    WHERE c.id = _card_id
      AND ((c.is_published = true AND c.is_active = true) OR c.user_id = auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION public.card_accepts_events(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.card_accepts_events(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------- card_events
DROP POLICY IF EXISTS "insert events for published cards" ON public.card_events;

CREATE POLICY "insert analytics events for visible cards"
  ON public.card_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    public.card_accepts_events(card_id)
    AND event_type = ANY (ARRAY[
      'view','save','qr_scan','nfc_open',
      'click_phone','click_email','click_website','click_whatsapp',
      'click_address','download_vcard'
    ])
    AND (metadata IS NULL OR pg_column_size(metadata) < 2048)
  );

CREATE POLICY "card events are immutable"
  ON public.card_events
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "card events cannot be deleted"
  ON public.card_events
  FOR DELETE
  TO anon, authenticated
  USING (false);

REVOKE ALL ON public.card_events FROM anon;
REVOKE ALL ON public.card_events FROM authenticated;
GRANT INSERT ON public.card_events TO anon;
GRANT SELECT, INSERT ON public.card_events TO authenticated;
GRANT ALL ON public.card_events TO service_role;

-- ---------------------------------------------------------------------- cards
DROP POLICY IF EXISTS "published cards public read" ON public.cards;

CREATE POLICY "published cards public read"
  ON public.cards
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND is_active = true);

-- Column-level privileges: anonymous visitors only get business-card display fields.
REVOKE ALL ON public.cards FROM anon;
GRANT SELECT (
  id, slug, name, title, company, bio, phone, whatsapp, email, website, address,
  avatar_url, cover_url, accent_color, template, socials,
  is_published, is_active, is_verified, card_type,
  company_id, department_id, extension, working_hours, languages
) ON public.cards TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;