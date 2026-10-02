begin;

-- The active profile table is public.profiles. Remove the obsolete bootstrap trigger
-- that targets the old app.profiles schema and would break new signups.
drop trigger if exists on_auth_user_created_bootstrap on auth.users;
drop function if exists private.bootstrap_auth_user();

-- Users may edit their display name, but must never be able to self-assert
-- phone verification or alter trust/account security fields through the Data API.
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

-- This trigger function is internal-only; it should not be callable through RPC.
revoke all on function public.sync_profile_phone_verified() from public, anon, authenticated;

commit;
