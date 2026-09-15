import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

/**
 * Uploads a file to S3 and returns its public URL.
 * Objects are stored under `webcam/<username>-<uuid>` and the bucket is expected
 * to allow public reads on that prefix (see README).
 */
export const uploadImage = async (file: File, username: string) => {
  if (!bucket) throw new Error("AWS_BUCKET_NAME is not set");

  const key = `webcam/${username}-${crypto.randomUUID()}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }),
  );

  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
