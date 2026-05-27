-- ─────────────────────────────────────────────────
-- Amambaí F.C. — Schema do Banco de Dados
-- Execute no SQL Editor do Supabase
-- ─────────────────────────────────────────────────

-- ── Extensões ─────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tabela: users (complementa auth.users) ────────
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  nickname    text not null,
  avatar_emoji text not null default '⭐',
  created_at  timestamptz default now()
);

-- ── Tabela: pools (bolões) ────────────────────────
create table public.pools (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  admin_id    uuid not null references public.users(id),
  invite_code text not null unique default substring(md5(random()::text), 1, 8),
  status      text not null default 'SETUP'
                check (status in ('SETUP','DRAFT','ACTIVE','FINISHED')),
  draft_open  boolean not null default false,
  created_at  timestamptz default now()
);

-- ── Tabela: pool_members ──────────────────────────
create table public.pool_members (
  id                  uuid primary key default uuid_generate_v4(),
  pool_id             uuid not null references public.pools(id) on delete cascade,
  user_id             uuid not null references public.users(id),
  draft_order         integer,
  score_general       integer not null default 0,
  score_artilheiro    integer not null default 0,
  score_trader        numeric(10,1) not null default 0,
  predictions_count   integer not null default 0,
  exact_predictions   integer not null default 0,
  created_at          timestamptz default now(),
  unique (pool_id, user_id)
);

-- ── Tabela: matches ───────────────────────────────
create table public.matches (
  id            uuid primary key default uuid_generate_v4(),
  external_id   text not null unique,
  home_team     text not null,
  home_team_flag text not null default '',
  away_team     text not null,
  away_team_flag text not null default '',
  home_score    integer,
  away_score    integer,
  kickoff_at    timestamptz not null,
  stage         text not null default 'GROUP_STAGE'
                  check (stage in ('GROUP_STAGE','ROUND_OF_16','QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL')),
  status        text not null default 'SCHEDULED'
                  check (status in ('SCHEDULED','LIVE','FT','POSTPONED')),
  grp           text, -- ex: "Group A"
  created_at    timestamptz default now()
);

-- ── Tabela: predictions (palpites) ───────────────
create table public.predictions (
  id            uuid primary key default uuid_generate_v4(),
  member_id     uuid not null references public.pool_members(id) on delete cascade,
  match_id      uuid not null references public.matches(id),
  home_pred     integer not null,
  away_pred     integer not null,
  points_earned integer not null default 0,
  created_at    timestamptz default now(),
  unique (member_id, match_id)
);

-- ── Tabela: draft_players ─────────────────────────
create table public.draft_players (
  id            uuid primary key default uuid_generate_v4(),
  pool_id       uuid not null references public.pools(id) on delete cascade,
  player_name   text not null,
  team          text not null,
  team_flag     text not null default '',
  external_id   text not null,
  owner_id      uuid references public.pool_members(id),
  goals         integer not null default 0,
  created_at    timestamptz default now(),
  unique (pool_id, external_id)
);

-- ── Tabela: trader_picks ──────────────────────────
create table public.trader_picks (
  id            uuid primary key default uuid_generate_v4(),
  member_id     uuid not null references public.pool_members(id) on delete cascade,
  team_name     text not null,
  team_flag     text not null default '',
  pick_type     text not null check (pick_type in ('favorite','intermediate','wildcard')),
  multiplier    numeric(3,1) not null,
  base_pts      numeric(10,1) not null default 0,
  total_pts     numeric(10,1) not null default 0,
  eliminated    boolean not null default false,
  created_at    timestamptz default now(),
  unique (member_id, pick_type)
);

-- ── Tabela: notifications ─────────────────────────
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        text not null,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- FUNÇÕES RPC
-- ─────────────────────────────────────────────────

-- Incrementa pontuação geral de um membro
create or replace function increment_score_general(
  member_id uuid,
  pts integer,
  is_exact boolean
)
returns void
language plpgsql
security definer
as $$
begin
  update public.pool_members
  set
    score_general     = score_general + pts,
    predictions_count = predictions_count + 1,
    exact_predictions = exact_predictions + case when is_exact then 1 else 0 end
  where id = member_id;
end;
$$;

-- Incrementa pontos do artilheiro (chamado ao sincronizar gols)
create or replace function update_artilheiro_scores(pool_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.pool_members pm
  set score_artilheiro = (
    select coalesce(sum(dp.goals), 0)
    from public.draft_players dp
    where dp.owner_id = pm.id
  )
  where pm.pool_id = update_artilheiro_scores.pool_id;
end;
$$;

-- Recalcula pontos do Trader quando uma seleção avança de fase
create or replace function recalculate_trader(
  pool_id uuid,
  team_name text,
  stage_pts integer,
  is_eliminated boolean default false
)
returns void
language plpgsql
security definer
as $$
begin
  -- Atualiza base_pts e elimina se necessário
  update public.trader_picks
  set
    base_pts  = base_pts + stage_pts,
    total_pts = (base_pts + stage_pts) * multiplier,
    eliminated = is_eliminated
  where team_name = recalculate_trader.team_name
    and member_id in (
      select id from public.pool_members where pool_id = recalculate_trader.pool_id
    );

  -- Atualiza score_trader no member
  update public.pool_members pm
  set score_trader = (
    select coalesce(sum(tp.total_pts), 0)
    from public.trader_picks tp
    where tp.member_id = pm.id
  )
  where pm.pool_id = recalculate_trader.pool_id;
end;
$$;

-- ─────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────

alter table public.users enable row level security;
alter table public.pools enable row level security;
alter table public.pool_members enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.draft_players enable row level security;
alter table public.trader_picks enable row level security;
alter table public.notifications enable row level security;

-- Users: cada um vê só o próprio
create policy "users_self" on public.users
  for all using (auth.uid() = id);

-- Matches: todos podem ler
create policy "matches_read" on public.matches
  for select using (true);

-- Pool members: todos do mesmo pool podem ler
create policy "members_read" on public.pool_members
  for select using (true);

-- Predictions: cada membro vê as próprias; após o jogo, vê de todos
create policy "predictions_own" on public.predictions
  for all using (
    member_id in (
      select id from public.pool_members where user_id = auth.uid()
    )
  );

-- Draft players: todos podem ler
create policy "draft_players_read" on public.draft_players
  for select using (true);

-- Trader picks: todos podem ler
create policy "trader_picks_read" on public.trader_picks
  for select using (true);

-- Notifications: cada um vê as próprias
create policy "notif_own" on public.notifications
  for all using (user_id = auth.uid());

-- ─────────────────────────────────────────────────
-- REALTIME (para rankings ao vivo)
-- ─────────────────────────────────────────────────

alter publication supabase_realtime add table public.pool_members;
alter publication supabase_realtime add table public.draft_players;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.notifications;
