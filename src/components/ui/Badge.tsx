import { HTMLAttributes } from "react";

type Color = "sage" | "groen" | "blauw" | "lavendel" | "oker";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
}

const colorClass: Record<Color, string> = {
  sage: "badge-sage",
  groen: "badge-groen",
  blauw: "badge-blauw",
  lavendel: "badge-lavendel",
  oker: "bg-oker-light text-oker",
};

export function Badge({ color = "sage", className = "", ...props }: BadgeProps) {
  return <span className={`badge ${colorClass[color]} ${className}`} {...props} />;
}
