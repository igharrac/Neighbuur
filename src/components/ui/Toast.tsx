"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CheckCircle, WarningCircle, Info } from "@phosphor-icons/react";

type ToastVariant = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icon: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle size={18} weight="fill" className="text-groen" />,
  error: <WarningCircle size={18} weight="fill" className="text-terracotta" />,
  info: <Info size={18} weight="fill" className="text-blauw" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2.5 bg-warmzwart text-white px-5 py-3 rounded-full shadow-strong text-body-sm font-medium animate-fade-in"
          >
            {icon[t.variant]}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast moet binnen ToastProvider gebruikt worden");
  return ctx;
}
