import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

import type {
  InferenceOptions,
  IInferenceProvider,
  ProviderFileConfig,
} from "@commonkads/engine";
import {
  createDiagnosticsLogger,
  loadProviderConfig,
} from "@commonkads/engine";

const logger = createDiagnosticsLogger("providers:bedrock");

type AWSFileConfig = ProviderFileConfig & { region?: string };

export interface BedrockTextInferenceOptions {
  region?: string;
  guardrailIdentifier?: string;
  guardrailVersion?: string;
  /** Path to a provider config file; defaults to ~/.commonkads/aws.yml. */
  configFile?: string;
  /** Injectable for testing; defaults to a real `BedrockRuntimeClient`. */
  client?: BedrockRuntimeClient;
}

/** `IInferenceProvider` backed by Bedrock's Converse API. */
export class BedrockTextInference implements IInferenceProvider {
  private readonly client: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(
    modelId?: string,
    private readonly options: BedrockTextInferenceOptions = {},
  ) {
    const fileConfig = loadProviderConfig<AWSFileConfig>(
      "aws",
      options.configFile,
    );

    let resolvedModel: string;
    let modelSource: string;
    if (modelId !== undefined) {
      resolvedModel = modelId;
      modelSource = "explicit-arg";
    } else if (fileConfig.modelId !== undefined) {
      resolvedModel = fileConfig.modelId;
      modelSource = "config-file";
    } else {
      throw new Error(
        "modelId is required: pass it or set modelId in ~/.commonkads/providers/aws.yml",
      );
    }
    this.modelId = resolvedModel;

    logger.info(`config: model="${resolvedModel}" source=${modelSource}`);

    const resolvedRegion = options.region ?? fileConfig.region;

    this.client =
      options.client ?? new BedrockRuntimeClient({ region: resolvedRegion });
  }

  /** Resolves a named guardrail for the given environment. */
  static withGuardrailName(
    modelId: string | undefined,
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
