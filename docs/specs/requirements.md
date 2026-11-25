# Requirements — @commonkads/provider-aws

## Overview

AWS provider implementations for the [CommonKADS engine](https://github.com/commonkads/engine). Provides `IInferenceProvider` backed by Bedrock Converse API, `IFileStore` backed by Amazon S3, and `IKnowledgeStore` backed by Bedrock Knowledge Bases.

## REQ-1 — BedrockTextInference

Implements `IInferenceProvider`. Constructor accepts `modelId: string` and `BedrockTextInferenceOptions`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `region` | `string` | — | AWS region; falls back to SDK default resolution |
| `guardrailIdentifier` | `string` | — | Bedrock guardrail ID |
| `guardrailVersion` | `string` | — | Bedrock guardrail version |
| `client` | `BedrockRuntimeClient` | — | Injectable for testing |

`BedrockTextInference.withGuardrailName(modelId, guardrailName, options)` is a static factory that resolves a named guardrail by environment.

## REQ-2 — S3FileStore

Implements `IFileStore`. Constructor accepts `bucket: string` and `S3FileStoreOptions`.

| Option | Type | Description |
|--------|------|-------------|
| `region` | `string` | AWS region |
| `client` | `S3Client` | Injectable for testing |

`readWithVersion` returns the S3 `VersionId` as the version identifier (or `'unversioned'` if absent). `list(prefix?)` uses `ListObjectsV2Command`.

## REQ-3 — BedrockKnowledgeStore

Implements `IKnowledgeStore`. Constructor accepts `knowledgeBaseId: string` and `BedrockKnowledgeStoreOptions`.

| Option | Type | Description |
|--------|------|-------------|
| `region` | `string` | AWS region |
| `maxResults` | `number` | Passages per query |
| `client` | `BedrockAgentRuntimeClient` | Injectable for testing |

`search(query)` issues a `RetrieveCommand` and returns top-N passages joined with `\n\n---\n\n`.

## REQ-4 — Registry Integration

`registerAwsProviders()` registers a builder for type `"bedrock"`. The `register` named export is an alias. `BedrockProviderOptions` (`{ type: "bedrock"; model; region?; guardrail? }`) is the config shape.

## REQ-5 — Credentials

Uses the AWS SDK's default credential chain (env vars, shared credential file, instance profile, etc.). No explicit key management in this package.

## Out of Scope

- Bedrock Agents, model fine-tuning, or model management
- DynamoDB, SQS, or other AWS services
- Multi-region failover
