import { describe, it, expect, vi } from "vitest";

const upsert = vi.fn(async () => ({ data: [], error: null }));
const rpc = vi.fn(async () => ({ data: null, error: null }));
const from = vi.fn(() => ({ upsert }));

vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: () => ({ from, rpc }),
}));

import { saveRealCounts } from "@/lib/forecast/real";

describe("real counts", () => {
  it("upserts actuals and refreshes delta view", async () => {
    await saveRealCounts("org-1", "2026-01-30", 95);

    expect(upsert).toHaveBeenCalledOnce();
    const [row, opts] = upsert.mock.calls[0];
    expect(row).toMatchObject({ org_id: "org-1", forecast_date: "2026-01-30", actual_breakfasts: 95 });
    expect(opts).toMatchObject({ onConflict: "org_id,forecast_date" });
    expect(rpc).toHaveBeenCalledWith("refresh_forecast_delta");
  });
});
