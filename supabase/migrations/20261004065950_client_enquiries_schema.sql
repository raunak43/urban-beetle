-- =====================================================================
-- Urban Beetle lead management
-- Public visitors can only submit (through public.submit_enquiry, called
-- by the website server). Nobody without a team account can read anything.
-- =====================================================================

create schema if not exists private;

-- Lifecycle of an enquiry, in pipeline order.
create type public.enquiry_status as enum (
  'new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'closed'
);

-- ---------------------------------------------------------------------
-- Team accounts (for the future admin dashboard). Managed from the
-- Supabase dashboard: add a row here for each staff auth user.
-- ---------------------------------------------------------------------
create table public.team_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------
create table public.client_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- About you
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  company_name text not null check (char_length(btrim(company_name)) between 1 and 160),
  email text not null check (
    char_length(email) <= 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  phone text not null check (phone ~ '^\+?[0-9 ()-]{7,20}$'),
  city text check (char_length(city) <= 120),
  website text check (char_length(website) <= 300),
  social_media text check (char_length(social_media) <= 300),

  -- What do you need
  services_required text[] not null check (
    cardinality(services_required) between 1 and 14
    and services_required <@ array[
      'branding', 'website', 'social_media', 'content_creation', 'video_production',
      'photography', 'meta_ads', 'google_ads', 'seo', 'influencer_marketing',
      'creative_design', 'ai_creative', 'complete_marketing', 'other'
    ]::text[]
  ),
  services_other text check (char_length(services_other) <= 200),

  -- About the project
  business_description text not null check (char_length(btrim(business_description)) between 10 and 4000),
  project_goals text not null check (char_length(btrim(project_goals)) between 10 and 4000),
  current_challenges text check (char_length(current_challenges) <= 4000),
  target_audience text check (char_length(target_audience) <= 2000),

  -- Project information
  budget text not null check (budget in (
    'under_25k', '25k_50k', '50k_1l', '1l_2_5l', '2_5l_plus', 'not_decided'
  )),
  start_timeline text not null check (start_timeline in (
    'immediately', 'within_1_week', 'within_1_month', '1_3_months', 'just_exploring'
  )),
  project_duration text not null check (project_duration in (
    'one_time', '1_3_months', '3_6_months', '6_12_months', 'long_term', 'not_sure'
  )),

  -- Additional
  additional_information text check (char_length(additional_information) <= 4000),
  referral_source text check (referral_source in (
    'instagram', 'google', 'youtube', 'referral', 'existing_client', 'website', 'other'
  )),

  -- Pipeline (team-managed)
  enquiry_status public.enquiry_status not null default 'new',
  status_changed_at timestamptz not null default now(),
  assigned_to uuid references auth.users (id) on delete set null,

  -- Abuse tracking (salted hash, never the raw IP)
  ip_hash text check (char_length(ip_hash) <= 128),
  user_agent text check (char_length(user_agent) <= 400),

  -- Full-text search for the dashboard
  search tsvector generated always as (
    to_tsvector('simple'::regconfig,
      coalesce(full_name, '') || ' ' || coalesce(company_name, '') || ' ' ||
      coalesce(email, '') || ' ' || coalesce(phone, '') || ' ' || coalesce(city, '') || ' ' ||
      coalesce(business_description, '') || ' ' || coalesce(project_goals, '') || ' ' ||
      coalesce(current_challenges, '') || ' ' || coalesce(target_audience, ''))
  ) stored
);

comment on table public.client_enquiries is 'Project enquiries submitted from urbanbeetle website /enquiry.';

create index client_enquiries_created_at_idx on public.client_enquiries (created_at desc);
create index client_enquiries_status_idx on public.client_enquiries (enquiry_status, created_at desc);
create index client_enquiries_budget_idx on public.client_enquiries (budget);
create index client_enquiries_services_idx on public.client_enquiries using gin (services_required);
create index client_enquiries_search_idx on public.client_enquiries using gin (search);
create index client_enquiries_email_idx on public.client_enquiries (lower(email), created_at desc);
create index client_enquiries_ip_idx on public.client_enquiries (ip_hash, created_at desc);
create index client_enquiries_assigned_idx on public.client_enquiries (assigned_to);

-- Internal notes written by the team.
create table public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.client_enquiries (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index enquiry_notes_enquiry_idx on public.enquiry_notes (enquiry_id, created_at desc);
create index enquiry_notes_author_idx on public.enquiry_notes (author_id);

-- Audit trail of every status change.
create table public.enquiry_status_history (
  id bigint generated always as identity primary key,
  enquiry_id uuid not null references public.client_enquiries (id) on delete cascade,
  from_status public.enquiry_status,
  to_status public.enquiry_status not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default now()
);
create index enquiry_status_history_enquiry_idx on public.enquiry_status_history (enquiry_id, changed_at desc);
create index enquiry_status_history_changed_by_idx on public.enquiry_status_history (changed_by);

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------
create function private.touch_enquiry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.enquiry_status is distinct from old.enquiry_status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

create trigger client_enquiries_touch
before update on public.client_enquiries
for each row execute function private.touch_enquiry();

create function private.log_enquiry_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.enquiry_status_history (enquiry_id, from_status, to_status)
    values (new.id, null, new.enquiry_status);
  elsif new.enquiry_status is distinct from old.enquiry_status then
    insert into public.enquiry_status_history (enquiry_id, from_status, to_status, changed_by)
    values (new.id, old.enquiry_status, new.enquiry_status, (select auth.uid()));
  end if;
  return null;
end;
$$;

create trigger client_enquiries_status_log
after insert or update of enquiry_status on public.client_enquiries
for each row execute function private.log_enquiry_status();

-- ---------------------------------------------------------------------
-- Access control
-- ---------------------------------------------------------------------
create function private.is_team_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.team_members where user_id = (select auth.uid()));
$$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke all on function private.is_team_member() from public, anon;
grant execute on function private.is_team_member() to authenticated;
revoke all on function private.touch_enquiry() from public, anon, authenticated;
revoke all on function private.log_enquiry_status() from public, anon, authenticated;

alter table public.team_members enable row level security;
alter table public.client_enquiries enable row level security;
alter table public.enquiry_notes enable row level security;
alter table public.enquiry_status_history enable row level security;

-- Anonymous visitors get no direct table access at all.
revoke all on public.team_members, public.client_enquiries, public.enquiry_notes, public.enquiry_status_history from anon;
revoke all on public.team_members, public.client_enquiries, public.enquiry_notes, public.enquiry_status_history from authenticated;

-- Team members: read enquiries, but may only change pipeline fields (never what the client submitted).
grant select on public.client_enquiries to authenticated;
grant update (enquiry_status, assigned_to) on public.client_enquiries to authenticated;
grant select on public.team_members to authenticated;
grant select, insert on public.enquiry_notes to authenticated;
grant delete on public.enquiry_notes to authenticated;
grant select on public.enquiry_status_history to authenticated;

create policy "Team can view enquiries" on public.client_enquiries
  for select to authenticated using ((select private.is_team_member()));
create policy "Team can update enquiry pipeline" on public.client_enquiries
  for update to authenticated
  using ((select private.is_team_member()))
  with check ((select private.is_team_member()));

create policy "Team can view team" on public.team_members
  for select to authenticated using ((select private.is_team_member()));

create policy "Team can view notes" on public.enquiry_notes
  for select to authenticated using ((select private.is_team_member()));
create policy "Team can add notes as themselves" on public.enquiry_notes
  for insert to authenticated
  with check ((select private.is_team_member()) and author_id = (select auth.uid()));
create policy "Authors can delete their notes" on public.enquiry_notes
  for delete to authenticated
  using ((select private.is_team_member()) and author_id = (select auth.uid()));

create policy "Team can view status history" on public.enquiry_status_history
  for select to authenticated using ((select private.is_team_member()));

-- ---------------------------------------------------------------------
-- Submission entry point (the only thing the website can do)
-- Validates via table constraints, throttles abuse, and is idempotent for
-- quick retries: the same email within 10 minutes returns the stored enquiry.
-- ---------------------------------------------------------------------
create function public.submit_enquiry(payload jsonb, p_ip_hash text default null, p_user_agent text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(payload ->> 'email'));
  v_existing uuid;
  v_id uuid;
begin
  if jsonb_typeof(payload) is distinct from 'object' then
    raise exception 'invalid_payload' using errcode = 'P0001';
  end if;

  select id into v_existing
  from public.client_enquiries
  where lower(email) = v_email and created_at > now() - interval '10 minutes'
  order by created_at desc
  limit 1;
  if v_existing is not null then
    return jsonb_build_object('id', v_existing, 'duplicate', true);
  end if;

  if p_ip_hash is not null and (
    (select count(*) from public.client_enquiries
       where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= 3
    or (select count(*) from public.client_enquiries
       where ip_hash = p_ip_hash and created_at > now() - interval '1 day') >= 8
  ) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if (select count(*) from public.client_enquiries
        where lower(email) = v_email and created_at > now() - interval '1 day') >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.client_enquiries (
    full_name, company_name, email, phone, city, website, social_media,
    services_required, services_other,
    business_description, project_goals, current_challenges, target_audience,
    budget, start_timeline, project_duration,
    additional_information, referral_source,
    ip_hash, user_agent
  ) values (
    btrim(payload ->> 'full_name'),
    btrim(payload ->> 'company_name'),
    v_email,
    btrim(payload ->> 'phone'),
    nullif(btrim(payload ->> 'city'), ''),
    nullif(btrim(payload ->> 'website'), ''),
    nullif(btrim(payload ->> 'social_media'), ''),
    array(select distinct s from jsonb_array_elements_text(coalesce(payload -> 'services_required', '[]'::jsonb)) as s),
    nullif(btrim(payload ->> 'services_other'), ''),
    btrim(payload ->> 'business_description'),
    btrim(payload ->> 'project_goals'),
    nullif(btrim(payload ->> 'current_challenges'), ''),
    nullif(btrim(payload ->> 'target_audience'), ''),
    payload ->> 'budget',
    payload ->> 'start_timeline',
    payload ->> 'project_duration',
    nullif(btrim(payload ->> 'additional_information'), ''),
    nullif(payload ->> 'referral_source', ''),
    left(p_ip_hash, 128),
    left(p_user_agent, 400)
  )
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'duplicate', false);
end;
$$;

revoke all on function public.submit_enquiry(jsonb, text, text) from public, authenticated;
grant execute on function public.submit_enquiry(jsonb, text, text) to anon;
