import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

import { BedrockTextInference } from "./bedrock.js";

let dir: string;

before(() => {
  dir = mkdtempSync(join(tmpdir(), "ck-bedrock-test-"));
});

after(() => {
  rmSync(dir, { recursive: true, force: true });
});

function stubClient(): BedrockRuntimeClient {
  return {
    send: async () => ({
      output: { message: { content: [{ text: "ok" }] } },
    }),
  } as unknown as BedrockRuntimeClient;
}

describe("BedrockTextInference config resolution", () => {
  it("resolves modelId from explicit arg", () => {
    assert.doesNotThrow(
      () =>
        new BedrockTextInference("amazon.nova-lite-v1:0", {
          client: stubClient(),
        }),
    );
  });

  it("resolves modelId from config file", () => {
    const cfg = join(dir, "aws.yml");
    writeFileSync(cfg, "modelId: amazon.nova-lite-v1:0\n");
    assert.doesNotThrow(
      () =>
        new BedrockTextInference(undefined, {
          configFile: cfg,
          client: stubClient(),
        }),
    );
  });

  it("throws when modelId is absent and config file has no model", () => {
    const cfg = join(dir, "no-model.yml");
    writeFileSync(cfg, "region: us-east-1\n");
    assert.throws(
      () =>
        new BedrockTextInference(undefined, {
          configFile: cfg,
          client: stubClient(),
        }),
      /modelId is required/,
    );
  });

  it("throws when explicit configFile is not found", () => {
    assert.throws(
      () =>
        new BedrockTextInference(undefined, {
          configFile: join(dir, "ghost.yml"),
        }),
      /Config file not found/,
    );
  });

  it("silently ignores apiKey in config file", () => {
    const cfg = join(dir, "apikey.yml");
    writeFileSync(
      cfg,
      "modelId: amazon.nova-lite-v1:0\napiKey: should-be-ignored\n",
    );
    assert.doesNotThrow(
      () =>
        new BedrockTextInference(undefined, {
          configFile: cfg,
          client: stubClient(),
        }),
    );
  });

  it("withGuardrailName keeps modelId as required", () => {
    assert.doesNotThrow(() =>
      BedrockTextInference.withGuardrailName(
        "amazon.nova-lite-v1:0",
        "my-guardrail",
        {
          client: stubClient(),
        },
      ),
    );
  });
});
