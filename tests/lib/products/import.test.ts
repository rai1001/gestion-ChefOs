import { describe, it, expect } from "vitest";
import { parseProductsBuffer, parseProductsText } from "@/lib/products/import";

const csv = `name,unit,unit_price
Harina,KG,1.2
Azucar,KG,0.8
`;

describe("products import", () => {
  it("parses csv buffer", () => {
    const items = parseProductsBuffer(Buffer.from(csv, "utf8"), true);
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("Harina");
    expect(items[0].unit_price).toBeCloseTo(1.2, 5);
  });

  it("parses text lines", () => {
    const text = "Leche L 0.50\nHuevos UD 0.20";
    const items = parseProductsText(text);
    expect(items).toHaveLength(2);
    expect(items[1].name).toBe("Huevos");
  });
});
