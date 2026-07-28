create or replace function public.bump_card_view_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.event_type = 'view' then
    update public.cards set view_count = view_count + 1 where id = NEW.card_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_bump_card_view_count on public.card_events;
create trigger trg_bump_card_view_count
after insert on public.card_events
for each row execute function public.bump_card_view_count();

-- backfill existing views
update public.cards c
set view_count = sub.n
from (select card_id, count(*)::int n from public.card_events where event_type='view' group by card_id) sub
where sub.card_id = c.id and c.view_count < sub.n;