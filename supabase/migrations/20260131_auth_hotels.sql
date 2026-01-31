-- Hotels, employees details and shifts extensions

create table if not exists hotels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  created_by uuid,
  created_at timestamptz default now() not null,
  unique (org_id, name)
);

alter table employees
  add column if not exists hotel_id uuid references hotels(id) on delete set null,
  add column if not exists email text,
  add column if not exists status text default 'active';

alter table employees
  add constraint if not exists employees_status_chk check (status in ('active','inactive','vacation'));

create index if not exists idx_hotels_org on hotels(org_id);
create index if not exists idx_employees_org_hotel on employees(org_id, hotel_id);

alter table shifts
  add column if not exists hotel_id uuid references hotels(id) on delete cascade,
  add column if not exists shift_code text default 'morning',
  add column if not exists status text default 'scheduled';

alter table shifts
  add constraint if not exists shifts_shift_code_chk check (shift_code in ('morning','evening')),
  add constraint if not exists shifts_status_chk check (status in ('scheduled','done','cancelled'));

create index if not exists idx_shifts_org_date on shifts(org_id, shift_date);

