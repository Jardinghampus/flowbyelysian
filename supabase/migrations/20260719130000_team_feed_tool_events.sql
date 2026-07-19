-- Tool activity events for team feed (nullable listing, expanded event types)

alter table public.team_feed_events
  alter column listing_id drop not null;

alter table public.team_feed_events
  drop constraint if exists team_feed_events_event_type_check;

alter table public.team_feed_events
  add constraint team_feed_events_event_type_check
  check (
    event_type in (
      'listing_live',
      'listing_pocket',
      'listing_request',
      'listing_updated',
      'tool_description',
      'tool_deal',
      'tool_training',
      'tool_areas',
      'tool_lookup',
      'tool_performance'
    )
  );

-- Demo seed: Hampus tool activity for team FOMO feed
insert into public.team_feed_events (
  event_type,
  listing_id,
  actor_id,
  actor_name,
  title,
  area_name,
  status,
  inquiry_type,
  transaction_type,
  property_type,
  created_at
)
select
  v.event_type,
  null,
  u.id::text,
  u.full_name,
  v.title,
  v.area_name,
  'tool',
  'tool',
  'sale',
  'tool',
  v.created_at
from public.app_users u
cross join (
  values
    ('tool_description', 'Generated listing description for Palm Jumeirah villa', 'Palm Jumeirah', now() - interval '2 hours'),
    ('tool_deal', 'Moved deal to Offer — Marina Gate 2BR', 'Dubai Marina', now() - interval '5 hours'),
    ('tool_training', 'Completed module: Off-plan sales playbook', 'Training', now() - interval '1 day'),
    ('tool_lookup', 'Owner lookup — Emirates Hills cluster', 'Emirates Hills', now() - interval '1 day 3 hours')
) as v(event_type, title, area_name, created_at)
where lower(u.email) = 'hampus@zaylo.com'
  and not exists (
    select 1 from public.team_feed_events e
    where e.event_type like 'tool_%' and e.actor_id = u.id::text
    limit 1
  );
