"use client";

import { ReactNode, useEffect } from "react";
import { X } from "@phosphor-icons/react";

type PanelWidth = "md" | "lg" | "xl";

const widthClass: Record<PanelWidth, string> = {
  md: "sm:w-[480px]",
  lg: "sm:w-[720px]",
  xl: "sm:w-[960px]",
};

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** md (480px, default) · lg (720px) · xl (960px) — altijd volle breedte op mobiel. */
  width?: PanelWidth;
  children: ReactNode;
}

/**
 * Zelfde gedrag als Modal (Escape sluit, achtergrond-klik sluit, body-scroll
 * op slot), maar schuift in vanaf rechts i.p.v. gecentreerd — voor
 * bewerkformulieren in een lijst, zodat de lijst zelf zichtbaar blijft en
 * het paneel altijd in beeld staat, ongeacht scrollpositie.
 */
export function SidePanel({ open, onClose, title, width = "md", children }: SidePanelProps) {
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
      className="fixed inset-0 z-[100] bg-warmzwart/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`fixed inset-y-0 right-0 w-full ${widthClass[width]} bg-white shadow-strong p-6 sm:p-8 overflow-y-auto animate-slide-in-right`}
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
