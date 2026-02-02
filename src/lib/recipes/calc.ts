import type { Recipe, RecipeItemInput, RecipeItem } from "./store";

export function computeItemTotals(input: RecipeItemInput): RecipeItem {
  const gross = input.gross_qty ?? input.net_qty ?? 0;
  const net = input.net_qty ?? Math.max(gross - (input.waste_qty ?? 0), 0);
  const waste_qty = input.waste_qty ?? Math.max(gross - net, 0);
  const waste_pct = input.waste_pct ?? (gross > 0 ? (waste_qty / gross) * 100 : 0);
  const total_cost = net * input.unit_price;
  return {
    id: "",
    product_name: input.product_name,
    unit: input.unit,
    gross_qty: gross,
    net_qty: net,
    waste_qty,
    waste_pct,
    unit_price: input.unit_price,
    total_cost,
  };
}

export function computeRecipeCost(items: RecipeItem[], servings: number) {
  const total_cost = items.reduce((acc, it) => acc + it.total_cost, 0);
  const cost_per_serving = servings > 0 ? total_cost / servings : 0;
  return { total_cost, cost_per_serving };
}

export function cloneWithTotals(recipe: Omit<Recipe, "total_cost" | "cost_per_serving">): Recipe {
  const { total_cost, cost_per_serving } = computeRecipeCost(recipe.items, recipe.servings);
  return { ...recipe, total_cost, cost_per_serving };
}
