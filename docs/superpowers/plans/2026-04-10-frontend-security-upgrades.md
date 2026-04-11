# Frontend Security Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all `npm audit` vulnerabilities in the frontend project while preserving current frontend behavior and restoring build, lint, and test health after dependency upgrades.

**Architecture:** The implementation is a bounded dependency-hardening pass centered on direct package updates in [`frontend/package.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package.json), lockfile regeneration in [`frontend/package-lock.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package-lock.json), and compatibility fixes in test or config files only when the upgraded toolchain requires them. Runtime changes stay limited to package versions for `react-router-dom` and Vite-related tooling, with the test stack upgraded separately so jsdom-related advisories are removed without expanding into unrelated refactors.

**Tech Stack:** Vite, React 18, TypeScript, Vitest, jsdom, Testing Library, ESLint, npm

---

## File Map

- [`frontend/package.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package.json): direct dependency and devDependency version updates, plus `overrides` only if a vulnerable transitive package cannot be cleared by direct upgrades
- [`frontend/package-lock.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package-lock.json): regenerated dependency graph after package updates
- [`frontend/vitest.config.ts`](/home/john-paulo/projects/jiu-jitsu/frontend/vitest.config.ts): test runner compatibility updates only if required after upgrading jsdom or Vitest
- [`frontend/src/test/setup.ts`](/home/john-paulo/projects/jiu-jitsu/frontend/src/test/setup.ts): DOM/test polyfill updates only if required after upgrading jsdom
- [`frontend/vite.config.ts`](/home/john-paulo/projects/jiu-jitsu/frontend/vite.config.ts): Vite compatibility updates only if required by the security upgrade
- [`frontend/eslint.config.js`](/home/john-paulo/projects/jiu-jitsu/frontend/eslint.config.js): lint compatibility updates only if upgraded tooling changes config expectations

### Task 1: Capture the Baseline

**Files:**
- Modify: none
- Test: [`frontend/package.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package.json)

- [ ] **Step 1: Verify the current dependency scripts before running checks**

```json
{
  "scripts": {
    "build": "vite build",
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Run the audit baseline**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm audit`
Expected: FAIL with vulnerabilities reported for `react-router-dom`, `vite`, `jsdom`, and transitive packages such as `rollup`, `glob`, `minimatch`, `picomatch`, `flatted`, `yaml`, and `lodash`

- [ ] **Step 3: Run the build baseline**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm run build`
Expected: PASS, or a concrete existing build failure recorded before any dependency changes

- [ ] **Step 4: Run the lint baseline**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm run lint`
Expected: PASS, or a concrete existing lint failure recorded before any dependency changes

- [ ] **Step 5: Run the test baseline**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm test`
Expected: PASS, or a concrete existing test failure recorded before any dependency changes

- [ ] **Step 6: Commit the baseline notes only if you created a local scratch note**

```bash
git -C /home/john-paulo/projects/jiu-jitsu/frontend status --short
```

Expected: no tracked source changes required from this task

### Task 2: Upgrade Direct Runtime and Toolchain Dependencies

**Files:**
- Modify: [`frontend/package.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package.json)
- Test: [`frontend/package-lock.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package-lock.json)

- [ ] **Step 1: Update the direct dependency versions in `package.json`**

Replace the dependency entries with these values:

```json
{
  "dependencies": {
    "react-router-dom": "^6.30.3"
  },
  "devDependencies": {
    "vite": "^5.4.21",
    "jsdom": "^29.0.2"
  }
}
```

Keep every other package unchanged in this step.

- [ ] **Step 2: If jsdom 29 requires a test-runner alignment, update the related dev dependency versions in the same file**

Use this block only if `npm install` or `npm test` reports Vitest-to-jsdom incompatibility:

```json
{
  "devDependencies": {
    "vitest": "^4.1.4",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0"
  }
}
```

Do not upgrade these packages preemptively if the current runner works with `jsdom@29`.

- [ ] **Step 3: Reinstall dependencies and regenerate the lockfile**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm install`
Expected: PASS with `package-lock.json` updated and patched transitives pulled in for `@remix-run/router`, `rollup`, `glob`, `minimatch`, `picomatch`, `flatted`, `yaml`, `js-yaml`, `ajv`, and `brace-expansion`

- [ ] **Step 4: Verify that direct vulnerable packages moved to safe versions**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm ls react-router-dom vite jsdom`
Expected: `react-router-dom@6.30.3`, `vite@5.4.21` or newer secure equivalent, and `jsdom@29.0.2`

- [ ] **Step 5: Commit the package version changes**

```bash
git -C /home/john-paulo/projects/jiu-jitsu/frontend add package.json package-lock.json
git -C /home/john-paulo/projects/jiu-jitsu/frontend commit -m "chore: upgrade vulnerable frontend dependencies"
```

### Task 3: Clear Residual Audit Findings with Targeted Overrides Only If Necessary

**Files:**
- Modify: [`frontend/package.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package.json)
- Test: [`frontend/package-lock.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package-lock.json)

- [ ] **Step 1: Re-run the audit after the direct upgrades**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm audit`
Expected: PASS with zero vulnerabilities, or a reduced report showing the exact remaining package names

- [ ] **Step 2: If the audit is not yet clean, add a minimal `overrides` block to force the remaining patched transitives**

Add this block only for packages that still appear in the audit output after Task 2:

```json
{
  "overrides": {
    "@remix-run/router": "1.23.2",
    "rollup": "4.60.1",
    "glob": "10.5.0",
    "minimatch": "9.0.9",
    "picomatch": "2.3.2",
    "flatted": "3.4.2",
    "yaml": "2.8.3",
    "js-yaml": "4.1.1",
    "ajv": "6.14.0",
    "brace-expansion": "2.0.3"
  }
}
```

If a residual advisory references `minimatch@3.x` or `brace-expansion@1.x`, extend the overrides with:

```json
{
  "overrides": {
    "minimatch@3.1.2": "3.1.5",
    "brace-expansion@1.1.12": "1.1.13"
  }
}
```

- [ ] **Step 3: Reinstall after adding overrides**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm install`
Expected: PASS with lockfile updated to reflect the overrides

- [ ] **Step 4: Re-run the audit and confirm zero vulnerabilities**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm audit`
Expected: PASS with `found 0 vulnerabilities`

- [ ] **Step 5: Commit the override path only if it was needed**

```bash
git -C /home/john-paulo/projects/jiu-jitsu/frontend add package.json package-lock.json
git -C /home/john-paulo/projects/jiu-jitsu/frontend commit -m "chore: pin secure transitive frontend packages"
```

Expected: skip this commit entirely if Task 2 already produced a clean audit

### Task 4: Repair Test Compatibility After the jsdom Upgrade

**Files:**
- Modify: [`frontend/vitest.config.ts`](/home/john-paulo/projects/jiu-jitsu/frontend/vitest.config.ts)
- Modify: [`frontend/src/test/setup.ts`](/home/john-paulo/projects/jiu-jitsu/frontend/src/test/setup.ts)
- Test: [`frontend/src/test/example.test.ts`](/home/john-paulo/projects/jiu-jitsu/frontend/src/test/example.test.ts)

- [ ] **Step 1: Run the test suite immediately after the dependency upgrade**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm test`
Expected: PASS, or a concrete DOM/setup compatibility failure caused by the newer jsdom

- [ ] **Step 2: If Vitest needs an explicit modern jsdom-compatible config, keep `vitest.config.ts` in this shape**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

This is expected to remain unchanged unless the upgraded Vitest version requires a syntactic adjustment.

- [ ] **Step 3: If `window.matchMedia` setup breaks under the new jsdom, normalize `src/test/setup.ts` to this implementation**

```ts
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
```

- [ ] **Step 4: Re-run the focused example test**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npx vitest run src/test/example.test.ts`
Expected: PASS

- [ ] **Step 5: Re-run the full test suite**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm test`
Expected: PASS, or only pre-existing unrelated failures documented from Task 1

- [ ] **Step 6: Commit the compatibility fixes only if files changed**

```bash
git -C /home/john-paulo/projects/jiu-jitsu/frontend add vitest.config.ts src/test/setup.ts package.json package-lock.json
git -C /home/john-paulo/projects/jiu-jitsu/frontend commit -m "test: restore compatibility after jsdom upgrade"
```

### Task 5: Verify Build and Lint Against the Hardened Toolchain

**Files:**
- Modify: [`frontend/vite.config.ts`](/home/john-paulo/projects/jiu-jitsu/frontend/vite.config.ts)
- Modify: [`frontend/eslint.config.js`](/home/john-paulo/projects/jiu-jitsu/frontend/eslint.config.js)
- Test: [`frontend/package.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package.json)

- [ ] **Step 1: Re-run the production build**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm run build`
Expected: PASS

- [ ] **Step 2: If Vite upgrade exposes config breakage, preserve the existing configuration shape**

[`frontend/vite.config.ts`](/home/john-paulo/projects/jiu-jitsu/frontend/vite.config.ts) should remain:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

Only adapt this file if the upgraded Vite version rejects an existing option.

- [ ] **Step 3: Re-run lint**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm run lint`
Expected: PASS

- [ ] **Step 4: If ESLint tooling upgrades require explicit config preservation, keep `eslint.config.js` in this shape**

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
```

Only change this config if the upgraded lint toolchain produces a specific compatibility error.

- [ ] **Step 5: Commit build/lint compatibility fixes only if files changed**

```bash
git -C /home/john-paulo/projects/jiu-jitsu/frontend add vite.config.ts eslint.config.js package.json package-lock.json
git -C /home/john-paulo/projects/jiu-jitsu/frontend commit -m "build: preserve frontend toolchain compatibility"
```

### Task 6: Final Verification and Cleanup

**Files:**
- Modify: [`frontend/package.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package.json) if temporary overrides can be removed
- Modify: [`frontend/package-lock.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package-lock.json)
- Test: [`frontend/package.json`](/home/john-paulo/projects/jiu-jitsu/frontend/package.json)

- [ ] **Step 1: If you added overrides in Task 3, test whether they are still necessary**

Temporarily remove only the override entries you added, then run:

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm install && npm audit`
Expected: PASS with zero vulnerabilities if the direct dependency graph now resolves cleanly without overrides

If the audit regresses, restore the minimal override block and continue.

- [ ] **Step 2: Run the full verification sequence on the final dependency tree**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm audit && npm run build && npm run lint && npm test`
Expected: all commands PASS, with `npm audit` printing `found 0 vulnerabilities`

- [ ] **Step 3: Inspect the final diff**

Run: `git -C /home/john-paulo/projects/jiu-jitsu/frontend status --short`
Expected: only intentional dependency/config changes remain staged or committed

- [ ] **Step 4: Commit the final clean state**

```bash
git -C /home/john-paulo/projects/jiu-jitsu/frontend add package.json package-lock.json vitest.config.ts src/test/setup.ts vite.config.ts eslint.config.js
git -C /home/john-paulo/projects/jiu-jitsu/frontend commit -m "chore: harden frontend dependency tree"
```

- [ ] **Step 5: Record the release evidence for handoff**

Run: `cd /home/john-paulo/projects/jiu-jitsu/frontend && npm audit --json`
Expected: `"total": 0` under `metadata.vulnerabilities`
