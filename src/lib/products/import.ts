import { read, utils } from "xlsx";

export type ProductImport = { name: string; unit: string; unit_price: number };

const toNumber = (val: any) => {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const num = Number(String(val).replace(",", ".").replace(/\s+/g, ""));
  return Number.isNaN(num) ? 0 : num;
};

export function parseProductsBuffer(buffer: Buffer, isCsv = false): ProductImport[] {
  const wb = read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });
  const items: ProductImport[] = [];
  for (const row of rows) {
    const name = (row.name ?? row.product ?? row.Producto ?? row["descripcion"] ?? "").toString().trim();
    const unit = (row.unit ?? row.unidad ?? row.Unidad ?? "UD").toString().trim() || "UD";
    const unit_price = toNumber(row.unit_price ?? row.precio ?? row.precio_unitario);
    if (!name) continue;
    items.push({ name, unit, unit_price });
  }
  return items;
}

export function parseProductsText(text: string): ProductImport[] {
  // Expect lines like "Harina kg 1.20" or "Harina,kg,1.20"
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,;|\t]/).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const unit_price = toNumber(parts.pop());
        const unit = parts.pop() || "UD";
        const name = parts.join(" ");
        return { name, unit, unit_price };
      }
      // fallback regex: last number is price, previous token is unit
      const m = line.match(/(.+)\s+([A-Za-z]{1,5})\s+([\d.,]+)/);
      if (m) {
        return { name: m[1].trim(), unit: m[2].trim(), unit_price: toNumber(m[3]) };
      }
      return null;
    })
    .filter((v): v is ProductImport => !!v);
}
