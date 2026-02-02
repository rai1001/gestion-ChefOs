import { test, expect } from "@playwright/test";

const csv = `name,unit,unit_price
Harina,KG,1.2
`;

const fileUpload = {
  name: "products.csv",
  mimeType: "text/csv",
  buffer: Buffer.from(csv, "utf8"),
};

test.describe("products import", () => {
  test("uploads products and lists them", async ({ page }) => {
    await page.goto("/products/import");
    await page.getByTestId("products-import-card").waitFor({ state: "visible" });
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: "visible" });
    await fileInput.setInputFiles(fileUpload as any);
    await page.getByTestId("products-import-excel").click();
    await expect(page.getByTestId("products-import-status")).toBeVisible();
    await page.goto("/products");
    await expect(page.getByTestId("products-table")).toBeVisible();
    await expect(page.getByText("Harina").first()).toBeVisible();
  });
});
