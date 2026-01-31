import { describe, it, expect } from "vitest";
import { resetTasksStore, seedTask, startTask, finishTask, listTasks } from "@/lib/tasks/store";
import { TaskEntry } from "@/lib/tasks/types";

describe("task workflow", () => {
  it("cannot finish before start", () => {
    resetTasksStore();
    seedTask({
      id: "t1",
      org_id: "org",
      title: "Prep",
      status: "pending",
      due_date: "2026-02-01",
      shift: "morning",
      priority: "medium",
    } as TaskEntry);
    expect(() => finishTask("t1")).toThrow();
  });

  it("records start then finish", () => {
    resetTasksStore();
    seedTask({
      id: "t1",
      org_id: "org",
      title: "Prep",
      status: "pending",
      due_date: "2026-02-01",
      shift: "morning",
      priority: "medium",
    } as TaskEntry);
    const started = startTask("t1");
    expect(started.status).toBe("in_progress");
    const finished = finishTask("t1");
    expect(finished.status).toBe("done");
    expect(finished.started_at).toBeDefined();
    expect(finished.finished_at).toBeDefined();
  });

  it("filters by date range and shift", () => {
    resetTasksStore();
    seedTask({
      id: "m1",
      org_id: "org",
      title: "AM task",
      status: "pending",
      due_date: "2026-02-01",
      shift: "morning",
      priority: "low",
    } as TaskEntry);
    seedTask({
      id: "e1",
      org_id: "org",
      title: "PM task",
      status: "pending",
      due_date: "2026-02-02",
      shift: "evening",
      priority: "high",
    } as TaskEntry);
    const onlyMorning = listTasks({ shift: "morning" });
    expect(onlyMorning).toHaveLength(1);
    expect(onlyMorning[0].id).toBe("m1");
    const feb2 = listTasks({ from: "2026-02-02", to: "2026-02-02" });
    expect(feb2).toHaveLength(1);
    expect(feb2[0].id).toBe("e1");
  });
});
