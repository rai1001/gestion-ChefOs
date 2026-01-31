import { listEventSheets } from "@/lib/events/store";
import { seedTask } from "./store";
import { TaskEntry } from "./types";
import { randomUUID } from "crypto";

type EventSheetRow = {
  org_id: string;
  event_date: string;
  hall: string;
  name: string;
  attendees: number;
  menu_name?: string | null;
  menu_id?: string | null;
};

function dedupeKey(row: EventSheetRow) {
  return `${row.org_id}-${row.event_date}-${row.hall}-${row.name}`.toLowerCase();
}

/**
 * Generate production tasks from event sheets.
 * - One task per event/hall.
 * - Servings = attendees.
 * - Shift defaults to morning.
 */
export function createTasksFromEventSheets(org_id: string, event_date?: string, hall?: string | null) {
  const sheets = listEventSheets(event_date, hall) as EventSheetRow[];
  const seen = new Set<string>();
  const tasks: TaskEntry[] = [];

  for (const row of sheets) {
    const key = dedupeKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    const task: TaskEntry = {
      id: randomUUID(),
      org_id,
      title: `${row.name} ${row.menu_name ?? ""}`.trim(),
      status: "pending",
      due_date: row.event_date,
      shift: "morning",
      priority: "medium",
      event_id: row.menu_id ?? null,
      recipe_id: null,
      servings: row.attendees,
      hall: row.hall,
      started_at: null,
      finished_at: null,
      assignee: null,
    };
    seedTask(task);
    tasks.push(task);
  }

  return tasks;
}
