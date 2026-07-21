
DROP POLICY IF EXISTS "anyone inserts card events" ON public.card_events;
CREATE POLICY "insert events for published cards" ON public.card_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.cards c WHERE c.id = card_id AND (c.is_published = true OR c.user_id = auth.uid()))
  );
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
