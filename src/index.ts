import { registerProvider } from "@commonkads/engine";
import { BedrockTextInference } from "./bedrock.js";
import { S3FileStore } from "./s3.js";
import { BedrockKnowledgeStore } from "./bedrock-kb.js";

export { BedrockTextInference };
export type { BedrockTextInferenceOptions } from "./bedrock.js";
export { S3FileStore };
export type { S3FileStoreOptions } from "./s3.js";
export { BedrockKnowledgeStore };
export type { BedrockKnowledgeStoreOptions } from "./bedrock-kb.js";

export interface BedrockProviderOptions {
  type: "bedrock";
  model: string;
  region?: string;
  guardrail?: string;
}

export function registerAwsProviders(): void {
  registerProvider("bedrock", (opts) => {
    const o = opts as unknown as BedrockProviderOptions;
    return o.guardrail
      ? BedrockTextInference.withGuardrailName(o.model, o.guardrail, {
          region: o.region,
        })
      : new BedrockTextInference(o.model, { region: o.region });
  });
}

export { registerAwsProviders as register };
