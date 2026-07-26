DROP POLICY IF EXISTS "insert analytics events for visible cards" ON public.card_events;

CREATE POLICY "visitors log events for visible cards"
  ON public.card_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cards c
      WHERE c.id = card_events.card_id
        AND c.is_published = true
        AND c.is_active = true
    )
    AND event_type = ANY (ARRAY[
      'view','save','qr_scan','nfc_open',
      'click_phone','click_email','click_website','click_whatsapp',
      'click_address','download_vcard'
    ])
    AND (metadata IS NULL OR pg_column_size(metadata) < 2048)
  );

CREATE POLICY "owners log events on own cards"
  ON public.card_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cards c
      WHERE c.id = card_events.card_id
        AND c.user_id = auth.uid()
    )
    AND event_type = ANY (ARRAY[
      'view','save','qr_scan','nfc_open',
      'click_phone','click_email','click_website','click_whatsapp',
      'click_address','download_vcard'
    ])
    AND (metadata IS NULL OR pg_column_size(metadata) < 2048)
  );

DROP FUNCTION IF EXISTS public.card_accepts_events(uuid);