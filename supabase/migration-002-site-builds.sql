-- Website agent: one row per generated version of a client's website.
-- Run once in the Supabase SQL editor (after schema.sql and any earlier migrations).
do $$ begin
  create type build_status as enum ('queued', 'generating', 'deploying', 'ready', 'published', 'superseded', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists site_builds (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  version integer not null default 1,
  status build_status not null default 'queued',
  change_request text,              -- what Aisha asked to change for this version
  content jsonb,                    -- everything the agent wrote (copy, design, image plan)
  notes_for_admin jsonb not null default '[]',
  netlify_site_id text,
  netlify_site_name text,
  netlify_deploy_id text,
  preview_url text,                 -- private draft deploy, for Aisha to check
  live_url text,                    -- set when Aisha approves and it's published
  custom_domain text,
  error text,
  log jsonb not null default '[]',
  usage jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ready_at timestamptz,
  approved_at timestamptz,
  sent_at timestamptz
);
create index if not exists site_builds_project on site_builds (project_id, version desc);

-- Admin only: clients never see drafts. They get the link from Aisha once it's approved.
alter table site_builds enable row level security;
drop policy if exists "admin builds" on site_builds;
create policy "admin builds" on site_builds for all using (is_admin()) with check (is_admin());
