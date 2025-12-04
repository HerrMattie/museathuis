
-- MuseaThuis premium ecosysteem datamodel
-- Ontworpen voor Supabase / Postgres

-- Basis extensies
create extension if not exists "pgcrypto";

-- 1. Kunstwerken en teksten
create table if not exists artworks (
  id            bigserial primary key,
  external_id   text,
  museum        text,
  source_system text,
  title         text not null,
  artist_name   text,
  artist_birth_year integer,
  artist_death_year integer,
  dating_text   text,
  year_from     integer,
  year_to       integer,
  object_type   text,
  location_city text,
  location_country text,
  is_cc0        boolean default false,
  language      text default 'nl',
  persistent_id text,
  source_raw    jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists artwork_images (
  id          bigserial primary key,
  artwork_id  bigint references artworks(id) on delete cascade,
  image_url   text not null,
  thumbnail_url text,
  rights      text,
  license     text,
  width_px    integer,
  height_px   integer,
  offset_x    numeric,
  offset_y    numeric,
  is_primary  boolean default true
);

create table if not exists artwork_texts (
  id            bigserial primary key,
  artwork_id    bigint references artworks(id) on delete cascade,
  text_type     text not null, -- 'primary','focus','game_hint'
  language      text default 'nl',
  body          text not null,
  audio_url     text,
  duration_sec  integer,
  created_at    timestamptz default now(),
  created_by    uuid, -- verwijzing naar auth.users.id indien gewenst
  is_ai_generated boolean default true
);

-- 2. Thema's / series
create table if not exists themes (
  id          bigserial primary key,
  slug        text unique not null,
  title       text not null,
  description text,
  colour      text,
  created_at  timestamptz default now()
);

create table if not exists series (
  id          bigserial primary key,
  slug        text unique not null,
  title       text not null,
  description text,
  theme_id    bigint references themes(id),
  level       text, -- 'intro','verdieping'
  is_published boolean default false,
  created_at  timestamptz default now()
);

create table if not exists series_items (
  id          bigserial primary key,
  series_id   bigint references series(id) on delete cascade,
  position    integer not null,
  item_type   text not null, -- 'tour','focus'
  tour_id     bigint,
  focus_id    bigint,
  unique(series_id, position)
);

-- 3. Dagelijkse content: tours, games, focus

create table if not exists tours (
  id            bigserial primary key,
  slug          text unique,
  title         text not null,
  intro_text    text,
  theme_id      bigint references themes(id),
  date_planned  date, -- dagkaartdatum
  is_published  boolean default false,
  is_premium    boolean default true,
  language      text default 'nl',
  created_at    timestamptz default now()
);

create table if not exists tour_items (
  id          bigserial primary key,
  tour_id     bigint references tours(id) on delete cascade,
  position    integer not null,
  artwork_id  bigint references artworks(id),
  text_id     bigint references artwork_texts(id),
  unique(tour_id, position)
);

create table if not exists games (
  id            bigserial primary key,
  slug          text unique,
  title         text not null,
  description   text,
  game_type     text not null, -- 'detail','tijdlijn','raad_werk'
  theme_id      bigint references themes(id),
  date_planned  date,
  is_published  boolean default false,
  is_premium    boolean default true,
  language      text default 'nl',
  created_at    timestamptz default now()
);

create table if not exists game_questions (
  id            bigserial primary key,
  game_id       bigint references games(id) on delete cascade,
  position      integer not null,
  artwork_id    bigint references artworks(id),
  question_text text not null,
  correct_answer text not null,
  wrong_answers  text[] default '{}',
  explanation   text,
  unique(game_id, position)
);

create table if not exists focus_sessions (
  id            bigserial primary key,
  slug          text unique,
  title         text not null,
  description   text,
  artwork_id    bigint references artworks(id),
  theme_id      bigint references themes(id),
  date_planned  date,
  is_published  boolean default false,
  is_premium    boolean default true,
  language      text default 'nl',
  created_at    timestamptz default now()
);

-- 4. Gebruikersprofielen en voorkeuren
-- Supabase auth.users bevat de accounts; wij refereren met user_id

create table if not exists profiles (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  display_name     text,
  avatar_url       text,
  created_at       timestamptz default now()
);

create table if not exists user_preferences (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  language        text default 'nl',
  minutes_per_day integer default 20,
  favourite_periods text[],
  favourite_themes  text[],
  favourite_countries text[],
  has_museum_card boolean default false,
  age_bracket     text, -- '55-64','65-74','75+','onbekend'
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 5. Voortgang, scores, badges

create table if not exists tour_progress (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  tour_id     bigint references tours(id) on delete cascade,
  started_at  timestamptz default now(),
  completed_at timestamptz,
  completion_ratio numeric default 0,
  rating       integer, -- 1-5 sterren
  unique(user_id, tour_id)
);

create table if not exists game_results (
  id            bigserial primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  game_id       bigint references games(id) on delete cascade,
  played_at     timestamptz default now(),
  score         integer not null,
  max_score     integer not null,
  accuracy      numeric,
  duration_sec  integer
);

create table if not exists focus_progress (
  id            bigserial primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  focus_id      bigint references focus_sessions(id) on delete cascade,
  started_at    timestamptz default now(),
  completed_at  timestamptz,
  duration_sec  integer,
  reflection_notes text
);

create table if not exists badges (
  id          bigserial primary key,
  code        text unique not null,
  title       text not null,
  description text,
  criteria    jsonb,
  created_at  timestamptz default now()
);

create table if not exists user_badges (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  badge_id    bigint references badges(id) on delete cascade,
  earned_at   timestamptz default now(),
  unique(user_id, badge_id)
);

-- 6. Week / maand selectie en live events

create table if not exists highlights (
  id          bigserial primary key,
  period_type text not null, -- 'week','month'
  period_start date not null,
  item_type   text not null, -- 'tour','game','focus','series'
  tour_id     bigint,
  game_id     bigint,
  focus_id    bigint,
  series_id   bigint,
  created_at  timestamptz default now(),
  unique(period_type, period_start, item_type)
);

create table if not exists live_events (
  id          bigserial primary key,
  slug        text unique not null,
  title       text not null,
  description text,
  scheduled_at timestamptz not null,
  duration_min integer,
  host_name   text,
  is_online   boolean default true,
  is_premium  boolean default true,
  created_at  timestamptz default now()
);

create table if not exists live_event_registrations (
  id          bigserial primary key,
  event_id    bigint references live_events(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  registered_at timestamptz default now(),
  unique(event_id, user_id)
);

-- 7. Premiumrechten en abonnementen (koppeling met Stripe)

create type if not exists subscription_status as enum ('trialing','active','past_due','canceled','incomplete');

create table if not exists subscriptions (
  id                bigserial primary key,
  user_id           uuid references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status            subscription_status default 'trialing',
  current_period_start timestamptz,
  current_period_end   timestamptz,
  cancel_at_period_end boolean default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(user_id)
);

-- 8. Generieke analytics events

create table if not exists analytics_events (
  id            bigserial primary key,
  user_id       uuid references auth.users(id),
  session_id    uuid default gen_random_uuid(),
  event_time    timestamptz default now(),
  event_type    text not null, -- 'view_artwork','play_audio','complete_tour', etc.
  context       jsonb,
  user_agent    text,
  ip_hash       text
);

