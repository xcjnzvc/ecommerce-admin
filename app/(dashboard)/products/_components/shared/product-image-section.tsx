"use client";

import type { ChangeEvent } from "react";
import { Upload } from "lucide-react";

interface ProductImageSectionProps {
  mainImagePreview: string | null;
  detailImagePreviews: string[];
  onMainImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDetailImagesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveDetailImage: (index: number, isExisting: boolean) => void;
}

export function ProductImageSection({
  mainImagePreview,
  detailImagePreviews,
  onMainImageChange,
  onDetailImagesChange,
  onRemoveDetailImage,
}: ProductImageSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-500">
          대표 이미지 (1장)
        </label>
        <label className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-all h-40 relative overflow-hidden">
          {mainImagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImagePreview}
              alt="Main Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <Upload size={24} />
              <span className="text-xs mt-2 font-medium">
                클릭하여 대표 이미지 업로드
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onMainImageChange}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-500">
          상세 이미지 (여러 장 가능)
        </label>
        <div className="flex gap-2 items-center overflow-x-auto h-40 border-2 border-dashed rounded-xl p-4">
          <label className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 shrink-0">
            <Upload size={18} />
            <span className="text-[10px] mt-1">추가</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onDetailImagesChange}
            />
          </label>

          {detailImagePreviews.map((url, idx) => {
            const isExisting = url.startsWith("http");
            return (
              <div
                key={url}
                className="w-24 h-24 rounded-lg overflow-hidden relative shrink-0 border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Detail ${idx}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveDetailImage(idx, isExisting)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
