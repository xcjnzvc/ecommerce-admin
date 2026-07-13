import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래 경로 제외한 모든 요청에 미들웨어 적용:
     * - _next/static, _next/image (Next.js 내부 파일)
     * - favicon.ico
     * - api/ (API 라우트는 자체적으로 인증 처리하니 제외 가능, 필요시 포함해도 됨)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
