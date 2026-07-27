-- Additive-only fields for the editable project dashboard table.
-- Existing agent_matches rows and values are left unchanged.
alter table public.agent_matches
  add column if not exists query_sent_date date,
  add column if not exists pages_requested_date date,
  add column if not exists rejected_date date,
  add column if not exists offer_date date;

notify pgrst, 'reload schema';
