import { describe, it, expect } from "vitest";
import { parseRecipeImport } from "@/lib/recipes/import";
import { upsertRecipeWithItems, listRecipes, resetRecipesStore } from "@/lib/recipes/store";

describe("recipes import endpoint logic", () => {
  it("parses buffer and stores recipe", async () => {
    resetRecipesStore();
    const csv = `DESCRIPCIÓN PRODUCTO PROVEEDOR,UNIDADES,CANTIDAD BRUTA,CANTIDAD NETA,% DESPERDICIO,PRECIO POR UNIDAD
Patata,KG,0.5,0.45,10,1.2
`;
    const parsed = await parseRecipeImport(Buffer.from(csv, "utf8"), { filename: "r.csv", name: "Receta CSV", servings: 5 });
    const id = upsertRecipeWithItems({ org_id: "org-dev", name: parsed.name, servings: parsed.servings, items: parsed.items });
    const list = listRecipes("org-dev");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(id);
    expect(list[0].total_cost).toBeGreaterThan(0);
  });
});
