import { test, expect } from "@playwright/test";

test("dashboard answers core manager questions", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Manager Questions")).toBeVisible();
  await expect(page.getByText("Team Net Revenue Retention")).toBeVisible();
  await expect(page.getByText("Manager Actions This Week")).toBeVisible();
  await expect(page.getByText("Customer Health and Risk")).toBeVisible();
  await expect(page.getByText("Operating Cadence")).toBeVisible();
});

test("accounts filtering and detail navigation work", async ({ page }) => {
  await page.goto("/accounts");
  await expect(page.getByText("Accounts and Health")).toBeVisible();

  const firstAccountLink = page.locator("table a").first();
  await expect(firstAccountLink).toBeVisible();
  const href = await firstAccountLink.getAttribute("href");
  expect(href).toContain("/accounts/");
  await page.goto(href!);

  await expect(page).toHaveURL(/\/accounts\//);
  await expect(page.getByText("Account Detail")).toBeVisible();
});

test("pipeline scenario builder recalculates", async ({ page }) => {
  await page.goto("/pipeline");
  await expect(page.getByText("Forecast Scenario Builder")).toBeVisible();

  const firstSlider = page.locator('input[type="range"]').first();
  await firstSlider.evaluate((node) => {
    const slider = node as HTMLInputElement;
    slider.value = "90";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.getByRole("button", { name: "Recalculate" }).click();

  await expect(page.getByText("vs baseline").first()).toBeVisible();
  await expect(page.getByText("Deal Desk and Guardrails")).toBeVisible();
});

test("team coaching prep renders", async ({ page }) => {
  await page.goto("/team");
  await expect(page.getByText("Coaching 1:1 Prep").first()).toBeVisible();
});

test("playbooks stay interactive", async ({ page }) => {
  await page.goto("/playbooks");
  await expect(page.getByText("Operating Playbooks")).toBeVisible();

  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.check();

  const notes = page.getByLabel("Working Notes");
  await notes.fill("Escalate champion block with executive sponsor.");
  await page.reload();

  await expect(page.getByLabel("Working Notes")).toHaveValue("Escalate champion block with executive sponsor.");
});

test("resume routes back to dashboard", async ({ page }) => {
  await page.goto("/resume");
  await expect(page.getByText("Ex-founder (~")).toBeVisible();
  await page.getByRole("link", { name: "View Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
