import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { photoId, reason } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await (await supabase).from("reports").insert({
    photo_id: photoId,
    reason: reason.trim(),
  });

  if (error) {
    console.error("Report insert error:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
