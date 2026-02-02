import type { RecipeItemInput } from "./store";
import { read, utils } from "xlsx";

export type RecipeImport = {
  name: string;
  date?: string;
  servings: number;
  items: RecipeItemInput[];
  total_cost: number;
};

function normalizeKey(key: string) {
  return key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function toNumber(val: any): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const str = String(val).trim().replace(/\./g, "").replace(",", ".");
  const num = Number(str);
  return Number.isNaN(num) ? 0 : num;
}

function detectKeys(keys: string[]) {
  const norm = keys.map(normalizeKey);
  const find = (pred: (k: string) => boolean) => keys[norm.findIndex(pred)];
  return {
    desc: find((k) => k.includes("descripcion") || k.includes("producto")),
    unit: find((k) => k.startsWith("unidad") || k === "unidades"),
    gross: find((k) => k.includes("bruta")),
    net: find((k) => k.includes("neta")),
    wastePct: find((k) => k.includes("desper") && k.includes("%")) ?? find((k) => k.includes("desper")),
    price: find((k) => k.includes("precio")),
  };
}

export async function parseRecipeImport(
  fileBuffer: Buffer,
  opts: { filename?: string; name: string; servings?: number; date?: string }
): Promise<RecipeImport> {
  const workbook = read(fileBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = utils.sheet_to_json(sheet, { defval: null });
  if (!rows.length) {
    return { name: opts.name, servings: opts.servings ?? 1, date: opts.date, items: [], total_cost: 0 };
  }
  const keys = Object.keys(rows[0]).filter(Boolean);
  const cols = detectKeys(keys);

  const items: RecipeItemInput[] = [];
  for (const row of rows) {
    const product = row[cols.desc ?? ""] ?? "";
    if (!product || /^seleccionar/i.test(String(product))) continue;
    const unit = (row[cols.unit ?? ""] ?? "").toString().trim() || "UD";
    const gross_qty = toNumber(row[cols.gross ?? ""]);
    const net_qty = toNumber(row[cols.net ?? ""]);
    const waste_pct = toNumber(row[cols.wastePct ?? ""]);
    const unit_price = toNumber(row[cols.price ?? ""]);
    items.push({ product_name: String(product).trim(), unit, gross_qty, net_qty, waste_pct, unit_price });
  }

  const total_cost = items.reduce((acc, it) => acc + (it.net_qty ?? 0) * it.unit_price, 0);
  return {
    name: opts.name,
    servings: opts.servings ?? 1,
    date: opts.date,
    items,
    total_cost,
  };
}
