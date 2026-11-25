# Changes — initial-version

## New files

| File | Description |
|------|-------------|
| `package.json` | Package manifest — `@commonkads/provider-aws` |
| `src/bedrock.ts` | `BedrockTextInference` — `IInferenceProvider` backed by Bedrock Converse API |
| `src/bedrock-kb.ts` | `BedrockKnowledgeStore` — `IKnowledgeStore` backed by Bedrock Knowledge Base |
| `src/s3.ts` | `S3FileStore` — `IFileStore` backed by Amazon S3 |
| `src/s3.test.ts` | Unit tests for `S3FileStore` |
| `src/index.ts` | Public exports and `registerAwsProviders()` |
| `tsconfig.json` | TypeScript build config |
| `tsconfig.test.json` | TypeScript config for type-checking tests |
| `eslint.config.mjs` | ESLint config (typescript-eslint + prettier) |
| `.github/workflows/ci.yml` | CI workflow (lint, compile, test, pack) |
| `.github/workflows/release.yml` | Release workflow (changesets publish) |
| `.changeset/config.json` | Changesets configuration |
| `.npmrc` | Registry routing for `@commonkads` |
| `README.md` | Usage documentation |
| `CHANGELOG.md` | Initial changelog entry |

## Modified files

None — brand new repository.

## Deviations from design

None.
