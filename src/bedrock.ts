import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

import type {
  InferenceOptions,
  IInferenceProvider,
} from "@commonkads/engine";
import { createDiagnosticsLogger } from "@commonkads/engine";

const logger = createDiagnosticsLogger("providers:bedrock");

export interface BedrockTextInferenceOptions {
  region?: string;
  guardrailIdentifier?: string;
  guardrailVersion?: string;
  /** Injectable for testing; defaults to a real `BedrockRuntimeClient`. */
  client?: BedrockRuntimeClient;
}

/** `IInferenceProvider` backed by Bedrock's Converse API. */
export class BedrockTextInference implements IInferenceProvider {
  private readonly client: BedrockRuntimeClient;

  constructor(
    private readonly modelId: string,
    private readonly options: BedrockTextInferenceOptions = {},
  ) {
    this.client =
      options.client ?? new BedrockRuntimeClient({ region: options.region });
  }

  /** Resolves a named guardrail for the given environment. */
  static withGuardrailName(
    modelId: string,
    guardrailName: string,
    options: Omit<
      BedrockTextInferenceOptions,
      "guardrailIdentifier" | "guardrailVersion"
    > = {},
  ): BedrockTextInference {
    return new BedrockTextInference(modelId, {
      ...options,
      guardrailIdentifier: guardrailName,
      guardrailVersion: "DRAFT",
    });
  }

  async infer(prompt: string, options: InferenceOptions = {}): Promise<string> {
    logger.debug(
      `calling model=${this.modelId} promptLength=${prompt.length} explain=${Boolean(options.explain)}`,
    );

    const command = new ConverseCommand({
      modelId: this.modelId,
      messages: [{ role: "user", content: [{ text: prompt }] }],
      system: options.systemPrompt
        ? [{ text: options.systemPrompt }]
        : undefined,
      guardrailConfig: this.options.guardrailIdentifier
        ? {
            guardrailIdentifier: this.options.guardrailIdentifier,
            guardrailVersion: this.options.guardrailVersion ?? "DRAFT",
          }
        : undefined,
    });

    const response = await this.client.send(command);
    const content = response.output?.message?.content ?? [];
    return content.map((block) => block.text ?? "").join("");
  }
}
