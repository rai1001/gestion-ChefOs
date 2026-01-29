import { describe, it, expect } from "vitest";
import { resetTasksStore, seedTask, startTask, finishTask } from "@/lib/tasks/store";

describe("task workflow", () => {
  it("cannot finish before start", () => {
    resetTasksStore();
    seedTask({ id: "t1", org_id: "org", title: "Prep", status: "pending" });
    expect(() => finishTask("t1")).toThrow();
  });

  it("records start then finish", () => {
    resetTasksStore();
    seedTask({ id: "t1", org_id: "org", title: "Prep", status: "pending" });
    const started = startTask("t1");
    expect(started.status).toBe("in_progress");
    const finished = finishTask("t1");
    expect(finished.status).toBe("done");
    expect(finished.started_at).toBeDefined();
    expect(finished.finished_at).toBeDefined();
  });
});
