# 멀티채널 이커머스 관리자 대시보드

자사몰, 카페24, 스마트스토어, 쿠팡 등 멀티채널 운영에서 발생하는 반복 업무를 줄이고,
상품 등록부터 리뷰 관리까지 하나의 화면에서 처리할 수 있도록 만든 관리자 시스템입니다.

---

## 만든 이유

이커머스 운영 시 채널마다 상품 정보를 따로 입력하고, 리뷰를 따로 확인하고, 재고를 따로 관리하는 반복 업무가 발생합니다.  
이 프로젝트는 그 반복을 줄이기 위해 기획했습니다.

---

## 주요 기능

### 대시보드

- 채널별 상품 등록 현황 요약
- 매출 및 주문 수 시각화 (차트)
- 재고 부족 상품 알림

### 상품 관리

- 상품 등록 / 수정 / 삭제
- 상품 정보 입력 한 번으로 채널별 양식 자동 변환 출력
  - 카페24 — API 연동 등록
  - 쿠팡 — API 연동 등록
  - 스마트스토어 — 복사용 텍스트 출력 (공식 API 미제공)
- URL 입력 시 상품 정보 자동 수집 (크롤링)
- OpenAI API 기반 상품 상세설명 자동 생성

### 주문 관리

- 주문 목록 조회 및 상태 관리 (접수 / 준비중 / 발송 / 완료)
- 채널별 주문 현황 필터링

### 재고 관리

- 상품별 재고 수량 조회 및 수정
- 재고 부족 기준 설정 및 알림

### 리뷰 관리

- 채널별 리뷰 목록 조회
- OpenAI API 기반 리뷰 답변 초안 자동 생성

### 마케팅 자동화

- AI 기반 상품 설명 문구 생성
- AI 기반 리뷰 답변 생성
- 인플루언서 캠페인 목록 관리 (진행중 / 완료 / 예정)

### 설정

- 채널별 API 키 등록 및 관리 (카페24, 쿠팡)
- 계정 정보 관리

---

## 기술 스택

| 구분        | 기술                               |
| ----------- | ---------------------------------- |
| Frontend    | Next.js, TypeScript, TailwindCSS   |
| Backend     | Next.js API Routes                 |
| Database    | PostgreSQL (AWS RDS)               |
| 인증        | Supabase Auth                      |
| 이미지 저장 | AWS S3                             |
| 배포        | Vercel (프론트) / AWS EC2 (백엔드) |
| AI          | OpenAI API                         |
| 크롤링      | Playwright                         |

---

## 로컬 실행 방법

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local

# 개발 서버 실행
npm run dev
```

### 환경변수 목록 (.env.example)

```
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
COUPANG_ACCESS_KEY=
COUPANG_SECRET_KEY=
CAFE24_CLIENT_ID=
CAFE24_CLIENT_SECRET=
```

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── page.tsx           # 대시보드 홈
│   │   ├── products/          # 상품 관리
│   │   ├── orders/            # 주문 관리
│   │   ├── inventory/         # 재고 관리
│   │   ├── reviews/           # 리뷰 관리
│   │   ├── marketing/         # 마케팅 자동화
│   │   └── settings/          # 설정
│   └── api/
│       ├── products/
│       ├── orders/
│       ├── reviews/
│       └── ai/
├── components/
│   ├── ui/
│   └── layout/
└── lib/
    ├── supabase.ts
    ├── openai.ts
    └── channels/
        ├── coupang.ts
        └── cafe24.ts
```

---

## 개발 순서 (로드맵)

- [x] 프로젝트 초기 셋업 (Next.js + TypeScript + TailwindCSS)
- [ ] 로그인 / 회원가입
- [ ] 대시보드 레이아웃 및 사이드바
- [ ] 상품 관리 (등록 / 수정 / 목록)
- [ ] 채널별 상품 변환 출력
- [ ] AI 상품 설명 자동 생성
- [ ] 재고 관리
- [ ] 주문 관리
- [ ] 리뷰 관리 + AI 답변 생성
- [ ] 마케팅 자동화 탭
- [ ] 카페24 / 쿠팡 API 연동
- [ ] AWS 배포

---

## AI 도구 활용

이 프로젝트는 Claude, Cursor 등 AI 코딩 도구를 적극적으로 활용하여 개발했습니다.

- 반복적인 UI 컴포넌트 초안 생성
- API 연동 코드 구조 설계
- 크롤링 스크립트 작성
- 오류 디버깅 및 코드 리뷰
