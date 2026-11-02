-- Client journey: the 6 locked steps on the client dashboard.
-- Steps the client confirms themselves (payment sent, call booked, handover done)
-- are recorded here with a timestamp; Aisha still confirms payments in Admin.
alter table projects add column if not exists journey jsonb not null default '{}';

create or replace function mark_journey(pid uuid, step text, note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (owns_project(pid) or is_admin()) then raise exception 'not allowed'; end if;
  if step not in ('deposit_sent', 'call_booked', 'handover_done', 'balance_sent') then
    raise exception 'unknown step';
  end if;
  update projects
     set journey = journey
       || jsonb_build_object(step || '_at', now())
       || case when note is not null and length(trim(note)) > 0
               then jsonb_build_object(step || '_note', left(note, 4000)) else '{}'::jsonb end
   where id = pid;
end $$;
grant execute on function mark_journey(uuid, text, text) to authenticated;
