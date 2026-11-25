# Tasks — initial-version

All tasks completed on 2026-11-25.

1. **Create `package.json`** — `@commonkads/provider-aws`, `@commonkads/engine ^0.1.0` dep, `test`/`test:ci`/`release` scripts, `@changesets/cli` devDep, `publishConfig` for GitHub Packages.
2. **Port source files** from `strata/aws/src` — replace all `@robproper/strata-engine` imports with `@commonkads/engine`. Files: `src/bedrock.ts`, `src/bedrock-kb.ts`, `src/s3.ts`, `src/index.ts`.
3. **Port test file** from `strata/aws/src` — replace `@robproper/strata-aws` import with `@commonkads/provider-aws`. File: `src/s3.test.ts`.
4. **Create `tsconfig.json`** — NodeNext module resolution, ES2022 target, excludes `*.test.ts`.
5. **Create `tsconfig.test.json`** — extends tsconfig, `noEmit: true`, includes test files.
6. **Create `eslint.config.mjs`** — typescript-eslint + prettier + unused-imports rules.
7. **Create `.github/workflows/ci.yml`** — lint, compile, test, pack; triggers on PR and `workflow_dispatch`.
8. **Create `.github/workflows/release.yml`** — `changesets/action` publish; triggers on push to main and `workflow_dispatch`.
9. **Create `.changeset/config.json`** — `access: public`, `baseBranch: main`.
10. **Create `.npmrc`** — routes `@commonkads` to GitHub Packages registry.
11. **Create `README.md`** — usage docs for registry and direct construction patterns.
12. **Initialize git repository** with `main` as the default branch.
