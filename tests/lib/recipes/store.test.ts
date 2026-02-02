import { describe, it, expect, beforeEach } from "vitest";
import { listRecipes, upsertRecipeWithItems, resetRecipesStore, getRecipe } from "@/lib/recipes/store";

describe("recipes store", () => {
  beforeEach(() => {
    resetRecipesStore();
  });

  it("stores recipe and items with totals", () => {
    const recipeId = upsertRecipeWithItems({
      org_id: "org-dev",
      name: "Tortilla",
      servings: 10,
      date: "2026-02-01",
      items: [
        { product_name: "Patata", unit: "KG", gross_qty: 0.5, net_qty: 0.45, waste_qty: 0.05, waste_pct: 10, unit_price: 1.2 },
        { product_name: "Huevos", unit: "UD", gross_qty: 12, net_qty: 12, waste_qty: 0, waste_pct: 0, unit_price: 0.2 },
      ],
    });

    const recipes = listRecipes("org-dev");
    expect(recipes).toHaveLength(1);
    const r = getRecipe(recipeId);
    expect(r?.items).toHaveLength(2);
    expect(r?.total_cost).toBeCloseTo(0.45 * 1.2 + 12 * 0.2, 5);
    expect(r?.cost_per_serving).toBeCloseTo((0.45 * 1.2 + 12 * 0.2) / 10, 5);
  });
});
