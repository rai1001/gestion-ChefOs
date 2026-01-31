import { describe, it, expect, beforeEach } from "vitest";
import { createHotel, listHotels, resetHotelsStore } from "@/lib/hotels/store";

describe("hotels store", () => {
  beforeEach(() => resetHotelsStore());

  it("creates and lists hotels by org", () => {
    createHotel("org-a", "Hotel A");
    createHotel("org-b", "Hotel B");
    const res = listHotels("org-a");
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe("Hotel A");
  });
});
