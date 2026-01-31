import { readFileSync } from "fs";
import { join } from "path";

const tables = [
  "forecasts",
  "forecast_imports",
  "events",
  "event_imports",
  "menus",
  "recipes",
  "recipe_ingredients",
  "allergens",
  "tasks",
  "task_logs",
  "labels",
  "inventory_lots",
  "products",
  "suppliers",
  "purchase_orders",
  "purchase_lines",
  "receptions",
  "reception_lines",
  "employees",
  "shifts",
  "shift_assignments",
  "alerts",
];

describe("core schema migration", () => {
  const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "20260129_core_schema.sql"), "utf8");
  const tasksExt = readFileSync(join(process.cwd(), "supabase", "migrations", "20260131_tasks_production.sql"), "utf8");

  it("declares all required tables", () => {
    for (const t of tables) {
      expect(sql).toContain(`create table if not exists ${t}`);
    }
  });

  it("enables row level security on key tables", () => {
    const rlsTables = ["forecasts", "forecast_imports", "events", "event_imports", "tasks", "inventory_lots", "alerts"];
    for (const t of rlsTables) {
      expect(sql).toContain(`alter table ${t} enable row level security`);
    }
  });

  it("adds uniqueness for idempotent imports", () => {
    expect(sql).toMatch(/unique \(org_id, import_date\)/);
    expect(sql).toMatch(/unique \(org_id, forecast_date\)/);
  });

  it("indexes foreign keys", () => {
    const expectedIdx = [
      "idx_forecasts_org_date",
      "idx_events_org_date",
      "idx_tasks_org",
      "idx_labels_org",
      "idx_inventory_lots_org",
      "idx_purchase_orders_org",
      "idx_receptions_org",
    ];
    for (const idx of expectedIdx) {
      expect(sql.toLowerCase()).toContain(idx.toLowerCase());
    }
  });

  it("uses not null on core columns", () => {
    expect(sql).toContain("org_id uuid references organizations(id) on delete cascade not null");
    expect(sql).toContain("created_at timestamptz default now() not null");
  });

  it("extends tasks with production fields and constraints", () => {
    expect(tasksExt).toContain("due_date date");
    expect(tasksExt.toLowerCase()).toContain("shift in ('morning','evening')");
    expect(tasksExt).toContain("tasks_status_chk");
    expect(tasksExt.toLowerCase()).toContain("idx_tasks_org_due_shift");
  });
});
