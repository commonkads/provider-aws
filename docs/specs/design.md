# Design — @commonkads/provider-aws

## 1. Component Overview

| File | Export | Engine Interface |
|------|--------|-----------------|
| `src/bedrock.ts` | `BedrockTextInference`, `BedrockTextInferenceOptions` | `IInferenceProvider` |
| `src/s3.ts` | `S3FileStore`, `S3FileStoreOptions` | `IFileStore` |
| `src/bedrock-kb.ts` | `BedrockKnowledgeStore`, `BedrockKnowledgeStoreOptions` | `IKnowledgeStore` |
| `src/index.ts` | `registerAwsProviders`, `register`, `BedrockProviderOptions` | — |

## 2. Interface Implementations

**`BedrockTextInference implements IInferenceProvider`**
- Uses `BedrockRuntimeClient` + `ConverseCommand`
- `withGuardrailName(modelId, name, opts)` resolves the guardrail ID/version by name before constructing the instance

**`S3FileStore implements IFileStore`**
- Uses `GetObjectCommand` for `read`/`readWithVersion`, `ListObjectsV2Command` for `list`
- Version identifier = S3 `VersionId` or `'unversioned'`

**`BedrockKnowledgeStore implements IKnowledgeStore`**
- Uses `RetrieveCommand` from `BedrockAgentRuntimeClient`
- `search` joins passages with `\n\n---\n\n`; `get` performs a reference lookup

## 3. Registry Wiring

```ts
registerAwsProviders();
// Registers: registerProvider('bedrock', (opts) => ...)

const inference = buildInference({ type: 'bedrock', model: 'amazon.nova-pro-v1:0' });
```
