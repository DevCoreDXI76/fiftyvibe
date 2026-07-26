# 공통 기반 (디자인 토큰·레이아웃·공통 컴포넌트·GA4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** fiftyvibe 프로젝트에 브랜드 디자인 토큰, 헤더/푸터 레이아웃, 재사용 공통 컴포넌트(Disclaimer/AdSlot/ToolCTA), GA4 스크립트+이벤트 유틸을 추가해 CHECKLIST.md §2를 완료한다.

**Architecture:** Tailwind v4의 `@theme` CSS 블록으로 색상 토큰을 등록하고, Pretendard는 jsDelivr CDN, JetBrains Mono는 `next/font/google`로 로드한다. `app/layout.tsx`에 Header/Footer/GoogleAnalytics를 항상 렌더링하고, Disclaimer/AdSlot/ToolCTA는 이후 도구 페이지가 개별 import하도록 독립 컴포넌트로만 만든다. GA4는 측정 ID가 없으면 아무것도 렌더링하지 않는 안전한 기본값으로 만든다.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Vitest 4, next/font/google, next/script. 새 npm 패키지 추가 없음.

## Global Constraints

- 서버·DB·외부 API 추가 금지 — 모든 계산/로직은 클라이언트에서 완결 (CLAUDE.md 절대 규칙 D-03)
- localStorage/sessionStorage 사용 금지 — 상태는 React state로만 (CLAUDE.md 절대 규칙 #5)
- 새 npm 패키지 추가 전 정당화 필요 — 이 플랜은 신규 패키지를 추가하지 않는다 (CLAUDE.md 절대 규칙 #6)
- 파일명 kebab-case, 컴포넌트명 PascalCase (CLAUDE.md 코드 컨벤션)
- 디자인 토큰: navy `#0E1A2F` · navy-deep `#080F1E` · amber `#F5A623` · steel `#8FB8E8` · ivory `#F2F6FC` (SPEC §6, CLAUDE.md 브랜드 토큰)
- 본문은 밝은 배경(ivory) + 네이비 텍스트가 기본. 다크(navy)는 헤더·푸터·히어로에만 (SPEC §6)
- Tailwind v4 프로젝트라 `tailwind.config.js`가 없다 — 토큰은 `app/globals.css`의 `@theme` 블록에 등록한다
- 경로 별칭 `@/*` → 프로젝트 루트 (`tsconfig.json` 기존 설정, 그대로 사용)

---

### Task 1: 디자인 토큰 + 폰트 + 루트 메타데이터

**Files:**
- Modify (전체 교체): `app/globals.css`
- Modify (전체 교체): `app/layout.tsx`

**Interfaces:**
- Consumes: 없음 (최초 작업)
- Produces: CSS 커스텀 프로퍼티 `--color-navy`, `--color-navy-deep`, `--color-amber`, `--color-steel`, `--color-ivory` (→ Tailwind 유틸리티 `bg-navy`, `text-navy`, `border-steel` 등으로 이후 모든 태스크에서 사용), CSS 클래스 `.brand-cursor` (Task 2에서 사용), CSS 변수 `--font-jbmono` (JetBrains Mono, Task 2 이후 필요 시 `font-mono` 유틸리티로 사용 가능)

- [ ] **Step 1: `app/globals.css` 전체를 아래 내용으로 교체**

```css
@import "tailwindcss";
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@1.3.9/dist/web/static/pretendard.css");

@theme inline {
  --color-navy: #0e1a2f;
  --color-navy-deep: #080f1e;
  --color-amber: #f5a623;
  --color-steel: #8fb8e8;
  --color-ivory: #f2f6fc;
  --font-sans: "Pretendard", sans-serif;
  --font-mono: var(--font-jbmono);
}

body {
  background: var(--color-ivory);
  color: var(--color-navy);
  font-family: var(--font-sans);
}

.brand-cursor {
  display: inline-block;
  color: var(--color-amber);
  animation: brand-cursor-blink 1s step-end infinite;
}

@keyframes brand-cursor-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-cursor {
    animation: none;
  }
}
```

- [ ] **Step 2: `app/layout.tsx` 전체를 아래 내용으로 교체**

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "피프티바이브 — 퇴직연금 계산 도구",
  description:
    "50세 1인 개발자(피프티바이브)가 만드는 퇴직소득세·연금수령·DB/DC 전환 계산 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jetBrainsMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
```

(Header/Footer/GoogleAnalytics는 아직 렌더링하지 않는다 — Task 2, 3, 8에서 각각 추가한다)

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공 (홈페이지 `app/page.tsx`는 기존 create-next-app 기본 콘텐츠 그대로라 스타일이 아직 어색해 보일 수 있음 — 정상. 홈페이지 실제 콘텐츠는 CHECKLIST §6에서 작업)

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: 브랜드 디자인 토큰 + Pretendard/JetBrains Mono 폰트 설정"
```

---

### Task 2: Header 컴포넌트

**Files:**
- Create: `components/header.tsx`
- Modify: `app/layout.tsx` (Header import + 렌더링 추가)

**Interfaces:**
- Consumes: `.brand-cursor` CSS 클래스 (Task 1), `bg-navy`/`text-ivory` 유틸리티 (Task 1)
- Produces: `export function Header()` — 이후 태스크에서는 사용하지 않음 (layout에만 렌더링됨)

- [ ] **Step 1: `components/header.tsx` 생성**

```tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-navy text-ivory">
      <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          피프티바이브<span className="brand-cursor">▮</span>
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: `app/layout.tsx`에서 `<body>` 내용을 아래로 교체**

교체 전:
```tsx
      <body className="flex min-h-full flex-col">
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
```

교체 후:
```tsx
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
```

그리고 파일 상단 import 목록에 아래 줄 추가 (`"./globals.css";` 다음 줄):
```tsx
import { Header } from "@/components/header";
```

- [ ] **Step 3: 빌드 + 육안 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공

Run: `npm run dev`, 브라우저로 `http://localhost:3000` 접속
Expected: 상단에 네이비 배경 헤더, "피프티바이브" 옆에 앰버색 깜빡이는 "▮" 표시

- [ ] **Step 4: Commit**

```bash
git add components/header.tsx app/layout.tsx
git commit -m "feat: 헤더 컴포넌트(로고타입 + 앰버 커서) 추가"
```

---

### Task 3: Footer 컴포넌트

**Files:**
- Create: `components/footer.tsx`
- Modify: `app/layout.tsx` (Footer import + 렌더링 추가)

**Interfaces:**
- Consumes: `bg-navy-deep`/`text-ivory`/`hover:text-amber` 유틸리티 (Task 1)
- Produces: `export function Footer()` — 이후 태스크에서는 사용하지 않음

- [ ] **Step 1: `components/footer.tsx` 생성**

```tsx
const CHANNEL_LINKS = [
  {
    label: "유튜브",
    href: "https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w",
  },
  { label: "네이버 블로그", href: "https://blog.naver.com/coredxi" },
];

const POLICY_LINKS = [
  { label: "개인정보처리방침", href: "#" },
  { label: "문의", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-navy-deep text-ivory">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:justify-between">
        <nav className="flex gap-4" aria-label="채널 링크">
          {CHANNEL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <nav className="flex gap-4" aria-label="정책 링크">
          {POLICY_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-amber">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: `app/layout.tsx`에서 `<body>` 내용을 아래로 교체**

교체 전:
```tsx
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
```

교체 후:
```tsx
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
```

그리고 `import { Header } from "@/components/header";` 다음 줄에 추가:
```tsx
import { Footer } from "@/components/footer";
```

- [ ] **Step 3: 빌드 + 육안 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공

Run: `npm run dev`, 브라우저로 확인
Expected: 페이지 하단에 진네이비 배경 푸터, 유튜브/네이버 블로그/개인정보처리방침/문의 링크 표시. 유튜브·블로그 링크 클릭 시 새 탭으로 실제 URL 이동 확인

- [ ] **Step 4: Commit**

```bash
git add components/footer.tsx app/layout.tsx
git commit -m "feat: 푸터 컴포넌트(채널·정책 링크) 추가"
```

---

### Task 4: Disclaimer 컴포넌트

**Files:**
- Create: `components/disclaimer.tsx`

**Interfaces:**
- Consumes: `border-steel`/`bg-steel`/`text-navy` 유틸리티 (Task 1)
- Produces: `export function Disclaimer()` — props 없음. 이후 도구 페이지(CHECKLIST §3~)에서 `import { Disclaimer } from "@/components/disclaimer"`로 사용 (CLAUDE.md 절대 규칙 #4: 모든 도구 페이지에 필수 포함)

- [ ] **Step 1: `components/disclaimer.tsx` 생성**

```tsx
export function Disclaimer() {
  return (
    <p className="rounded border border-steel/40 bg-steel/10 p-4 text-sm text-navy">
      본 결과는 참고용이며 법적 효력이 없습니다. 실제 세액·수령액은 세법 개정이나
      개별 상황에 따라 달라질 수 있으므로, 최종 확정 전 홈택스 모의계산 또는 세무
      전문가를 통해 반드시 확인하시기 바랍니다.
    </p>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공 (아직 어디서도 import하지 않으므로 화면 변화는 없음 — 정상)

- [ ] **Step 3: Commit**

```bash
git add components/disclaimer.tsx
git commit -m "feat: Disclaimer 공통 컴포넌트 추가"
```

---

### Task 5: AdSlot 컴포넌트

**Files:**
- Create: `components/ad-slot.tsx`

**Interfaces:**
- Consumes: `border-steel`/`bg-steel`/`text-steel` 유틸리티 (Task 1)
- Produces: `export function AdSlot({ variant }: { variant: "result" | "content" })` — 이후 도구 페이지에서 `<AdSlot variant="result" />` 형태로 사용 (SPEC §5: 도구 결과 하단 1 + 설명 섹션 중간 1)

- [ ] **Step 1: `components/ad-slot.tsx` 생성**

```tsx
type AdSlotVariant = "result" | "content";

const HEIGHT_BY_VARIANT: Record<AdSlotVariant, string> = {
  result: "h-[250px]",
  content: "h-[120px]",
};

export function AdSlot({ variant }: { variant: AdSlotVariant }) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded border border-dashed border-steel/50 bg-steel/5 text-sm text-steel ${HEIGHT_BY_VARIANT[variant]}`}
    >
      광고 영역
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공

- [ ] **Step 3: Commit**

```bash
git add components/ad-slot.tsx
git commit -m "feat: AdSlot 공통 컴포넌트 추가"
```

---

### Task 6: ToolCTA 컴포넌트

**Files:**
- Create: `components/tool-cta.tsx`

**Interfaces:**
- Consumes: `border-steel`/`text-navy`/`text-amber` 유틸리티 (Task 1)
- Produces: `export function ToolCTA({ title, description, href, ctaLabel }: { title: string; description: string; href: string; ctaLabel: string })` — 이후 도구 페이지에서 다음 도구를 안내할 때 사용

- [ ] **Step 1: `components/tool-cta.tsx` 생성**

```tsx
type ToolCTAProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export function ToolCTA({ title, description, href, ctaLabel }: ToolCTAProps) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
    >
      <p className="text-lg font-semibold text-navy">{title}</p>
      <p className="mt-2 text-sm text-navy/70">{description}</p>
      <span className="mt-4 inline-block text-sm font-medium text-amber">
        {ctaLabel} →
      </span>
    </a>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공

- [ ] **Step 3: Commit**

```bash
git add components/tool-cta.tsx
git commit -m "feat: ToolCTA 공통 컴포넌트 추가"
```

---

### Task 7: `lib/analytics.ts` trackEvent 유틸 (TDD)

**Files:**
- Create: `lib/analytics.test.ts`
- Create: `lib/analytics.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `export function trackEvent(name: string, params?: Record<string, unknown>): void` — Task 8의 GoogleAnalytics가 주입하는 전역 `gtag` 함수를 호출. 이후 도구 페이지에서 `calculate_click`, `tool_cross_link`, `guide_to_tool` 이벤트 전송에 재사용 (SPEC §7)

- [ ] **Step 1: 실패하는 테스트 작성 — `lib/analytics.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./analytics";

describe("trackEvent", () => {
  afterEach(() => {
    globalThis.gtag = undefined;
  });

  it("전역 gtag가 있으면 event 이름과 params로 호출한다", () => {
    const gtag = vi.fn();
    globalThis.gtag = gtag;

    trackEvent("calculate_click", { tool: "severance-tax" });

    expect(gtag).toHaveBeenCalledWith("event", "calculate_click", {
      tool: "severance-tax",
    });
  });

  it("전역 gtag가 없으면 예외 없이 아무 일도 하지 않는다", () => {
    expect(() => trackEvent("calculate_click")).not.toThrow();
  });

  it("params를 생략하면 빈 객체로 호출한다", () => {
    const gtag = vi.fn();
    globalThis.gtag = gtag;

    trackEvent("guide_to_tool");

    expect(gtag).toHaveBeenCalledWith("event", "guide_to_tool", {});
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/analytics.test.ts`
Expected: FAIL — `Cannot find module './analytics'` (아직 `lib/analytics.ts`가 없음)

- [ ] **Step 3: 최소 구현 — `lib/analytics.ts` 생성**

```ts
type GtagFunction = (...args: unknown[]) => void;

declare global {
  // eslint-disable-next-line no-var
  var gtag: GtagFunction | undefined;
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof globalThis.gtag !== "function") {
    return;
  }
  globalThis.gtag("event", name, params);
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/analytics.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/analytics.ts lib/analytics.test.ts
git commit -m "feat: GA4 trackEvent 유틸 추가 (테스트 포함)"
```

---

### Task 8: GoogleAnalytics 컴포넌트 + env + layout 연결

**Files:**
- Create: `components/google-analytics.tsx`
- Create: `.env.example`
- Modify: `app/layout.tsx` (GoogleAnalytics import + 렌더링 추가)

**Interfaces:**
- Consumes: `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` (없으면 컴포넌트가 `null` 반환), Task 7의 전역 `gtag` 타입 선언과 동일한 전역 함수를 브라우저에서 실제로 정의함
- Produces: `export function GoogleAnalytics()` — layout에서만 렌더링, 다른 태스크에서는 사용하지 않음

- [ ] **Step 1: `components/google-analytics.tsx` 생성**

```tsx
import Script from "next/script";

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
```

- [ ] **Step 2: `.env.example` 생성**

```
# GA4 측정 ID (선택) — 비워두면 GoogleAnalytics 컴포넌트가 아무것도 렌더링하지 않음
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

- [ ] **Step 3: `app/layout.tsx`에서 `<body>` 내용을 아래로 교체**

교체 전:
```tsx
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
```

교체 후:
```tsx
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <GoogleAnalytics />
      </body>
```

그리고 `import { Footer } from "@/components/footer";` 다음 줄에 추가:
```tsx
import { GoogleAnalytics } from "@/components/google-analytics";
```

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공. `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 설정되어 있지 않으므로 빌드된 HTML에 gtag 스크립트가 포함되지 않아야 정상 (컴포넌트가 `null` 반환)

- [ ] **Step 5: Commit**

```bash
git add components/google-analytics.tsx .env.example app/layout.tsx
git commit -m "feat: GA4 스크립트 컴포넌트 추가 (측정 ID 없으면 no-op)"
```

---

### Task 9: 전체 검증 + CHECKLIST.md §2 갱신

**Files:**
- Modify: `docs/CHECKLIST.md`

**Interfaces:**
- Consumes: Task 1~8에서 만든 모든 파일
- Produces: 없음 (최종 검증 + 문서 갱신)

- [ ] **Step 1: 전체 테스트 실행**

Run: `npm test`
Expected: PASS — `lib/analytics.test.ts` 3개 포함 전체 통과

- [ ] **Step 2: 전체 빌드 실행**

Run: `npm run build`
Expected: 에러 없이 정적 export 빌드 성공

- [ ] **Step 3: 개발 서버 육안 확인**

Run: `npm run dev`, `http://localhost:3000` 접속
Expected:
- 상단: 네이비 헤더 + "피프티바이브" + 깜빡이는 앰버 "▮"
- 하단: 진네이비 푸터, 유튜브/네이버 블로그/개인정보처리방침/문의 링크
- 본문 배경은 밝은 색(ivory 계열), 텍스트는 네이비 계열 (기존 create-next-app 기본 콘텐츠라 완벽히 일치하진 않음 — 홈페이지 실제 콘텐츠는 §6에서 교체 예정이므로 정상)

- [ ] **Step 4: `docs/CHECKLIST.md` §2 항목 체크**

`## 2. 공통 기반 (W1)` 섹션의 5개 항목을 아래처럼 갱신 (날짜는 실제 작업일로):

```markdown
## 2. 공통 기반 (W1)
- [x] tailwind.config 디자인 토큰 등록 (SPEC §6) — Tailwind v4라 app/globals.css @theme로 구현 (07-27)
- [x] 폰트: Pretendard + JetBrains Mono (07-27)
- [x] 레이아웃: 헤더(로고타입+커서), 푸터 (07-27)
- [x] `<Disclaimer />`, `<AdSlot />`, `<ToolCTA />` (07-27)
- [x] GA4 스니펫 + 이벤트 유틸 (07-27, 측정 ID는 아직 미발급 — .env.example에 변수만 준비)
```

- [ ] **Step 5: Commit**

```bash
git add docs/CHECKLIST.md
git commit -m "chore: checklist §2 완료 표시"
```
