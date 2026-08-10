import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Academy runs its own suite against itself: the practice
 * applications are the system under test.
 *
 * BASE_URL lets the same suite run against a local dev server or a deployed
 * Vercel URL. See .env.example.
 */
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: isCI
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Pinned so date and currency assertions behave the same everywhere.
    locale: "en-US",
    timezoneId: "UTC",
  },

  projects: [
    // Pure unit tests for the simulator and SQL engines. No browser needed.
    {
      name: "unit",
      testDir: "./tests/unit",
      use: {},
    },

    // Signs in once and stores the session for the authenticated project.
    {
      name: "setup",
      testDir: "./tests",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // Tests that must run signed out (login form, redirects, registration).
    {
      name: "public",
      testDir: "./tests",
      testMatch: /.*\.public\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // The main authenticated suite.
    {
      name: "chromium",
      testDir: "./tests",
      testIgnore: [/.*\.setup\.ts/, /.*\.public\.spec\.ts/, /unit\/.*/],
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
    },
  ],

  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
