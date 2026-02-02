import { describe, it, expect, beforeEach } from "vitest";
import { listProducts, resetProductsStore, upsertProduct, findProductByName } from "@/lib/products/store";

describe("products store", () => {
  beforeEach(() => {
    resetProductsStore();
  });

  it("stores and lists products", () => {
    upsertProduct({ org_id: "org-dev", name: "Harina", unit: "KG", unit_price: 1.2 });
    const list = listProducts("org-dev");
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Harina");
  });

  it("finds by name ignoring case", () => {
    upsertProduct({ org_id: "org-dev", name: "Azucar", unit: "KG", unit_price: 0.8 });
    const found = findProductByName("org-dev", "azucar");
    expect(found?.unit_price).toBeCloseTo(0.8, 5);
  });
});
