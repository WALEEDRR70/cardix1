CREATE TABLE public.saved_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual',
  source_card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  bio TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  avatar_url TEXT,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_cards TO authenticated;
GRANT ALL ON public.saved_cards TO service_role;

ALTER TABLE public.saved_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads saved cards" ON public.saved_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner inserts saved cards" ON public.saved_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner updates saved cards" ON public.saved_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner deletes saved cards" ON public.saved_cards FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_saved_cards_user ON public.saved_cards(user_id, created_at DESC);

CREATE TRIGGER trg_saved_cards_updated
BEFORE UPDATE ON public.saved_cards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();