create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_en text not null,
  name_ar text not null,
  description_en text,
  description_ar text,
  audience text not null default 'individual',
  interval text not null default 'month',
  price_cents integer not null default 0,
  currency text not null default 'USD',
  features_en text[] not null default '{}',
  features_ar text[] not null default '{}',
  paypal_plan_id text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.billing_plans to anon;
grant select, insert, update, delete on public.billing_plans to authenticated;
grant all on public.billing_plans to service_role;
alter table public.billing_plans enable row level security;
create policy "public reads active plans" on public.billing_plans for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admins manage plans" on public.billing_plans for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.billing_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_en text not null,
  name_ar text not null,
  description_en text,
  description_ar text,
  template_id uuid references public.design_templates(id) on delete set null,
  preview_url text,
  price_cents integer not null default 0,
  currency text not null default 'USD',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.billing_products to anon;
grant select, insert, update, delete on public.billing_products to authenticated;
grant all on public.billing_products to service_role;
alter table public.billing_products enable row level security;
create policy "public reads active products" on public.billing_products for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admins manage products" on public.billing_products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.billing_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  plan_id uuid references public.billing_plans(id) on delete set null,
  product_id uuid references public.billing_products(id) on delete set null,
  paypal_order_id text,
  paypal_subscription_id text,
  amount_cents integer not null default 0,
  currency text not null default 'USD',
  status text not null default 'created',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.billing_orders to authenticated;
grant all on public.billing_orders to service_role;
alter table public.billing_orders enable row level security;
create policy "users read own orders" on public.billing_orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.billing_plans(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  paypal_subscription_id text unique,
  status text not null default 'pending',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.billing_subscriptions to authenticated;
grant all on public.billing_subscriptions to service_role;
alter table public.billing_subscriptions enable row level security;
create policy "users read own subscriptions" on public.billing_subscriptions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create trigger billing_plans_updated before update on public.billing_plans for each row execute function public.set_updated_at();
create trigger billing_products_updated before update on public.billing_products for each row execute function public.set_updated_at();
create trigger billing_orders_updated before update on public.billing_orders for each row execute function public.set_updated_at();
create trigger billing_subscriptions_updated before update on public.billing_subscriptions for each row execute function public.set_updated_at();

insert into public.billing_plans (code,name_en,name_ar,audience,interval,price_cents,features_en,features_ar,is_featured,sort_order) values
 ('pro-monthly','Pro','برو','individual','month',600,'{"Unlimited cards","All premium templates","AI bio & card scanning","Full analytics"}','{"بطاقات غير محدودة","كل القوالب المميزة","نبذة بالذكاء الاصطناعي ومسح البطاقات","تحليلات كاملة"}',true,10),
 ('pro-yearly','Pro','برو','individual','year',6000,'{"Everything in Pro monthly","2 months free"}','{"كل مزايا برو الشهري","شهران مجاناً"}',false,20),
 ('teams-monthly','Teams','الفرق','company','month',400,'{"Everything in Pro","Shared brand templates","Team directory","Centralized billing"}','{"كل مزايا برو","قوالب موحّدة للعلامة","دليل الفريق","فوترة مركزية"}',true,30),
 ('teams-yearly','Teams','الفرق','company','year',4000,'{"Everything in Teams monthly","2 months free"}','{"كل مزايا الفرق الشهري","شهران مجاناً"}',false,40);