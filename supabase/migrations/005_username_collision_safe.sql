-- Make profile creation collision-safe. Google/OAuth users don't pick a
-- username, so we derive it from the email prefix — but that can collide
-- (john@gmail.com vs john@work.com both want "john", and username is UNIQUE).
-- Append an incrementing suffix until free, so signup never fails on a clash.
-- Also picks up Google's avatar, which arrives as 'picture' not 'avatar_url'.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1),
    'trader'
  );

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;
