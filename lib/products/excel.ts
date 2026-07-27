import * as XLSX from "xlsx";
import {
  foodProductCreateSchema,
  type FoodProductCreateValues,
} from "@/app/(dashboard)/products/_components/food-product.schema";

/** 엑셀 헤더 ↔ 내부 필드 매핑 */
export const EXCEL_COLUMNS = [
  { key: "name", header: "상품명", required: true },
  { key: "categoryNos", header: "카테고리번호", required: true },
  { key: "price", header: "판매가", required: true },
  { key: "cost", header: "공급가", required: false },
  { key: "stock", header: "재고", required: true },
  { key: "description", header: "상품설명", required: false },
  { key: "status", header: "상태", required: false },
  { key: "mainImageUrl", header: "대표이미지", required: false },
  { key: "foodType", header: "식품유형", required: true },
  { key: "ingredients", header: "원재료명", required: true },
  { key: "netWeight", header: "내용량", required: true },
  { key: "expiryDate", header: "소비기한", required: true },
  { key: "storageMethod", header: "보관방법", required: true },
  { key: "manufacturer", header: "제조사", required: true },
  { key: "consumerServicePhone", header: "소비자상담전화", required: true },
  { key: "allergens", header: "알레르기", required: false },
  { key: "isGMO", header: "GMO", required: false },
  { key: "nutritionRequired", header: "영양성분표시대상", required: false },
  { key: "calories", header: "열량", required: false },
  { key: "carbs", header: "탄수화물", required: false },
  { key: "protein", header: "단백질", required: false },
  { key: "fat", header: "지방", required: false },
  { key: "sodium", header: "나트륨", required: false },
  { key: "isImported", header: "수입식품", required: false },
  { key: "importerName", header: "수입업소명", required: false },
  { key: "importManufacturerName", header: "수입제조업소명", required: false },
  { key: "exportCountry", header: "수출국명", required: false },
  { key: "channelCafe24", header: "카페24", required: true },
  { key: "channelShopify", header: "Shopify", required: true },
  { key: "cafe24DisplayStatus", header: "카페24진열", required: false },
  { key: "cafe24SellingStatus", header: "카페24판매", required: false },
  { key: "cafe24ShippingPolicy", header: "카페24배송정책", required: false },
  { key: "shopifyProductType", header: "Shopify상품유형", required: false },
  { key: "shopifyVendor", header: "Shopify브랜드", required: false },
  { key: "shopifyTags", header: "Shopify태그", required: false },
  { key: "shopifyPublishStatus", header: "Shopify게시상태", required: false },
] as const;

/** 구 템플릿 헤더 호환 */
const COLUMN_HEADER_ALIASES: Partial<
  Record<(typeof EXCEL_COLUMNS)[number]["key"], string[]>
> = {
  mainImageUrl: ["대표이미지", "이미지URL"],
};

type ExcelColumnKey = (typeof EXCEL_COLUMNS)[number]["key"];

export type ExcelProductRow = Partial<Record<ExcelColumnKey, string | number>>;

export type ParsedBulkProduct = {
  rowIndex: number;
  values: FoodProductCreateValues;
  images: string[];
};

export type BulkParseError = {
  rowIndex: number;
  message: string;
};

export type BulkParseResult = {
  products: ParsedBulkProduct[];
  errors: BulkParseError[];
};

const SAMPLE_ROW: Record<string, string | number> = {
  상품명: "유기농 사과주스 1L",
  카테고리번호: "43",
  판매가: 12000,
  공급가: 7000,
  재고: 50,
  상품설명: "신선한 유기농 사과로 만든 주스입니다.",
  상태: "판매중",
  대표이미지: "https://example.com/images/product-main.jpg",
  식품유형: "과채주스",
  원재료명: "유기농 사과 100%",
  내용량: "1L",
  소비기한: "제조일로부터 12개월",
  보관방법: "직사광선을 피해 실온 보관",
  제조사: "OO식품 / 경기도 성남시",
  소비자상담전화: "1588-0000",
  알레르기: "",
  GMO: "해당없음",
  영양성분표시대상: "N",
  열량: "",
  탄수화물: "",
  단백질: "",
  지방: "",
  나트륨: "",
  수입식품: "N",
  수입업소명: "",
  수입제조업소명: "",
  수출국명: "",
  카페24: "Y",
  Shopify: "Y",
  카페24진열: "진열함",
  카페24판매: "판매함",
  카페24배송정책: "기본배송",
  Shopify상품유형: "Beverage",
  Shopify브랜드: "MyBrand",
  Shopify태그: "juice,organic",
  Shopify게시상태: "draft",
};

const GUIDE_ROWS = [
  ["컬럼", "설명", "예시"],
  ["상품명", "필수. 상품 이름", "유기농 사과주스 1L"],
  ["카테고리번호", "필수. 콤마로 여러 개 가능 (카페24 관리자 > 분류에서 확인)", "43 또는 23,43"],
  ["판매가", "필수. 숫자", "12000"],
  ["공급가", "선택. 숫자 (기본 0)", "7000"],
  ["재고", "필수. 숫자", "50"],
  ["상품설명", "선택. 상세 설명 텍스트", "신선한 주스입니다."],
  ["상태", "선택. 판매중 | 임시저장 (기본 판매중)", "판매중"],
  ["대표이미지", "선택. 대표 이미지 URL (카페24·Shopify·DB에 반영)", "https://example.com/images/product-main.jpg"],
  ["식품유형", "필수", "과채주스"],
  ["원재료명", "필수", "유기농 사과 100%"],
  ["내용량", "필수", "1L"],
  ["소비기한", "필수", "제조일로부터 12개월"],
  ["보관방법", "필수", "실온 보관"],
  ["제조사", "필수", "OO식품 / 경기도"],
  ["소비자상담전화", "필수", "1588-0000"],
  ["알레르기", "선택. 콤마 구분", "대두,밀"],
  ["GMO", "선택. 해당없음 | 유전자재조합식품", "해당없음"],
  ["영양성분표시대상", "Y/N (기본 N)", "N"],
  ["열량~나트륨", "영양성분표시대상=Y일 때 필수", "100"],
  ["수입식품", "Y/N (기본 N)", "N"],
  ["수입업소명 등", "수입식품=Y일 때 필수", ""],
  ["카페24 / Shopify", "필수. Y/N. 최소 1개 Y", "Y"],
  ["카페24진열", "진열함 | 진열안함 (카페24=Y일 때)", "진열함"],
  ["카페24판매", "판매함 | 판매안함", "판매함"],
  ["카페24배송정책", "카페24=Y일 때 필수", "기본배송"],
  ["Shopify상품유형", "Shopify=Y일 때 필수", "Beverage"],
  ["Shopify브랜드", "Shopify=Y일 때 필수", "MyBrand"],
  ["Shopify태그", "선택. 콤마 구분", "juice,organic"],
  ["Shopify게시상태", "active | draft (기본 draft)", "draft"],
];

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseYesNo(value: string, defaultValue = false): boolean {
  if (!value) return defaultValue;
  const normalized = value.toUpperCase();
  return (
    normalized === "Y" ||
    normalized === "YES" ||
    normalized === "TRUE" ||
    value === "예" ||
    value === "TRUE"
  );
}

function parseNumberList(value: string): number[] {
  if (!value) return [];
  return value
    .split(/[,|/]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

function parseStringList(value: string): string[] {
  if (!value) return [];
  return value
    .split(/[,|/]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function rowToCreateInput(row: ExcelProductRow): {
  input: unknown;
  images: string[];
} {
  const cafe24 = parseYesNo(cellToString(row.channelCafe24));
  const shopify = parseYesNo(cellToString(row.channelShopify));
  const nutritionRequired = parseYesNo(cellToString(row.nutritionRequired));
  const isImported = parseYesNo(cellToString(row.isImported));
  const statusRaw = cellToString(row.status);
  const status =
    statusRaw === "임시저장" || statusRaw === "판매중" ? statusRaw : "판매중";

  const gmoRaw = cellToString(row.isGMO);
  const isGMO =
    gmoRaw === "유전자재조합식품" ? "유전자재조합식품" : "해당없음";

  const mainImageUrl = cellToString(row.mainImageUrl);
  const images = mainImageUrl ? [mainImageUrl] : [];

  const input = {
    name: cellToString(row.name),
    categoryNos: parseNumberList(cellToString(row.categoryNos)),
    price: Number(row.price ?? 0),
    cost: Number(row.cost ?? 0),
    stock: Number(row.stock ?? 0),
    description: cellToString(row.description),
    images,
    options: [],
    legalInfo: {
      foodType: cellToString(row.foodType),
      ingredients: cellToString(row.ingredients),
      netWeight: cellToString(row.netWeight),
      expiryDate: cellToString(row.expiryDate),
      storageMethod: cellToString(row.storageMethod),
      manufacturer: cellToString(row.manufacturer),
      consumerServicePhone: cellToString(row.consumerServicePhone),
      allergens: parseStringList(cellToString(row.allergens)),
      isGMO,
      nutritionRequired,
      nutrition: nutritionRequired
        ? {
            calories: Number(row.calories ?? 0),
            carbs: Number(row.carbs ?? 0),
            protein: Number(row.protein ?? 0),
            fat: Number(row.fat ?? 0),
            sodium: Number(row.sodium ?? 0),
          }
        : undefined,
      isImported,
      importInfo: isImported
        ? {
            importerName: cellToString(row.importerName),
            manufacturerName: cellToString(row.importManufacturerName),
            exportCountry: cellToString(row.exportCountry),
          }
        : undefined,
    },
    channels: { cafe24, shopify },
    channelData: {
      cafe24: cafe24
        ? {
            displayStatus:
              cellToString(row.cafe24DisplayStatus) === "진열안함"
                ? "진열안함"
                : "진열함",
            sellingStatus:
              cellToString(row.cafe24SellingStatus) === "판매안함"
                ? "판매안함"
                : "판매함",
            shippingPolicy: cellToString(row.cafe24ShippingPolicy) || "기본배송",
          }
        : undefined,
      shopify: shopify
        ? {
            productType: cellToString(row.shopifyProductType),
            vendor: cellToString(row.shopifyVendor),
            tags: cellToString(row.shopifyTags),
            publishStatus:
              cellToString(row.shopifyPublishStatus) === "active"
                ? "active"
                : "draft",
          }
        : undefined,
    },
    status,
  };

  return { input, images };
}

function sheetRowToExcelProduct(
  row: Record<string, unknown>,
): ExcelProductRow {
  const result: ExcelProductRow = {};
  for (const col of EXCEL_COLUMNS) {
    const headers = COLUMN_HEADER_ALIASES[col.key] ?? [col.header];
    for (const header of headers) {
      const raw = row[header];
      if (raw === undefined || raw === null || raw === "") continue;
      result[col.key] = typeof raw === "number" ? raw : cellToString(raw);
      break;
    }
  }
  return result;
}

/** 업로드된 엑셀 ArrayBuffer를 파싱·검증 */
export function parseProductExcel(buffer: ArrayBuffer): BulkParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      products: [],
      errors: [{ rowIndex: 0, message: "시트를 찾을 수 없습니다." }],
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const products: ParsedBulkProduct[] = [];
  const errors: BulkParseError[] = [];

  rows.forEach((rawRow, index) => {
    const rowIndex = index + 2; // 헤더가 1행
    const excelRow = sheetRowToExcelProduct(rawRow);

    // 완전 빈 행 스킵
    if (!cellToString(excelRow.name) && excelRow.price === undefined) {
      return;
    }

    const { input, images } = rowToCreateInput(excelRow);
    // #region agent log
    fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'69fb1b'},body:JSON.stringify({sessionId:'69fb1b',location:'excel.ts:parseProductExcel',message:'excel row parsed',data:{rowIndex,rawRowKeys:Object.keys(rawRow),rawMainImage:rawRow['대표이미지']??rawRow['이미지URL']??null,excelMainImage:excelRow.mainImageUrl??null,parsedImages:images,parsedValuesImages:(input as {images?:string[]}).images??[]},timestamp:Date.now(),hypothesisId:'A-B'})}).catch(()=>{});
    // #endregion
    const parsed = foodProductCreateSchema.safeParse(input);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .slice(0, 3)
        .join(", ");
      errors.push({ rowIndex, message: message || "유효하지 않은 행입니다." });
      return;
    }

    products.push({
      rowIndex,
      values: parsed.data,
      images,
    });
  });

  return { products, errors };
}

/** 등록용 템플릿(.xlsx) ArrayBuffer 생성 */
export function buildProductTemplateBuffer(): ArrayBuffer {
  const workbook = XLSX.utils.book_new();

  const headers = EXCEL_COLUMNS.map((c) => c.header);
  const sample = headers.map((h) => SAMPLE_ROW[h] ?? "");
  const productSheet = XLSX.utils.aoa_to_sheet([headers, sample]);
  productSheet["!cols"] = headers.map((h) => ({
    wch: Math.min(Math.max(h.length + 4, 12), 28),
  }));
  XLSX.utils.book_append_sheet(workbook, productSheet, "상품목록");

  const guideSheet = XLSX.utils.aoa_to_sheet(GUIDE_ROWS);
  guideSheet["!cols"] = [{ wch: 18 }, { wch: 48 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(workbook, guideSheet, "작성가이드");

  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

export function downloadProductTemplate(filename = "상품등록_템플릿.xlsx") {
  const buffer = buildProductTemplateBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
