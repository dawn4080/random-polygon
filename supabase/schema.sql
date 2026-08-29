create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 16),
  best_score integer not null default 0 check (best_score >= 0),
  best_wave integer not null default 0 check (best_wave >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_records (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null check (score >= 0),
  wave integer not null check (wave >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.game_records enable row level security;

-- RLS 정책과 별도로 API 역할에 테이블 조회 권한이 필요하다.
-- 랭킹은 비로그인 사용자도 볼 수 있으므로 profiles의 SELECT만 공개한다.
grant select on table public.profiles to anon, authenticated;

create policy "profiles are publicly readable"
on public.profiles for select using (true);

create policy "users can update their profile"
on public.profiles for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "records are publicly readable"
on public.game_records for select using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, nickname)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), '플레이어'), 16)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.submit_game_result(p_score integer, p_wave integer)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_score < 0 or p_wave < 0 or p_score > 1000000000 or p_wave > 100000 then
    raise exception '잘못된 게임 기록입니다.';
  end if;

  insert into public.game_records (user_id, score, wave)
  values (current_user_id, p_score, p_wave);

  update public.profiles
  set best_score = greatest(best_score, p_score),
      best_wave = greatest(best_wave, p_wave),
      updated_at = now()
  where user_id = current_user_id;
end;
$$;

revoke all on function public.submit_game_result(integer, integer) from public;
grant execute on function public.submit_game_result(integer, integer) to authenticated;
