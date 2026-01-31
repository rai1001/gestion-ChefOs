import { supabaseAdmin } from "../supabase/admin";
import { SupplierConfig } from "./deadline";

export type Supplier = SupplierConfig & {
  id: string;
  name: string;
  lead_time_days?: number;
  contact?: { phone?: string; email?: string };
  delivery_days?: number[];
};

export type SupplierProduct = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  product_name: string;
  unit: string;
  category?: string;
  price_cents?: number;
};

const stubSuppliers: Supplier[] = [
  {
    id: "sup-veg",
    name: "Frutas SA",
    delivery_days: [1, 3, 5],
    cutoff_time: "16:00",
    prep_hours: 12,
    ship_hours: 24,
    lead_time_days: 1,
    contact: { phone: "+34 600 123 123" },
  },
  {
    id: "sup-lact",
    name: "Lácteos del Norte",
    delivery_days: [2, 4, 6],
    cutoff_time: "14:00",
    prep_hours: 6,
    ship_hours: 24,
    lead_time_days: 2,
    contact: { phone: "+34 600 222 222" },
  },
];

const stubProducts: SupplierProduct[] = [
  {
    id: "prod-apple",
    supplier_id: "sup-veg",
    supplier_name: "Frutas SA",
    product_name: "Manzana Fuji",
    unit: "kg",
    category: "Fruta",
    price_cents: 220,
  },
  {
    id: "prod-orange",
    supplier_id: "sup-veg",
    supplier_name: "Frutas SA",
    product_name: "Naranja Navel",
    unit: "kg",
    category: "Fruta",
    price_cents: 180,
  },
  {
    id: "prod-milk",
    supplier_id: "sup-lact",
    supplier_name: "Lácteos del Norte",
    product_name: "Leche entera 1L",
    unit: "L",
    category: "Lácteos",
    price_cents: 95,
  },
];

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function listSuppliers(_orgId?: string): Promise<Supplier[]> {
  // Stub for E2E or when Supabase env vars are missing
  const admin = supabaseAdmin();
  if (isE2E || !admin) return stubSuppliers;

  const { data, error } = await admin
    .from("suppliers")
    .select("id,name,lead_time_days,delivery_days,cutoff_time,prep_hours,ship_hours,contact_phone,contact_email");
  if (error || !data) return stubSuppliers;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    lead_time_days: row.lead_time_days ?? undefined,
    delivery_days: row.delivery_days ?? undefined,
    cutoff_time: row.cutoff_time ?? undefined,
    prep_hours: row.prep_hours ?? undefined,
    ship_hours: row.ship_hours ?? undefined,
    contact: { phone: row.contact_phone ?? undefined, email: row.contact_email ?? undefined },
  }));
}

export async function listSupplierProducts(orgId?: string): Promise<SupplierProduct[]> {
  const admin = supabaseAdmin();
  if (isE2E || !admin) return stubProducts;

  const { data, error } = await admin
    .from("supplier_products_view")
    .select("id, supplier_id, supplier_name, product_name, unit, category, price_cents, org_id");

  if (error || !data) return stubProducts;
  const filtered = orgId ? data.filter((row) => row.org_id === orgId) : data;
  return filtered as SupplierProduct[];
}
