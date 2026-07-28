import * as XLSX from "xlsx";

type CellValue = string | number | boolean | null | undefined;

/**
 * 객체 배열을 .xlsx로 변환해 브라우저에서 다운로드합니다.
 * 키 순서가 곧 컬럼 순서가 됩니다.
 */
export function downloadXlsx(
  rows: Record<string, CellValue>[],
  filename: string,
  sheetName = "목록",
): void {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}]);

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  if (headers.length > 0) {
    sheet["!cols"] = headers.map((header) => {
      const maxContentLen = rows.reduce((max, row) => {
        const cell = row[header];
        const len = cell == null ? 0 : String(cell).length;
        return Math.max(max, len);
      }, header.length);
      return { wch: Math.min(Math.max(maxContentLen + 2, 10), 40) };
    });
  }

  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** 파일명용 타임스탬프 (예: 20260729_0022) */
export function exportTimestamp(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}${m}${d}_${hh}${mm}`;
}
