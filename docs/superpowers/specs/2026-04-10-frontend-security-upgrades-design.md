# Frontend Security Upgrades Design

Date: 2026-04-10
Scope: `/home/john-paulo/projects/jiu-jitsu/frontend`

## Goal

Eliminate all `npm audit` vulnerabilities in the frontend project, including development and test dependencies, while keeping behavioral changes to the application itself as small as possible.

## Context

The frontend is a Vite + React + TypeScript project with shadcn-based UI components. The current dependency tree reports 18 vulnerabilities from `npm audit`, including direct issues in `react-router-dom`, `vite`, and `jsdom`, plus multiple vulnerable transitive packages pulled by build, lint, and test tooling.

Deprecated-package warnings shown during `npm install` are not treated as security failures by themselves. They should only be addressed when the dependency upgrades required to remove vulnerabilities also remove those warnings or when cleanup is low-risk.

## Design Summary

The work will be handled as a dependency-hardening task, not as an application refactor.

The implementation should:
- upgrade directly affected runtime packages to patched versions;
- upgrade the build toolchain to versions that pull secure transitive dependencies;
- upgrade the test environment, including major versions if required, to remove remaining audit findings;
- regenerate the lockfile and validate the resulting tree with build, lint, tests, and a fresh audit run;
- use explicit `overrides` only if a remaining vulnerable transitive dependency cannot be removed cleanly through direct upgrades.

## Recommended Approach

Use a focused, staged dependency update:

1. Upgrade direct dependencies with known fixed versions, especially `react-router-dom` and `vite`.
2. Reinstall dependencies and let the lockfile pull patched transitives such as `rollup`, `glob`, `minimatch`, `picomatch`, `yaml`, `js-yaml`, `flatted`, `ajv`, `brace-expansion`, and `lodash`.
3. Upgrade the test stack, including `jsdom`, even when it requires a major-version change.
4. Only expand further into adjacent tooling upgrades, such as `vitest` or related setup, when needed to restore compatibility after the `jsdom` jump.

This approach keeps the migration narrow enough to debug while still meeting the user's requirement to fully clear the audit report.

## Alternatives Considered

### 1. Broad "upgrade everything to latest"

This would likely clear the audit report, but it mixes security work with unnecessary modernization. It increases regression risk and makes root-cause analysis harder if the build or tests fail.

### 2. Minimal direct upgrades plus heavy use of `overrides`

This could clear the audit report quickly, but it produces a less transparent dependency graph and adds maintenance debt. It should only be used as a fallback for stubborn transitive packages.

## Architecture and Affected Areas

### Runtime dependencies

`react-router-dom` and its paired router packages must move to patched releases to eliminate known redirect and XSS-related advisories.

No application-level route redesign is planned. The runtime goal is package hardening, not changing route behavior.

### Build and dev server

`vite` must move to a secure release so the project no longer carries the known Vite and esbuild-related advisories. This also updates related build artifacts in the lockfile, including Rollup packages.

### Lint and type-analysis tooling

Some vulnerable transitives come from ESLint and TypeScript tooling. These should be resolved by reinstalling after direct upgrades, and if needed by targeted version bumps in the lint/type toolchain.

### Test environment

`jsdom` must be upgraded to a secure major version to remove the remaining low-severity advisory path through `http-proxy-agent` and `@tootallnate/once`.

If the existing `vitest` setup is not compatible with the newer `jsdom`, then the implementation may upgrade `vitest` and make small setup/test adjustments. The work should stay limited to compatibility fixes rather than test-suite redesign.

## Data and Configuration Changes

Expected file changes are:
- `package.json`
- `package-lock.json`
- test setup files or config files only if compatibility changes require them

No backend API changes, schema changes, or application data migrations are part of this work.

## Error Handling and Risk Management

Primary risks:
- a major `jsdom` upgrade may change DOM behavior used by tests;
- toolchain updates may tighten linting, type checks, or build behavior;
- patched transitives may shift through lockfile regeneration in ways that expose pre-existing fragility.

Mitigations:
- record the baseline status of audit, build, lint, and tests before changing versions;
- apply upgrades in small steps and rerun validation after each stage;
- keep runtime changes minimal and localized to dependency/config compatibility;
- add `overrides` only when direct upgrades cannot fully remove a vulnerable transitive dependency.

## Validation Plan

Before and after the upgrade sequence, run:
- `npm audit`
- `npm run build`
- `npm run lint`
- `npm test`

Success criteria:
- `npm audit` reports zero vulnerabilities in `/home/john-paulo/projects/jiu-jitsu/frontend`;
- the frontend build succeeds;
- lint succeeds, or any failure is shown to be pre-existing and unrelated to the dependency changes;
- tests succeed, or any failure is shown to be pre-existing and unrelated to the dependency changes.

## Out of Scope

The following are intentionally excluded unless required for compatibility:
- UI redesign or frontend feature work;
- unrelated refactors;
- package modernization beyond what is necessary to clear the audit report;
- migration to newer major versions of React or other application libraries with no security relevance to this task.

## Implementation Notes

If a package can be upgraded safely through a patch or minor release, prefer that path. If a major upgrade is necessary to remove a vulnerability, keep the change bounded to the directly affected subsystem and verify behavior immediately after the change.

The preferred end state is a clean dependency tree without persistent audit findings and without introducing avoidable application behavior changes.
