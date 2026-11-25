import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type {
  GetObjectCommandInput,
  ListObjectsV2CommandInput,
} from "@aws-sdk/client-s3";

import { FileNotFoundError } from "@commonkads/engine";
import { S3FileStore } from "@commonkads/provider-aws";

function makeSdkError(name: string): Error {
  const err = new Error(name);
  (err as { name: string }).name = name;
  return err;
}

function makeS3Client(
  handler: (input: GetObjectCommandInput) => Promise<unknown>,
) {
  return {
    send: async (command: { input: GetObjectCommandInput }) =>
      handler(command.input),
  };
}

function makeListS3Client(
  handler: (input: ListObjectsV2CommandInput) => Promise<unknown>,
) {
  return {
    send: async (command: { input: ListObjectsV2CommandInput }) =>
      handler(command.input),
  };
}

describe("S3FileStore", () => {
  it("read returns UTF-8 content from S3", async () => {
    const client = makeS3Client(async () => ({
      Body: { transformToString: async () => "hello from s3" },
      VersionId: "v1",
    }));
    const store = new S3FileStore("my-bucket", { client: client as never });
    assert.strictEqual(await store.read("norms.txt"), "hello from s3");
  });

  it("readWithVersion returns content and VersionId", async () => {
    const client = makeS3Client(async () => ({
      Body: { transformToString: async () => "knowledge text" },
      VersionId: "abc123",
    }));
    const store = new S3FileStore("my-bucket", { client: client as never });
    const result = await store.readWithVersion("norms.txt");
    assert.strictEqual(result.content, "knowledge text");
    assert.strictEqual(result.version, "abc123");
  });

  it('readWithVersion falls back to "unversioned" when VersionId is absent', async () => {
    const client = makeS3Client(async () => ({
      Body: { transformToString: async () => "content" },
    }));
    const store = new S3FileStore("my-bucket", { client: client as never });
    const result = await store.readWithVersion("norms.txt");
    assert.strictEqual(result.version, "unversioned");
  });

  it("throws FileNotFoundError on NoSuchKey", async () => {
    const client = makeS3Client(async () => {
      throw makeSdkError("NoSuchKey");
    });
    const store = new S3FileStore("my-bucket", { client: client as never });
    await assert.rejects(store.read("missing.txt"), FileNotFoundError);
  });

  it("throws FileNotFoundError on NotFound", async () => {
    const client = makeS3Client(async () => {
      throw makeSdkError("NotFound");
    });
    const store = new S3FileStore("my-bucket", { client: client as never });
    await assert.rejects(store.read("missing.txt"), FileNotFoundError);
  });

  it("re-throws unknown errors", async () => {
    const client = makeS3Client(async () => {
      throw makeSdkError("AccessDenied");
    });
    const store = new S3FileStore("my-bucket", { client: client as never });
    const err = (await store.read("restricted.txt").catch((e) => e)) as Error;
    assert.match(err.message, /AccessDenied/);
    assert.ok(!(err instanceof FileNotFoundError));
  });

  describe("list", () => {
    it("returns all keys when prefix is empty", async () => {
      const client = makeListS3Client(async () => ({
        Contents: [{ Key: "a/domain.yml" }, { Key: "b/domain.yml" }],
        IsTruncated: false,
      }));
      const store = new S3FileStore("my-bucket", { client: client as never });
      const result = await store.list("");

      assert.deepStrictEqual(result, ["a/domain.yml", "b/domain.yml"]);
    });

    it("passes prefix to ListObjectsV2 and returns matching keys", async () => {
      let capturedPrefix: string | undefined;
      const client = makeListS3Client(async (input) => {
        capturedPrefix = input.Prefix;
        return {
          Contents: [
            { Key: "domain-a/domain.yml" },
            { Key: "domain-a/norms.txt" },
          ],
          IsTruncated: false,
        };
      });
      const store = new S3FileStore("my-bucket", { client: client as never });
      const result = await store.list("domain-a/");

      assert.strictEqual(capturedPrefix, "domain-a/");
      assert.deepStrictEqual(result, [
        "domain-a/domain.yml",
        "domain-a/norms.txt",
      ]);
    });

    it("paginates using NextContinuationToken", async () => {
      let callCount = 0;
      const client = makeListS3Client(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            Contents: [{ Key: "a.yml" }],
            IsTruncated: true,
            NextContinuationToken: "token-1",
          };
        }
        return {
          Contents: [{ Key: "b.yml" }],
          IsTruncated: false,
        };
      });
      const store = new S3FileStore("my-bucket", { client: client as never });
      const result = await store.list();

      assert.strictEqual(callCount, 2);
      assert.deepStrictEqual(result, ["a.yml", "b.yml"]);
    });

    it("returns empty array when Contents is undefined", async () => {
      const client = makeListS3Client(async () => ({
        IsTruncated: false,
      }));
      const store = new S3FileStore("my-bucket", { client: client as never });
      const result = await store.list();

      assert.deepStrictEqual(result, []);
    });

    it("returns paths sorted lexicographically", async () => {
      const client = makeListS3Client(async () => ({
        Contents: [{ Key: "z.yml" }, { Key: "a.yml" }, { Key: "m.yml" }],
        IsTruncated: false,
      }));
      const store = new S3FileStore("my-bucket", { client: client as never });
      const result = await store.list();

      assert.deepStrictEqual(result, ["a.yml", "m.yml", "z.yml"]);
    });
  });
});
