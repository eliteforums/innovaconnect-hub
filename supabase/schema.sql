-- ════════════════════════════════════════════════════════════════════════════
--  InnovaHack Chapter 2 — complete database & storage setup (Supabase)
-- ════════════════════════════════════════════════════════════════════════════
--
--  HOW TO RUN
--    Supabase dashboard → SQL Editor → New query → paste this whole file → Run.
--    It is idempotent: safe to run again after updates, and it never deletes
--    data. Then set these environment variables on the website (e.g. Vercel):
--      SUPABASE_URL               = Project Settings → API → Project URL
--      SUPABASE_SERVICE_ROLE_KEY  = Project Settings → API → service_role key
--      ADMIN_USERNAME / ADMIN_PASSWORD  (dashboard login; defaults admin/admin)
--
--  SECURITY MODEL
--    The website talks to Supabase only from the server, with the service-role
--    key. Every table has row-level security ON and NO policies, and the anon /
--    authenticated roles have no table privileges — so the public anon key can
--    neither read nor write anything. Never expose the service-role key in the
--    browser.
--
--  WHAT IT CREATES
--    1. Form submissions:  interest_signups, registrations,
--                          partner_inquiries, contact_messages
--    2. Admin dashboard:   site_content (editable content),
--                          admin_sessions (sign-in sessions)
--    3. Storage:           public bucket "site-media" for uploaded images
--    4. Read-only views:   *_view tables that flatten submissions for browsing
--                          in the Supabase Table Editor
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. FORM SUBMISSIONS
--    One table per public form. The app writes {dedupe_key, email, payload};
--    `payload` holds the validated form fields as JSON. A unique dedupe_key
--    makes duplicate submissions fail with 409, which the site reports as
--    "already received".
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array['interest_signups', 'registrations', 'partner_inquiries', 'contact_messages'] loop
    execute format($f$
      create table if not exists public.%1$I (
        id          uuid        primary key default gen_random_uuid(),
        created_at  timestamptz not null default now(),
        dedupe_key  text        not null unique,
        email       text        not null,
        payload     jsonb       not null
      );
      alter table public.%1$I enable row level security;
      create index if not exists %1$s_created_at_idx on public.%1$I (created_at desc);
      create index if not exists %1$s_email_idx      on public.%1$I (lower(email));
    $f$, t);

    -- Sanity constraints (added only once).
    if not exists (select 1 from pg_constraint where conname = t || '_payload_object') then
      execute format('alter table public.%I add constraint %I check (jsonb_typeof(payload) = ''object'')', t, t || '_payload_object');
    end if;
    if not exists (select 1 from pg_constraint where conname = t || '_email_length') then
      execute format('alter table public.%I add constraint %I check (char_length(email) between 3 and 254)', t, t || '_email_length');
    end if;
    if not exists (select 1 from pg_constraint where conname = t || '_dedupe_key_length') then
      execute format('alter table public.%I add constraint %I check (char_length(dedupe_key) between 1 and 300)', t, t || '_dedupe_key_length');
    end if;
  end loop;
end $$;

comment on table public.interest_signups  is 'Event update list sign-ups (/register#updates). Deduplicated by email.';
comment on table public.registrations     is 'Team registrations (/register, only while registration is open). Deduplicated by team lead email.';
comment on table public.partner_inquiries is 'Partnership / sponsorship inquiries (/partners).';
comment on table public.contact_messages  is 'Contact form messages (/contact).';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. ADMIN DASHBOARD
-- ────────────────────────────────────────────────────────────────────────────

-- Editable site content: one JSON document per section (e.g. "event",
-- "copy.home"). Saved sections override the built-in defaults in the code;
-- deleting a row restores the default for that section.
create table if not exists public.site_content (
  key         text        primary key,
  value       jsonb       not null,
  updated_at  timestamptz not null default now()
);
alter table public.site_content enable row level security;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'site_content_key_format') then
    alter table public.site_content
      add constraint site_content_key_format check (key ~ '^[a-zA-Z0-9._-]{1,64}$');
  end if;
end $$;

comment on table public.site_content is 'Admin-edited content sections, merged over the defaults in src/content/.';

-- Keep updated_at current, including for edits made directly in Supabase.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before insert or update on public.site_content
  for each row execute function public.touch_updated_at();

-- Admin sign-in sessions. Only the SHA-256 hash of each session token is
-- stored, never the token itself.
create table if not exists public.admin_sessions (
  token_hash  text        primary key,
  username    text        not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);
alter table public.admin_sessions enable row level security;
create index if not exists admin_sessions_expires_idx on public.admin_sessions (expires_at);

comment on table public.admin_sessions is 'Admin dashboard sessions (hashed tokens). Expired rows are purged automatically.';

-- Remove expired sessions. Runs automatically on every sign-in (trigger
-- below); can also be called manually: select public.purge_expired_admin_sessions();
create or replace function public.purge_expired_admin_sessions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.admin_sessions where expires_at <= now();
  get diagnostics removed = row_count;
  return removed;
end;
$$;

create or replace function public.admin_sessions_purge_on_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform public.purge_expired_admin_sessions();
  return new;
end;
$$;

drop trigger if exists admin_sessions_purge on public.admin_sessions;
create trigger admin_sessions_purge
  before insert on public.admin_sessions
  for each statement execute function public.admin_sessions_purge_on_insert();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. STORAGE — images uploaded in the admin dashboard
--    Public bucket: anyone can view an image by its URL (that is how the site
--    displays them). Uploads and deletes happen only on the server with the
--    service-role key, so no storage policies are needed. Limits match the
--    app: 5 MB, JPEG / PNG / WebP / GIF / AVIF.
-- ────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. READ-ONLY VIEWS for browsing submissions in the Supabase Table Editor
--    security_invoker = on means the views obey the same access rules as the
--    tables, so they expose nothing to the public API.
-- ────────────────────────────────────────────────────────────────────────────

create or replace view public.registrations_view
with (security_invoker = on) as
select
  id,
  created_at,
  payload #>> '{team,name}'            as team_name,
  payload #>> '{domain}'               as domain,
  payload #>> '{lead,fullName}'        as lead_name,
  payload #>> '{lead,email}'           as lead_email,
  payload #>> '{lead,phone}'           as lead_phone,
  payload #>> '{lead,organization}'    as organization,
  payload #>> '{lead,city}'            as city,
  payload #>> '{lead,state}'           as state,
  jsonb_array_length(coalesce(payload #> '{team,members}', '[]'::jsonb)) + 1 as team_size,
  payload #>> '{project,title}'        as project_title,
  payload #>> '{project,summary}'      as project_summary,
  payload #>> '{project,repoUrl}'      as repo_url,
  payload #>> '{project,demoUrl}'      as demo_url,
  (payload #>> '{consents,updates}')::boolean as wants_updates,
  payload                               as raw
from public.registrations;

create or replace view public.interest_signups_view
with (security_invoker = on) as
select
  id,
  created_at,
  payload ->> 'name'          as name,
  email,
  payload ->> 'organization'  as organization,
  payload ->> 'interest'      as interest
from public.interest_signups;

create or replace view public.partner_inquiries_view
with (security_invoker = on) as
select
  id,
  created_at,
  payload ->> 'organization'  as organization,
  payload ->> 'category'      as category,
  payload ->> 'contactName'   as contact_name,
  payload ->> 'contactRole'   as contact_role,
  email,
  payload ->> 'interest'      as interest,
  payload ->> 'contribution'  as contribution,
  payload ->> 'challenge'     as challenge,
  payload ->> 'message'       as message
from public.partner_inquiries;

create or replace view public.contact_messages_view
with (security_invoker = on) as
select
  id,
  created_at,
  payload ->> 'name'     as name,
  email,
  payload ->> 'topic'    as topic,
  payload ->> 'message'  as message
from public.contact_messages;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. PRIVILEGES
--    Lock everything to the server (service_role). RLS already blocks the
--    public roles; revoking privileges is a second, independent barrier.
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  obj text;
begin
  foreach obj in array array[
    'interest_signups', 'registrations', 'partner_inquiries', 'contact_messages',
    'site_content', 'admin_sessions',
    'registrations_view', 'interest_signups_view', 'partner_inquiries_view', 'contact_messages_view'
  ] loop
    execute format('revoke all on public.%I from anon, authenticated', obj);
    execute format('grant select, insert, update, delete on public.%I to service_role', obj);
  end loop;
end $$;

revoke all on function public.purge_expired_admin_sessions() from public, anon, authenticated;
grant execute on function public.purge_expired_admin_sessions() to service_role;
revoke all on function public.admin_sessions_purge_on_insert() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

commit;

-- ════════════════════════════════════════════════════════════════════════════
--  Optional checks (run separately after setup):
--    select table_name from information_schema.tables
--     where table_schema = 'public' order by 1;
--    select id, public, file_size_limit from storage.buckets where id = 'site-media';
--
--  Useful queries:
--    select * from public.registrations_view order by created_at desc;
--    select count(*) from public.interest_signups;
--    delete from public.site_content where key = 'copy.home';  -- reset a section
-- ════════════════════════════════════════════════════════════════════════════
