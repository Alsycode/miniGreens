"use client";

import { useState, type InputHTMLAttributes } from "react";

const inputClass =
  "w-full rounded-lg border border-brand-border bg-white px-3 py-2 pr-16 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary";

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative mt-1">
      <input {...props} type={visible ? "text" : "password"} className={inputClass} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-brand-primary hover:underline"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
