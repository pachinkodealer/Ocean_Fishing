-- Store the exact candles analyzed at game creation so the setup chart,
-- entry price, and AI key levels all render from one frozen snapshot.
-- Without this the chart re-fetches candles independently and can drift
-- away from the stored entry/levels when the upstream API falls back.
alter table games
  add column if not exists setup_klines jsonb not null default '[]';
