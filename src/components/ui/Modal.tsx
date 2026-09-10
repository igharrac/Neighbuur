"use client";

import { ReactNode, useEffect } from "react";
import { X } from "@phosphor-icons/react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-warmzwart/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-white rounded shadow-strong p-8 relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Sluiten"
          className="absolute top-2 right-2 min-w-11 min-h-11 flex items-center justify-center text-warmgrijs hover:text-warmzwart transition-colors"
        >
          <X size={20} />
        </button>
        {title && <h2 className="font-display text-display-sm mb-4 pr-10">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
