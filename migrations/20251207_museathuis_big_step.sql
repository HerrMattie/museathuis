-- 2025-12-07: MuseaThuis big step migration
-- Deze migratie wijzigt geen bestaande kolomnamen en verwijdert geen tabellen.
-- Er worden alleen views en een loggingtabel voor dagprogramma's toegevoegd.

------------------------------------------------------------
-- 1. BEST-OF VIEWS OP BASIS VAN RATINGS
------------------------------------------------------------

drop view if exists best_of_tours_week cascade;
drop view if exists best_of_tours_month cascade;
drop view if exists best_of_games_week cascade;
drop view if exists best_of_games_month cascade;
drop view if exists best_of_focus_week cascade;
drop view if exists best_of_focus_month cascade;

create or replace view best_of_tours_week as
select
  t.id as tour_id,
  coalesce(t.title, 'Tour') as title,
  avg(r.rating)::numeric(3,2) as avg_rating,
  count(*) as rating_count,
  min(r.created_at) as first_rating_at,
  max(r.created_at) as last_rating_at
from tours t
join tour_ratings r on r.tour_id = t.id
where r.created_at >= date_trunc('week', now())
  and r.created_at <  date_trunc('week', now()) + interval '1 week'
group by t.id, t.title
having count(*) >= 3
order by avg_rating desc, rating_count desc, last_rating_at desc
limit 50;

create or replace view best_of_tours_month as
select
  t.id as tour_id,
  coalesce(t.title, 'Tour') as title,
  avg(r.rating)::numeric(3,2) as avg_rating,
  count(*) as rating_count,
  min(r.created_at) as first_rating_at,
  max(r.created_at) as last_rating_at
from tours t
join tour_ratings r on r.tour_id = t.id
where r.created_at >= date_trunc('month', now())
  and r.created_at <  date_trunc('month', now()) + interval '1 month'
group by t.id, t.title
having count(*) >= 5
order by avg_rating desc, rating_count desc, last_rating_at desc
limit 50;

create or replace view best_of_games_week as
select
  g.id as game_id,
  coalesce(g.title, 'Game') as title,
  avg(r.rating)::numeric(3,2) as avg_rating,
  count(*) as rating_count,
  min(r.created_at) as first_rating_at,
  max(r.created_at) as last_rating_at
from games g
join game_ratings r on r.game_id = g.id
where r.created_at >= date_trunc('week', now())
  and r.created_at <  date_trunc('week', now()) + interval '1 week'
group by g.id, g.title
having count(*) >= 3
order by avg_rating desc, rating_count desc, last_rating_at desc
limit 50;

create or replace view best_of_games_month as
select
  g.id as game_id,
  coalesce(g.title, 'Game') as title,
  avg(r.rating)::numeric(3,2) as avg_rating,
  count(*) as rating_count,
  min(r.created_at) as first_rating_at,
  max(r.created_at) as last_rating_at
from games g
join game_ratings r on r.game_id = g.id
where r.created_at >= date_trunc('month', now())
  and r.created_at <  date_trunc('month', now()) + interval '1 month'
group by g.id, g.title
having count(*) >= 5
order by avg_rating desc, rating_count desc, last_rating_at desc
limit 50;

create or replace view best_of_focus_week as
select
  f.id as focus_item_id,
  coalesce(f.title, 'Focusmoment') as title,
  avg(r.rating)::numeric(3,2) as avg_rating,
  count(*) as rating_count,
  min(r.created_at) as first_rating_at,
  max(r.created_at) as last_rating_at
from focus_items f
join focus_ratings r on r.focus_item_id = f.id
where r.created_at >= date_trunc('week', now())
  and r.created_at <  date_trunc('week', now()) + interval '1 week'
group by f.id, f.title
having count(*) >= 3
order by avg_rating desc, rating_count desc, last_rating_at desc
limit 50;

create or replace view best_of_focus_month as
select
  f.id as focus_item_id,
  coalesce(f.title, 'Focusmoment') as title,
  avg(r.rating)::numeric(3,2) as avg_rating,
  count(*) as rating_count,
  min(r.created_at) as first_rating_at,
  max(r.created_at) as last_rating_at
from focus_items f
join focus_ratings r on r.focus_item_id = f.id
where r.created_at >= date_trunc('month', now())
  and r.created_at <  date_trunc('month', now()) + interval '1 month'
group by f.id, f.title
having count(*) >= 5
order by avg_rating desc, rating_count desc, last_rating_at desc
limit 50;

------------------------------------------------------------
-- 2. LOGGINGTABEL VOOR DAGPROGRAMMA-WIJZIGINGEN
------------------------------------------------------------

create table if not exists dayprogram_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid,
  day_date date not null,
  content_type text not null check (content_type in ('tour','focus','game')),
  slot_index int not null check (slot_index between 1 and 3),
  old_content_id uuid,
  new_content_id uuid,
  action text not null, -- bijvoorbeeld 'generate_proposal', 'generate_alternative', 'manual_update'
  metadata jsonb default '{}'::jsonb
);

comment on table dayprogram_events is
  'Logging van wijzigingen aan dayprogram_slots voor audit en analytics.';

create index if not exists idx_dayprogram_events_day_date
  on dayprogram_events (day_date);

create index if not exists idx_dayprogram_events_content_type
  on dayprogram_events (content_type);

create index if not exists idx_dayprogram_events_created_at
  on dayprogram_events (created_at);