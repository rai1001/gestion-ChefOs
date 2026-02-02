import { test, expect } from "@playwright/test";

const csv = `DESCRIPCIÓN PRODUCTO PROVEEDOR,UNIDADES,CANTIDAD BRUTA,CANTIDAD NETA,% DESPERDICIO,PRECIO POR UNIDAD
Patata,KG,0.5,0.45,10,1.2
`;

const fileUpload = {
  name: "receta.csv",
  mimeType: "text/csv",
  buffer: Buffer.from(csv, "utf8"),
};

test.describe("recipes import", () => {
  test("uploads csv and shows recipe in list", async ({ page }) => {
    await page.goto("/recipes/import");
    await page.setInputFiles('input[type="file"]', fileUpload as any);
    await page.getByTestId("import-excel").click();
    await expect(page.getByTestId("import-status")).toBeVisible();
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible();
    await expect(page.getByTestId("recipes-table").getByText("receta", { exact: false }).first()).toBeVisible();
  });
});
