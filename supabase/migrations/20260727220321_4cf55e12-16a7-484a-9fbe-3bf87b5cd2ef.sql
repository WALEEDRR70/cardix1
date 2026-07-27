-- 1. Extend company_templates with targeting + full design
ALTER TABLE public.company_templates
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.company_departments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS target_role public.company_role,
  ADD COLUMN IF NOT EXISTS design jsonb,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_auto_assign boolean NOT NULL DEFAULT true;

-- 2. Invitations can carry a specific card template
ALTER TABLE public.company_invitations
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.company_templates(id) ON DELETE SET NULL;

-- 3. Cards remember the company template they follow
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS company_template_id uuid REFERENCES public.company_templates(id) ON DELETE SET NULL;

-- 4. Resolve the best matching company template for a department + role
CREATE OR REPLACE FUNCTION app_private.resolve_company_template(
  _company uuid,
  _dept uuid,
  _role public.company_role
) RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, app_private
AS $$
  SELECT t.id
  FROM public.company_templates t
  WHERE t.company_id = _company
    AND t.is_auto_assign
    AND (t.department_id IS NULL OR t.department_id = _dept)
    AND (t.target_role IS NULL OR t.target_role = _role)
  ORDER BY
    (CASE WHEN t.department_id IS NOT NULL THEN 4 ELSE 0 END)
    + (CASE WHEN t.target_role IS NOT NULL THEN 2 ELSE 0 END)
    + (CASE WHEN t.is_default THEN 1 ELSE 0 END) DESC,
    t.sort_order ASC,
    t.created_at ASC
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION app_private.resolve_company_template(uuid, uuid, public.company_role) FROM PUBLIC;

-- 5. Apply the resolved template to an employee's company card
CREATE OR REPLACE FUNCTION app_private.apply_company_template_to_card(
  _company uuid,
  _user uuid,
  _dept uuid,
  _role public.company_role
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private
AS $$
DECLARE
  tpl public.company_templates%ROWTYPE;
  comp public.companies%ROWTYPE;
BEGIN
  SELECT * INTO comp FROM public.companies WHERE id = _company;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT * INTO tpl FROM public.company_templates
   WHERE id = app_private.resolve_company_template(_company, _dept, _role);

  UPDATE public.cards c
     SET department_id = _dept,
         is_verified = comp.is_verified,
         company_template_id = COALESCE(tpl.id, c.company_template_id),
         template = COALESCE(tpl.template, c.template),
         accent_color = COALESCE(tpl.accent_color, c.accent_color),
         design = CASE WHEN tpl.design IS NOT NULL THEN tpl.design ELSE c.design END,
         updated_at = now()
   WHERE c.company_id = _company
     AND c.user_id = _user
     AND c.card_type = 'employee';
END;
$$;

REVOKE ALL ON FUNCTION app_private.apply_company_template_to_card(uuid, uuid, uuid, public.company_role) FROM PUBLIC;

-- 6. Promotion / transfer -> refresh the employee card automatically
CREATE OR REPLACE FUNCTION public.sync_member_card_design()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private
AS $$
BEGIN
  PERFORM app_private.apply_company_template_to_card(NEW.company_id, NEW.user_id, NEW.department_id, NEW.role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_member_card_design ON public.company_members;
CREATE TRIGGER trg_sync_member_card_design
AFTER UPDATE OF role, department_id ON public.company_members
FOR EACH ROW
WHEN (OLD.role IS DISTINCT FROM NEW.role OR OLD.department_id IS DISTINCT FROM NEW.department_id)
EXECUTE FUNCTION public.sync_member_card_design();

-- 7. Editing a template refreshes every card that follows it
CREATE OR REPLACE FUNCTION public.sync_cards_of_template()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private
AS $$
BEGIN
  UPDATE public.cards
     SET template = NEW.template,
         accent_color = NEW.accent_color,
         design = CASE WHEN NEW.design IS NOT NULL THEN NEW.design ELSE design END,
         updated_at = now()
   WHERE company_template_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_cards_of_template ON public.company_templates;
CREATE TRIGGER trg_sync_cards_of_template
AFTER UPDATE OF design, template, accent_color ON public.company_templates
FOR EACH ROW EXECUTE FUNCTION public.sync_cards_of_template();