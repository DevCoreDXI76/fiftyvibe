# 공통 기반 (디자인 토큰 · 레이아웃 · 공통 컴포넌트 · GA4) — 설계

작성일: 2026-07-27 · 대상: CHECKLIST.md §2 "공통 기반 (W1)"

## 배경

§1(개발 환경)까지 완료되어 Next.js App Router + Tailwind v4 스캐폴드가 준비됐다.
이 스펙은 모든 도구 페이지가 공유할 디자인 토큰, 헤더/푸터 레이아웃, 재사용 공통
컴포넌트, GA4 연동 기반을 만드는 범위를 다룬다. 실제 도구 페이지(§3~)는 범위 밖이다.

## 전제: Tailwind v4 설정 방식

create-next-app이 Tailwind v4로 스캐폴딩되어 `tailwind.config.js`가 존재하지 않는다.
토큰 등록은 `app/globals.css`의 `@theme` 블록으로 한다 (v3의 `tailwind.config.js` extend와
동등한 역할). CHECKLIST.md 문구는 이 프로젝트에서 `@theme` 방식으로 해석한다.

## 1. 디자인 토큰 (`app/globals.css`)

```css
@theme inline {
  --color-navy: #0E1A2F;
  --color-navy-deep: #080F1E;
  --color-amber: #F5A623;
  --color-steel: #8FB8E8;
  --color-ivory: #F2F6FC;
  --font-sans: var(--font-pretendard);
  --font-mono: var(--font-jbmono);
}
```

기존 Geist 기반 `--color-background`/`--color-foreground`/`--font-geist-*` 토큰은 제거하고
위 5색 + 2폰트 변수로 교체한다. 본문 기본 배경은 ivory, 텍스트는 navy로 하고, 다크 배경
(헤더/푸터/히어로)에서만 navy 배경 + ivory 텍스트를 명시적으로 준다 (SPEC §6).

## 2. 폰트

- **Pretendard**: jsDelivr CDN `@font-face` (`@import url(...) `또는 `<link>`), `font-display: swap`.
  `--font-pretendard` CSS 변수에 연결.
- **JetBrains Mono**: `next/font/google`로 로드 (추가 npm 의존성 없이 Next가 자동 self-host).
  `app/layout.tsx`에서 `variable: "--font-jbmono"`로 선언.

## 3. 레이아웃 컴포넌트 (`app/layout.tsx`에 항상 포함)

### `components/header.tsx`
- 네이비(`bg-navy`) 배경, "피프티바이브" 로고타입 + 앰버 커서 블록(▮)
- 커서는 `globals.css`의 `.brand-cursor` 클래스 재사용 (아래) — blink 애니메이션,
  `@media (prefers-reduced-motion: reduce)`에서 애니메이션 비활성화(고정 표시)

### `components/footer.tsx`
- 네이비 배경, 채널 링크 2개 + 정책 링크 2개
  - 유튜브: `https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w`
  - 네이버 블로그: `https://blog.naver.com/coredxi`
  - privacy, contact — 실제 페이지가 아직 없으므로 `href="#"` placeholder로 두고,
    §6에서 `/privacy`, `/contact` 페이지를 만들 때 실제 경로로 교체한다.

### `.brand-cursor` (globals.css)
- `app/layout.tsx`가 아니라 `globals.css`에 전역 유틸리티 클래스로 정의해, 헤더뿐 아니라
  이후 도구 페이지 h1(SPEC §6 "제목 뒤 앰버 커서 블록")에서도 재사용한다.

## 4. 공통 컴포넌트 (레이아웃에는 안 넣음 — 도구 페이지에서 개별 import)

### `components/disclaimer.tsx`
- props 없음, SPEC §5 고정 문구("본 결과는 참고용이며 법적 효력이 없습니다...") 출력.
- CLAUDE.md 절대 규칙 #4: 모든 도구 페이지가 반드시 이 컴포넌트를 포함해야 함 (강제는
  코드 레벨이 아니라 §3 이후 각 도구 페이지 작성 시 사람/AI가 체크).

### `components/ad-slot.tsx`
- Props: `variant: "result" | "content"` — 높이를 다르게 고정(레이아웃 시프트 방지).
- 애드센스 승인 전이므로 점선 테두리 placeholder 박스만 렌더링.

### `components/tool-cta.tsx`
- Props: `{ title: string; description: string; href: string; ctaLabel: string }`
- 범용 카드. 실제 문구/링크는 각 도구 페이지에서 채운다.

## 5. GA4

- `.env.example` (git 추적): `NEXT_PUBLIC_GA_MEASUREMENT_ID=`
- `components/google-analytics.tsx`: `next/script`로 `gtag.js` 삽입.
  `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`가 비어있으면 아무것도 렌더링하지 않음(no-op).
  `app/layout.tsx`에 항상 포함 — ID가 없는 동안은 안전하게 아무 일도 안 함.
- `lib/analytics.ts`: `trackEvent(name: string, params?: Record<string, unknown>)`
  - `window.gtag`가 있으면 호출, 없으면(SSR/테스트/ID 미설정) 조용히 무시.
  - SPEC §7 이벤트(`calculate_click`, `tool_cross_link`, `guide_to_tool`)는 이후 도구
    페이지에서 이 함수를 호출하는 방식으로 재사용.

## 6. 테스트

- `lib/analytics.ts`는 순수 함수라 `lib/analytics.test.ts`에 vitest 유닛 테스트 작성:
  - `window.gtag`가 정의된 경우 올바른 인자로 호출되는지
  - `window.gtag`가 없는 경우 예외 없이 조용히 반환하는지
- 컴포넌트(Header/Footer/Disclaimer/AdSlot/ToolCTA/GoogleAnalytics)는 프레젠테이셔널이라
  자동 테스트 대신 `npm run dev` 육안 확인 + `npm run build` 정적 export 성공으로 검증.

## 범위 밖 (이번 스펙에서 하지 않는 것)

- `/privacy`, `/contact` 실제 페이지 내용 (§6에서 진행)
- 실제 GA4 측정 ID 발급·주입 (아직 미발급 — 값 비운 채로 안전하게 통과하도록만 구현)
- 도구 페이지에서 Disclaimer/AdSlot/ToolCTA/trackEvent 실제 사용 (§3~5에서 진행)
