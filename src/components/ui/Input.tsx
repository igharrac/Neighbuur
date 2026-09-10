import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="text-body-sm font-semibold block mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? "!border-terracotta" : ""} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {hint && !error && <p className="text-body-xs text-warmgrijs mt-1">{hint}</p>}
        {error && <p className="text-body-xs text-terracotta mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="text-body-sm font-semibold block mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`input min-h-[120px] resize-y ${error ? "!border-terracotta" : ""} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {hint && !error && <p className="text-body-xs text-warmgrijs mt-1">{hint}</p>}
        {error && <p className="text-body-xs text-terracotta mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
