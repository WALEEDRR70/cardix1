ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS department text;

UPDATE public.cards c
SET department = d.name
FROM public.company_departments d
WHERE c.department_id = d.id AND (c.department IS NULL OR c.department = '');

UPDATE public.cards c
SET title = COALESCE(NULLIF(m.job_title, ''), d.name)
FROM public.company_members m
LEFT JOIN public.company_departments d ON d.id = m.department_id
WHERE c.card_type = 'employee'
  AND m.company_id = c.company_id
  AND m.user_id = c.user_id
  AND (c.title IS NULL OR c.title = '')
  AND COALESCE(NULLIF(m.job_title, ''), d.name) IS NOT NULL;