import { test, expect } from "@playwright/test";

const pages = ["/", "/login", "/forecasts", "/events", "/purchases", "/receptions", "/inventory", "/tasks"];

test.describe("smoke", () => {
  for (const path of pages) {
    test(`loads ${path}`, async ({ page }) => {
      await page.goto(path);
      if (path === "/") {
        await expect(page).toHaveURL(/\/forecasts$/i);
      } else {
        await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`, "i"));
      }
    });
  }
});
