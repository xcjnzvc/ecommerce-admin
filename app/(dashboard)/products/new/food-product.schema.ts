import { buildLegalInfoHtml } from "@/lib/build-legal-info-html";
import { z } from "zod";

// ────────────────────────────────────────────────
// 공통 하위 스키마
// ────────────────────────────────────────────────

const optionSchema = z.object({
  name: z.string().min(1, "옵션명을 입력하세요"),
  value: z.string().min(1, "옵션값을 입력하세요"),
  extraPrice: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().min(0, "재고는 0 이상이어야 합니다"),
});

const nutritionSchema = z.object({
  calories: z.coerce.number().min(0, "열량을 입력하세요"),
  carbs: z.coerce.number().min(0, "탄수화물을 입력하세요"),
  protein: z.coerce.number().min(0, "단백질을 입력하세요"),
  fat: z.coerce.number().min(0, "지방을 입력하세요"),
  sodium: z.coerce.number().min(0, "나트륨을 입력하세요"),
});

const importInfoSchema = z.object({
  importerName: z.string().min(1, "수입업소명을 입력하세요"),
  manufacturerName: z.string().min(1, "제조업소명을 입력하세요"),
  exportCountry: z.string().min(1, "수출국명을 입력하세요"),
});

export const ALLERGEN_OPTIONS = [
  "난류",
  "우유",
  "메밀",
  "땅콩",
  "대두",
  "밀",
  "고등어",
  "게",
  "새우",
  "돼지고기",
  "복숭아",
  "토마토",
  "아황산류",
  "호두",
  "닭고기",
  "쇠고기",
  "오징어",
  "조개류(굴/전복/홍합 포함)",
] as const;

// ────────────────────────────────────────────────
// 3. 식품 법정 고시정보
// ────────────────────────────────────────────────

const foodLegalInfoSchema = z.object({
  foodType: z.string().min(1, "식품유형을 입력하세요"),
  ingredients: z.string().min(1, "원재료명 및 함량을 입력하세요"),
  netWeight: z.string().min(1, "내용량을 입력하세요"),
  expiryDate: z.string().min(1, "소비기한을 입력하세요"),
  storageMethod: z.string().min(1, "보관방법을 입력하세요"),
  manufacturer: z.string().min(1, "제조사/소재지를 입력하세요"),
  consumerServicePhone: z.string().min(1, "소비자상담 전화번호를 입력하세요"),

  allergens: z.array(z.string()).default([]),
  isGMO: z.enum(["해당없음", "유전자재조합식품"]).default("해당없음"),

  nutritionRequired: z.boolean().default(false),
  nutrition: nutritionSchema.optional(),

  isImported: z.boolean().default(false),
  importInfo: importInfoSchema.optional(),
});

// ────────────────────────────────────────────────
// 4. 채널별 정보
// ────────────────────────────────────────────────

const shopifyDataSchema = z.object({
  productType: z.string().min(1, "상품 유형(Product type)을 입력하세요"),
  vendor: z.string().min(1, "판매자/브랜드명(Vendor)을 입력하세요"),
  tags: z.string().optional().default(""), // 콤마로 구분된 태그
  publishStatus: z.enum(["active", "draft"]).default("draft"),
});

const cafe24DataSchema = z.object({
  displayStatus: z.enum(["진열함", "진열안함"]).default("진열함"),
  sellingStatus: z.enum(["판매함", "판매안함"]).default("판매함"),
  shippingPolicy: z.string().min(1, "배송 정책을 입력하세요"),
});

// ────────────────────────────────────────────────
// 전체 스키마
// ────────────────────────────────────────────────

export const foodProductSchema = z
  .object({
    // 1. 기본 정보
    name: z.string().min(1, "상품명을 입력하세요"),
    categoryNos: z
      .array(z.coerce.number())
      .min(1, "상품이 노출될 분류를 최소 1개 선택하세요"),
    price: z.coerce.number().min(0, "판매가를 입력하세요"),
    cost: z.coerce.number().min(0).default(0),
    stock: z.coerce.number().min(0, "재고수량을 입력하세요"),
    description: z.string().optional().default(""),
    images: z.array(z.string()).default([]),

    // 2. 옵션
    options: z.array(optionSchema).default([]),

    // 3. 식품 법정 고시정보
    legalInfo: foodLegalInfoSchema,

    // 4. 채널 선택 + 채널별 정보
    channels: z.object({
      shopify: z.boolean().default(false),
      cafe24: z.boolean().default(false),
    }),
    channelData: z.object({
      shopify: shopifyDataSchema.optional(),
      cafe24: cafe24DataSchema.optional(),
    }),

    status: z.enum(["임시저장", "판매중"]).default("임시저장"),
  })
  // ── 조건부 필수값 검증 ──
  .superRefine((data, ctx) => {
    if (data.legalInfo.nutritionRequired && !data.legalInfo.nutrition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "영양성분 표시대상인 경우 영양성분을 입력해야 합니다",
        path: ["legalInfo", "nutrition"],
      });
    }

    if (data.legalInfo.isImported && !data.legalInfo.importInfo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "수입식품인 경우 수입업소/제조업소/수출국 정보를 입력해야 합니다",
        path: ["legalInfo", "importInfo"],
      });
    }

    // 최소 1개 채널 선택 필수
    if (!data.channels.shopify && !data.channels.cafe24) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "최소 1개 이상의 채널을 선택해야 합니다",
        path: ["channels"],
      });
    }

    // Shopify 선택 시 Shopify 데이터 필수
    if (data.channels.shopify && !data.channelData.shopify) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shopify 전용 정보를 입력해야 합니다",
        path: ["channelData", "shopify"],
      });
    }

    // 카페24 선택 시 카페24 데이터 필수
    if (data.channels.cafe24 && !data.channelData.cafe24) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "카페24 전용 정보를 입력해야 합니다",
        path: ["channelData", "cafe24"],
      });
    }
  });

export type FoodProductFormInput = z.input<typeof foodProductSchema>;
export type FoodProductFormValues = z.output<typeof foodProductSchema>;
