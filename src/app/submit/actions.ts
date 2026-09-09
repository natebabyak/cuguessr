"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { photo } from "@/lib/db/schema";
import type { Photo } from "./photo-schema";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export async function createPhoto(photoData: Photo) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const photoBuffer = await photoData.photo.arrayBuffer();
  const webpBuffer = await sharp(photoBuffer).webp().rotate().webp().toBuffer();
  const { height, width } = await sharp(webpBuffer).metadata();

  const photoObjectKey = crypto.randomUUID();

  await s3.send(
    new PutObjectCommand({
      Bucket: "cuguessr",
      Key: `photos/${photoObjectKey}.webp`,
      Body: webpBuffer,
      ContentType: "image/webp",
    }),
  );

  await db.insert(photo).values({
    userId: session.user.id,
    objectKey: photoObjectKey,
    height,
    width,
    latitude: photoData.latitude,
    longitude: photoData.longitude,
    status: "pending",
  });
}
