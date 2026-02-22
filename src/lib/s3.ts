import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadToS3(
  file: Buffer | Blob,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType
  });

  await s3Client.send(command);

  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
  return { url, key };
}

export async function getObjectUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  console.log(`[S3] Generating signed URL for key: ${key}`);
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  console.log(`[S3] Generated signed URL successfully`);
  return signedUrl;
}

export async function getObjectContent(key: string): Promise<string> {
  console.log(`[S3] Fetching content for key: ${key}`);
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    console.error(`[S3] Empty response for key: ${key}`);
    throw new Error('Empty response from S3');
  }

  const bodyString = await response.Body.transformToString();
  console.log(
    `[S3] Fetched content for key: ${key}, length: ${bodyString.length}`
  );
  return bodyString;
}

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  await s3Client.send(command);
}

export async function copyObjectInS3(
  sourceKey: string,
  destKey: string
): Promise<void> {
  const command = new CopyObjectCommand({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${sourceKey}`,
    Key: destKey
  });

  await s3Client.send(command);
}

export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return decodeURIComponent(urlObj.pathname.substring(1));
  } catch {
    return null;
  }
}

export function isS3Url(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('s3.') || url.startsWith('s3://');
}

export async function objectExists(key: string): Promise<boolean> {
  console.log(`[S3] Checking if object exists: ${key}`);
  try {
    const command = new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    await s3Client.send(command);
    console.log(`[S3] Object exists: ${key}`);
    return true;
  } catch (error: unknown) {
    const err = error as { name?: string };
    console.log(`[S3] Object does not exist: ${key}, error: ${err.name}`);
    if (err.name === 'NoSuchKey') return false;
    throw error;
  }
}
