import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import exifr from "exifr";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "../constants";
import { db } from "../db";
import { photo as photosTable } from "../db/schema";
import { calculateDistance } from "../scoring";

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
  const distanceFromCampus = calculateDistance({
    a: { latitude, longitude },
    b: {
      latitude: DEFAULT_LATITUDE,
      longitude: DEFAULT_LONGITUDE,
    },
  });

  if (distanceFromCampus > 2_000) {
    throw new Error("Photo location must be within 2 km of campus");
  }

  const { fliph, flipv, PhotonImage, rotate } =
    await import("@cf-wasm/photon/workerd");

  const arrayBuffer = await photo.arrayBuffer();

  // Photon has no built-in EXIF auto-orient, so read the orientation
  // tag and translate it into Photon transformations.
  const exifOrientation = await exifr
    .orientation(arrayBuffer)
    .catch(() => undefined);

  let image = PhotonImage.new_from_byteslice(new Uint8Array(arrayBuffer));

  switch (exifOrientation) {
    case 2:
      fliph(image);
      break;

    case 3: {
      const rotated = rotate(image, 180);
      image.free();
      image = rotated;
      break;
    }

    case 4:
      flipv(image);
      break;

    case 5: {
      fliph(image);
      const rotated = rotate(image, 90);
      image.free();
      image = rotated;
      break;
    }

    case 6: {
      const rotated = rotate(image, 90);
      image.free();
      image = rotated;
      break;
    }

    case 7: {
      fliph(image);
      const rotated = rotate(image, 270);
      image.free();
      image = rotated;
      break;
    }

    case 8: {
      const rotated = rotate(image, 270);
      image.free();
      image = rotated;
      break;
    }
  }

  const webpBytes = image.get_bytes_webp();
  const width = image.get_width();
  const height = image.get_height();

  image.free();

  const photoId = crypto.randomUUID();
  const objectKey = `photos/${photoId}.webp`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: "cuguessr",
      Key: objectKey,
      Body: webpBytes,
      ContentType: "image/webp",
    }),
  );

  await db.insert(photosTable).values({
    userId,
    objectKey,
    height,
    width,
    latitude,
    longitude,
    status: "pending",
  });
}
