/* eslint-disable @next/next/no-img-element */
type Size = "sm" | "md" | "lg";

interface AvatarProps {
  naam: string;
  src?: string | null;
  size?: Size;
  className?: string;
}

const sizeClass: Record<Size, string> = {
  sm: "w-7 h-7 text-body-xs",
  md: "w-10 h-10 text-body",
  lg: "w-16 h-16 text-display-sm",
};

const colors = ["bg-terracotta", "bg-groen", "bg-blauw", "bg-lavendel", "bg-oker"];

function colorForNaam(naam: string) {
  const code = naam.charCodeAt(0) || 0;
  return colors[code % colors.length];
}

export function Avatar({ naam, src, size = "md", className = "" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={naam}
        className={`${sizeClass[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass[size]} ${colorForNaam(naam)} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
    >
      {naam.charAt(0).toUpperCase()}
    </span>
  );
}
