# Commerce Admin

(멀티채널 이커머스 관리자 대시보드)

Cafe24와 Shopify를 하나의 관리자에서 다루는 멀티채널 이커머스 운영 시스템입니다.

운영자가 상품 등록·수정, 재고 관리, 채널 동기화, 주문 현황을 채널별로 나눠 들어가지 않고 처리할 수 있도록 만들었습니다.

배포: [https://ecommerce-admin-six-blush.vercel.app](https://ecommerce-admin-six-blush.vercel.app)

---

## Why

실제 이커머스 운영에서는 이런 일이 반복됩니다.

- 같은 상품을 Cafe24와 Shopify에 각각 등록해야 함
- 재고를 채널마다 따로 맞추다 보면 쉽게 불일치함
- 수정·품절·동기화 실패를 한곳에서 추적하기 어려움

이 반복 업무와 정합성 문제를 줄이기 위해, 내부 DB를 기준으로 두고 채널 API를 어댑터로 붙이는 통합 어드민을 만들었습니다.

---

## Documentation

프로젝트를 만들게 된 배경, 설계 판단, 트러블슈팅은 About 페이지에 정리했습니다.

👉 [About Page](https://ecommerce-admin-six-blush.vercel.app/about)

---

## Tech Stack

| 구분     | 기술                                                 | 역할                                  |
| -------- | ---------------------------------------------------- | ------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript, TailwindCSS | 관리자 UI                             |
| Backend  | Next.js API Routes                                   | 인증, 상품/재고/주문 API, Cron        |
| Database | Supabase (PostgreSQL), RLS                           | 상품·주문·동기화 상태 저장            |
| Auth     | Supabase Auth, Cafe24 OAuth                          | 관리자 로그인, Cafe24 토큰 관리       |
| State    | TanStack React Query                                 | 서버 상태 캐시, Realtime invalidation |
| Form     | react-hook-form, zod                                 | 상품 등록/수정 검증                   |
| External | Cafe24 Admin API, Shopify Admin API                  | 채널 상품·재고·주문 연동              |
| Deploy   | Vercel (Cron Jobs 포함)                              | 배포 및 재고 동기화 스케줄            |

---

## Features

### 상품 관리

- 상품 등록 / 수정 / 삭제
- 식품 카테고리 전용 등록 폼
- Cafe24 · Shopify 순차 등록
- OAuth 토큰 자동 갱신

### 재고 관리

- Cafe24 → Supabase → Shopify 자동 동기화
- 관리자 수동 재고 조정
- 동기화 로그 및 실패 추적

### 주문 관리

- Shopify 웹훅 기반 주문 수집
- Cafe24 주문 동기화

### 대시보드

- 매출
- 주문 현황
- 베스트셀러

---

## Architecture

```text
Admin UI (Next.js)
        │
        ▼
API Routes (app/api)
        │
        ▼
Service Layer (lib/products, lib/inventory, lib/orders)
        │
        ├──► Supabase (products.stock 기준)
        │
        ├──► Cafe24 Admin API
        │
        └──► Shopify Admin API
```

### 상품 등록 흐름

```text
폼 제출
  → Supabase products insert
  → Cafe24 상품 생성 (+ 필요 시 이미지 업로드)
  → Shopify 상품 생성
  → cafe24_product_no / shopify_product_id 등 채널 번호 저장
```

### 재고 동기화 흐름

```text
Cron (/api/cron/sync-inventory)
  → Cafe24 실재고 조회
  → products.stock 갱신
  → Shopify inventory 반영
  → 실패 시 sync_error_log 기록 / 성공 시 resolved
```

초기에는 별도 inventory 테이블을 두었으나, 운영 중이던 동기화 로직과 정합성이 깨져 `products.stock`으로 통합했습니다. 재고는 이중 저장하지 않는 것이 이 프로젝트의 핵심 원칙입니다.

---

## Getting Started

```bash
git clone <repo-url>
cd ecommerce-admin
npm install
# .env.local 생성 후 아래 환경변수 채우기
npm run dev
```

### 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

CAFE24_CLIENT_ID=
CAFE24_CLIENT_SECRET=

SHOPIFY_SHOP=
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=
SHOPIFY_LOCATION_ID=
SHOPIFY_ACCESS_TOKEN=
SHOPIFY_APP_URL=          # 예: https://your-app.vercel.app

CRON_SECRET=
```

실제 키 값은 커밋하지 않습니다.

---

## Project Structure

```text
app/
 ├ (auth)/              # 로그인·회원가입
 ├ (dashboard)/
 │   ├ dashboard/       # 운영 대시보드
 │   ├ products/
 │   │   ├ new/         # 상품 등록
 │   │   └ [id]/edit/  # 상품 수정
 │   ├ inventory/       # 재고 관리
 │   ├ orders/          # 주문 관리
 │   └ settings/
 ├ api/                 # API Routes (products, inventory, orders, cron, webhooks)
 └ about/               # 설계·배경 설명 페이지

lib/
 ├ api/                 # Cafe24 / Shopify 어댑터
 ├ products/            # 상품 등록·수정 오케스트레이션
 ├ inventory/           # 재고 동기화
 ├ orders/              # 주문 동기화
 ├ dashboard/           # 대시보드 집계
 └ supabase/            # 클라이언트·동기화 상태

components/             # 공용 UI
types/                  # 공유 타입
```

채널별 외부 호출은 `lib/api/`에만 두고, `app/api`와 `lib/*` 서비스 레이어에서 오케스트레이션합니다. 새 채널은 기존 채널 코드를 건드리지 않고 어댑터·서비스 추가 쪽으로 확장하는 구조입니다.
