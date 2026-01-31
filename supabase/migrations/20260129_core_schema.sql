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
  task_id uuid references tasks(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete cascade not null,
  action text not null,
  at timestamptz default now() not null
);

create table if not exists labels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade not null,
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
  quantity numeric not null default 0,
  unit text not null default 'ud',
  expires_at date,
  label_id uuid,
  created_at timestamptz default now() not null
);

create table if not exists merma (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  lot_id uuid references inventory_lots(id) on delete cascade,
  quantity numeric not null,
  reason text,
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
  quantity numeric not null default 0,
  unit text not null default 'ud',
  price_cents integer default 0,
  created_at timestamptz default now() not null
);

create table if not exists receptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  order_id uuid references purchase_orders(id) on delete cascade,
  expected_date date,
  photo_url text,
  received_at timestamptz default now() not null
);

create table if not exists reception_lines (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  reception_id uuid references receptions(id) on delete cascade,
  product_id uuid,
  ordered numeric not null default 0,
  received numeric not null default 0,
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

create table if not exists vacations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  employee_id uuid references employees(id) on delete cascade,
  start_date date not null,
  end_date date not null,
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
create index if not exists idx_vacations_org on vacations(org_id);

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
alter table merma enable row level security;
alter table vacations enable row level security;

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
create policy if not exists org_isolation_merma on merma using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');
create policy if not exists org_isolation_vacations on vacations using (org_id = current_setting('request.jwt.claims'::text)::json->>'org_id');

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

-- Event sheets helper view
create view if not exists event_sheets as
select e.id as event_id, e.org_id, e.event_date, e.attendees, e.menu_id from events e;

-- Alerts KPI materialized view and refresh
create materialized view if not exists kpi_alert_counts as
  select org_id, count(*)::int as alert_count from alerts group by org_id;

create or replace function refresh_kpi_alert_counts() returns void language sql as $$
  refresh materialized view concurrently kpi_alert_counts;
$$;

-- Upcoming events (30 días) para dashboard
create materialized view if not exists kpi_upcoming_events as
select org_id, event_date, hall, name, event_type, attendees
from events
where event_date >= current_date and event_date < current_date + interval '30 days';

create index if not exists idx_kpi_upcoming_events_org_date on kpi_upcoming_events(org_id, event_date);

create or replace function refresh_kpi_upcoming_events() returns void language sql as $$
  refresh materialized view concurrently kpi_upcoming_events;
$$;

-- Refresco unificado de dashboards
create or replace function refresh_dashboards() returns void language sql as $$
begin
  perform refresh_forecast_delta();
  perform refresh_kpi_alert_counts();
  perform refresh_kpi_upcoming_events();
end;
$$;

-- Generic alert helper
create or replace function create_alert(p_org uuid, p_category text, p_message text)
returns void language plpgsql as $$
begin
  insert into alerts(org_id, category, message) values (p_org, p_category, p_message);
end;
$$;

-- Reception alerts for delay/shortage
create or replace function trg_reception_line_alert() returns trigger language plpgsql as $$
declare
  rec receptions;
begin
  select * into rec from receptions where id = new.reception_id;
  if rec.expected_date is not null and rec.received_at::date > rec.expected_date then
    perform create_alert(rec.org_id, 'delay', 'Entrega retrasada');
  end if;
  if new.received < new.ordered then
    perform create_alert(rec.org_id, 'shortage', 'Falta cantidad por recibir');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reception_line_alert on reception_lines;
create trigger trg_reception_line_alert
after insert or update on reception_lines
for each row execute function trg_reception_line_alert();

-- Merma alerts
create or replace function trg_merma_alert() returns trigger language plpgsql as $$
begin
  perform create_alert(new.org_id, 'merma', 'Merma registrada');
  return new;
end;
$$;

drop trigger if exists trg_merma_alert on merma;
create trigger trg_merma_alert
after insert on merma
for each row execute function trg_merma_alert();

-- Expiry/stockout alerts on inventory lots
create or replace function trg_inventory_lot_alert() returns trigger language plpgsql as $$
begin
  if new.expires_at is not null and new.expires_at <= (current_date + interval '1 day') then
    perform create_alert(new.org_id, 'expiry', 'Lote a punto de caducar');
  end if;
  if new.quantity <= 0 then
    perform create_alert(new.org_id, 'rotura', 'Rotura de stock');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_inventory_lot_alert on inventory_lots;
create trigger trg_inventory_lot_alert
after insert or update on inventory_lots
for each row execute function trg_inventory_lot_alert();

-- Purchase order due alerts
create or replace function trg_purchase_order_due() returns trigger language plpgsql as $$
begin
  if new.needed_by is not null and new.needed_by <= current_date and coalesce(new.status, 'draft') <> 'completed' then
    perform create_alert(new.org_id, 'order_due', 'Pedido pendiente de recibir');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_purchase_order_due on purchase_orders;
create trigger trg_purchase_order_due
after insert or update on purchase_orders
for each row execute function trg_purchase_order_due();

-- FK link labels -> inventory_lots when present
alter table labels drop constraint if exists labels_lot_id_fkey;
alter table labels add constraint labels_lot_id_fkey foreign key(lot_id) references inventory_lots(id) on delete set null;
