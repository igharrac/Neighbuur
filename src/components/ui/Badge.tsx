import { HTMLAttributes } from "react";

type Color = "terracotta" | "groen" | "blauw" | "lavendel" | "oker";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
}

const colorClass: Record<Color, string> = {
  terracotta: "badge-terracotta",
  groen: "badge-groen",
  blauw: "badge-blauw",
  lavendel: "badge-lavendel",
  oker: "bg-oker-light text-oker",
};

export function Badge({ color = "terracotta", className = "", ...props }: BadgeProps) {
  return <span className={`badge ${colorClass[color]} ${className}`} {...props} />;
}
