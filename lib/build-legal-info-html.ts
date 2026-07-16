import { FoodProductFormValues } from "@/app/(dashboard)/products/new/food-product.schema";

export function buildLegalInfoHtml(
  legalInfo: FoodProductFormValues["legalInfo"],
): string {
  const rows: [string, string][] = [
    ["식품유형", legalInfo.foodType],
    ["원재료명 및 함량", legalInfo.ingredients],
    ["내용량", legalInfo.netWeight],
    ["소비기한", legalInfo.expiryDate],
    ["보관방법", legalInfo.storageMethod],
    ["제조사/소재지", legalInfo.manufacturer],
    ["소비자상담 전화번호", legalInfo.consumerServicePhone],
    [
      "알레르기 유발성분",
      legalInfo.allergens.length > 0
        ? legalInfo.allergens.join(", ")
        : "해당없음",
    ],
    ["유전자변형식품 해당여부", legalInfo.isGMO],
  ];

  if (legalInfo.nutritionRequired && legalInfo.nutrition) {
    const n = legalInfo.nutrition;
    rows.push([
      "영양성분",
      `열량 ${n.calories}kcal / 탄수화물 ${n.carbs}g / 단백질 ${n.protein}g / 지방 ${n.fat}g / 나트륨 ${n.sodium}mg`,
    ]);
  }

  if (legalInfo.isImported && legalInfo.importInfo) {
    const i = legalInfo.importInfo;
    rows.push([
      "수입식품 정보",
      `수입업소: ${i.importerName} / 제조업소: ${i.manufacturerName} / 수출국: ${i.exportCountry}`,
    ]);
  }

  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <th style="width:180px;background:#f8f9fa;padding:10px;border:1px solid #e2e2e2;text-align:left;font-size:13px;">${label}</th>
        <td style="padding:10px;border:1px solid #e2e2e2;font-size:13px;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  return `
    <div style="margin-top:32px;">
      <h3 style="font-size:15px;font-weight:bold;margin-bottom:10px;">식품 등의 표시·광고에 관한 법률에 따른 표시사항</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

// XSS 방지 — 입력값에 HTML 태그가 섞여 들어가지 않도록 이스케이프
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
