import { test, expect } from "@playwright/test";
import { parse } from "@/lib/playwright-simulator/parser";
import { runSimulation } from "@/lib/playwright-simulator/runner";
import { scenarios } from "@/lib/playwright-simulator/scenarios";

/**
 * Unit tests for the Playwright simulator that powers the browser playground.
 * These run without a browser — the simulator is pure TypeScript.
 */

test.describe("parser", () => {
  test("extracts statements from a full test file", () => {
    const statements = parse(`
      import { test, expect } from '@playwright/test';

      test('example', async ({ page }) => {
        await page.goto('/practice/registration');
        await page.getByLabel('Email').fill('a@b.com');
      });
    `);

    expect(statements).toHaveLength(2);
    expect(statements[0].chain.root).toBe("page");
    expect(statements[0].chain.calls[0].name).toBe("goto");
    expect(statements[1].chain.calls[1].args[0]).toBe("a@b.com");
  });

  test("parses object and regex arguments", () => {
    const [statement] = parse(
      `await expect(page.getByRole('heading', { name: /ORD-\\d+/, level: 1 })).toBeVisible();`,
    );

    const target = statement.chain.expectTarget!;
    const options = target.calls[0].args[1] as Record<string, unknown>;

    expect(options.name).toBeInstanceOf(RegExp);
    expect(options.level).toBe(1);
  });

  test("records .not as negation", () => {
    const [statement] = parse(
      `await expect(page.getByText('Gone')).not.toBeVisible();`,
    );
    expect(statement.chain.negated).toBe(true);
  });

  test("handles variable assignment", () => {
    const [statement] = parse(`const email = page.getByLabel('Email');`);
    expect(statement.assignTo).toBe("email");
  });
});

test.describe("execution", () => {
  test("navigates and fills a field", () => {
    const result = runSimulation(`
      await page.goto('/practice/registration');
      await page.getByLabel('Email').fill('ada@example.com');
      await expect(page.getByLabel('Email')).toHaveValue('ada@example.com');
    `);

    expect(result.passed).toBe(true);
    expect(result.finalState.fields.email).toBe("ada@example.com");
    expect(result.steps).toHaveLength(3);
  });

  test("reports a strict mode violation for an ambiguous locator", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop');
      await page.getByRole('button', { name: 'Add to Cart' }).click();
    `);

    expect(result.passed).toBe(false);
    expect(result.error?.title).toBe("Strict mode violation");
    expect(result.error?.available?.length).toBeGreaterThan(1);
  });

  test("resolves a chained, filtered locator", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop');

      const product = page.getByRole('article').filter({ hasText: 'Wireless Headphones' });

      await product.getByRole('button', { name: 'Add to Cart' }).click();

      await expect(page.getByTestId('cart-count')).toHaveText('1');
    `);

    expect(result.passed).toBe(true);
    expect(result.finalState.cart).toEqual([{ productId: "p-1001", quantity: 1 }]);
  });

  test("produces a Playwright-style not-found error with suggestions", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop/login');
      await page.getByRole('button', { name: 'Loginn' }).click();
    `);

    expect(result.passed).toBe(false);
    expect(result.error?.message).toContain("Timeout");
    expect(result.error?.available).toContain("Sign In");
  });

  test("reports an assertion failure with expected and received", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop');
      await expect(page.getByText('Order Successful!')).toBeVisible();
    `);

    expect(result.passed).toBe(false);
    expect(result.error?.expected).toBe("visible");
    expect(result.error?.received).toContain("not found");
  });

  test("enforces the authentication guard on protected routes", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop/orders');
      await expect(page).toHaveURL('/practice/shop/login');
    `);

    expect(result.passed).toBe(true);
  });

  test("signs in and reaches the shop", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop/login');
      await page.getByLabel('Email').fill('testuser@example.com');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL('/practice/shop');
      await expect(page.getByTestId('account-name')).toContainText('Test User');
    `);

    expect(result.passed).toBe(true);
    expect(result.finalState.auth?.email).toBe("testuser@example.com");
  });

  test("rejects bad credentials", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop/login');
      await page.getByLabel('Email').fill('testuser@example.com');
      await page.getByLabel('Password').fill('wrong');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByText('Invalid email or password')).toBeVisible();
    `);

    expect(result.passed).toBe(true);
  });

  test("check() is idempotent where click() would toggle", () => {
    const result = runSimulation(`
      await page.goto('/practice/registration');
      await page.getByRole('checkbox', { name: 'Terms and Conditions' }).check();
      await page.getByRole('checkbox', { name: 'Terms and Conditions' }).check();
      await expect(page.getByRole('checkbox', { name: 'Terms and Conditions' })).toBeChecked();
    `);

    expect(result.passed).toBe(true);
  });

  test("waitForResponse matches a request the action produced", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop/login');
      await page.getByLabel('Email').fill('testuser@example.com');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForResponse('**/api/auth/login');
    `);

    expect(result.passed).toBe(true);
  });

  test("waitForResponse fails when no matching request was seen", () => {
    const result = runSimulation(`
      await page.goto('/practice/registration');
      await page.waitForResponse('**/api/orders');
    `);

    expect(result.passed).toBe(false);
    expect(result.error?.reason).toContain("registered before the action");
  });

  test("reports a syntax error with a line number", () => {
    const result = runSimulation(`await page.getByLabel('Email'.fill('x');`);

    expect(result.passed).toBe(false);
    expect(result.error?.title).toBe("Could not parse the test");
  });

  test("names unsupported APIs instead of failing silently", () => {
    const result = runSimulation(`
      await page.goto('/practice/shop');
      await page.getByRole('button').dragTo(page.getByRole('article'));
    `);

    expect(result.passed).toBe(false);
    expect(result.error?.title).toBe("Unsupported API");
  });
});

test.describe("scenario solutions", () => {
  for (const scenario of scenarios.filter((s) => s.mode === "simulated")) {
    test(`solution passes: ${scenario.title}`, () => {
      const result = runSimulation(scenario.solution, scenario.initialUrl);

      expect(
        result.passed,
        `${scenario.id} failed: ${result.error?.message ?? ""} ${result.error?.reason ?? ""}`,
      ).toBe(true);

      if (scenario.check) {
        const check = scenario.check(result);
        expect(check.passed, check.message).toBe(true);
      }
    });
  }
});
