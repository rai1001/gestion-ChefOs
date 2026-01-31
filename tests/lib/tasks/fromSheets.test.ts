import { describe, it, expect, beforeEach } from "vitest";
import { resetEventsStore, upsertEventEntries, attachMenu } from "@/lib/events/store";
import { resetTasksStore, listTasks } from "@/lib/tasks/store";
import { createTasksFromEventSheets } from "@/lib/tasks/fromSheets";

describe("createTasksFromEventSheets", () => {
  beforeEach(() => {
    resetEventsStore();
    resetTasksStore();
  });

  it("creates one task per event hall with servings = attendees", () => {
    upsertEventEntries([
      { org_id: "org-dev", event_date: "2026-02-10", hall: "Castelao", name: "Boda", event_type: "Banquete", attendees: 120 },
      { org_id: "org-dev", event_date: "2026-02-10", hall: "Roi", name: "Conferencia", event_type: "Corporate", attendees: 60 },
    ]);
    attachMenu("org-dev", "2026-02-10", null, "Menu Gala");

    const tasks = createTasksFromEventSheets("org-dev", "2026-02-10");
    expect(tasks).toHaveLength(2);
    expect(tasks[0].servings).toBeGreaterThan(0);
    const stored = listTasks();
    expect(stored).toHaveLength(2);
    expect(stored[0].status).toBe("pending");
  });
});
