-- Auto-create profile on new user signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Function to refresh leaderboard snapshots
create or replace function refresh_leaderboard()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete existing snapshots
  delete from leaderboard_snapshots;

  -- All-time leaderboard
  insert into leaderboard_snapshots (period, user_id, rank, points, accuracy, correct, total)
  select
    'alltime',
    p.id,
    row_number() over (order by p.points desc, p.accuracy_pct desc),
    p.points,
    p.accuracy_pct,
    p.correct_calls,
    p.total_calls
  from profiles p
  where p.total_calls > 0;

  -- Weekly leaderboard
  insert into leaderboard_snapshots (period, week_start, user_id, rank, points, accuracy, correct, total)
  select
    'weekly',
    date_trunc('week', now())::date,
    p.user_id,
    row_number() over (order by sum(p.points_earned) desc),
    sum(p.points_earned),
    case when count(*) > 0 then round(sum(case when p.is_correct then 1 else 0 end)::numeric / count(*) * 100, 2) else 0 end,
    sum(case when p.is_correct then 1 else 0 end),
    count(*)::int
  from predictions p
  where p.scored_at >= date_trunc('week', now())
    and p.scored_at is not null
  group by p.user_id
  having count(*) > 0;

  -- Monthly leaderboard
  insert into leaderboard_snapshots (period, month_start, user_id, rank, points, accuracy, correct, total)
  select
    'monthly',
    date_trunc('month', now())::date,
    p.user_id,
    row_number() over (order by sum(p.points_earned) desc),
    sum(p.points_earned),
    case when count(*) > 0 then round(sum(case when p.is_correct then 1 else 0 end)::numeric / count(*) * 100, 2) else 0 end,
    sum(case when p.is_correct then 1 else 0 end),
    count(*)::int
  from predictions p
  where p.scored_at >= date_trunc('month', now())
    and p.scored_at is not null
  group by p.user_id
  having count(*) > 0;
end;
$$;
