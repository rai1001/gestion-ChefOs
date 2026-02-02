import { describe, it, expect } from "vitest";
import { parseRecipeImport } from "@/lib/recipes/import";

const csvSample = `DESCRIPCIÓN PRODUCTO PROVEEDOR,UNIDADES,CANTIDAD BRUTA,CANTIDAD NETA,% DESPERDICIO,PRECIO POR UNIDAD
Patata,KG,0.5,0.45,10,1.2
Huevos,UD,12,12,0,0.2
`;

describe("recipes import parser", () => {
  it("parses csv into recipe import structure", async () => {
    const buf = Buffer.from(csvSample, "utf8");
    const res = await parseRecipeImport(buf, { filename: "tortilla.csv", name: "Tortilla", servings: 10 });
    expect(res.name).toBe("Tortilla");
    expect(res.items).toHaveLength(2);
    expect(res.items[0].product_name).toBe("Patata");
    expect(res.items[0].unit_price).toBeCloseTo(1.2, 5);
    const total = res.items.reduce((a, i) => a + i.net_qty * i.unit_price, 0);
    expect(total).toBeCloseTo(res.total_cost, 5);
  });
});
