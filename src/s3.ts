import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import { FileNotFoundError } from "@commonkads/engine";
import type { FileContent, IStorageBackend } from "@commonkads/engine";

export interface S3FileStoreOptions {
  region?: string;
  /** Injectable for testing; defaults to a real `S3Client`. */
  client?: S3Client;
}

/** `IStorageBackend` backed by Amazon S3. */
export class S3FileStore implements IStorageBackend {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    options: S3FileStoreOptions = {},
  ) {
    this.client = options.client ?? new S3Client({ region: options.region });
  }

  async read(path: string): Promise<string> {
    return (await this.readObject(path)).content;
  }

  async readWithVersion(path: string): Promise<FileContent> {
    return this.readObject(path);
  }

  async list(prefix: string = ""): Promise<string[]> {
    const paths: string[] = [];
    let continuationToken: string | undefined;
    do {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );
      for (const obj of response.Contents ?? []) {
        if (obj.Key !== undefined) {
          paths.push(obj.Key);
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken !== undefined);
    return paths.sort();
  }

  private async readObject(path: string): Promise<FileContent> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: path }),
      );
      const content = (await response.Body?.transformToString("utf-8")) ?? "";
      return { content, version: response.VersionId ?? "unversioned" };
    } catch (error) {
      if (isMissingObject(error)) {
        throw new FileNotFoundError(path);
      }
      throw error;
    }
  }
}

function isMissingObject(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const name = (error as { name?: string }).name;
  return name === "NoSuchKey" || name === "NotFound";
}
