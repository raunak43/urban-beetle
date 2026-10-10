-- ---------------------------------------------------------------------
-- keepalive(): a harmless query for the website's twice-daily check (app/api/keepalive). Supabase pauses
-- Free Plan projects after about a week without database activity, which would take the enquiry
-- form down. Returns the database's clock; reads and writes no data.
-- ---------------------------------------------------------------------
create or replace function public.keepalive()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select now() $$;

revoke all on function public.keepalive() from public, authenticated;
grant execute on function public.keepalive() to anon;
