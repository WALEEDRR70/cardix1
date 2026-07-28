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
  member_job_title text;
  dept_name text;
BEGIN
  SELECT * INTO comp FROM public.companies WHERE id = _company;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT job_title INTO member_job_title
  FROM public.company_members
  WHERE company_id = _company AND user_id = _user
  LIMIT 1;

  SELECT name INTO dept_name
  FROM public.company_departments
  WHERE id = _dept AND company_id = _company
  LIMIT 1;

  SELECT * INTO tpl FROM public.company_templates
   WHERE id = app_private.resolve_company_template(_company, _dept, _role);

  UPDATE public.cards c
     SET department_id = _dept,
         department = dept_name,
         title = COALESCE(NULLIF(member_job_title, ''), tpl.target_role::text, tpl.name, dept_name, c.title),
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

UPDATE public.cards c
SET department = s.department_name,
    title = COALESCE(NULLIF(s.job_title, ''), s.target_role, s.template_name, s.department_name, c.title),
    updated_at = now()
FROM (
  SELECT
    m.company_id,
    m.user_id,
    m.job_title,
    d.name AS department_name,
    ct.target_role::text AS target_role,
    ct.name AS template_name,
    c2.id AS card_id
  FROM public.cards c2
  JOIN public.company_members m
    ON m.company_id = c2.company_id AND m.user_id = c2.user_id
  LEFT JOIN public.company_departments d
    ON d.id = m.department_id AND d.company_id = m.company_id
  LEFT JOIN public.company_templates ct
    ON ct.id = c2.company_template_id
  WHERE c2.card_type = 'employee'
) s
WHERE c.id = s.card_id;