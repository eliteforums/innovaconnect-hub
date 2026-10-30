-- InnovaHack Chapter 2 — form submission storage.
-- Run once in the Supabase SQL editor (or with `supabase db push`).
--
-- Every table has row-level security enabled and NO policies, so the public
-- anon key can neither read nor write. The website writes with the
-- service-role key from server-side route handlers only.

create extension if not exists pgcrypto;

do $$
declare t text;
begin
  foreach t in array array['interest_signups', 'registrations', 'partner_inquiries', 'contact_messages'] loop
    execute format($f$
      create table if not exists public.%1$I (
        id          uuid primary key default gen_random_uuid(),
        created_at  timestamptz not null default now(),
        dedupe_key  text not null unique,
        email       text not null,
        payload     jsonb not null
      );
      alter table public.%1$I enable row level security;
      create index if not exists %1$s_created_at_idx on public.%1$I (created_at desc);
      create index if not exists %1$s_email_idx on public.%1$I (email);
    $f$, t);
  end loop;
end $$;

-- ── Admin dashboard ────────────────────────────────────────────────────────
-- Editable site content: one JSON document per section, overriding the
-- built-in defaults in the code.
create table if not exists public.site_content (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table public.site_content enable row level security;

-- Admin sessions. Only a SHA-256 hash of each session token is stored.
create table if not exists public.admin_sessions (
  token_hash  text primary key,
  username    text not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);
alter table public.admin_sessions enable row level security;
create index if not exists admin_sessions_expires_idx on public.admin_sessions (expires_at);

-- Public bucket for images uploaded through the dashboard. Uploads and
-- deletes use the service-role key from the server; anyone can view.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;
