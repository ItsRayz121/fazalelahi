-- =====================================================================
--  PROPOSED least-privilege hardening for schema.sql   (NOT APPLIED)
--  Review, then run in a STAGING Supabase project first. Idempotent.
--
--  Problem: schema.sql grants every `authenticated` user full control of
--  site_content, inquiries (read PII) and the media bucket. Any account that
--  can sign in (public signup on, invite, OAuth, a leaked low-privilege
--  account) is an admin.
--
--  Fix: authorize on `app_metadata.role = 'admin'`. app_metadata can only be
--  written server-side (dashboard / service role), never by the user, unlike
--  user_metadata. Disabling public signup is still recommended but is no
--  longer the only protection.
--
--  After running, mark your admin (replace the email):
--    update auth.users
--       set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'
--     where email = 'YOUR-ADMIN@EXAMPLE.COM';
--  then sign out/in so the JWT carries the claim.
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- site_content: public read, admin write ------------------------------
drop policy if exists "content admin write" on public.site_content;
create policy "content admin write"
  on public.site_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- inquiries: constrained anonymous insert, admin manage ---------------
-- NOT VALID: enforce on new rows without failing on legacy rows.
alter table public.inquiries drop constraint if exists inquiries_limits;
alter table public.inquiries add constraint inquiries_limits check (
      char_length(coalesce(name,''))    between 1 and 120
  and char_length(coalesce(email,''))   between 3 and 254 and email like '%_@_%.__%'
  and char_length(coalesce(company,'')) <= 200
  and char_length(coalesce(type,''))    <= 80
  and char_length(coalesce(message,'')) between 1 and 5000
  and char_length(status) <= 20
) not valid;

drop policy if exists "inquiries anon insert" on public.inquiries;
create policy "inquiries anon insert"
  on public.inquiries for insert
  to anon, authenticated
  with check (status = 'New');            -- visitors cannot pre-set a status

drop policy if exists "inquiries admin read"   on public.inquiries;
create policy "inquiries admin read"   on public.inquiries for select to authenticated using (public.is_admin());
drop policy if exists "inquiries admin update" on public.inquiries;
create policy "inquiries admin update" on public.inquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "inquiries admin delete" on public.inquiries;
create policy "inquiries admin delete" on public.inquiries for delete to authenticated using (public.is_admin());

-- media bucket: public read, admin write ------------------------------
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- OPTIONAL abuse brake (off by default; trade-off: during an attack it also
-- blocks real visitors). Bounds storage growth from anonymous spam.
-- create or replace function public.inquiries_throttle() returns trigger language plpgsql as $$
-- begin
--   if (select count(*) from public.inquiries where created_at > now() - interval '1 minute') >= 10 then
--     raise exception 'rate limit' using errcode = 'P0001';
--   end if;
--   return new;
-- end $$;
-- drop trigger if exists inquiries_throttle on public.inquiries;
-- create trigger inquiries_throttle before insert on public.inquiries
--   for each row execute function public.inquiries_throttle();
-- Real per-IP limiting/CAPTCHA needs an Edge Function or Turnstile in front.
