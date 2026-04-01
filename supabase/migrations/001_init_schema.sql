-- Enable UUID extension
create extension if not exists "pgcrypto";

-- profiles: extends auth.users, created via trigger on signup
create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text unique not null,
  avatar_url     text,
  plan           text not null default 'free',
  points         integer not null default 0,
  accuracy_pct   numeric(5,2) not null default 0,
  streak         integer not null default 0,
  best_streak    integer not null default 0,
  total_calls    integer not null default 0,
  correct_calls  integer not null default 0,
  created_at     timestamptz not null default now()
);

-- games: one row per uploaded chart session
create table games (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  ticker          text not null,
  timeframe       text not null,
  screenshot_url  text not null,
  current_price   numeric(20,8) not null,
  key_levels      jsonb not null default '[]',
  bull_scenario   jsonb not null default '{}',
  bear_scenario   jsonb not null default '{}',
  ai_call         text not null check (ai_call in ('bull', 'bear')),
  ai_target       numeric(20,8) not null,
  ai_reasoning    text not null,
  confidence      integer not null default 50 check (confidence between 0 and 100),
  status          text not null default 'pending' check (status in ('pending', 'scored')),
  resolve_at      timestamptz not null,
  resolved_price  numeric(20,8),
  created_at      timestamptz not null default now()
);

-- predictions: one row per user call on a game
create table predictions (
  id            uuid primary key default gen_random_uuid(),
  game_id       uuid not null references games(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  direction     text not null check (direction in ('bull', 'bear')),
  target_price  numeric(20,8),
  points_earned integer not null default 0,
  is_correct    boolean,
  hit_target    boolean,
  scored_at     timestamptz,
  created_at    timestamptz not null default now(),
  unique(game_id, user_id)
);

-- leaderboard_snapshots: refreshed by cron
create table leaderboard_snapshots (
  id            uuid primary key default gen_random_uuid(),
  period        text not null check (period in ('weekly', 'monthly', 'alltime')),
  week_start    date,
  month_start   date,
  user_id       uuid not null references profiles(id) on delete cascade,
  rank          integer not null,
  points        integer not null,
  accuracy      numeric(5,2) not null,
  correct       integer not null,
  total         integer not null,
  refreshed_at  timestamptz not null default now()
);

-- badges
create table badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  badge_type  text not null check (badge_type in ('beat_the_ai', 'hot_streak', 'sharp_shooter')),
  awarded_at  timestamptz not null default now(),
  metadata    jsonb
);

-- Indexes
create index games_user_id_idx on games(user_id);
create index games_status_resolve_at_idx on games(status, resolve_at);
create index predictions_game_id_idx on predictions(game_id);
create index predictions_user_id_idx on predictions(user_id);
create index leaderboard_snapshots_period_rank_idx on leaderboard_snapshots(period, rank);
create index badges_user_id_idx on badges(user_id);
