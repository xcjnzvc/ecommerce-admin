"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Section({
  title,
  children,
  collapsible = false,
  isOpen = true,
  onToggle,
}: SectionProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div
        className={`flex justify-between items-center ${collapsible ? "cursor-pointer" : ""}`}
        onClick={onToggle}
      >
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {collapsible &&
          (isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
      </div>
      {(!collapsible || isOpen) && (
        <div className="mt-4 space-y-4">{children}</div>
      )}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function FormInputStyles() {
  return (
    <style jsx global>{`
      .input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 0.5rem;
        outline: none;
        width: 100%;
      }
      .input:focus {
        box-shadow: 0 0 0 2px #6366f1;
      }
    `}</style>
  );
}
