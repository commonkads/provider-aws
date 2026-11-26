# @commonkads/provider-aws

> **Disclaimer:** This project is an independent open-source software implementation inspired by the CommonKADS knowledge engineering methodology (Schreiber et al.). It is not affiliated with or endorsed by the original methodology authors or any third-party trademark holders.

AWS provider implementations for the [CommonKADS engine](https://github.com/commonkads/engine).

## Provided implementations

| Export | Interface | Description |
|--------|-----------|-------------|
| `BedrockTextInference` | `IInferenceProvider` | Amazon Bedrock Converse API |
| `S3FileStore` | `IFileStore` | Amazon S3 file store |
| `BedrockKnowledgeStore` | `IKnowledgeStore` | Amazon Bedrock Knowledge Base |

## Usage

### Via the registry (recommended)

```ts
import { registerAwsProviders } from '@commonkads/provider-aws';
import { buildInference } from '@commonkads/engine';

// Call once at startup, before any buildInference calls.
registerAwsProviders();

const inference = buildInference({ type: 'bedrock', model: 'amazon.nova-pro-v1:0' });
```

### Direct construction

```ts
import { BedrockTextInference, S3FileStore, BedrockKnowledgeStore } from '@commonkads/provider-aws';

const inference = new BedrockTextInference('amazon.nova-pro-v1:0', { region: 'us-east-1' });
const fileStore = new S3FileStore('my-bucket', { region: 'us-east-1' });
const knowledgeStore = new BedrockKnowledgeStore('kb-id-123', { region: 'us-east-1' });
```

## Third-party extension pattern

`registerAwsProviders()` is the official extension point for wiring providers into
the engine without forking it. Any package can follow the same pattern:

```ts
import { registerProvider } from '@commonkads/engine';

export function registerMyProviders(): void {
  registerProvider('my-type', (opts) => new MyTextInference(opts));
}
```

Install the package, call `registerMyProviders()` at startup, and `buildInference`
dispatches to it via `{ type: 'my-type', ... }`.

## Credentials

Standard AWS credential chain applies: environment variables (`AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_REGION`), shared credentials file, or IAM role.
