import { test, expect } from "@playwright/test";

test("dashboard and core pages load", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Team Net Revenue Retention")).toBeVisible();
  await expect(page.getByText("Manager Actions This Week")).toBeVisible();

  await page.goto("/accounts");
  await expect(page.getByText("Accounts and Health")).toBeVisible();

  await page.goto("/pipeline");
  await expect(page.getByText("Funnel Conversion by Stage")).toBeVisible();

  await page.goto("/team");
  await expect(page.getByText("What's Working").first()).toBeVisible();

  await page.goto("/playbooks");
  await expect(page.getByText("Operating Playbooks")).toBeVisible();

  await page.goto("/resume");
  await expect(page.getByText("Ex-founder (~â‚¬500k ARR)")).toBeVisible();
});
