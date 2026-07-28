update public.cards c
set title = coalesce(nullif(c.department, ''), case c.title
    when 'owner' then 'المالك'
    when 'admin' then 'مدير النظام'
    when 'manager' then 'مدير'
    when 'employee' then 'موظف'
    when 'viewer' then 'مشاهد'
  end),
  updated_at = now()
where c.card_type = 'employee'
  and c.title in ('owner','admin','manager','employee','viewer');