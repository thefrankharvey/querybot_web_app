alter table public.agent_matches
  add column if not exists genres_themes text,
  add column if not exists query_sent_date date,
  add column if not exists pages_requested_date date,
  add column if not exists rejected_date date,
  add column if not exists offer_date date;

notify pgrst, 'reload schema';
