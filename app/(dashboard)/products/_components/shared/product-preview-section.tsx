"use client";

import { Section } from "./form-ui";

interface ProductPreviewSectionProps {
  previewTab: "shopify" | "cafe24";
  onPreviewTabChange: (tab: "shopify" | "cafe24") => void;
  previewPayload: unknown;
}

export function ProductPreviewSection({
  previewTab,
  onPreviewTabChange,
  previewPayload,
}: ProductPreviewSectionProps) {
  return (
    <Section title="5. 미리보기">
      <div className="flex gap-2 border-b mb-4">
        <button
          type="button"
          onClick={() => onPreviewTabChange("shopify")}
          className={`px-4 py-2 text-sm ${
            previewTab === "shopify"
              ? "border-b-2 border-indigo-600 font-semibold text-indigo-600"
              : "text-slate-500"
          }`}
        >
          Shopify 미리보기
        </button>
        <button
          type="button"
          onClick={() => onPreviewTabChange("cafe24")}
          className={`px-4 py-2 text-sm ${
            previewTab === "cafe24"
              ? "border-b-2 border-indigo-600 font-semibold text-indigo-600"
              : "text-slate-500"
          }`}
        >
          카페24 미리보기
        </button>
      </div>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto max-h-80">
        {JSON.stringify(previewPayload, null, 2)}
      </pre>
    </Section>
  );
}
