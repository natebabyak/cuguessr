import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

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

  // Verify it's actually a valid image
  const metadata = await sharp(buffer)
    .metadata()
    .catch(() => null);
  if (!metadata?.width || !metadata?.height)
    return NextResponse.json({ error: "Invalid image file." }, { status: 400 });

  const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

  const supabase = createClient();
  const uuid = crypto.randomUUID();

  const { data: storageData, error: storageError } = await (
    await supabase
  ).storage
    .from("photos")
    .upload(`${uuid}.webp`, webpBuffer, { contentType: "image/webp" });

  if (storageError)
    return NextResponse.json({ error: storageError.message }, { status: 500 });

  const { error: insertError } = await (await supabase).from("photos").insert([
    {
      image_path: storageData.path,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    },
  ]);

  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
