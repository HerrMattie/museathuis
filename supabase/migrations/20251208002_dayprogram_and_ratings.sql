-- Fase 1 stap 2 en Fase 2 stap 3: dayprogram_slots inzetten en ratings eenduidig maken

--------------------------------------------------
-- 1. View voor dagprogramma (today)
--    Verwacht een bestaande tabel public.dayprogram_slots met minimaal:
--    - id
--    - slot_date::date
--    - slot_key (bijv. 'tour' | 'game' | 'focus' | 'salon' | 'academie' | 'best-of')
--    - content_type (bijv. 'tour' | 'game' | 'focus' | 'salon' | 'academy')
--    - content_id (uuid of bigint)
--    - is_premium boolean
--    - is_free boolean
--------------------------------------------------
create or replace view public.v_dayprogram_today as
select
  s.id,
  s.slot_date::date as date,
  s.slot_key,
  s.content_type,
  s.content_id,
  coalesce(s.is_premium, false) as is_premium,
  coalesce(s.is_free, not coalesce(s.is_premium, false)) as is_free
from public.dayprogram_slots s
where s.slot_date::date = current_date
order by s.slot_key asc, s.id asc;

--------------------------------------------------
-- 2. View voor dagprogramma status (aantal slots / premium / free)
--------------------------------------------------
create or replace view public.v_dayprogram_status_today as
select
  current_date::date as date,
  count(*) as total_slots,
  count(*) filter (where coalesce(is_premium, false)) as premium_slots,
  count(*) filter (where coalesce(is_free, false)) as free_slots
from public.dayprogram_slots s
where s.slot_date::date = current_date;

--------------------------------------------------
-- 3. Ratings eenduidig maken
--    Verwacht tabel public.ratings met minimaal:
--    - id
--    - user_id (uuid)
--    - content_type (text)
--    - content_id (uuid of bigint)
--    - rating (int)
--------------------------------------------------

-- Index / constraint zodat 1 gebruiker per content_type + content_id maar 1 rating heeft.
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'ratings_user_content_unique'
  ) then
    begin
      alter table public.ratings
        add constraint ratings_user_content_unique
        unique (user_id, content_type, content_id);
    exception
      when others then
        -- fallback naar create index if not exists
        begin
          create unique index if not exists ratings_user_content_unique
            on public.ratings (user_id, content_type, content_id);
        exception
          when others then
            raise notice 'Kon unieke index voor ratings niet aanmaken, controleer schema handmatig.';
        end;
    end;
  end if;
end$$;