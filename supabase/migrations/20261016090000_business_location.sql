-- ---------------------------------------------------------------------
-- Business location: the client's address, Google Maps link or shared coordinates, from the enquiry
-- form's "Business location on Google Maps" field. Adds the column and teaches submit_enquiry to save it
-- (the function is otherwise unchanged).
-- ---------------------------------------------------------------------
alter table public.client_enquiries
  add column if not exists business_location text check (char_length(business_location) <= 500);

create or replace function public.submit_enquiry(payload jsonb, p_ip_hash text default null, p_user_agent text default null)
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
    full_name, company_name, email, phone, city, business_location, website, social_media,
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
    nullif(btrim(payload ->> 'business_location'), ''),
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
