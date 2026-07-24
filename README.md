# 멀티채널 이커머스 관리자 대시보드

카페24와 Shopify에 상품을 각각 등록해야 하는 반복 업무를 줄이기 위해 만든
통합 어드민입니다. 하나의 폼에서 상품을 등록하면 두 채널에 동시 반영되고,
재고는 카페24를 기준으로 매일 자동 동기화됩니다.

프로젝트 배경과 설계 판단은 [/about](이 배포 URL/about) 페이지에 정리했습니다.

---

## 실제로 구현한 기능

### 상품 관리

- 식품 카테고리 전용 등록 폼 (법정 고시정보, 옵션, 채널별 정보 한 화면 입력)
- 등록 시 Supabase 저장 → 카페24 등록 → Shopify 등록 순차 처리, 각 채널 상품번호를 다시 Supabase에 기록
- 등록(create)과 수정(edit) 플로우를 별도 컴포넌트로 분리, 공용 섹션/훅으로 중복 제거
- 카페24 OAuth 토큰 자동 갱신 (동시 요청 시 중복 갱신 방지 처리)

### 재고 관리

- `products.stock`을 재고의 단일 소스로 채택 (초기엔 별도 inventory 테이블을 시도했으나, 이미 운영 중이던 동기화 로직과의 정합성을 위해 통일)
- 매일 1회 크론으로 카페24 실재고를 조회해 Supabase → Shopify 순으로 미러링 (`/api/cron/sync-inventory`, Vercel Cron + CRON_SECRET 인증)
- 관리자가 수동으로 재고를 조정하면 카페24·Shopify에 동시 반영 (`/api/products/[id]/stock`)
- 재고 변경 이력을 DB에 영속화 (`inventory_logs`)
- 동기화 실패 이력을 추적하고, 다음 동기화 성공 시 자동으로 해결 처리 (`sync_error_log` + resolved 플래그)

---

## 기술 스택

| 구분      | 기술                                          |
| --------- | --------------------------------------------- |
| Frontend  | Next.js (App Router), TypeScript, TailwindCSS |
| Backend   | Next.js API Routes                            |
| Database  | Supabase (PostgreSQL), RLS                    |
| 인증      | Supabase Auth, 카페24 OAuth                   |
| 외부 연동 | 카페24 Admin API, Shopify Admin API           |
| 배포      | Vercel (Cron Jobs 포함)                       |
| 폼/검증   | react-hook-form, zod                          |

---

## 로컬 실행 방법

\`\`\`bash
npm install
cp .env.example .env.local
npm run dev
\`\`\`

### 필요한 환경변수

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CAFE24_CLIENT_ID=
CAFE24_CLIENT_SECRET=
SHOPIFY_SHOP=
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=
SHOPIFY_LOCATION_ID=
CRON_SECRET=
\`\`\`

---

## 다음 단계로 고려 중인 것

- 카페24/Shopify 주문 웹훅을 통한 실시간 재고 반영 (현재는 크론 폴링 방식)
- 스마트스토어/쿠팡 등 채널 확장 (어댑터 구조로 설계, `lib/api/` 아래 서비스 레이어 추가만으로 확장 가능하도록 구성)
- 대시보드 실데이터 연동

---

## AI 도구 활용

Claude와 함께 설계 논의부터 디버깅까지 진행했습니다. 특히 재고 데이터가
두 곳(별도 inventory 테이블, products.stock)에 나뉘어 저장되며 발생한
정합성 문제를 진단하고, 단일 소스로 통합하는 리팩토링 과정에서 실질적인
도움을 받았습니다.
