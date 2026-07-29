"use client";

export interface PillTabOption<T extends string = string> {
  label: string;
  value: T;
}

interface PillTabsProps<T extends string = string> {
  options: ReadonlyArray<PillTabOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function PillTabs<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
}: PillTabsProps<T>) {
  return (
    <div
      className={`bg-gray-100 p-1 rounded-full flex text-[12px] font-medium text-gray-500 ${className}`}
    >
      {options.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`px-4 py-1.5 rounded-full ${
            tab.value === value ? "bg-white shadow-sm text-gray-900" : ""
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
