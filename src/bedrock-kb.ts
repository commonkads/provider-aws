import {
  BedrockAgentRuntimeClient,
  RetrieveCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

import type { FileContent, IKnowledgeStore } from "@commonkads/engine";

export interface BedrockKnowledgeStoreOptions {
  region?: string;
  /** Number of passages to request per query. */
  maxResults?: number;
  /** Injectable for testing; defaults to a real `BedrockAgentRuntimeClient`. */
  client?: BedrockAgentRuntimeClient;
}

/** `IKnowledgeStore` backed by an Amazon Bedrock Knowledge Base. */
export class BedrockKnowledgeStore implements IKnowledgeStore {
  private readonly client: BedrockAgentRuntimeClient;

  constructor(
    private readonly knowledgeBaseId: string,
    private readonly options: BedrockKnowledgeStoreOptions = {},
  ) {
    this.client =
      options.client ??
      new BedrockAgentRuntimeClient({ region: options.region });
  }

  get(_ref: string): Promise<FileContent> {
    return Promise.resolve({ content: '', version: '' });
  }

  async search(query: string): Promise<FileContent> {
    const response = await this.client.send(
      new RetrieveCommand({
        knowledgeBaseId: this.knowledgeBaseId,
        retrievalQuery: { text: query },
        retrievalConfiguration: this.options.maxResults
          ? {
              vectorSearchConfiguration: {
                numberOfResults: this.options.maxResults,
              },
            }
          : undefined,
      }),
    );

    const passages = (response.retrievalResults ?? [])
      .map((result) => result.content?.text ?? "")
      .filter((text) => text.length > 0);

    return { content: passages.join("\n\n---\n\n"), version: "" };
  }
}
