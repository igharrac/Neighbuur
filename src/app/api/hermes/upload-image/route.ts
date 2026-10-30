import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { verifyHermesAuth } from "@/lib/hermes-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Enige manier waarop Hermes een afbeelding bij Neighbuur krijgt — base64
 * in een JSON-body, geen multipart. Belandt in de bestaande blog-images-
 * bucket (migratie 0067), onder een eigen hermes/-prefix zodat door
 * Hermes aangeleverde bestanden herkenbaar blijven van handmatige uploads.
 */
export async function POST(request: Request) {
  const authError = verifyHermesAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const contentType = String(body.content_type ?? "");
  const contentBase64 = String(body.content_base64 ?? "");

  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return NextResponse.json({ error: "content_type moet image/jpeg, image/png of image/webp zijn" }, { status: 400 });
  }
  if (!contentBase64) {
    return NextResponse.json({ error: "content_base64 is verplicht" }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(contentBase64, "base64");
  } catch {
    return NextResponse.json({ error: "content_base64 kon niet gedecodeerd worden" }, { status: 400 });
  }

  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: `afbeelding moet tussen 1 byte en ${MAX_BYTES / (1024 * 1024)}MB zijn` }, { status: 400 });
  }

  const path = `hermes/${randomUUID()}.${ext}`;
  const admin = createAdminSupabase();

  const { error: uploadError } = await admin.storage
    .from("blog-images")
    .upload(path, buffer, { contentType, upsert: false, cacheControl: "3600" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = admin.storage.from("blog-images").getPublicUrl(path);

  return NextResponse.json({ ok: true, url: data.publicUrl, path }, { status: 201 });
}
