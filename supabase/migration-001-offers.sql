-- Run this only if you already ran an earlier schema.sql. New setups just run schema.sql.
alter table projects add column if not exists package_id text not null default 'retail';
alter table projects add column if not exists offer_code text;
create table if not exists offer_codes (
  code text primary key, package_id text not null, label text, max_uses integer,
  used_count integer not null default 0, email text, expires_at timestamptz,
  active boolean not null default true, created_at timestamptz not null default now()
);
alter table offer_codes enable row level security;
create policy "admin offer codes" on offer_codes for all using (is_admin()) with check (is_admin());
create or replace function redeem_offer_code(c text, e text) returns text language plpgsql security definer set search_path = public as $$
declare pkg text;
begin
  update offer_codes set used_count = used_count + 1
  where upper(code) = upper(c) and active
    and (expires_at is null or expires_at > now())
    and (max_uses is null or used_count < max_uses)
    and (email is null or lower(email) = lower(e))
  returning package_id into pkg;
  return pkg;
end $$;
revoke execute on function redeem_offer_code(text, text) from public, anon, authenticated;
