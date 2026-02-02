import { randomUUID } from "crypto";
import { computeItemTotals, computeRecipeCost } from "./calc";

export type RecipeItemInput = {
  product_name: string;
  unit: string;
  gross_qty?: number;
  net_qty?: number;
  waste_qty?: number;
  waste_pct?: number;
  unit_price: number;
};

export type RecipeItem = RecipeItemInput & {
  id: string;
  net_qty: number;
  gross_qty: number;
  waste_qty: number;
  waste_pct: number;
  total_cost: number;
};

export type Recipe = {
  id: string;
  org_id: string;
  name: string;
  date?: string;
  servings: number;
  items: RecipeItem[];
  total_cost: number;
  cost_per_serving: number;
};

const globalAny = globalThis as any;
const recipeStore: Map<string, Recipe> = globalAny.__recipesStore ?? new Map();
globalAny.__recipesStore = recipeStore;

function normalizeItem(input: RecipeItemInput): RecipeItem {
  const base = computeItemTotals(input);
  return { ...base, id: randomUUID() };
}

export function resetRecipesStore() {
  recipeStore.clear();
}

export function upsertRecipeWithItems(input: {
  org_id: string;
  name: string;
  date?: string;
  servings: number;
  items: RecipeItemInput[];
}) {
  const id = randomUUID();
  const items = input.items.map(normalizeItem);
  const { total_cost, cost_per_serving } = computeRecipeCost(items, input.servings);
  const recipe: Recipe = {
    id,
    org_id: input.org_id,
    name: input.name,
    date: input.date,
    servings: input.servings,
    items,
    total_cost,
    cost_per_serving,
  };
  recipeStore.set(id, recipe);
  return id;
}

export function listRecipes(org_id?: string) {
  return Array.from(recipeStore.values()).filter((r) => (org_id ? r.org_id === org_id : true));
}

export function getRecipe(id: string) {
  return recipeStore.get(id);
}
