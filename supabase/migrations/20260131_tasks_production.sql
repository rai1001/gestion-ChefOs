-- Extend tasks table for production scheduling per shift/day
alter table tasks
  add column if not exists due_date date not null default current_date,
  add column if not exists shift text default 'morning' check (shift in ('morning','evening')),
  add column if not exists priority text default 'medium',
  add column if not exists event_id uuid references events(id) on delete set null,
  add column if not exists recipe_id uuid references recipes(id) on delete set null,
  add column if not exists servings integer default 0,
  add column if not exists hall text,
  add column if not exists started_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists assignee text;

-- Status constraint
alter table tasks
  add constraint tasks_status_chk check (status in ('pending','in_progress','done'));

-- Index to query by org/date/shift
create index if not exists idx_tasks_org_due_shift on tasks(org_id, due_date, shift);

comment on column tasks.shift is 'morning (06-14) or evening (16-24)';
comment on column tasks.due_date is 'production day for the task';
