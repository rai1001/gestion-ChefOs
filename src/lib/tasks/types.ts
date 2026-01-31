export type Shift = "morning" | "evening";

export type TaskEntry = {
  id: string;
  org_id: string;
  title: string;
  status: "pending" | "in_progress" | "done";
  due_date: string; // YYYY-MM-DD
  shift: Shift;
  priority: "low" | "medium" | "high";
  event_id?: string | null;
  recipe_id?: string | null;
  servings?: number | null;
  hall?: string | null;
  assignee?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
};

export type InventoryLot = {
  id: string;
  org_id: string;
  product_id?: string;
  quantity?: number;
  unit?: string;
  expires_at: string;
  label_id: string;
};
