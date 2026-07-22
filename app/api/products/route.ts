import { NextRequest, NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";

// 1. 요청 데이터에 대한 엄격한 타입 정의
interface ProductRequestBody {
  product_name: string;
  price: number;
  supply_price: number;
  description?: string;
  display: "T" | "F";
  selling: "T" | "F";
  category_nos: number[];
  images?: string[] | string;
  detail_image?: string;
  stock_quantity?: number;
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | null
    | string[]
    | number[];
}

// 2. 카페24 전송용 타입
interface Cafe24Payload {
  product_name: string;
  price: number;
  supply_price: number;
  description?: string;
  display: "T" | "F";
  selling: "T" | "F";
  [key: string]: string | number | boolean | undefined | null | string[];
}

export async function GET() {
  try {
    const products = await cafe24.getProducts();
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ProductRequestBody = await req.json();

    const {
      category_nos,
      images,
      detail_image,
      stock_quantity,
      ...productBody
    } = body;

    // 대표 이미지 추출 로직
    let mainImage: string | null = null;
    if (images) {
      const imageArray = Array.isArray(images) ? images : [images];
      if (imageArray.length > 0) mainImage = String(imageArray[0]);
    }
    if (!mainImage && detail_image) mainImage = String(detail_image);

    // 이미지 업로드 및 상대 경로 추출
    let uploadedPath: string | null = null;
    if (mainImage) {
      try {
        const uploadResult = await cafe24.uploadImage(mainImage);
        // uploadResult가 path를 직접 반환하도록 구조를 맞췄으므로 바로 사용
        if (uploadResult) {
          const match = uploadResult.match(/(\/web\/upload\/.+)$/);
          uploadedPath = match
            ? match[1]
            : uploadResult.replace(/^https?:\/\/[^/]+/, "");
        }
      } catch (uploadError) {
        console.error("이미지 업로드 실패:", uploadError);
      }
    }

    // 상품 생성 Payload 구성
    const cafe24Payload: Cafe24Payload = {
      product_name: productBody.product_name,
      price: productBody.price,
      supply_price: productBody.supply_price,
      description: productBody.description,
      display: productBody.display,
      selling: productBody.selling,
    };

    const result = await cafe24.createProduct(cafe24Payload);

    console.log("상품 생성 응답:", JSON.stringify(result, null, 2));

    const productNo = result?.product?.product_no;

    // 재고관리 활성화
    if (productNo) {
      try {
        await cafe24.updateStock(productNo, stock_quantity ?? 0);

        console.log("재고관리 활성화 완료:", productNo);
      } catch (stockError) {
        console.error("재고관리 활성화 실패:", stockError);
      }
    }

    // 상품에 이미지 등록
    if (productNo && uploadedPath) {
      await cafe24.uploadProductImages(productNo, {
        detail_image: uploadedPath,
        list_image: uploadedPath,
        small_image: uploadedPath,
        tiny_image: uploadedPath,
      });
    }

    // 카테고리 연결
    if (productNo && Array.isArray(category_nos)) {
      for (const categoryNo of category_nos) {
        try {
          await cafe24.assignCategory(productNo, categoryNo);
        } catch (categoryError) {
          console.error(`카테고리(${categoryNo}) 배정 실패:`, categoryError);
        }
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("카페24 상품 등록 실패:", err);
    return NextResponse.json({ error: "카페24 등록 실패" }, { status: 500 });
  }
}
