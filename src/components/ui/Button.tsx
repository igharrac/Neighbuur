import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "dark" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  dark: "btn-dark",
  ghost: "btn-ghost",
};

const sizeClass: Record<Size, string> = {
  sm: "!px-4 !py-2 !text-body-sm",
  md: "",
  lg: "!px-9 !py-4 !text-body-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${variantClass[variant]} ${sizeClass[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
