import { test, expect } from "@playwright/test";

/**
 * Smoke coverage for the training platform itself: the routes must render, the
 * playground must execute, and the SQL Lab must return rows.
 */
test.describe("Training platform", () => {
  const routes = [
    { path: "/", heading: /Master Playwright/ },
    { path: "/dashboard", heading: "Dashboard" },
    { path: "/learn", heading: "Curriculum" },
    { path: "/challenges", heading: "Challenges" },
    { path: "/capstone", heading: /Capstone/ },
    { path: "/cheat-sheet", heading: "Cheat Sheets" },
    { path: "/api-reference", heading: "API Reference" },
    { path: "/which-api", heading: /Which API/ },
    { path: "/glossary", heading: "Glossary" },
    { path: "/progress", heading: "Progress" },
  ];

  for (const route of routes) {
    test(`renders ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(
        page.getByRole("heading", { name: route.heading, level: 1 }),
      ).toBeVisible();
    });
  }

  test("a lesson renders its sections, quiz and navigation", async ({ page }) => {
    await page.goto("/learn/locators/get-by-role");

    await expect(
      page.getByRole("heading", { name: "getByRole — the first locator to reach for" }),
    ).toBeVisible();
    await expect(page.getByText("What you'll learn")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Check your understanding" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Key takeaways" })).toBeVisible();
  });

  test("marking a lesson complete persists across a reload", async ({ page }) => {
    await page.goto("/learn/locators/what-a-locator-is");

    const markComplete = page
      .getByRole("button", { name: "Mark complete" })
      .first();
    await markComplete.click();

    await expect(
      page.getByRole("button", { name: "Completed" }).first(),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("button", { name: "Completed" }).first(),
    ).toBeVisible();
  });

  test("a quiz scores answers and explains them", async ({ page }) => {
    await page.goto("/learn/locators/what-a-locator-is");

    // Answer every question, correctly or not — the point is that it scores.
    const questions = page.locator("li:has(fieldset)");
    const count = await questions.count();

    for (let i = 0; i < count; i += 1) {
      await questions.nth(i).getByRole("radio").first().check();
    }

    await page.getByRole("button", { name: "Submit answers" }).click();

    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("global search finds a lesson", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: /Search/ }).first().click();
    await page.getByRole("textbox", { name: "Search" }).fill("storageState");

    await expect(page.getByRole("dialog", { name: /Search/ })).toContainText(
      "storageState",
    );
  });
});

test.describe("Playwright playground", () => {
  test("executes a passing test against the simulated browser", async ({
    page,
  }) => {
    await page.goto("/playground?scenario=locators");

    await page.getByRole("button", { name: "Show solution" }).click();
    await page.getByRole("button", { name: "Load into editor" }).click();
    await page.getByRole("button", { name: "Run", exact: true }).click();

    await expect(page.getByText("✓ Test passed")).toBeVisible();
    await expect(page.getByText("EXECUTION LOG")).toBeVisible();
  });

  test("produces a Playwright-style failure for a bad locator", async ({
    page,
  }) => {
    await page.goto("/playground?scenario=login");

    const editor = page.getByRole("textbox", { name: "Test code" });
    await editor.fill(
      "await page.goto('/practice/shop/login');\nawait page.getByRole('button', { name: 'Loginn' }).click();",
    );
    await page.getByRole("button", { name: "Run", exact: true }).click();

    await expect(page.getByText("✕ Test failed")).toBeVisible();
    await expect(page.getByText("Timeout 5000ms exceeded")).toBeVisible();
    await expect(page.getByText("No matching element found.")).toBeVisible();
    await expect(page.getByText("- Sign In")).toBeVisible();
  });

  test("submitting a solved challenge records progress", async ({ page }) => {
    await page.goto("/playground?scenario=checkbox");

    await page.getByRole("button", { name: "Show solution" }).click();
    await page.getByRole("button", { name: "Load into editor" }).click();
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Terms accepted.")).toBeVisible();
    await expect(page.getByText("Solved")).toBeVisible();
  });

  test("the simulated Country dropdown opens and lists its options", async ({
    page,
  }) => {
    await page.goto("/playground?scenario=select");

    const country = page.getByRole("combobox", { name: "Country" });
    await expect(country).toHaveAttribute("aria-expanded", "false");

    await country.click();

    const options = page.getByRole("listbox", { name: "Country" });
    await expect(options).toBeVisible();
    await expect(options.getByRole("option")).toHaveCount(7);
    await expect(options.getByRole("option", { name: /Canada/ })).toContainText(
      'value="CA"',
    );

    await page.keyboard.press("Escape");
    await expect(options).toBeHidden();
  });
});

test.describe("SQL Lab", () => {
  test("runs the default query and returns rows", async ({ page }) => {
    await page.goto("/practice/sql");

    await page.getByRole("button", { name: "Run Query" }).click();

    await expect(page.getByText(/\d+ rows/)).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("reports a helpful error for an unknown table", async ({ page }) => {
    await page.goto("/practice/sql");

    await page.getByRole("textbox", { name: "SQL query" }).fill(
      "SELECT * FROM customers;",
    );
    await page.getByRole("button", { name: "Run Query" }).click();

    await expect(page.getByText("Query failed")).toBeVisible();
    await expect(page.getByText(/Unknown table "customers"/)).toBeVisible();
  });

  test("checks an exercise answer and records it", async ({ page }) => {
    await page.goto("/practice/sql?exercise=sql-missing-phone");

    await page.getByRole("button", { name: "Show solution" }).click();
    await page.getByRole("button", { name: "Load into editor" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();

    await expect(
      page.getByText("Correct. Your result matches the expected data exactly."),
    ).toBeVisible();
  });
});
