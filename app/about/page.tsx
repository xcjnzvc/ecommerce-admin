import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const DEPLOY_URL = "https://ecommerce-admin-six-blush.vercel.app";
const GITHUB_URL = "https://github.com/xcjnzvc/ecommerce-admin";

const scaleCards = [
  { value: "Cafe24 + Shopify", label: "2개 채널 연동" },
  { value: "03:00 UTC", label: "Daily 재고 동기화" },
  { value: "6개", label: "도메인 테이블" },
  {
    value: "도메인별 API",
    label: "products · inventory · orders · auth",
  },
];

const overviewMeta = [
  { label: "개발 기간", value: "2026.07 ~ 진행중" },
  { label: "개발 인원", value: "1인 개발" },
  {
    label: "담당 범위",
    value: "기획 · UI/UX · Frontend · Backend · Database · API 연동 · 배포",
  },
];

const screenshots = [
  {
    title: "Dashboard",
    caption: "매출·주문 현황 요약",
    src: "/dashboard.png",
  },
  {
    title: "상품 등록",
    caption: "멀티채널 등록 폼",
    src: "/product.png",
  },
  {
    title: "재고 관리",
    caption: "SSOT 기반 재고·동기화 상태",
    src: "/inventory.png",
  },
];

const coreFeatures = [
  {
    badge: "핵심",
    badgeColor: "bg-emerald-50 text-emerald-700",
    title: "멀티채널 상품 등록",
    desc: "하나의 폼에서 등록하면 Supabase → Cafe24 → Shopify 순으로 처리하고, 채널별 상품번호를 다시 DB에 저장합니다. 등록·수정 플로우는 분리하되 공용 섹션·훅으로 중복을 줄였습니다.",
  },
  {
    badge: "핵심",
    badgeColor: "bg-violet-50 text-violet-700",
    title: "재고 동기화 (products.stock SSOT)",
    desc: "Cafe24 실재고를 기준으로 매일 Cron이 products.stock을 갱신한 뒤 Shopify에 미러링합니다. 관리자 수동 조정도 동일 경로로 전 채널에 반영하고, 변경 이력을 남깁니다.",
  },
  {
    badge: "핵심",
    badgeColor: "bg-blue-50 text-blue-700",
    title: "Cafe24 OAuth 자동 갱신",
    desc: "access/refresh 토큰을 Supabase에 저장하고, axios 인터셉터에서 만료를 확인합니다. 핵심은 동시 요청 시 refresh_token race condition을 Promise lock으로 막아, 갱신이 한 번만 일어나도록 한 점입니다.",
  },
];

const otherFeatures = [
  {
    title: "상품 목록 · 상태 관리",
    desc: "검색, 상태 필터, 일괄 삭제",
  },
  {
    title: "상품 수정 · 삭제",
    desc: "채널 갱신 + 내부 DB 우선 정리",
  },
  {
    title: "주문 관리",
    desc: "Shopify 웹훅 실시간 반영, Cafe24 수동 동기화",
  },
  {
    title: "대시보드",
    desc: "매출 추이, 베스트셀러, 최근 주문",
  },
];

const beforeAfter = [
  {
    before: "같은 상품을 Cafe24·Shopify에 각각 등록해야 했다.",
    after: "한 번 등록하면 연동된 채널에 순차적으로 생성된다.",
  },
  {
    before: "재고를 채널마다 따로 수정해야 했다.",
    after:
      "Cafe24 실재고를 기준으로 하루 1회 자동 동기화하고, 수동 조정도 전 채널에 반영한다.",
  },
  {
    before: "동기화 실패를 놓치면 재고 불일치를 뒤늦게 발견했다.",
    after:
      "실패는 sync_error_log에 남기고, 다음 성공 시 자동으로 resolved 처리한다.",
  },
];

const architectureLayers = [
  { title: "Admin UI", desc: "Next.js App Router" },
  { title: "API Routes", desc: "products · inventory · orders · auth" },
  { title: "Service Layer", desc: "lib/products · inventory · orders" },
  { title: "Supabase", desc: "products.stock SSOT" },
  { title: "Cafe24 API", desc: "상품 · 재고 · OAuth" },
  { title: "Shopify API", desc: "상품 · 재고 · 주문 웹훅" },
];

const productFlow = [
  { step: "01", title: "폼 제출", desc: "법정 고시정보·옵션 입력" },
  { step: "02", title: "Supabase", desc: "원본 데이터 우선 저장" },
  { step: "03", title: "Cafe24", desc: "상품 생성·이미지 연결" },
  { step: "04", title: "Shopify", desc: "상품·재고 아이템 생성" },
  { step: "05", title: "번호 매핑", desc: "채널 상품번호 DB 재기록" },
];

const inventoryFlow = [
  { step: "01", title: "Cafe24 실재고", desc: "채널 기준 조회" },
  { step: "02", title: "Cron", desc: "매일 03:00 UTC" },
  { step: "03", title: "products.stock", desc: "SSOT 갱신" },
  { step: "04", title: "Shopify", desc: "동일 재고 반영" },
  { step: "05", title: "이력·오류", desc: "logs / resolved" },
];

const designDecisions = [
  {
    title: "왜 inventory 테이블을 없애고 products.stock을 SSOT로 잡았는가",
    background:
      "재고 화면을 먼저 설계하면서 inventory 테이블을 따로 두었습니다. 창고·예약·채널 재고를 분리하려는 의도였습니다.",
    concern:
      "이미 돌고 있던 동기화 Cron은 products.stock만 읽고 있었습니다. 등록은 inventory에, Cron은 products만 보면 재고가 항상 틀린 값이 되고, 어느 쪽이 최신인지도 보장할 수 없었습니다. RLS 미설정으로 저장 자체가 막히는 증상도 겹쳤습니다.",
    decision:
      "inventory를 폐기하고 products.stock을 Single Source of Truth로 통합했습니다. 재고는 이중 저장하지 않는 것이 이 프로젝트의 핵심 원칙입니다.",
  },
  {
    title: "왜 API Layer(lib/api)를 분리했는가",
    background:
      "Cafe24·Shopify는 필드명·응답 구조·인증 방식이 서로 다릅니다. API Route에 채널 호출을 직접 넣으면 엔드포인트마다 연동 로직이 흩어집니다.",
    concern:
      "채널이 늘어날수록 프론트와 route 핸들러를 계속 수정해야 하고, 스펙 차이를 동일하다고 가정하기 쉬워집니다.",
    decision:
      "외부 호출은 lib/api 어댑터에만 두고, 등록·재고·주문은 lib/* 서비스 레이어에서 오케스트레이션합니다. 새 채널은 어댑터·서비스 추가 쪽으로 확장하는 구조를 유지합니다.",
  },
  {
    title: "왜 삭제는 채널 실패와 무관하게 내부 DB를 정리하는가",
    background:
      "삭제는 Cafe24/Shopify API 호출과 Supabase 삭제가 함께 일어납니다. 채널 쪽에 이미 없거나 일시 오류가 나면 두 저장소의 정합성을 어떻게 맞출지 결정해야 했습니다.",
    concern:
      "채널 삭제가 실패했다고 Supabase도 그대로 두면, 사용자가 삭제했는데 목록에 남는 상황이 더 혼란스럽다고 판단했습니다. 반대로 채널에만 남는 eventual consistency 이슈도 생깁니다.",
    decision:
      "내부 DB 상태는 즉시 정리하고, 외부 채널 삭제 실패는 sync_error_log로 추적해 재처리 가능한 구조로 분리했습니다.",
  },
];

const troubleshooting = [
  {
    highlight: true,
    label: "동시 요청 시 Cafe24 refresh_token race condition",
    problem:
      "여러 API 요청이 거의 동시에 들어올 때만 간헐적으로 카페24 인증이 실패했습니다. 단일 요청으로는 재현되지 않았습니다.",
    cause:
      "Cafe24 refresh_token은 1회성입니다. 만료 시점에 두 요청이 각자 갱신을 시도하면, 먼저 도착한 요청이 토큰을 소비한 뒤 뒤 요청은 이미 무효화된 refresh로 갱신을 시도해 실패합니다.",
    fix: "모듈 스코프의 Promise 변수로 갱신 로직을 감쌌습니다. 이미 갱신이 진행 중이면 새 갱신을 시작하지 않고 기존 Promise를 공유합니다. 동시 요청이 몰려도 refresh는 한 번만 실행됩니다.",
  },
  {
    highlight: false,
    label: "Cafe24 이미지 API의 상대 경로 요구사항",
    problem:
      "이미지 업로드 응답을 상품 이미지 필드에 그대로 넣으면 값이 유효하지 않다고 처리됐습니다.",
    cause:
      "업로드 API는 절대 URL을 반환하지만, 상품에 이미지를 연결하는 API는 서버 내부 상대 경로만 허용합니다. 문서만으로는 바로 알기 어려웠습니다.",
    fix: "업로드 응답에서 호스트를 제외한 상대 경로만 추출해 상품 이미지 필드에 전달하도록 수정했습니다.",
  },
  {
    highlight: false,
    label: "동기화 실패 로그가 해결 후에도 남는 문제",
    problem:
      "실패는 sync_error_log에 남기지만, 이후 동기화가 성공해도 화면의 오류 상태가 자동으로 풀리지 않을 수 있었습니다.",
    cause:
      "실패 기록 로직만 있고, 성공 시 과거 실패를 resolved 처리하는 로직이 없었습니다.",
    fix: "동기화 성공 분기에서 해당 상품의 미해결 로그를 찾아 자동 resolved 처리하도록 추가했습니다.",
  },
  {
    highlight: false,
    label: "inventory 테이블과 동기화 로직의 충돌",
    problem:
      "상품은 저장되는데 재고만 틀리거나, Cron이 읽는 값과 등록 시 쓰는 저장소가 달랐습니다.",
    cause:
      "inventory와 products.stock이 동시에 존재했고, Cron은 products.stock만 사용했습니다.",
    fix: "RLS 패치에 그치지 않고 inventory를 제거해 products.stock SSOT로 구조를 바로잡았습니다.",
  },
];

const learnings = [
  "멀티채널 구조는 ‘한 화면’보다 ‘단일 원본 + 채널 어댑터’가 핵심이라는 점",
  "재고처럼 정합성이 중요한 데이터는 이중 저장보다 SSOT가 운영 비용을 낮춘다는 점",
  "OAuth refresh는 동시성까지 포함한 인증 설계가 필요하다는 점",
  "외부 API 제약은 문서보다 실제 응답 형식을 기준으로 어댑터를 설계해야 한다는 점",
  "동기화는 실패 기록과 성공 시 해제를 한 세트로 둬야 운영 화면이 신뢰된다는 점",
];

function FlowSteps({
  items,
}: {
  items: { step: string; title: string; desc: string }[];
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-2 text-sm flex-wrap">
      {items.map((item, i, arr) => (
        <div
          key={item.step}
          className="flex md:flex-row flex-col items-start md:items-center gap-2"
        >
          <div className="bg-gray-50 rounded-xl px-4 py-3 min-w-[120px]">
            <p className="text-[10px] font-semibold text-gray-400 mb-1">
              {item.step}
            </p>
            <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
            <p className="text-xs text-gray-500 mt-1 leading-snug">
              {item.desc}
            </p>
          </div>
          {i < arr.length - 1 && (
            <span className="text-gray-300 hidden md:block text-lg">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 bg-white">
      <div className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Link>
      </div>

      {/* 1. 프로젝트 한 줄 */}
      <section className="mb-16">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Commerce Admin
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
          반복되는 상품 등록과 재고 관리 업무를 줄이기 위한
          <br />
          멀티채널 이커머스 운영 자동화 시스템
        </h1>
        <p className="text-gray-600 text-base leading-relaxed max-w-2xl mb-8">
          Cafe24와 Shopify API를 각각 독립적인 연동 계층으로 분리하고,{" "}
          <code className="text-gray-500 text-sm">products.stock</code>을 재고의
          Single Source of Truth(SSOT)로 둡니다. 쿠팡·스마트스토어는 사업자
          등록이 필요해 아직 연동하지 않았고, 테스트 진입이 자유로운 Shopify로
          멀티채널 구조를 먼저 검증했습니다.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          {/* <a
            href={DEPLOY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
          >
            Live Demo →
          </a> */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
          >
            GitHub →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {scaleCards.map((card) => (
            <div
              key={card.label}
              className="border border-gray-100 rounded-xl px-4 py-4"
            >
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-2">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {overviewMeta.map((item) => (
            <div key={item.label} className="flex gap-4 items-start">
              <span className="text-xs font-semibold text-gray-400 min-w-[72px] pt-0.5 shrink-0">
                {item.label}
              </span>
              <span className="text-sm text-gray-600 leading-relaxed">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-16" />

      {/* 2. 실제 화면 */}
      <section className="mb-16">
        <SectionLabel>실제 서비스 화면</SectionLabel>
        <div className="flex flex-col gap-8">
          {screenshots.map((shot) => (
            <div key={shot.title} className="flex flex-col gap-3">
              <div className="max-h-[500px] overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.title}
                  className="w-full object-cover object-top"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {shot.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{shot.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-16" />

      {/* 3. 핵심 기능 */}
      <section className="mb-16">
        <SectionLabel>핵심 기능</SectionLabel>
        <div className="flex flex-col gap-4 mb-10">
          {coreFeatures.map((item) => (
            <div
              key={item.title}
              className="border border-gray-100 rounded-xl px-5 py-6"
            >
              <span
                className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${item.badgeColor}`}
              >
                {item.badge}
              </span>
              <h3 className="font-semibold text-gray-900 text-lg mt-3 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          기타 기능
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {otherFeatures.map((item) => (
            <div
              key={item.title}
              className="border border-gray-100 rounded-xl px-4 py-4"
            >
              <p className="text-sm font-semibold text-gray-900">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Before / After
        </p>
        <div className="flex flex-col gap-4">
          {beforeAfter.map((item) => (
            <div
              key={item.before}
              className="border border-gray-100 rounded-xl px-5 py-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-red-600 mb-2">
                    BEFORE
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.before}
                  </p>
                </div>
                <span className="hidden sm:block text-gray-300 pt-4">→</span>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-emerald-700 mb-2">
                    AFTER
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.after}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-16" />

      {/* 4. 기술 구조 */}
      <section className="mb-16">
        <SectionLabel>기술 구조</SectionLabel>

        <p className="text-sm font-semibold text-gray-900 mb-4">시스템 구조</p>
        <div className="flex flex-col gap-2 mb-4">
          {architectureLayers.map((layer, i) => (
            <div key={layer.title}>
              <div className="border border-gray-100 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-gray-900">
                  {layer.title}
                </span>
                <span className="text-xs text-gray-500 text-right">
                  {layer.desc}
                </span>
              </div>
              {i < architectureLayers.length - 1 && (
                <div className="flex justify-center py-1 text-gray-300 text-sm">
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 leading-relaxed mb-10">
          API Route는 숫자보다 도메인 분리가 중요합니다. products / inventory /
          orders / auth 기준으로 나누고, 채널 호출은 lib/api 어댑터에만 둡니다.
          도메인 테이블 6개 · 배포 Cron 1개(재고) · 외부 채널 2개. 주문은
          Shopify 웹훅, Cafe24는 수동 동기화입니다.
        </p>

        <div className="mb-10">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            상품 등록 Flow
          </p>
          <FlowSteps items={productFlow} />
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Supabase를 내부 기준 데이터로 먼저 저장하고, 외부 채널 생성 결과를
            다시 매핑합니다. 내부 DB를 원본으로 유지하고 외부 채널은 동기화
            대상으로 관리하기 위한 순서입니다.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">
            재고 동기화 Flow
          </p>
          <FlowSteps items={inventoryFlow} />
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Cafe24 실재고 →{" "}
            <code className="text-gray-500">products.stock</code> → Shopify
            순입니다. 관리자 수동 수정도 같은 SSOT를 갱신한 뒤 전 채널에
            반영합니다.
          </p>
        </div>
      </section>

      <hr className="border-gray-100 mb-16" />

      {/* 5. 문제 해결 */}
      <section className="mb-16">
        <SectionLabel>문제 해결</SectionLabel>
        <div className="flex flex-col gap-5">
          {troubleshooting.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl px-5 py-5 ${
                item.highlight
                  ? "border-2 border-gray-900 bg-gray-50"
                  : "border border-gray-100"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {item.highlight && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-900 text-white">
                    핵심 차별점
                  </span>
                )}
                <p className="font-semibold text-gray-900 text-sm">
                  {item.label}
                </p>
              </div>
              {item.highlight && (
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-600">
                  <span className="rounded-lg bg-white border border-gray-200 px-3 py-2">
                    동시 요청 발생
                  </span>
                  <span className="hidden sm:inline text-gray-300">↓</span>
                  <span className="rounded-lg bg-white border border-gray-200 px-3 py-2">
                    refresh_token race condition
                  </span>
                  <span className="hidden sm:inline text-gray-300">↓</span>
                  <span className="rounded-lg bg-white border border-gray-200 px-3 py-2 font-semibold text-gray-900">
                    Promise lock 적용
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {[
                  {
                    tag: "문제",
                    text: item.problem,
                    tagColor: "bg-red-50 text-red-600",
                  },
                  {
                    tag: "원인",
                    text: item.cause,
                    tagColor: "bg-orange-50 text-orange-600",
                  },
                  {
                    tag: "해결",
                    text: item.fix,
                    tagColor: "bg-green-50 text-green-700",
                  },
                ].map(({ tag, text, tagColor }) => (
                  <div key={tag} className="flex gap-3 items-start">
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${tagColor}`}
                    >
                      {tag}
                    </span>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-16" />

      {/* 6. 현재 구현 범위 */}
      <section className="mb-16">
        <SectionLabel>현재 구현 범위</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-xl px-5 py-5">
            <p className="text-[10px] font-semibold text-emerald-700 mb-3">
              완료
            </p>
            <ul className="flex flex-col gap-2 text-sm text-gray-600">
              {[
                "상품 CRUD",
                "Cafe24 / Shopify 연동",
                "재고 일일 동기화 (03:00 UTC)",
                "OAuth 자동 갱신 + Promise lock",
                "Shopify 주문 웹훅",
                "Cafe24 주문 수동 동기화",
                "운영 환경을 고려한 대시보드",
              ].map((text) => (
                <li key={text} className="flex gap-2">
                  <span className="text-gray-300">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-gray-100 rounded-xl px-5 py-5">
            <p className="text-[10px] font-semibold text-gray-400 mb-3">확장</p>
            <ul className="flex flex-col gap-2 text-sm text-gray-600">
              {["Cafe24 주문 웹훅", "쿠팡 / 스마트스토어 (사업자 등록 후)"].map(
                (text) => (
                  <li key={text} className="flex gap-2">
                    <span className="text-gray-300">•</span>
                    <span>{text}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      <hr className="border-gray-100 mb-16" />

      {/* 7. 설계 판단 */}
      <section className="mb-16">
        <SectionLabel>설계 판단</SectionLabel>
        <div className="flex flex-col gap-5">
          {designDecisions.map((item) => (
            <div
              key={item.title}
              className="border border-gray-100 rounded-xl px-5 py-5"
            >
              <p className="font-semibold text-gray-900 text-sm mb-4">
                {item.title}
              </p>
              <div className="flex flex-col gap-3">
                {[
                  {
                    tag: "배경",
                    text: item.background,
                    tagColor: "bg-red-50 text-red-600",
                  },
                  {
                    tag: "고민",
                    text: item.concern,
                    tagColor: "bg-orange-50 text-orange-600",
                  },
                  {
                    tag: "결정",
                    text: item.decision,
                    tagColor: "bg-green-50 text-green-700",
                  },
                ].map(({ tag, text, tagColor }) => (
                  <div key={tag} className="flex gap-3 items-start">
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${tagColor}`}
                    >
                      {tag}
                    </span>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-16" />

      {/* 8. 배운 점 */}
      <section className="mb-16">
        <SectionLabel>이 프로젝트를 통해 얻은 것</SectionLabel>
        <ul className="flex flex-col gap-3">
          {learnings.map((text) => (
            <li
              key={text}
              className="flex gap-3 items-start text-sm text-gray-600 leading-relaxed"
            >
              <span className="text-gray-300 shrink-0">•</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap gap-3">
        {/* <a
          href={DEPLOY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
        >
          Live Demo →
        </a> */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
        >
          GitHub →
        </a>
      </section>
    </main>
  );
}
