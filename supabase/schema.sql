-- MONOS client portal schema. Run once in the Supabase SQL editor.

create type user_role as enum ('admin', 'client');
create type stage_status as enum ('todo', 'in_progress', 'done');
create type payment_status as enum ('due', 'paid', 'overdue');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'client',
  full_name text,
  company text,
  email text,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles on delete cascade,
  name text not null,
  package text not null default 'Website (7-day build)',
  price_pence integer not null default 100000,
  start_date date not null default current_date,
  -- Per-client customisation: which portal sections and brief questions this client sees.
  modules jsonb not null default '{"consultation":true,"agreement":true,"payments":true,"uploads":true}',
  brief_sections text[] not null default array['business','pages','style','content','domain'],
  notes text,
  created_at timestamptz not null default now()
);

create table stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  position integer not null,
  name text not null,
  status stage_status not null default 'todo',
  due_date date,
  client_note text
);

create table consultations (
  project_id uuid primary key references projects on delete cascade,
  answers jsonb not null default '{}',
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table agreements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  title text not null,
  body text not null,
  signed_name text,
  signed_at timestamptz,
  signed_ip text
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  label text not null,
  amount_pence integer not null,
  due_date date,
  status payment_status not null default 'due',
  payment_url text,
  paid_at timestamptz
);

create table files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  path text not null,
  name text not null,
  uploaded_by uuid references profiles,
  created_at timestamptz not null default now()
);

-- Helpers
create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create function owns_project(pid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects where id = pid and client_id = auth.uid())
$$;

-- New auth users get a client profile automatically.
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, company)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'company');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Row-level security: clients only ever see their own project data; admins see everything.
alter table profiles enable row level security;
alter table projects enable row level security;
alter table stages enable row level security;
alter table consultations enable row level security;
alter table agreements enable row level security;
alter table payments enable row level security;
alter table files enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "admin profiles" on profiles for all using (is_admin()) with check (is_admin());

create policy "read projects" on projects for select using (client_id = auth.uid() or is_admin());
create policy "admin projects" on projects for all using (is_admin()) with check (is_admin());

create policy "read stages" on stages for select using (owns_project(project_id) or is_admin());
create policy "admin stages" on stages for all using (is_admin()) with check (is_admin());

create policy "read consultation" on consultations for select using (owns_project(project_id) or is_admin());
create policy "write consultation" on consultations for insert with check (owns_project(project_id) or is_admin());
create policy "update consultation" on consultations for update using (owns_project(project_id) or is_admin());

create policy "read agreements" on agreements for select using (owns_project(project_id) or is_admin());
create policy "admin agreements" on agreements for all using (is_admin()) with check (is_admin());
-- Clients sign through the sign_agreement function below, never by direct update.

create policy "read payments" on payments for select using (owns_project(project_id) or is_admin());
create policy "admin payments" on payments for all using (is_admin()) with check (is_admin());

create policy "read files" on files for select using (owns_project(project_id) or is_admin());
create policy "add files" on files for insert with check (owns_project(project_id) or is_admin());

create function sign_agreement(aid uuid, name text, ip text) returns void language plpgsql security definer set search_path = public as $$
begin
  update agreements set signed_name = name, signed_at = now(), signed_ip = ip
  where id = aid and signed_at is null and owns_project(project_id);
  if not found then raise exception 'Agreement not found or already signed'; end if;
end $$;

-- Storage bucket for client uploads, foldered by project id.
insert into storage.buckets (id, name, public) values ('client-files', 'client-files', false);
create policy "client upload" on storage.objects for insert
  with check (bucket_id = 'client-files' and (owns_project(((storage.foldername(name))[1])::uuid) or is_admin()));
create policy "client read" on storage.objects for select
  using (bucket_id = 'client-files' and (owns_project(((storage.foldername(name))[1])::uuid) or is_admin()));
