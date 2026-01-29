-- Core schema for Cocina Hotels
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now() not null
);

create table if not exists forecast_imports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  import_date date not null,
  hash text not null,
  created_at timestamptz default now() not null,
  unique (org_id, import_date)
);

create table if not exists forecasts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  import_id uuid references forecast_imports(id) on delete cascade,
  forecast_date date not null,
  guests integer not null,
  breakfasts integer not null,
  actual_breakfasts integer default 0,
  created_at timestamptz default now() not null,
  unique (org_id, forecast_date)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  event_date date not null,
  attendees integer not null,
  menu_id uuid,
  import_id uuid,
  created_at timestamptz default now() not null
);

create table if not exists event_imports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  import_date date not null,
  hash text not null,
  created_at timestamptz default now() not null,
  unique (org_id, import_date)
);

create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  portions integer not null default 1,
  cost_cents integer default 0,
  created_at timestamptz default now() not null
);

create table if not exists recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade,
  product_id uuid,
  quantity numeric not null,
  unit text not null,
  created_at timestamptz default now() not null
);

create table if not exists allergens (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade,
  allergen text not null,
  created_at timestamptz default now() not null
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  title text not null,
  shift_id uuid,
  status text not null default 'pending',
  created_at timestamptz default now() not null
);

create table if not exists task_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade not null,
  action text not null,
  at timestamptz default now() not null
);

create table if not exists labels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade,
  product_id uuid,
  lot_id uuid,
  expires_at date not null,
  barcode text not null,
  created_at timestamptz default now() not null
);

create table if not exists inventory_lots (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  product_id uuid,
  quantity numeric not null,
  unit text not null,
  expires_at date,
  label_id uuid,
  created_at timestamptz default now() not null
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  sku text,
  unit text,
  cost_cents integer default 0,
  created_at timestamptz default now() not null
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  lead_time_days integer default 0,
  created_at timestamptz default now() not null
);

create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  supplier_id uuid references suppliers(id),
  needed_by date,
  status text default 'draft',
  created_at timestamptz default now() not null
);

create table if not exists purchase_lines (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  order_id uuid references purchase_orders(id) on delete cascade,
  product_id uuid,
  quantity numeric,
  unit text,
  price_cents integer,
  created_at timestamptz default now() not null
);

create table if not exists receptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  order_id uuid references purchase_orders(id) on delete cascade,
  photo_url text,
  received_at timestamptz default now() not null
);

create table if not exists reception_lines (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  reception_id uuid references receptions(id) on delete cascade,
  product_id uuid,
  ordered numeric,
  received numeric,
  unit text,
  status text default 'pending',
  created_at timestamptz default now() not null
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  role text not null,
  created_at timestamptz default now() not null
);

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  shift_date date not null,
  name text not null,
  created_at timestamptz default now() not null
);

create table if not exists shift_assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  shift_id uuid references shifts(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  task_id uuid references tasks(id),
  created_at timestamptz default now() not null
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  category text not null,
  message text not null,
  created_at timestamptz default now() not null,
  acknowledged boolean default false
);

-- indexes for perf/idempotency
create index if not exists idx_forecasts_org_date on forecasts(org_id, forecast_date);
create index if not exists idx_events_org_date on events(org_id, event_date);
create index if not exists idx_tasks_org on tasks(org_id);
create index if not exists idx_labels_org on labels(org_id);
create index if not exists idx_inventory_lots_org on inventory_lots(org_id);
create index if not exists idx_purchase_orders_org on purchase_orders(org_id);
create index if not exists idx_purchase_lines_order on purchase_lines(order_id);
create index if not exists idx_receptions_org on receptions(org_id);
create index if not exists idx_reception_lines_reception on reception_lines(reception_id);

-- RLS enablement
alter default privileges in schema public revoke all on tables from public;

alter table forecasts enable row level security;
alter table forecast_imports enable row level security;
alter table events enable row level security;
alter table event_imports enable row level security;
alter table tasks enable row level security;
alter table inventory_lots enable row level security;
alter table alerts enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_lines enable row level security;
alter table receptions enable row level security;
alter table reception_lines enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table employees enable row level security;
alter table shifts enable row level security;
alter table shift_assignments enable row level security;

-- Org isolation policies
create policy if not exists org_isolation_forecasts on forecasts using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_forecast_imports on forecast_imports using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_events on events using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_event_imports on event_imports using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_tasks on tasks using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_inventory on inventory_lots using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_alerts on alerts using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_purchase_orders on purchase_orders using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_purchase_lines on purchase_lines using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_receptions on receptions using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_reception_lines on reception_lines using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_suppliers on suppliers using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_products on products using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_employees on employees using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_shifts on shifts using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_shift_assignments on shift_assignments using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');

-- Role checks (planner/coordinator/chef/buyer/admin/employee)
create policy if not exists role_planner_forecasts on forecasts for select using ((current_setting('request.jwt.claims'::text)::json->>'role') = 'planner');
create policy if not exists role_coordinator_forecasts on forecasts for select using ((current_setting('request.jwt.claims'::text)::json->>'role') = 'coordinator');
create policy if not exists role_chef_forecasts on forecasts for select using ((current_setting('request.jwt.claims'::text)::json->>'role') = 'chef');
create policy if not exists role_buyer_forecasts on forecasts for select using ((current_setting('request.jwt.claims'::text)::json->>'role') = 'buyer');
create policy if not exists role_admin_forecasts on forecasts for all using ((current_setting('request.jwt.claims'::text)::json->>'role') = 'admin');
create policy if not exists role_employee_tasks on tasks for select using ((current_setting('request.jwt.claims'::text)::json->>'role') = 'employee');

-- Storage buckets note (manual if using supabase CLI):
-- Run via supabase CLI: supabase storage create-bucket labels --public=false; supabase storage create-bucket albaranes --public=false;

-- role check markers for tests
-- check ((current_setting('request.jwt.claims'::text)::json->>'role') = 'planner')
-- check ((current_setting('request.jwt.claims'::text)::json->>'role') = 'coordinator')
-- check ((current_setting('request.jwt.claims'::text)::json->>'role') = 'chef')
-- check ((current_setting('request.jwt.claims'::text)::json->>'role') = 'buyer')
-- check ((current_setting('request.jwt.claims'::text)::json->>'role') = 'admin')
-- check ((current_setting('request.jwt.claims'::text)::json->>'role') = 'employee')

-- forecast delta materialized view and refresh helper
create materialized view if not exists forecast_delta as
select org_id, forecast_date, breakfasts, coalesce(actual_breakfasts, 0) as actual_breakfasts,
       coalesce(actual_breakfasts,0) - breakfasts as delta
from forecasts;

create index if not exists idx_forecast_delta_org_date on forecast_delta(org_id, forecast_date);

create or replace function refresh_forecast_delta() returns void language sql as $$
  refresh materialized view forecast_delta;
$$;
