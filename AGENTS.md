# Repository Guidelines

## Project Structure & Module Organization
Application code lives in `src/`. Route pages are in `src/pages`, shared UI primitives in `src/components/ui`, and feature-specific components under folders like `src/components/alunos`, `src/components/dashboard`, and `src/components/financeiro`. Reusable hooks, schemas, and config live in `src/hooks`, `src/schemas`, and `src/config`. Mock data is kept in `src/data`. Static public assets such as icons and robots metadata are in `public/`. Tests currently live in `src/test`.

## Build, Test, and Development Commands
- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite dev server on port `8080`.
- `npm run build`: create the production build in `dist/`.
- `npm run build:dev`: run a development-mode build for quick validation.
- `npm run lint`: run ESLint on all TypeScript and TSX files.
- `npm test`: run Vitest once in jsdom.
- `npm run test:watch`: run Vitest in watch mode while developing.

## Coding Style & Naming Conventions
Use TypeScript and React function components. Follow the existing style: double quotes, semicolons, and 2-space indentation. Components and pages use `PascalCase` file names such as `Dashboard.tsx`; hooks use `use-*.tsx` or `use-*.ts`; utility modules use lower-case names like `utils.ts`. Prefer the `@/` alias over deep relative imports. ESLint is configured in `eslint.config.js` with `typescript-eslint`, `react-hooks`, and `react-refresh`; run lint before opening a PR.

## Testing Guidelines
Vitest and Testing Library are configured through `vitest.config.ts` and `src/test/setup.ts`. Add tests beside the existing pattern in `src/test`, using `*.test.ts` or `*.test.tsx`. Cover new user-facing behavior, route rendering, and component state changes. Run `npm test` locally before submitting changes.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commit messages, often with prefixes like `chore:` (`chore: harden frontend dependency tree`). Keep commits focused and use a scope when it clarifies intent. Pull requests should include: a concise summary, linked issue or task if available, screenshots or short recordings for UI changes, and the commands you ran to validate the work.

## Configuration Notes
Do not commit secrets. Frontend build and alias configuration live in `vite.config.ts`; Tailwind configuration is in `tailwind.config.ts`. Treat `dist/` as generated output and leave it out of manual edits.
