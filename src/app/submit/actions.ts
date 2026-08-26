"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import * as v from "valibot";
import { db } from "@/lib/db";
import { photo as photosTable } from "@/lib/db/schema";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export const PhotoSchema = v.object({
  photo: v.file(),
  coordinates: v.object({
    latitude: v.number(),
    longitude: v.number(),
  }),
});

export async function submitPhoto(
  photoData: v.InferOutput<typeof PhotoSchema>,
  userId?: string,
) {
  const result = v.safeParse(PhotoSchema, photoData);

  if (!result.success) {
    return { message: "Failed to submit photo" };
  }

  const { photo, coordinates } = result.output;

  const buffer = await photo.arrayBuffer();

  const webpBuffer = await sharp(buffer)
    .rotate()
    .webp({ quality: 80 })
    .toBuffer();

  const photoId = crypto.randomUUID();
  const photoObjectKey = `photos/${photoId}.webp`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: "cuguessr",
      Key: photoObjectKey,
      Body: webpBuffer,
      ContentType: "image/webp",
    }),
  );

  await db.insert(photosTable).values({
    id: photoId,
    userId,
    objectKey: photoObjectKey,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });
}
