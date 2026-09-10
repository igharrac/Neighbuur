"use client";

import { useRef, useState } from "react";
import { PaperPlaneRight, Image as ImageIcon, Spinner } from "@phosphor-icons/react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";

interface ChatInputProps {
  gesprekId: string;
  onSend: (payload: { tekst: string; fotoPath: string | null }) => Promise<boolean>;
}

export function ChatInput({ gesprekId, onSend }: ChatInputProps) {
  const [tekst, setTekst] = useState("");
  const [sending, setSending] = useState(false);
  const { upload, uploading } = useImageUpload({
    bucket: "chat-fotos",
    pathPrefix: `${gesprekId}/${crypto.randomUUID()}`,
    isPrivate: true,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSend() {
    const waarde = tekst.trim();
    if (!waarde || sending) return;
    setSending(true);
    const gelukt = await onSend({ tekst: waarde, fotoPath: null });
    if (gelukt) setTekst("");
    setSending(false);
  }

  async function handleFoto(file: File | undefined) {
    if (!file) return;
    const path = await upload(file);
    if (path) await onSend({ tekst: "", fotoPath: path });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-end gap-2 p-3 bg-white border-t border-lijn pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="min-w-11 min-h-11 flex items-center justify-center text-warmgrijs hover:text-warmzwart shrink-0"
        aria-label="Foto versturen"
      >
        {uploading ? <Spinner size={20} className="animate-spin" /> : <ImageIcon size={20} />}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFoto(e.target.files?.[0])}
      />
      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Typ een bericht..."
        rows={1}
        className="input flex-1 !py-2.5 resize-none max-h-32"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={sending || tekst.trim().length === 0}
        className="min-w-11 min-h-11 flex items-center justify-center bg-terracotta text-white rounded-sm disabled:opacity-40 disabled:pointer-events-none shrink-0"
        aria-label="Verstuur bericht"
      >
        <PaperPlaneRight size={18} weight="fill" />
      </button>
    </div>
  );
}
