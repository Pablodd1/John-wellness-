-- ============================================================
-- 0005_security_hardening — closes the loyalty escalation path
--
-- Fixes (from external security review, all confirmed):
--   1. add_loyalty_points was SECURITY DEFINER with no auth check: any
--      authenticated user could credit or zero ANY user's points.
--      → now requires auth.uid() = p_user, bounds the delta, and EXECUTE
--        is revoked from public/anon.
--   2. The profiles UPDATE policy let users edit their own loyalty_points
--        directly. → trigger reverts loyalty_points changes made outside
--        the RPC (service role / definer context still allowed).
-- ============================================================

create or replace function public.add_loyalty_points(p_user uuid, p_delta int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.uid() <> p_user then
    raise exception 'LOYALTY_FORBIDDEN: points can only be adjusted for the calling user';
  end if;
  if p_delta is null or p_delta > 5000 or p_delta < -5000 then
    raise exception 'LOYALTY_INVALID_DELTA';
  end if;
  update public.profiles
     set loyalty_points = greatest(0, loyalty_points + p_delta)
   where user_id = p_user;
end $$;

revoke execute on function public.add_loyalty_points(uuid, int) from public, anon;
grant execute on function public.add_loyalty_points(uuid, int) to authenticated;

-- Column guard: direct client updates to loyalty_points are reverted.
-- current_user inside the SECURITY DEFINER RPC is the function owner
-- (postgres), so legitimate RPC adjustments pass; direct client updates
-- run as authenticated and are silently reverted.
create or replace function public.guard_loyalty()
returns trigger language plpgsql as $$
begin
  if NEW.loyalty_points is distinct from OLD.loyalty_points
     and current_user not in ('postgres', 'service_role') then
    NEW.loyalty_points = OLD.loyalty_points;
  end if;
  return NEW;
end $$;

drop trigger if exists profiles_guard_loyalty on public.profiles;
create trigger profiles_guard_loyalty
  before update on public.profiles
  for each row execute function public.guard_loyalty();
