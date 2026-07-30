DROP POLICY IF EXISTS "platform admins read all cards" ON public.cards;
DROP POLICY IF EXISTS "platform admins update all cards" ON public.cards;

CREATE POLICY "platform admins read all cards"
ON public.cards FOR SELECT TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "platform admins update all cards"
ON public.cards FOR UPDATE TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);