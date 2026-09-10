"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react";

export function isValidKvK(kvk: string): boolean {
  return /^\d{8}$/.test(kvk.replace(/\s/g, ""));
}

interface KvkInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function KvkInput({ value, onChange, label = "KvK-nummer" }: KvkInputProps) {
  const touched = value.length > 0;
  const valid = isValidKvK(value);

  return (
    <div className="w-full">
      <label className="text-body-sm font-semibold block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          maxLength={9}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ""))}
          placeholder="12345678"
          className={`input pr-11 ${
            touched ? (valid ? "!border-groen" : "!border-terracotta") : ""
          }`}
        />
        {touched && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {valid ? (
              <CheckCircle size={20} weight="fill" className="text-groen" />
            ) : (
              <WarningCircle size={20} weight="fill" className="text-terracotta" />
            )}
          </span>
        )}
      </div>
      {touched && !valid && (
        <p className="text-body-xs text-terracotta mt-1">Vul exact 8 cijfers in, zonder letters.</p>
      )}
    </div>
  );
}
