"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface UploadOptions {
  bucket: string;
  pathPrefix: string;
  maxSizeMB?: number;
  accept?: string[];
  /** Private buckets hebben geen publieke URL — retourneert het storage-pad in plaats daarvan. */
  isPrivate?: boolean;
}

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function useImageUpload({
  bucket,
  pathPrefix,
  maxSizeMB = 5,
  accept = DEFAULT_ACCEPT,
  isPrivate = false,
}: UploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(file: File): string | null {
    if (!accept.includes(file.type)) {
      return "Alleen JPEG, PNG of WebP toegestaan.";
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Bestand is te groot (max ${maxSizeMB}MB).`;
    }
    return null;
  }

  async function upload(file: File): Promise<string | null> {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${pathPrefix}.${ext}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    setUploading(false);

    if (uploadError) {
      setError(uploadError.message);
      return null;
    }

    if (isPrivate) return path;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  return { upload, uploading, error, setError };
}
