import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
  ]),

  {
    rules: {
      /**
       * Downgraded to a warning. The practice applications fetch their data on
       * mount and set a loading flag in the same effect — the ordinary pattern
       * for a client component talking to a REST API, and the thing that makes
       * `page.route()` interception actually affect what renders. The rule's
       * preferred alternatives (Suspense-based data fetching) would remove the
       * loading and error states these exercises are built around.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  {
    // The Playwright suite is not React. Its fixtures take a `use()` callback,
    // which the React Hooks rules mistake for the `use` hook.
    files: ["tests/**/*.ts", "playwright/**/*.ts", "playwright.config.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;
