"use client";

import { MoreHorizontal } from "lucide-react";

export type TableActionMenuItem = {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "primary";
};

export interface TableActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  items: TableActionMenuItem[];
  menuWidth?: string;
  iconSize?: number;
  triggerClassName?: string;
}

const ITEM_VARIANT_CLASSES: Record<
  NonNullable<TableActionMenuItem["variant"]>,
  string
> = {
  default: "text-gray-700 hover:bg-gray-50 hover:text-[#143617]",
  danger: "text-red-600 hover:bg-red-50",
  primary: "text-indigo-600 hover:bg-indigo-50",
};

export default function TableActionMenu({
  isOpen,
  onToggle,
  onClose,
  items,
  menuWidth = "w-32",
  iconSize = 18,
  triggerClassName = "p-2 hover:bg-gray-100 rounded-full transition-all text-[#5e6e82] hover:text-[#143617]",
}: TableActionMenuProps) {
  return (
    <div className="relative inline-block text-left">
      <button onClick={onToggle} className={triggerClassName}>
        <MoreHorizontal size={iconSize} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-1 ${menuWidth} bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-20`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onClose();
                item.onClick();
              }}
              className={`w-full px-4 py-2 text-xs font-semibold ${ITEM_VARIANT_CLASSES[item.variant ?? "default"]}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
