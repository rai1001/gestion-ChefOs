import { test, expect } from "@playwright/test";
import path from "path";

test.describe("ocr albaran in receptions", () => {
  test("uploads file and shows OCR note", async ({ page }) => {
    await page.goto("/receptions");
    await page.getByLabel("receptions-table").waitFor();

    const input = page.getByLabel("ocr-upload");
    const fixturePath = path.join(__dirname, "fixtures", "ocr-demo.txt");
    await input.setInputFiles(fixturePath);

    await expect(page.getByLabel("ocr-note")).toContainText("OCR albarán");
  });
});
