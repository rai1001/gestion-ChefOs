import { test, expect } from "@playwright/test";

const pages = ["/", "/login"];

test.describe("smoke", () => {
  for (const path of pages) {
    test(`loads ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`, "i"));
    });
  }
});
