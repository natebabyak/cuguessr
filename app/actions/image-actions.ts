"use server";

import sharp from "sharp";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

const R2_URL = "https://pub-27971f31521f454098a11afbc3ec23b6.r2.dev";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function rotateImageAction(imageUrl: string, degrees: number) {
  try {
    const key = imageUrl.replace(`${R2_URL}/`, "").split("?")[0];

    const getCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    const item = await s3.send(getCommand);
    const buffer = Buffer.from(await item.Body!.transformToByteArray());

    const rotatedBuffer = await sharp(buffer).rotate(degrees).toBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: rotatedBuffer,
        ContentType: "image/webp",
      }),
    );

    revalidatePath("/admin");

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}
