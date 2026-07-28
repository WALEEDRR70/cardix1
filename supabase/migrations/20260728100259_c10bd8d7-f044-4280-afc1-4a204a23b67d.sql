CREATE OR REPLACE FUNCTION app_private.apply_company_template_to_card(_company uuid, _user uuid, _dept uuid, _role public.company_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private
AS $$
DECLARE
  tpl public.company_templates%ROWTYPE;
  comp public.companies%ROWTYPE;
  member_job_title text;
  dept_name text;
  role_label text;
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

  role_label := CASE COALESCE(_role::text, '')
    WHEN 'owner' THEN 'المالك'
    WHEN 'admin' THEN 'مدير النظام'
    WHEN 'manager' THEN 'مدير'
    WHEN 'employee' THEN 'موظف'
    WHEN 'viewer' THEN 'مشاهد'
    ELSE NULL END;

  SELECT * INTO tpl FROM public.company_templates
   WHERE id = app_private.resolve_company_template(_company, _dept, _role);

  UPDATE public.cards c
     SET department_id = _dept,
         department = dept_name,
         title = COALESCE(NULLIF(member_job_title, ''), dept_name, role_label, c.title),
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