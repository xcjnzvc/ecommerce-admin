import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const features = [
  {
    badge: "상품",
    badgeColor: "bg-gray-100 text-gray-600",
    title: "상품 목록 조회 & 상태 관리",
    desc: "카페24 API로 실시간 상품 목록을 불러와 판매중·품절·판매중지 상태를 한 화면에서 확인합니다. 검색, 상태 필터, 일괄 삭제를 지원합니다.",
  },
  {
    badge: "상품 등록",
    badgeColor: "bg-emerald-50 text-emerald-700",
    title: "식품 카테고리 전용 등록 폼",
    desc: "법정 고시정보, 옵션, 채널별(쿠팡/카페24) 정보를 하나의 폼에서 입력합니다. 제출 시 Supabase 저장과 카페24 등록이 순차적으로 처리되고, 성공한 카페24 상품번호를 다시 Supabase에 기록합니다.",
  },
  {
    badge: "수정 · 삭제",
    badgeColor: "bg-sky-50 text-sky-700",
    title: "상품 수정 & 삭제",
    desc: "등록된 상품을 다시 불러와 수정하면 카페24와 Supabase가 함께 갱신됩니다. 삭제는 카페24 요청이 실패해도 내부 데이터는 정리되도록 처리했습니다.",
  },
  {
    badge: "재고",
    badgeColor: "bg-violet-50 text-violet-700",
    title: "재고 자동 동기화 & 이력 관리",
    desc: "카페24 실재고를 기준으로 매일 자동 동기화합니다. 관리자가 수정한 재고는 카페24와 Shopify에 동시에 반영되며, 동기화 실패는 별도 로그로 관리하고 성공 시 자동 해결 처리합니다.",
  },
  {
    badge: "인증",
    badgeColor: "bg-blue-50 text-blue-700",
    title: "카페24 OAuth 연동 & 토큰 자동 갱신",
    desc: "카페24 OAuth 인증 후 access_token/refresh_token을 Supabase에 저장하고, API 요청마다 만료 여부를 확인해 자동으로 갱신합니다.",
  },
];

const productFlow = [
  {
    step: "01",
    title: "상품 등록",
    desc: "법정 고시정보 포함 폼 작성",
  },
  {
    step: "02",
    title: "Supabase 저장",
    desc: "우리 DB에 원본 데이터 우선 저장",
  },
  {
    step: "03",
    title: "카페24 등록",
    desc: "이미지·카테고리 포함 API 순차 호출",
  },
  {
    step: "04",
    title: "번호 매핑",
    desc: "카페24 상품번호를 Supabase에 재기록",
  },
  {
    step: "05",
    title: "목록 반영",
    desc: "실시간 조회 API로 최신 상태 노출",
  },
];

const inventoryFlow = [
  {
    step: "01",
    title: "카페24 실재고",
    desc: "채널 기준 재고를 조회",
  },
  {
    step: "02",
    title: "자동 동기화(Cron)",
    desc: "매일 자동으로 동기화 실행",
  },
  {
    step: "03",
    title: "Supabase",
    desc: "products.stock에 반영",
  },
  {
    step: "04",
    title: "Shopify 재고 반영",
    desc: "동일 재고를 Shopify에 반영",
  },
  {
    step: "05",
    title: "관리자 수동 수정",
    desc: "어드민에서 재고 조정",
  },
  {
    step: "06",
    title: "전 채널 반영",
    desc: "카페24 + Shopify 동시 반영",
  },
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
          className="flex md:flex-row flex-col items-start md:items-center gap-2 md:gap-2"
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

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 bg-white">
      {/* 뒤로가기 */}
      <div className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Link>
      </div>

      {/* ─── 1. 문제 ─────────────────────────────────── */}
      <section className="mb-20">
        <h1 className="text-4xl font-bold leading-tight mb-5">
          여러 쇼핑몰에 상품을 각각 등록하는
          <br />
          번거로움을 없애기 위한 통합 어드민
        </h1>
        <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
          카페24, 쿠팡, 네이버 등 채널마다 따로 상품을 등록·관리해야 하는
          구조를, 하나의 어드민에서 등록하면 여러 채널에 동시 반영되도록 만들고
          있습니다. 쿠팡·네이버는 테스트 모드 없이 사업자 등록과 실제 판매
          개시가 선행되어야 API 연동이 가능해, 우선 카페24를 실채널로 먼저
          연동했습니다. 다만 카페24 하나만으로는 "여러 채널에 동시 등록"이라는
          핵심 구조를 검증할 수 없어, 테스트 환경 진입이 자유로운 해외 채널인
          Shopify를 두 번째 채널로 붙여 멀티채널 상품 등록뿐 아니라 재고
          동기화 구조까지 먼저 완성했습니다.
        </p>
      </section>

      <hr className="border-gray-100 mb-20" />

      {/* ─── 2. 혼자 책임진 범위 ──────────────────────── */}
      <section className="mb-20">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">
          혼자 책임진 범위
        </p>
        <div className="flex flex-col gap-3">
          {[
            { label: "디자인", desc: "어드민 UI 직접 설계 및 구현" },
            {
              label: "프론트엔드",
              desc: "Next.js 기반 상품 목록/등록·재고 관리 화면, 상태 관리",
            },
            {
              label: "백엔드",
              desc: "Next.js API Routes로 상품 CRUD, 재고 동기화, 자동 동기화(Cron), 동기화 로그까지 구현 (별도 서버 없이 route.ts 기반 경량 백엔드)",
            },
            {
              label: "외부 연동",
              desc: "카페24 OAuth 인증·토큰 자동 갱신, Shopify 재고 반영, 상품 CRUD API 연동",
            },
          ].map((item) => (
            <div key={item.label} className="flex gap-4 items-start">
              <span className="text-xs font-semibold text-gray-400 min-w-[80px] pt-0.5 shrink-0">
                {item.label}
              </span>
              <span className="text-sm text-gray-600 leading-relaxed">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-20" />

      {/* ─── 3. 핵심 흐름 ─────────────────────────────── */}
      <section className="mb-20">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">
          핵심 흐름
        </p>

        <div className="mb-10">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            상품 등록 Flow
          </p>
          <FlowSteps items={productFlow} />
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            외부 채널이 늘어나도 lib/api/ 아래에 어댑터만 추가하면 되도록,
            프론트 → API Routes → 서비스 레이어(cafe24.ts) → 외부 API 순의
            레이어드 구조로 설계했습니다.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">
            재고 동기화 Flow
          </p>
          <FlowSteps items={inventoryFlow} />
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            카페24 실재고를 Single Source of Truth로 두고, 자동 동기화(Cron)가{" "}
            <code className="text-gray-500">products.stock</code>을 갱신한 뒤
            Shopify에 재고를 반영합니다. 관리자 수동 수정도 동일하게 전 채널에
            반영됩니다.
          </p>
        </div>
      </section>

      <hr className="border-gray-100 mb-20" />

      {/* ─── 4. 기능 목록 ────────────────────────── */}
      <section className="mb-20">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">
          기능 목록
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 border border-gray-100 rounded-xl px-5 py-5"
            >
              <span
                className={`self-start text-xs font-semibold px-2 py-1 rounded-full ${item.badgeColor}`}
              >
                {item.badge}
              </span>
              <h3 className="font-semibold text-gray-900 text-base mt-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-20" />

      {/* ─── 5. 설계 판단 ────────────────────────── */}
      <section className="mb-20">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">
          설계 판단
        </p>
        <div className="flex flex-col gap-5">
          <div className="border border-gray-100 rounded-xl px-5 py-5">
            <p className="font-semibold text-gray-900 text-sm mb-4">
              카페24 삭제 실패 시에도 내부 DB는 정리하기로 한 이유
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 bg-red-50 text-red-600">
                  배경
                </span>
                <p className="text-sm text-gray-500 leading-relaxed">
                  상품 삭제는 카페24 API 호출과 Supabase 삭제, 두 단계로
                  이루어진다. 카페24 쪽 요청이 실패하는 경우(이미 삭제됐거나
                  일시적 오류) 두 데이터베이스의 정합성을 어떻게 맞출지 결정해야
                  했다.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 bg-orange-50 text-orange-600">
                  고민
                </span>
                <p className="text-sm text-gray-500 leading-relaxed">
                  카페24 삭제가 실패했을 때 Supabase도 그대로 두면 안전해
                  보이지만, 실제로는 사용자가 어드민에서 삭제 버튼을 눌렀는데
                  목록에 계속 남아있는 것이 더 혼란스러운 상황이라고 판단했다.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 bg-green-50 text-green-700">
                  결정
                </span>
                <p className="text-sm text-gray-500 leading-relaxed">
                  카페24 삭제 요청은 시도하되 실패해도 흐름을 막지 않고,
                  Supabase 데이터는 무조건 정리하도록 했다. 카페24 쪽에 남아있을
                  수 있는 데이터는 이후 별도로 확인할 수 있게 콘솔 로그로
                  남겼다.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl px-5 py-5">
            <p className="font-semibold text-gray-900 text-sm mb-4">
              재고 데이터를 하나의 테이블로 통일하기로 한 이유
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 bg-red-50 text-red-600">
                  배경
                </span>
                <p className="text-sm text-gray-500 leading-relaxed">
                  재고 관리 화면을 먼저 설계하면서 inventory 테이블을 따로
                  만들었다. 창고재고·예약재고·채널재고 등을 분리하려고 했다.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 bg-orange-50 text-orange-600">
                  고민
                </span>
                <p className="text-sm text-gray-500 leading-relaxed">
                  이미 운영 중이던 동기화 크론은 products.stock을 기준으로 돌고
                  있었다. 상품 등록은 inventory에 저장되는데 크론은 products만
                  읽으므로 재고가 항상 0처럼 보였다. 두 저장소가 존재하면 어느
                  쪽이 최신인지 보장할 수도 없었다.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 bg-green-50 text-green-700">
                  결정
                </span>
                <p className="text-sm text-gray-500 leading-relaxed">
                  inventory를 폐기하고 products.stock을 Single Source of Truth로
                  삼기로 했다. 카페24 실재고를 그대로 반영하는 단순한 모델로
                  변경했고, 동기화와 관리자 수정 모두 products.stock 하나만
                  사용하도록 구조를 정리했다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. 기술 선택 이유 ────────────────────────── */}
      <section className="mb-20">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
          기술 선택 이유
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Next.js 안에서 프론트와 경량 백엔드를 함께 구성하고, 외부 채널 연동은
          별도 서비스 레이어로 분리해 확장 가능한 구조를 지향했습니다.
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              tag: "Backend",
              tagColor: "bg-orange-50 text-orange-700",
              name: "Next.js API Routes",
              reason:
                "별도 서버를 두지 않고 app/api/*/route.ts로 경량 백엔드를 구성했다. 소규모 어드민 특성상 빠르게 만들고 Vercel에 그대로 배포할 수 있다는 점을 우선했다.",
            },
            {
              tag: "DB/Auth",
              tagColor: "bg-purple-50 text-purple-700",
              name: "Supabase",
              reason:
                "Postgres와 Auth를 함께 제공해 어드민 로그인과 상품 데이터 저장을 하나의 서비스로 처리했다. 카페24 등록 전 원본 데이터를 먼저 저장해두는 기준점으로도 사용한다.",
            },
            {
              tag: "연동",
              tagColor: "bg-blue-50 text-blue-700",
              name: "axios 인터셉터 기반 토큰 관리",
              reason:
                "카페24 access_token 만료 여부를 매 요청마다 확인하고, 필요할 때만 자동으로 refresh_token으로 갱신하도록 인터셉터에 로직을 위임했다.",
            },
            {
              tag: "설계",
              tagColor: "bg-gray-100 text-gray-600",
              name: "레이어드 아키텍처 (lib/api/)",
              reason:
                "카페24 외 채널이 추가되어도 프론트/API Routes 코드를 건드리지 않고 어댑터만 추가할 수 있도록 서비스 레이어를 분리했다.",
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex gap-4 items-start border border-gray-100 rounded-xl px-5 py-4"
            >
              <div className="shrink-0 pt-0.5">
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full ${item.tagColor}`}
                >
                  {item.tag}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-900">
                  {item.name}
                </span>
                <span className="text-sm text-gray-500 leading-relaxed">
                  {item.reason}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-20" />

      {/* ─── 7. 트러블슈팅 ───────────────────────────── */}
      <section className="mb-20">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">
          트러블슈팅
        </p>
        <div className="flex flex-col gap-5">
          {[
            {
              label: "동시 요청 시 카페24 refresh_token 무효화",
              problem:
                "여러 API 요청이 거의 동시에 들어올 때만 간헐적으로 카페24 인증이 실패했다. 단일 요청으로는 재현되지 않아 원인 파악이 어려웠다.",
              cause:
                "카페24 refresh_token은 1회성이라, 토큰 만료 시점에 요청 두 개가 동시에 들어오면 각 요청이 각자 갱신을 시도한다. 먼저 도착한 요청이 refresh_token을 소비해 새 토큰을 받는 동안, 뒤이어 들어온 요청은 이미 무효화된 refresh_token으로 갱신을 시도해 실패했다.",
              fix: "토큰 갱신 로직을 모듈 스코프의 Promise 변수로 감쌌다. 갱신이 이미 진행 중이면 새로운 갱신을 시작하지 않고, 기존에 진행 중인 Promise의 결과를 그대로 기다리도록 처리했다. 이후 동시 요청이 몰려도 갱신은 한 번만 일어나고, 나머지 요청은 그 결과를 공유하도록 정리했다.",
            },
            {
              label: "카페24 이미지 API의 상대 경로 요구사항",
              problem:
                "이미지 업로드 API와 상품에 이미지를 연결하는 API가 서로 다른 형식을 기대해, 두 API를 그대로 이어붙이면 값이 유효하지 않은 것으로 처리됐다.",
              cause:
                "이미지 업로드 API는 접근 가능한 절대 URL을 반환하지만, 상품에 이미지를 연결하는 API(list_image 등)는 절대 URL이 아닌 서버 내부 상대 경로만 허용한다는 걸 문서만으로는 바로 알기 어려웠다.",
              fix: "정규식으로 업로드 응답에서 호스트를 제외한 상대 경로만 추출해, 상품 이미지 필드에 그 값만 전달하도록 수정했다.",
            },
            {
              label: "동기화 실패 로그가 해결 후에도 남는 구조적 결함",
              problem:
                '카페24 조회가 실패하면 sync_error_log에 오류가 기록되도록 만들어뒀는데, 이후 동기화가 정상화돼도 그 기록을 자동으로 해결 처리하는 코드가 없어서 재고 화면에 "동기화 오류"가 영구히 남을 수 있는 구조였다.',
              cause:
                "실패를 기록하는 로직만 만들고, 성공 시 과거 실패 기록을 되돌리는 로직을 빠뜨렸다.",
              fix: "동기화 성공 분기에서 해당 상품의 미해결(resolved=false) 로그를 찾아 자동으로 resolved 처리하도록 추가했다.",
            },
            {
              label: "inventory 테이블 구조가 동기화 로직과 충돌한 문제",
              problem:
                "상품은 저장되는데 재고만 저장되지 않았고, 동기화 크론이 읽는 값과 등록 시 쓰는 저장소가 서로 달랐다.",
              cause:
                "inventory 테이블을 따로 두었지만 동기화 로직은 products.stock만 읽고 있었다. inventory에는 RLS 정책도 없어 저장 자체가 막히는 증상이 겹쳤다.",
              fix: "RLS 정책만 추가하는 대신, inventory를 제거하고 products.stock을 Single Source of Truth로 통합해 구조 자체를 바로잡았다.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-gray-100 rounded-xl px-5 py-5"
            >
              <p className="font-semibold text-gray-900 text-sm mb-4">
                {item.label}
              </p>
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

      <hr className="border-gray-100 mb-20" />

      {/* ─── 8. 진행 상황 ──────────────────────────────────── */}
      <section className="mb-20">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          진행 상황
        </p>
        <div className="border border-gray-100 rounded-xl px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-gray-900">
              현재 구현 완료
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            상품 조회·등록·수정·삭제와 카페24·Shopify 연동을 구현했습니다.
            카페24 실재고를 기준으로 매일 자동 동기화하며, Shopify에도 동일
            재고를 반영합니다.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            동기화 실패는 로그 테이블에 기록하고, 다음 성공 시 자동 해결
            처리하며, 관리자가 재고를 수정하면 모든 채널에 동시에 반영하고 변경
            이력을 저장하도록 구현했습니다.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            다음 단계는 웹훅 기반 실시간 동기화와 스마트스토어 등 추가 채널
            확장입니다.
          </p>
        </div>
      </section>

      {/* ─── 9. 링크 ──────────────────────────────────── */}
      <section className="flex gap-4">
        <a
          href="https://github.com/xcjnzvc/ecommerce-admin"
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
