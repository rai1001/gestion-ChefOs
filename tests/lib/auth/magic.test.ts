import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendMagicLink } from "@/lib/auth/magic";

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signInWithOtp: vi.fn(async () => ({ data: {}, error: null })),
      },
    })),
  };
});

describe("sendMagicLink", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_E2E = "1";
    process.env.E2E = "1";
  });

  it("returns ok in e2e mode", async () => {
    const res = await sendMagicLink("chef@demo.test");
    expect(res.ok).toBe(true);
    expect(res.mode).toBe("e2e");
  });

  it("throws without email", async () => {
    await expect(sendMagicLink("")).rejects.toThrow("email required");
  });
});
