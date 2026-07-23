import { buildLegalInfoHtml } from "@/lib/build-legal-info-html";
import type { FoodProductFormValues } from "../food-product.schema";

type LegalInfo = FoodProductFormValues["legalInfo"];

/**
 * 상세설명에서 기존 법정고시 HTML을 분리하고,
 * 최신 legalInfo 기준으로 다시 합성한 fullDescription을 반환.
 */
export function buildFullDescription(
  description: string | undefined,
  legalInfo: LegalInfo,
): string {
  const raw = description ?? "";
  const splitIndex = raw.indexOf("식품 등의 표시·광고에 관한 법률");
  const cleanDescription =
    splitIndex !== -1 ? raw.substring(0, splitIndex).trim() : raw.trim();

  return (
    cleanDescription +
    buildLegalInfoHtml({
      ...legalInfo,
      allergens: legalInfo.allergens ?? [],
      isGMO: legalInfo.isGMO ?? "해당없음",
      nutritionRequired: legalInfo.nutritionRequired ?? false,
      isImported: legalInfo.isImported ?? false,
      nutrition: legalInfo.nutrition
        ? {
            calories: Number(legalInfo.nutrition.calories ?? 0),
            carbs: Number(legalInfo.nutrition.carbs ?? 0),
            protein: Number(legalInfo.nutrition.protein ?? 0),
            fat: Number(legalInfo.nutrition.fat ?? 0),
            sodium: Number(legalInfo.nutrition.sodium ?? 0),
          }
        : undefined,
    })
  );
}
