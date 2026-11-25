# Design — initial-version

## File structure

```
provider-aws/
  .changeset/config.json       # Changesets config (access: public, baseBranch: main)
  .github/workflows/ci.yml     # Lint + compile + test + pack; PR and manual trigger
  .github/workflows/release.yml# Changesets publish; push to main and manual trigger
  .gitignore
  .npmrc                       # @commonkads:registry=https://npm.pkg.github.com
  CHANGELOG.md
  README.md
  eslint.config.mjs
  package.json                 # @commonkads/provider-aws
  src/
    bedrock.ts                 # BedrockTextInference (IInferenceProvider)
    bedrock-kb.ts              # BedrockKnowledgeStore (IKnowledgeStore)
    s3.ts                      # S3FileStore (IFileStore)
    s3.test.ts                 # Unit tests for S3FileStore
    index.ts                   # registerAwsProviders(), re-exports
  tsconfig.json
  tsconfig.test.json
```

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Package scope `@commonkads` | Matches the org and the engine package. |
| `@commonkads/engine ^0.1.0` | Pinned to the engine's current published version. |
| `NPM_READ_TOKEN` secret for install | `@commonkads/engine` is on GitHub Packages; CI needs read access. |
| `GITHUB_TOKEN` for publish | Standard for GitHub Packages publish within the same org. |
| Changesets for versioning | Consistent with the engine package workflow. |
| `tsconfig.json` excludes `*.test.ts` | Test files are type-checked via `tsconfig.test.json`; excluded from the production build. |
