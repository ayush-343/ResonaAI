import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function storageConfigured() {
  return ["R2_ACCOUNT_ID", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"].every(key => Boolean(process.env[key]));
}
let client: S3Client | null = null;
function storage() {
  if (!storageConfigured()) throw new Error("Cloud audio storage is not configured.");
  return client ??= new S3Client({
    region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
}
export async function uploadAudio(key: string, body: Uint8Array) {
  await storage().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key, Body: body, ContentType: "audio/wav" }));
}
export async function deleteAudio(key: string) {
  await storage().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }));
}
export async function audioURL(key: string) {
  return getSignedUrl(storage(), new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }), { expiresIn: 300 });
}
