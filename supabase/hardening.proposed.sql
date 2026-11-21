-- =====================================================================
--  PROPOSED least-privilege hardening for schema.sql   (NOT APPLIED)
--  Run on a STAGING Supabase project first. Idempotent. See supabase/MIGRATION_PLAN.md.
--
--  Problem: schema.sql grants every `authenticated` user full control of
--  site_content, inquiries (read PII) and the media bucket. Any account that
--  can sign in (public signup on, invite, OAuth, a leaked low-privilege
--  account) is an admin.
--
--  Fix: authorise on `app_metadata.role = 'admin'` (writable only server-side:
--  dashboard / service role - NEVER user_metadata, which users edit themselves)
--  and on a non-expired token. Public signup should still be disabled.
--
--  Mark your admin AFTER applying (replace the email), then sign out/in:
--    update auth.users
--       set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'
--     where email = 'YOUR-ADMIN@EXAMPLE.COM';
--  !! Do this BEFORE you rely on the new policies or you will lock yourself out.
-- =====================================================================

-- 1) Admin predicate ---------------------------------------------------
-- exp is re-checked in SQL as defence in depth (PostgREST already rejects expired JWTs).
-- To also require MFA, add:  and (auth.jwt() ->> 'aal') = 'aal2'
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and coalesce((auth.jwt() ->> 'exp')::bigint, 0) > extract(epoch from now())::bigint,
    false)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;   -- lets the admin UI ask the server

-- 2) site_content: public read, admin write ------------------------------
drop policy if exists "content admin write" on public.site_content;
create policy "content admin write"
  on public.site_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3) inquiries: constrained anonymous insert, admin manage ---------------
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

-- Grants: anon may only INSERT; nothing else on inquiries / writes on content.
revoke all on public.inquiries    from anon;
revoke all on public.site_content from anon;
grant insert on public.inquiries    to anon;
grant select on public.site_content to anon;

-- 4) Abuse brake: max 5 inquiries per e-mail per hour (does not block other visitors) ----
-- security definer: the visitor (anon) has no SELECT on inquiries, but the trigger must count rows.
create or replace function public.inquiries_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.inquiries
       where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate limit exceeded' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists inquiries_rate_limit on public.inquiries;
create trigger inquiries_rate_limit before insert on public.inquiries
  for each row execute function public.inquiries_rate_limit();
-- Real per-IP limiting / CAPTCHA needs an Edge Function or Turnstile in front; a global
-- cap here would let an attacker lock real visitors out, so it is intentionally omitted.

-- 5) Audit trail: who changed/deleted what (admin-readable, append-only) -------
create table if not exists public.admin_audit (
  id         bigserial primary key,
  at         timestamptz not null default now(),
  actor      uuid,
  tbl        text not null,
  op         text not null,
  row_key    text
);
alter table public.admin_audit enable row level security;
drop policy if exists "audit admin read" on public.admin_audit;
create policy "audit admin read" on public.admin_audit for select to authenticated using (public.is_admin());
revoke all on public.admin_audit from anon, authenticated;
grant select on public.admin_audit to authenticated;

create or replace function public.audit_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.admin_audit(actor, tbl, op, row_key)
  values (nullif(auth.jwt() ->> 'sub','')::uuid, tg_table_name, tg_op,
          coalesce(to_jsonb(old) ->> 'id', to_jsonb(old) ->> 'key', to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'key'));
  return coalesce(new, old);
end $$;
drop trigger if exists audit_inquiries on public.inquiries;
create trigger audit_inquiries after update or delete on public.inquiries
  for each row execute function public.audit_change();
drop trigger if exists audit_content on public.site_content;
create trigger audit_content after insert or update or delete on public.site_content
  for each row execute function public.audit_change();

-- 6) media bucket: public read, admin write ------------------------------
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
