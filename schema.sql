-- =====================================================================
--  Fazal Elahi website — Supabase schema + security
--  HOW TO RUN: Supabase Dashboard → SQL Editor → New query →
--  paste ALL of this → click "Run".  Safe to re-run (idempotent).
-- =====================================================================

-- 1) CONTENT TABLE -----------------------------------------------------
-- One row per `fazal_*` content key. value is JSON (the data object/array).
create table if not exists public.site_content (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Public (anyone) can READ content → powers the public website.
drop policy if exists "content public read" on public.site_content;
create policy "content public read"
  on public.site_content for select
  using (true);

-- Only signed-in admins can WRITE content.
drop policy if exists "content admin write" on public.site_content;
create policy "content admin write"
  on public.site_content for all
  to authenticated
  using (true)
  with check (true);


-- 2) INQUIRIES TABLE ---------------------------------------------------
-- Contact-form submissions. Visitors (anon) can INSERT; only admins read.
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text,
  company     text,
  type        text,
  message     text,
  status      text not null default 'New',
  created_at  timestamptz not null default now()
);

alter table public.inquiries enable row level security;

-- Anyone (a website visitor) can submit an inquiry.
drop policy if exists "inquiries anon insert" on public.inquiries;
create policy "inquiries anon insert"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

-- Only signed-in admins can read / update / delete inquiries.
drop policy if exists "inquiries admin read"   on public.inquiries;
create policy "inquiries admin read"
  on public.inquiries for select
  to authenticated using (true);

drop policy if exists "inquiries admin update" on public.inquiries;
create policy "inquiries admin update"
  on public.inquiries for update
  to authenticated using (true) with check (true);

drop policy if exists "inquiries admin delete" on public.inquiries;
create policy "inquiries admin delete"
  on public.inquiries for delete
  to authenticated using (true);

-- Done. Next: create your admin login under Authentication → Users
-- (Add user → enter your email + password → enable "Auto Confirm User").
