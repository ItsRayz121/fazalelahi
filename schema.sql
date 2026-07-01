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

-- TABLE-LEVEL GRANTS (REQUIRED) — RLS policies above only take effect once the
-- API roles also hold table privileges. Tables created via raw SQL are NOT
-- auto-granted to anon/authenticated, which is why public reads previously
-- failed with "permission denied for table site_content". These are idempotent.
grant usage on schema public to anon, authenticated;
grant select on public.site_content to anon, authenticated;      -- public website reads
grant insert, update, delete on public.site_content to authenticated; -- admin writes


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

-- TABLE-LEVEL GRANTS for inquiries (see note above). Idempotent.
grant insert on public.inquiries to anon, authenticated;         -- visitors submit the form
grant select, update, delete on public.inquiries to authenticated; -- admin manages them

-- 3) MEDIA STORAGE BUCKET ---------------------------------------------
-- Holds images & videos uploaded from the admin panel ("Upload from
-- device"). Public can READ (so the website can show them); only signed-in
-- admins can UPLOAD / replace / delete. Safe to re-run.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Anyone can read media (powers <img>/<video> on the public site).
drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  using ( bucket_id = 'media' );

-- Only signed-in admins can upload.
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'media' );

-- Only signed-in admins can replace (upsert) existing files.
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'media' )
  with check ( bucket_id = 'media' );

-- Only signed-in admins can delete.
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'media' );

-- Done. Next: create your admin login under Authentication → Users
-- (Add user → enter your email + password → enable "Auto Confirm User").
