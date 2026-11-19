import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { sql } from "drizzle-orm";
import sharp from "sharp";

import { db } from "#/db/index";
import { photo } from "#/db/schema";

import type { CreatePhotoInput } from "./photo-schema";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Photo uploads aren’t configured. Missing Cloudflare R2 credentials.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function createPhoto(input: CreatePhotoInput, userId: string) {
  const s3 = getR2Client();
  const photoBuffer = Buffer.from(await input.photo.arrayBuffer());
  const webpBuffer = await sharp(photoBuffer).webp().rotate().webp().toBuffer();
  const { height, width } = await sharp(webpBuffer).metadata();

  if (!height || !width) {
    throw new Error("Couldn’t process that image. Try a different photo.");
  }

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
    userId,
    objectKey: photoObjectKey,
    height,
    width,
    latitude: input.latitude,
    longitude: input.longitude,
    status: "pending",
  });
}

export async function getGamePhotos() {
  return await db.query.photo.findMany({
    columns: {
      id: true,
    },
    where: {
      status: "approved",
    },
    orderBy: () => sql`RANDOM()`,
    limit: 5,
  });
}

export async function getHomePhotos() {
  return await db.query.photo.findMany({
    columns: {
      objectKey: true,
      rotation: true,
    },
    where: {
      status: "approved",
    },
    orderBy: {
      createdAt: "desc",
    },
    limit: 10,
  });
}
