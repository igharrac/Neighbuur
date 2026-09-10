import { clsx, type ClassValue } from "clsx";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format date as "22 mei 2026" */
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format date as "di 26 mei" */
export function formatDateShort(date: Date | string) {
  return new Date(date).toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Relative time: "3 weken geleden" */
export function timeAgo(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60)      return "zojuist";
  if (diff < 3600)    return `${Math.floor(diff / 60)} min geleden`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)} uur geleden`;
  if (diff < 604800)  return `${Math.floor(diff / 86400)} dagen geleden`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weken geleden`;
  return formatDate(d);
}

/** WhatsApp share URL */
export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Genereert een 8-karakter alfanumerieke uitnodigingscode */
export function generateUitnodigingscode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Slugify: lowercase, spaties/leestekens naar dashes */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
