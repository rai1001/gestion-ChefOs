export type Product = {
  id: string;
  org_id: string;
  name: string;
  unit: string;
  unit_price: number;
};

const globalAny = globalThis as any;
const productsStore: Map<string, Product> = globalAny.__productsStore ?? new Map();
globalAny.__productsStore = productsStore;

export function resetProductsStore() {
  productsStore.clear();
}

export function listProducts(org_id?: string) {
  return Array.from(productsStore.values()).filter((p) => (org_id ? p.org_id === org_id : true));
}

export function upsertProduct(p: Omit<Product, "id"> & { id?: string }) {
  const id = p.id ?? crypto.randomUUID();
  const product: Product = { id, org_id: p.org_id, name: p.name, unit: p.unit, unit_price: p.unit_price };
  productsStore.set(id, product);
  return product;
}

export function seedProduct(p: Product) {
  productsStore.set(p.id, p);
}
