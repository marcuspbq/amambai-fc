-- ─────────────────────────────────────────────────
-- Amambaí F.C. — Schema do Banco de Dados
-- Versão 2.0 — Regras finais definidas em maio/2026
-- Execute no SQL Editor do Supabase
-- ─────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── users ─────────────────────────────────────────
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  nickname     text not null,
  avatar_emoji text not null default '⭐',
  created_at   timestamptz default now()
);

-- ── pools ─────────────────────────────────────────
create table public.pools (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  admin_id         uuid not null references public.users(id),
  invite_code      text not null unique default substring(md5(random()::text), 1, 8),
  entry_fee        numeric(10,2) not null default 50.00,
  prize_bolao      numeric(5,2) not null default 0.50,
  prize_trader     numeric(5,2) not null default 0.30,
  prize_artilheiro numeric(5,2) not null default 0.20,
  market_closes_at timestamptz not null default '2026-06-08 23:59:00-03',
  market_closed    boolean not null default false,
  draw_completed   boolean not null default false,
  status           text not null default 'OPEN'
                     check (status in ('OPEN','CLOSED','ACTIVE','FINISHED')),
  created_at       timestamptz default now()
);

-- ── pool_members ──────────────────────────────────
create table public.pool_members (
  id                uuid primary key default uuid_generate_v4(),
  pool_id           uuid not null references public.pools(id) on delete cascade,
  user_id           uuid not null references public.users(id),
  paid              boolean not null default false,
  score_bolao       integer not null default 0,
  score_trader      integer not null default 0,
  score_artilheiro  integer not null default 0,
  predictions_count integer not null default 0,
  exact_predictions integer not null default 0,
  created_at        timestamptz default now(),
  unique (pool_id, user_id)
);

-- ── world_cup_teams ───────────────────────────────
create table public.world_cup_teams (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null unique,
  flag                text not null default '',
  group_name          text not null,
  tier                text not null check (tier in ('A','B','C','D')),
  draw_block          text not null check (draw_block in ('A','B','C')),
  eliminated          boolean not null default false,
  eliminated_at_stage text check (eliminated_at_stage in (
    'GROUP_STAGE','ROUND_OF_32','ROUND_OF_16','QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL'
  )),
  created_at          timestamptz default now()
);

-- ── matches ───────────────────────────────────────
create table public.matches (
  id                   uuid primary key default uuid_generate_v4(),
  external_id          text not null unique,
  home_team            text not null,
  home_team_flag       text not null default '',
  away_team            text not null,
  away_team_flag       text not null default '',
  home_score_ft        integer,
  away_score_ft        integer,
  home_score_et        integer,
  away_score_et        integer,
  home_score_pen       integer,
  away_score_pen       integer,
  winner               text,
  kickoff_at           timestamptz not null,
  predictions_close_at timestamptz,
  stage                text not null default 'GROUP_STAGE'
                         check (stage in (
                           'GROUP_STAGE','ROUND_OF_32','ROUND_OF_16',
                           'QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL'
                         )),
  status               text not null default 'SCHEDULED'
                         check (status in ('SCHEDULED','LIVE','FT','POSTPONED','CANCELLED')),
  grp                  text,
  predictions_open     boolean not null default false,
  created_at           timestamptz default now()
);

create or replace function set_predictions_close_at()
returns trigger language plpgsql as $$
begin
  new.predictions_close_at := new.kickoff_at - interval '30 minutes';
  return new;
end;
$$;

create trigger trg_predictions_close_at
  before insert or update of kickoff_at on public.matches
  for each row execute function set_predictions_close_at();

-- ── predictions ───────────────────────────────────
create table public.predictions (
  id            uuid primary key default uuid_generate_v4(),
  member_id     uuid not null references public.pool_members(id) on delete cascade,
  match_id      uuid not null references public.matches(id),
  home_pred     integer not null check (home_pred >= 0),
  away_pred     integer not null check (away_pred >= 0),
  points_earned integer not null default 0,
  locked        boolean not null default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (member_id, match_id)
);

-- ── trader_selections ─────────────────────────────
create table public.trader_selections (
  id         uuid primary key default uuid_generate_v4(),
  member_id  uuid not null references public.pool_members(id) on delete cascade,
  team_name  text not null references public.world_cup_teams(name),
  team_flag  text not null default '',
  is_manual  boolean not null default true,
  draw_block text check (draw_block in ('A','B','C')),
  points     integer not null default 0,
  eliminated boolean not null default false,
  created_at timestamptz default now(),
  unique (member_id, team_name)
);

-- ── trader_match_results ──────────────────────────
create table public.trader_match_results (
  id         uuid primary key default uuid_generate_v4(),
  member_id  uuid not null references public.pool_members(id) on delete cascade,
  team_name  text not null,
  match_id   uuid not null references public.matches(id),
  result     text not null check (result in ('WIN','DRAW','LOSS')),
  points     integer not null,
  created_at timestamptz default now(),
  unique (member_id, team_name, match_id)
);

-- ── artilheiro_selections ─────────────────────────
create table public.artilheiro_selections (
  id          uuid primary key default uuid_generate_v4(),
  member_id   uuid not null references public.pool_members(id) on delete cascade,
  player_name text not null,
  team_name   text not null,
  team_flag   text not null default '',
  external_id text not null,
  position    text not null check (position in ('FORWARD','MIDFIELDER','DEFENDER','GOALKEEPER')),
  is_manual   boolean not null default true,
  goals       integer not null default 0,
  created_at  timestamptz default now(),
  unique (member_id, external_id)
);

-- ── player_goals ──────────────────────────────────
create table public.player_goals (
  id          uuid primary key default uuid_generate_v4(),
  external_id text not null,
  player_name text not null,
  team_name   text not null,
  match_id    uuid not null references public.matches(id),
  minute      integer,
  is_penalty  boolean not null default false,
  is_own_goal boolean not null default false,
  counted     boolean not null default true,
  created_at  timestamptz default now(),
  unique (external_id, match_id, minute)
);

-- ── draw_log ──────────────────────────────────────
create table public.draw_log (
  id           uuid primary key default uuid_generate_v4(),
  pool_id      uuid not null references public.pools(id),
  draw_type    text not null check (draw_type in ('TRADER','ARTILHEIRO')),
  member_id    uuid not null references public.pool_members(id),
  result_name  text not null,
  result_tier  text,
  result_block text,
  drawn_at     timestamptz default now()
);

-- ── notifications ─────────────────────────────────
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  type       text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- FUNÇÕES RPC
-- ─────────────────────────────────────────────────

create or replace function calculate_prediction_points(p_match_id uuid)
returns void language plpgsql security definer as $$
declare
  v_home_ft integer; v_away_ft integer; v_winner text;
  v_pred record; v_pts integer; v_exact boolean;
begin
  select home_score_ft, away_score_ft, winner
  into v_home_ft, v_away_ft, v_winner
  from public.matches where id = p_match_id and status = 'FT';
  if not found then return; end if;

  for v_pred in
    select p.id, p.member_id, p.home_pred, p.away_pred
    from public.predictions p where p.match_id = p_match_id and p.locked = false
  loop
    v_exact := false; v_pts := 0;
    if v_pred.home_pred = v_home_ft and v_pred.away_pred = v_away_ft then
      v_pts := 3; v_exact := true;
    elsif (
      (v_pred.home_pred > v_pred.away_pred and v_winner = 'home') or
      (v_pred.home_pred < v_pred.away_pred and v_winner = 'away') or
      (v_pred.home_pred = v_pred.away_pred and v_winner = 'draw')
    ) then v_pts := 1; end if;

    update public.predictions
    set points_earned = v_pts, locked = true, updated_at = now()
    where id = v_pred.id;

    update public.pool_members
    set score_bolao = score_bolao + v_pts,
        predictions_count = predictions_count + 1,
        exact_predictions = exact_predictions + case when v_exact then 1 else 0 end
    where id = v_pred.member_id;
  end loop;
end;
$$;

create or replace function process_trader_match(p_match_id uuid)
returns void language plpgsql security definer as $$
declare
  v_home text; v_away text; v_winner text;
  v_sel record; v_result text; v_pts integer;
begin
  select m.home_team, m.away_team, m.winner
  into v_home, v_away, v_winner
  from public.matches m where m.id = p_match_id and m.status = 'FT';
  if not found then return; end if;

  for v_sel in
    select ts.id, ts.member_id, ts.team_name
    from public.trader_selections ts
    join public.pool_members pm on pm.id = ts.member_id
    where ts.team_name in (v_home, v_away)
  loop
    if v_winner = 'draw' then v_result := 'DRAW'; v_pts := 1;
    elsif (v_sel.team_name = v_home and v_winner = 'home') or
          (v_sel.team_name = v_away and v_winner = 'away') then v_result := 'WIN'; v_pts := 3;
    else v_result := 'LOSS'; v_pts := 0; end if;

    insert into public.trader_match_results (member_id, team_name, match_id, result, points)
    values (v_sel.member_id, v_sel.team_name, p_match_id, v_result, v_pts)
    on conflict (member_id, team_name, match_id) do nothing;

    update public.trader_selections set points = points + v_pts where id = v_sel.id;

    update public.pool_members pm
    set score_trader = (
      select coalesce(sum(ts2.points), 0)
      from public.trader_selections ts2 where ts2.member_id = pm.id
    )
    where pm.id = v_sel.member_id;
  end loop;
end;
$$;

create or replace function eliminate_team(p_team_name text, p_stage text)
returns void language plpgsql security definer as $$
begin
  update public.world_cup_teams set eliminated = true, eliminated_at_stage = p_stage
  where name = p_team_name;
  update public.trader_selections set eliminated = true where team_name = p_team_name;
end;
$$;

create or replace function sync_artilheiro_goals(p_match_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.artilheiro_selections ars
  set goals = (
    select count(*) from public.player_goals pg
    where pg.external_id = ars.external_id and pg.counted = true
  )
  where ars.external_id in (
    select distinct external_id from public.player_goals
    where match_id = p_match_id and counted = true
  );

  update public.pool_members pm
  set score_artilheiro = (
    select coalesce(sum(ars.goals), 0)
    from public.artilheiro_selections ars where ars.member_id = pm.id
  )
  where pm.id in (
    select distinct ars.member_id from public.artilheiro_selections ars
    where ars.external_id in (
      select distinct external_id from public.player_goals
      where match_id = p_match_id and counted = true
    )
  );
end;
$$;

create or replace function get_ranking(p_pool_id uuid, p_competition text)
returns table (
  member_id uuid, nickname text, avatar_emoji text,
  score_primary integer, score_tiebreak1 integer, score_tiebreak2 integer, rank integer
)
language plpgsql security definer as $$
begin
  return query
  select pm.id, u.nickname, u.avatar_emoji,
    case p_competition
      when 'BOLAO' then pm.score_bolao
      when 'TRADER' then pm.score_trader
      when 'ARTILHEIRO' then pm.score_artilheiro
    end,
    case p_competition
      when 'BOLAO' then pm.score_trader
      when 'TRADER' then pm.score_bolao
      when 'ARTILHEIRO' then pm.score_bolao
    end,
    case p_competition
      when 'BOLAO' then pm.score_artilheiro
      when 'TRADER' then pm.score_artilheiro
      when 'ARTILHEIRO' then pm.score_trader
    end,
    rank() over (
      order by
        case p_competition when 'BOLAO' then pm.score_bolao when 'TRADER' then pm.score_trader when 'ARTILHEIRO' then pm.score_artilheiro end desc,
        case p_competition when 'BOLAO' then pm.score_trader when 'TRADER' then pm.score_bolao when 'ARTILHEIRO' then pm.score_bolao end desc,
        case p_competition when 'BOLAO' then pm.score_artilheiro when 'TRADER' then pm.score_artilheiro when 'ARTILHEIRO' then pm.score_trader end desc
    )::integer
  from public.pool_members pm
  join public.users u on u.id = pm.user_id
  where pm.pool_id = p_pool_id and pm.paid = true;
end;
$$;

-- ─────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────

alter table public.users enable row level security;
alter table public.pools enable row level security;
alter table public.pool_members enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.trader_selections enable row level security;
alter table public.trader_match_results enable row level security;
alter table public.artilheiro_selections enable row level security;
alter table public.player_goals enable row level security;
alter table public.world_cup_teams enable row level security;
alter table public.draw_log enable row level security;
alter table public.notifications enable row level security;

create policy "users_self" on public.users for all using (auth.uid() = id);
create policy "pools_read" on public.pools for select using (true);
create policy "pools_admin" on public.pools for all using (admin_id = auth.uid());
create policy "members_read" on public.pool_members for select using (true);
create policy "members_self" on public.pool_members for update using (user_id = auth.uid());
create policy "matches_read" on public.matches for select using (true);
create policy "teams_read" on public.world_cup_teams for select using (true);
create policy "predictions_own" on public.predictions for all using (
  member_id in (select id from public.pool_members where user_id = auth.uid())
);
create policy "predictions_read_locked" on public.predictions for select using (locked = true);
create policy "trader_sel_own" on public.trader_selections for all using (
  member_id in (select id from public.pool_members where user_id = auth.uid())
);
create policy "trader_sel_read_after_close" on public.trader_selections for select using (
  exists (
    select 1 from public.pool_members pm
    join public.pools p on p.id = pm.pool_id
    where pm.id = trader_selections.member_id and p.market_closed = true
  )
);
create policy "art_sel_own" on public.artilheiro_selections for all using (
  member_id in (select id from public.pool_members where user_id = auth.uid())
);
create policy "art_sel_read_after_close" on public.artilheiro_selections for select using (
  exists (
    select 1 from public.pool_members pm
    join public.pools p on p.id = pm.pool_id
    where pm.id = artilheiro_selections.member_id and p.market_closed = true
  )
);
create policy "goals_read" on public.player_goals for select using (true);
create policy "trader_results_read" on public.trader_match_results for select using (true);
create policy "draw_log_read" on public.draw_log for select using (true);
create policy "notif_own" on public.notifications for all using (user_id = auth.uid());

-- ─────────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────────

alter publication supabase_realtime add table public.pool_members;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.player_goals;

-- ─────────────────────────────────────────────────
-- ÍNDICES
-- ─────────────────────────────────────────────────

create index idx_predictions_member on public.predictions(member_id);
create index idx_predictions_match on public.predictions(match_id);
create index idx_trader_sel_member on public.trader_selections(member_id);
create index idx_trader_sel_team on public.trader_selections(team_name);
create index idx_art_sel_member on public.artilheiro_selections(member_id);
create index idx_art_sel_player on public.artilheiro_selections(external_id);
create index idx_player_goals_player on public.player_goals(external_id);
create index idx_player_goals_match on public.player_goals(match_id);
create index idx_matches_kickoff on public.matches(kickoff_at);
create index idx_matches_status on public.matches(status);
create index idx_pool_members_pool on public.pool_members(pool_id);
