import { describe, it, expect } from "vitest";
import { resetTasksStore, seedTask, startTask, finishTask, createLabel, listLots } from "@/lib/tasks/store";

describe("labels", () => {
  it("creates inventory lot with expiry", () => {
    resetTasksStore();
    seedTask({ id: "t1", org_id: "org", title: "Prep", status: "pending" });
    startTask("t1");
    finishTask("t1");
    const { label_id, lot_id, barcode } = createLabel({ org_id: "org", task_id: "t1", expires_at: "2026-04-01" });
    expect(label_id).toBeTruthy();
    expect(barcode).toMatch(/^LBL-/);
    const lots = listLots();
    const lot = lots.find((l) => l.id === lot_id);
    expect(lot?.expires_at).toBe("2026-04-01");
    expect(lot?.label_id).toBe(label_id);
  });
});
