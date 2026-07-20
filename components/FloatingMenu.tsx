"use client";

import { useState } from "react";
import { Plus, Smartphone, BookOpen, X } from "lucide-react";
import Link from "next/link";

const MenuItems = [
  { href: "/about", label: "서비스 가이드", icon: BookOpen },
  //   { href: "/download", label: "앱 다운로드", icon: Smartphone },
];

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
          {MenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-all group"
            >
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                {item.label}
              </span>
              <item.icon size={20} className="text-[#143617]" />
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#143617] text-white p-4 rounded-full shadow-xl hover:bg-[#14362a] transition-all"
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
