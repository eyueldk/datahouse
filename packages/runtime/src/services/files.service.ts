import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { filesBackend } from "../configs/files.config";
import { files } from "../schemas/files";

const { db } = dbBackend;

async function sha256Hex(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(buffer);
  return hasher.digest("hex");
}

function toBlob(content: File | Blob | Buffer, mimeType?: string): Blob {
  if (Buffer.isBuffer(content)) {
    return new Blob([content], {
      type: mimeType ?? "application/octet-stream",
    });
  }
  return content;
}

export async function uploadFile(params: {
  content: File | Blob | Buffer;
  name?: string;
  mimeType?: string;
}) {
  const blob = toBlob(params.content, params.mimeType);
  const key = nanoid();
  const checksum = await sha256Hex(blob);

  await filesBackend.write(key, blob, {
    mimeType: params.mimeType ?? "application/octet-stream",
  });

  const size = Buffer.isBuffer(params.content) ? params.content.byteLength : blob.size;

  const [record] = await db
    .insert(files)
    .values({
      key,
      name: params.name ?? key,
      mimeType: params.mimeType,
      size,
      checksum,
    })
    .returning();
  if (!record) {
    throw new Error("Failed to create file record");
  }
  return record;
}

export async function downloadFile(params: { id: string }) {
  const [record] = await db
    .select()
    .from(files)
    .where(eq(files.id, params.id))
    .limit(1);
  if (!record) {
    throw new Error(`File not found: ${params.id}`);
  }
  const content = await filesBackend.read(record.key);
  return { record, content };
}

export async function deleteFile(params: { id: string }) {
  const [deletedFile] = await db
    .delete(files)
    .where(eq(files.id, params.id))
    .returning();
  if (!deletedFile) {
    return;
  }
  await filesBackend.delete(deletedFile.key);
}
