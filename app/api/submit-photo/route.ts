import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE_MB = 10;
const MAX_WIDTH = 1920;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo") as File;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;

  if (!file || !latitude || !longitude)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP or HEIC." },
      { status: 400 },
    );

  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return NextResponse.json(
      { error: `File too large. Max size is ${MAX_SIZE_MB}MB.` },
      { status: 400 },
    );

  const buffer = Buffer.from(await file.arrayBuffer());

  const metadata = await sharp(buffer, { failOn: "error" })
    .metadata()
    .catch(() => null);

  if (!metadata?.width || !metadata?.height)
    return NextResponse.json({ error: "Invalid image file." }, { status: 400 });

  const pipeline = sharp(buffer).rotate();

  if (metadata.width > MAX_WIDTH) {
    pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  const webpBuffer = await pipeline.webp({ quality: 82 }).toBuffer();

  const uuid = crypto.randomUUID();
  const key = `${uuid}.webp`;

  const putCommand = new PutObjectCommand({
    Bucket: "cuguessr-images",
    Key: key,
    Body: webpBuffer,
    ContentType: "image/webp",
  });

  try {
    await r2.send(putCommand);
  } catch (err) {
    const message = err instanceof Error ? err.message : "R2 upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("photos").insert([
    {
      image_path: key,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    },
  ]);

  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ success: true, key });
}
