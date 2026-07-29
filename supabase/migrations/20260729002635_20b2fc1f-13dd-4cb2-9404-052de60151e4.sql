-- 1) Move has_role out of the API-exposed public schema
CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "users read own orders" ON public.billing_orders;
CREATE POLICY "users read own orders" ON public.billing_orders FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "users read own subscriptions" ON public.billing_subscriptions;
CREATE POLICY "users read own subscriptions" ON public.billing_subscriptions FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage plans" ON public.billing_plans;
CREATE POLICY "admins manage plans" ON public.billing_plans FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "public reads active plans" ON public.billing_plans;
CREATE POLICY "public reads active plans" ON public.billing_plans FOR SELECT TO anon, authenticated
  USING (is_active OR app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage products" ON public.billing_products;
CREATE POLICY "admins manage products" ON public.billing_products FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "public reads active products" ON public.billing_products;
CREATE POLICY "public reads active products" ON public.billing_products FOR SELECT TO anon, authenticated
  USING (is_active OR app_private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 2) Profiles are no longer world-readable
DROP POLICY IF EXISTS "profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

REVOKE SELECT ON public.profiles FROM anon;
