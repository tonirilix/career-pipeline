import type { Page } from "@playwright/test";

export async function seedSavedOpportunity(page: Page) {
  const addOpportunity = page.getByRole("button", { name: "Add opportunity" });

  try {
    await addOpportunity.waitFor({ state: "visible", timeout: 3_000 });
  } catch {
    await page.getByRole("button", { name: "Open sidebar" }).click();
    await addOpportunity.waitFor({ state: "visible" });
  }

  await addOpportunity.click();
  await page
    .getByRole("textbox", { name: "Company", exact: true })
    .fill("Stripe");
  await page
    .getByRole("textbox", { name: "Role title", exact: true })
    .fill("Senior Engineer");
  await page
    .getByRole("textbox", { name: "Posting URL", exact: true })
    .fill("https://stripe.com/jobs/1");
  await page
    .getByRole("textbox", { name: "Location", exact: true })
    .fill("Remote");
  await page
    .getByRole("textbox", { name: "Compensation", exact: true })
    .fill("$180k-$220k");
  await page.getByRole("button", { name: "Save opportunity" }).click();
  await page.getByText("Senior Engineer").waitFor();
}
