"use client";

interface FilterPanelFooterProps {
  onReset: () => void;
  onApply: () => void;
}

export default function FilterPanelFooter({
  onReset,
  onApply,
}: FilterPanelFooterProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
      <button
        type="button"
        onClick={onReset}
        className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
      >
        초기화
      </button>
      <button
        type="button"
        onClick={onApply}
        className="px-4 py-2 bg-[#143617] hover:bg-[#0d240f] text-white text-xs font-bold rounded-xl transition-colors"
      >
        적용
      </button>
    </div>
  );
}
