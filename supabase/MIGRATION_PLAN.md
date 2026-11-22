# Supabase hardening — migration plan (NOT executed)

Status as of 2026-11-21: **nothing here has been applied anywhere.** The Supabase project referenced by
`data.js` (`dnprmvvjxbbxbnixjfye.supabase.co`) does not resolve in DNS (checked via 8.8.8.8, 1.1.1.1 and
from the live site in Chrome: `ERR_NAME_NOT_RESOLVED`). The project existed in June 2026 (anon-key `iat`).
It is **paused or deleted** — cannot be distinguished without dashboard access.

## What is established, and what is not (as of 2026-11-22)
**Established by evidence**
- The host `dnprmvvjxbbxbnixjfye.supabase.co` does not resolve (NXDOMAIN via 8.8.8.8 and 1.1.1.1; a random control ref also gives NXDOMAIN, so
  that is how Supabase DNS answers for an unavailable project). The production site (https://fazalelahi.xyz) and `origin/main` both use exactly that host.
- The anon key's `iat` shows the project existed in June 2026, so "never existed / typo" is unlikely.
- Visitors to production therefore get built-in default content, the contact form cannot store inquiries (it now falls back to a mail draft with honest
  wording), and admin login cannot work.
- The schema in `schema.sql` (the file in this repo) grants every signed-in user admin-level access. Replayed in a local Postgres engine, a non-admin reads all
  inquiries, rewrites content and deletes rows. That is a risk **in that schema**.

**Not established (no access)**
- Whether the project is *paused*, *deleted* or *replaced*. NXDOMAIN fits both a paused and a deleted project.
- What policies/grants actually exist on any live database. The schema file may differ from what was ever applied; **no live policy has been inspected**, and
  the local test results do not prove anything about an unreachable production database.
- Whether public sign-up is enabled; whether the admin account and its metadata are set up; Auth/JWT settings; Storage bucket state.
- Behaviour on a real Supabase stack (GoTrue/PostgREST/Storage): only a PGlite policy emulation and mocked HTTP were used. No isolated staging project was
  available to me (creating one needs your Supabase account), so none was used.

**Owner actions needed** (see section 0 and 1): open the dashboard to see the project state; if usable, point a *staging* project at this branch's preview,
run `schema.sql` then `hardening.proposed.sql`, mark the admin via `app_metadata`, and re-run the checks in section 3 by hand. Nothing here was applied anywhere.

## 0. Prerequisite: find out what happened to the project (owner action)
1. Sign in at supabase.com → check whether the project is *Paused* (free tier pauses after ~1 week inactive) or gone.
2. Paused → "Restore project". Deleted → create a new project, run `schema.sql`, then this file, create the admin user,
   and update `SUPABASE_URL` / `SUPABASE_ANON_KEY` in `data.js` (anon key only — never service_role).
3. Until then the public site works from built-in defaults; the contact form falls back to the visitor's mail app
   (honestly labelled) and **no inquiry is stored**. Admin login cannot work.

## 1. Order of operations (staging first)
1. Create a **staging** project (free). Run `schema.sql`.
2. Take a backup of production before touching it: dashboard → Database → Backups (or `pg_dump` of `public` + `storage.objects` metadata);
   export `inquiries` as CSV (contains personal data — store encrypted, delete after).
3. Create admin user (Auth → Users → Add user, auto-confirm).
4. Run `hardening.proposed.sql`, then immediately:
   `update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}' where email='ADMIN@…';`
   Sign out and in (JWT must carry the claim).
5. Verify on staging (section 3). Only then repeat on production in a quiet window.
6. Auth → Providers → Email: **disable "Allow new users to sign up"**; keep "Confirm email" on. Add MFA (TOTP) for the admin and, if desired,
   require `aal2` in `is_admin()` (comment in the SQL).

## 2. Rollback
Policies are the only behavioural change. To revert to the previous behaviour (not recommended — it re-opens the hole):
```sql
-- restore schema.sql policies
drop policy "content admin write" on public.site_content;
create policy "content admin write" on public.site_content for all to authenticated using (true) with check (true);
drop policy "inquiries admin read" on public.inquiries;   create policy "inquiries admin read"   on public.inquiries for select to authenticated using (true);
drop policy "inquiries admin update" on public.inquiries; create policy "inquiries admin update" on public.inquiries for update to authenticated using (true) with check (true);
drop policy "inquiries admin delete" on public.inquiries; create policy "inquiries admin delete" on public.inquiries for delete to authenticated using (true);
drop policy "inquiries anon insert" on public.inquiries;  create policy "inquiries anon insert"  on public.inquiries for insert to anon, authenticated with check (true);
alter table public.inquiries drop constraint if exists inquiries_limits;
drop trigger if exists inquiries_rate_limit on public.inquiries;
drop trigger if exists audit_inquiries on public.inquiries; drop trigger if exists audit_content on public.site_content;
-- media policies: re-run the three "media admin *" policies from schema.sql
```
Lock-out recovery: the dashboard SQL editor runs as `postgres` and bypasses RLS; set `app_metadata.role` there.
`admin_audit` can be kept (harmless) or dropped.

## 3. Test evidence (local, PGlite = real Postgres engine, no network)
`qa-starter/baseline/rls-check.mjs` replays `schema.sql` (+ the proposal) with emulated Supabase roles and `auth.jwt()` claims.

| Check | schema.sql as-is | with proposal |
|---|---|---|
| Non-admin signed-in user reads all inquiries (PII) | **LEAKS** | denied |
| Non-admin modifies site_content | **ALLOWED** | denied |
| Non-admin deletes inquiries | **ALLOWED** | denied |
| Non-admin uploads to media bucket | **ALLOWED** | denied |
| Self-asserted `user_metadata.role=admin` | n/a (everyone is admin) | denied |
| Custom top-level claim | n/a | denied |
| Expired admin token | n/a | denied |
| Anon sets `status`, 1 MB message, garbage e-mail | **ALLOWED** | rejected |
| 6th inquiry from one e-mail / hour | allowed | rejected (others unaffected) |
| Admin read/update/upload, anon valid insert, anon read content | ok | ok |
| anon table privileges | INSERT on inquiries (+ default) | INSERT only; SELECT only on site_content |
| Audit rows written for admin changes; audit unreadable/unwritable by non-admins | none | yes |

Result: proposal 22/22 pass; current schema fails the 8 authorization/validation checks.
**Not tested:** a real Supabase stack (GoTrue, PostgREST, Storage API) — no Docker here. Re-run section 1.5 manually on staging:
sign in as admin (works), sign in as a second non-admin user (cannot read inquiries via REST), submit the contact form anonymously (row stored).

## 4. Admin authentication design (server-verified)
* Authority = database RLS using `public.is_admin()` (`app_metadata.role='admin'` + unexpired). `sessionStorage` is only a UI hint.
* `admin.html` now calls `rpc('is_admin')` after sign-in and on session restore and refuses to show the admin UI unless the **server** says true
  (non-admin accounts are signed out). If the RPC does not exist yet (migration not applied) it falls back to the old behaviour with a console warning,
  so deploying the front-end before the SQL cannot lock the admin out.
* Passwords/sessions are Supabase Auth (JWT, auto-refresh). Recommended: MFA, disable signup, short JWT expiry (dashboard → Auth → JWT expiry ≤ 1h).
* Local (cloud-off) mode is a convenience only: its password check is client-side and protects nothing server-side.

## 5. Abuse resistance & personal data
* Client: `maxlength`, honeypot field, busy-state/double-submit guard. Server: length/format CHECKs, status forced to `New`, per-e-mail rate limit.
* Not included (needs infra): per-IP limits and CAPTCHA (Cloudflare Turnstile via an Edge Function) — recommended if spam appears.
* PII: inquiries contain name/e-mail/message. Only admins can read; every admin update/delete is audited; define a retention period
  (e.g. delete after 12 months) and avoid exporting CSVs to shared drives. CSV export now neutralises spreadsheet formulas.
