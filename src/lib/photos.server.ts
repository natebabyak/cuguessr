import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { db } from "./db";
import { photo as photosTable } from "./db/schema";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export async function createPhotoServer(
  photo: File,
  latitude: number,
  longitude: number,
  userId: string,
) {
  const buffer = await photo.arrayBuffer();
  const webpBuffer = await sharp(Buffer.from(buffer))
    .rotate()
    .webp({ quality: 80 })
    .toBuffer();
  const { height, width } = await sharp(webpBuffer).metadata();
  const photoId = crypto.randomUUID();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: "cuguessr",
      Key: `photos/${photoId}.webp`,
      Body: webpBuffer,
      ContentType: "image/webp",
    }),
  );

  await db.insert(photosTable).values({
    id: photoId,
    userId,
    objectKey: `photos/${photoId}.webp`,
    height,
    width,
    latitude,
    longitude,
    status: "pending",
  });
}
