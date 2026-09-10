import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "flat";
}

export function Card({ variant = "elevated", className = "", ...props }: CardProps) {
  return (
    <div
      className={`${variant === "elevated" ? "card" : "card-flat"} ${className}`}
      {...props}
    />
  );
}
