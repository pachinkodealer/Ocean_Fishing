-- Enable RLS on all tables
alter table profiles enable row level security;
alter table games enable row level security;
alter table predictions enable row level security;
alter table leaderboard_snapshots enable row level security;
alter table badges enable row level security;

-- profiles policies
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- games policies
create policy "Games are viewable by everyone"
  on games for select using (true);

create policy "Users can insert own games"
  on games for insert with check (auth.uid() = user_id);

create policy "Users can update own games"
  on games for update using (auth.uid() = user_id);

-- Service role can update any game (for cron scoring)
create policy "Service role can update any game"
  on games for update using (auth.role() = 'service_role');

-- predictions policies
create policy "Predictions are viewable by everyone"
  on predictions for select using (true);

create policy "Users can insert own predictions"
  on predictions for insert with check (auth.uid() = user_id);

-- leaderboard_snapshots policies
create policy "Leaderboard is viewable by everyone"
  on leaderboard_snapshots for select using (true);

create policy "Service role can manage leaderboard"
  on leaderboard_snapshots for all using (auth.role() = 'service_role');

-- badges policies
create policy "Badges are viewable by everyone"
  on badges for select using (true);

create policy "Service role can award badges"
  on badges for insert with check (auth.role() = 'service_role');
