"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Download,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  downloadProductTemplate,
  parseProductExcel,
  type BulkParseError,
  type ParsedBulkProduct,
} from "@/lib/products/excel";
import { createProduct } from "@/lib/products/create-product";

type BulkUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (successCount: number) => void;
};

type UploadPhase = "idle" | "preview" | "uploading" | "done";

type RowResult = {
  rowIndex: number;
  name: string;
  ok: boolean;
  message?: string;
};

export default function BulkUploadModal({
  open,
  onClose,
  onComplete,
}: BulkUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [products, setProducts] = useState<ParsedBulkProduct[]>([]);
  const [parseErrors, setParseErrors] = useState<BulkParseError[]>([]);
  const [progress, setProgress] = useState(0);
  const [rowResults, setRowResults] = useState<RowResult[]>([]);

  if (!open) return null;

  const reset = () => {
    setPhase("idle");
    setFileName(null);
    setProducts([]);
    setParseErrors([]);
    setProgress(0);
    setRowResults([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (phase === "uploading") return;
    reset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const result = parseProductExcel(buffer);
      setProducts(result.products);
      setParseErrors(result.errors);
      setPhase("preview");
    } catch (error) {
      setProducts([]);
      setParseErrors([
        {
          rowIndex: 0,
          message:
            error instanceof Error
              ? error.message
              : "엑셀 파일을 읽지 못했습니다.",
        },
      ]);
      setPhase("preview");
    }
  };

  const handleUpload = async () => {
    if (products.length === 0) return;

    setPhase("uploading");
    setProgress(0);
    const results: RowResult[] = [];

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      try {
        // #region agent log
        fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'69fb1b'},body:JSON.stringify({sessionId:'69fb1b',location:'BulkUploadModal.tsx:handleUpload',message:'before createProduct call',data:{rowIndex:item.rowIndex,name:item.values.name,itemImages:item.images,valuesImages:item.values.images??[]},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        await createProduct(item.values, item.images, item.values.status);
        results.push({
          rowIndex: item.rowIndex,
          name: item.values.name,
          ok: true,
        });
      } catch (error) {
        results.push({
          rowIndex: item.rowIndex,
          name: item.values.name,
          ok: false,
          message:
            error instanceof Error ? error.message : "등록 중 오류가 발생했습니다.",
        });
      }
      setProgress(i + 1);
      setRowResults([...results]);
    }

    setPhase("done");
    const successCount = results.filter((r) => r.ok).length;
    if (successCount > 0) {
      onComplete(successCount);
    }
  };

  const successCount = rowResults.filter((r) => r.ok).length;
  const failCount = rowResults.filter((r) => !r.ok).length;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-[#143617]" />
              엑셀 파일로 상품 등록
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              템플릿에 맞춰 작성한 엑셀을 올리면 여러 상품을 한 번에 등록합니다.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={phase === "uploading"}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {/* 템플릿 다운로드 */}
          <button
            type="button"
            onClick={() => downloadProductTemplate()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f8f9fa] border border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Download size={15} className="text-gray-500" />
            등록용 템플릿 다운로드
          </button>

          {/* 파일 선택 */}
          {phase !== "uploading" && phase !== "done" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 bg-white border-2 border-dashed border-[#143617]/30 rounded-xl text-sm font-semibold text-[#143617] hover:bg-[#143617]/5 transition-colors"
              >
                <Upload size={22} />
                {fileName ? (
                  <span className="text-xs text-gray-600 font-medium">
                    {fileName} · 다시 선택
                  </span>
                ) : (
                  <span>.xlsx 파일 선택</span>
                )}
              </button>
            </div>
          )}

          {/* 미리보기 */}
          {phase === "preview" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                  <CheckCircle2 size={13} />
                  유효 {products.length}건
                </span>
                {parseErrors.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold">
                    <AlertCircle size={13} />
                    오류 {parseErrors.length}건
                  </span>
                )}
              </div>

              {products.length > 0 && (
                <ul className="max-h-36 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50 text-xs">
                  {products.map((p) => (
                    <li
                      key={`${p.rowIndex}-${p.values.name}`}
                      className="px-3 py-2.5 flex justify-between gap-2"
                    >
                      <span className="font-semibold text-gray-800 truncate">
                        {p.values.name}
                      </span>
                      <span className="text-gray-400 shrink-0">
                        {p.values.price.toLocaleString()}원 · 재고{" "}
                        {p.values.stock}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {parseErrors.length > 0 && (
                <ul className="max-h-28 overflow-y-auto rounded-xl border border-red-100 bg-red-50/50 divide-y divide-red-100 text-xs">
                  {parseErrors.map((err) => (
                    <li key={err.rowIndex} className="px-3 py-2 text-red-700">
                      <span className="font-bold">{err.rowIndex}행</span>:{" "}
                      {err.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 업로드 진행 */}
          {(phase === "uploading" || phase === "done") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  {phase === "uploading" && (
                    <Loader2 size={14} className="animate-spin text-[#143617]" />
                  )}
                  {phase === "uploading"
                    ? `등록 중... (${progress}/${products.length})`
                    : `완료 · 성공 ${successCount} / 실패 ${failCount}`}
                </span>
                <span>
                  {products.length > 0
                    ? Math.round((progress / products.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#143617] transition-all duration-300"
                  style={{
                    width: `${
                      products.length > 0
                        ? (progress / products.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {rowResults.length > 0 && (
                <ul className="max-h-40 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50 text-xs">
                  {rowResults.map((r) => (
                    <li
                      key={`${r.rowIndex}-${r.name}`}
                      className="px-3 py-2 flex items-start gap-2"
                    >
                      {r.ok ? (
                        <CheckCircle2
                          size={13}
                          className="text-emerald-600 mt-0.5 shrink-0"
                        />
                      ) : (
                        <AlertCircle
                          size={13}
                          className="text-red-500 mt-0.5 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {r.rowIndex}행 · {r.name}
                        </p>
                        {!r.ok && r.message && (
                          <p className="text-red-600 mt-0.5">{r.message}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
          {phase === "done" ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#143617] hover:bg-[#0d240f] rounded-xl text-xs font-bold text-white transition-colors"
            >
              닫기
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                disabled={phase === "uploading"}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={phase !== "preview" || products.length === 0}
                className="px-4 py-2 bg-[#143617] hover:bg-[#0d240f] rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {products.length > 0
                  ? `${products.length}개 상품 등록`
                  : "상품 등록"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
