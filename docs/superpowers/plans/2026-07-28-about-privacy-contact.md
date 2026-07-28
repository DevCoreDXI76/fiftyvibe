# about / privacy / contact 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SPEC.md §1의 나머지 정적 페이지 3개(`/about`, `/privacy`, `/contact`)를 구현하고, 푸터의 더미 링크(`href="#"`)를 실제 경로로 연결한다.

**Architecture:** 3개의 독립된 Server Component 정적 페이지(계산 로직 없음, 상태 없음) + 기존 `components/footer.tsx`의 링크 배열 수정 1건.

**Tech Stack:** Next.js App Router (Server Component), Tailwind CSS (기존 디자인 토큰), 신규 npm 의존성 없음.

## Global Constraints

- 서버·DB·외부 API 추가 금지 (CLAUDE.md 규칙 1) — 이 작업은 순수 정적 페이지라 해당 없음
- 법인(CoreDXI) 브랜드 비노출 원칙 — about 페이지에 법인명 언급 금지 (설계 문서 §배경)
- 도구 페이지가 아니므로 `<Disclaimer />`/`<AdSlot />` 대상 아님 (CLAUDE.md 규칙 4는 도구
  페이지에만 적용)
- localStorage/sessionStorage 사용 금지 (CLAUDE.md 규칙 5) — 이 페이지들은 상태 자체가 없음
- 새 npm 패키지 추가 전 정당화 필요, 목표는 최소 의존성 (CLAUDE.md 규칙 6) — 신규 패키지 없음
- privacy 페이지의 사업자 정보(책임자명·연락처)와 시행일자는 운영자가 직접 채워 넣을
  자리만 TODO로 비워둔다 — 임의의 값을 지어내지 않는다 (설계 문서 §배경, 사용자 확정 사항)
- 커밋 메시지 접두어: `feat:`, `fix:`, `content:`, `seo:`, 체크리스트 전용 커밋은 `chore:`
  허용(선례: bcc5d13, a5b5085 — 운영자 확정)
- 참조 설계 문서: `docs/superpowers/specs/2026-07-28-about-privacy-contact-design.md`

---

## Task 1: `/about` 페이지

**Files:**
- Create: `app/about/page.tsx`

**Interfaces:**
- Consumes: 없음 (독립 정적 페이지, 다른 태스크의 산출물에 의존하지 않음)
- Produces: 없음 (Task 4의 푸터 링크가 이 라우트(`/about`)를 가리키지만, Next.js는
  `typedRoutes`를 사용하지 않으므로 이 파일이 먼저 존재할 필요는 없음 — 순서 무관하게
  독립적으로 완료 가능)

- [ ] **Step 1: `app/about/page.tsx` 작성**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개 | 피프티바이브",
  description:
    "50세 1인 개발자 피프티바이브가 퇴직연금 계산 도구를 만드는 이유.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "소개 | 피프티바이브",
    description: "50세 1인 개발자 피프티바이브가 퇴직연금 계산 도구를 만드는 이유.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-navy">
      <h1 className="text-2xl font-bold">
        피프티바이브 소개
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <p>
        안녕하세요, 피프티바이브입니다. 50세, IT 대기업에서 부장으로 일하고
        있습니다. 2027년 3월, 회사의 DB형 퇴직연금을 DC형으로 전환할
        예정입니다.
      </p>

      <p>
        퇴직을 준비하면서 가장 먼저 부딪힌 문제는 계산이었습니다. 퇴직금을
        받으면 세금이 얼마나 빠지는지, 일시금과 연금 중 무엇이 유리한지, DB에서
        DC로 전환해도 괜찮은지 — 검색해봐도 단편적인 정보뿐이었습니다. 그래서
        제가 필요한 계산기를 직접 만들기 시작했습니다.
      </p>

      <p>
        피프티바이브는 그 과정에서 만든 계산 도구 모음입니다. 특정 금융상품을
        추천하거나 투자를 권유하지 않습니다. 세법과 계산 공식에 근거한 숫자만
        보여드립니다.
      </p>

      {/* TODO(운영자): 경력, 구체적인 계기 등 추가 에피소드 삽입 가능 */}

      <p>
        도구를 만들고 검토하는 과정은 유튜브와 네이버 블로그에도 기록하고
        있습니다.
      </p>

      <div className="flex gap-4">
        <a
          href="https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-navy underline decoration-amber"
        >
          유튜브 →
        </a>
        <a
          href="https://blog.naver.com/coredxi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-navy underline decoration-amber"
        >
          네이버 블로그 →
        </a>
      </div>
    </div>
  );
}
```

이 페이지에 법인명(CoreDXI 등)을 언급하지 않는다 — 브랜드 비노출 원칙.

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add app/about/page.tsx
git commit -m "content: about 페이지 추가"
```

---

## Task 2: `/privacy` 페이지

**Files:**
- Create: `app/privacy/page.tsx`

**Interfaces:**
- Consumes: 없음
- Produces: 없음 (Task 4의 푸터가 `/privacy`를 가리킴, 순서 무관)

이 페이지는 사업자 정보(성명·연락처)와 시행일자를 운영자가 배포 전 직접 채워 넣어야
한다는 것을 명확히 표시한다 — 실제 값을 임의로 만들어내지 않는다.

- [ ] **Step 1: `app/privacy/page.tsx` 작성**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 피프티바이브",
  description: "피프티바이브 개인정보처리방침 및 쿠키 사용 안내.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "개인정보처리방침 | 피프티바이브",
    description: "피프티바이브 개인정보처리방침 및 쿠키 사용 안내.",
    url: "/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-navy">
      <h1 className="text-2xl font-bold">
        개인정보처리방침
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <p>
        피프티바이브(이하 &ldquo;사이트&rdquo;)는 이용자의 개인정보를 중요하게
        생각하며, 관련 법령을 준수합니다. 본 방침은 사이트 이용에 적용됩니다.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          1. 수집하는 개인정보 항목 및 수집 방법
        </h2>
        <p>
          사이트는 회원가입, 게시판, 문의 폼 등 이용자가 직접 개인정보를
          입력하는 기능을 제공하지 않습니다. 계산기에 입력하는 값(퇴직급여,
          연봉 등)은 이용자의 브라우저 내에서만 계산되며, 서버로 전송되거나
          저장되지 않습니다. localStorage, sessionStorage 등 브라우저 저장소도
          사용하지 않습니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">2. 쿠키(Cookie)의 사용</h2>
        <p>
          사이트는 Google Analytics(GA4)를 통해 방문자 수, 페이지 조회 등
          통계 정보를 수집합니다. 이 과정에서 쿠키가 사용될 수 있으며, 수집되는
          정보는 개인을 식별할 수 없는 형태로 처리됩니다.
        </p>
        <p>
          향후 Google 애드센스 광고가 게재될 경우, Google 및 광고 파트너가
          관심기반 광고 제공을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저
          설정에서 쿠키 저장을 거부할 수 있으며, 이 경우 일부 서비스 이용에
          제한이 있을 수 있습니다. Google의 광고 쿠키 관리는{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-amber"
          >
            Google 광고 설정
          </a>
          에서 가능합니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">3. 개인정보의 보유 및 이용기간</h2>
        <p>
          사이트는 이용자의 개인정보를 별도로 수집·저장하지 않으므로 보유기간이
          존재하지 않습니다. GA4를 통해 수집되는 통계 정보는 Google의 정책에
          따라 처리됩니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">4. 개인정보의 제3자 제공</h2>
        <p>
          사이트는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 GA4,
          애드센스 등 제휴 서비스 이용 과정에서 Google의 개인정보처리방침이
          별도로 적용될 수 있습니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">5. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 브라우저 설정을 통해 쿠키 수집을 거부할 수
          있습니다. 개인정보 관련 문의는 아래 연락처로 하실 수 있습니다.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">6. 개인정보 보호책임자</h2>
        {/* TODO(운영자): 성명, 연락처(이메일 등) 직접 입력 */}
        <p className="text-navy/60">배포 전 운영자 정보로 채워야 합니다.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">7. 고지의 의무</h2>
        <p>
          이 방침의 내용은 법령·정책 변경에 따라 수정될 수 있으며, 변경 시 이
          페이지를 통해 공지합니다.
        </p>
      </section>

      {/* TODO(운영자): 실제 배포일로 시행일자 확정 */}
      <p className="text-sm text-navy/60">시행일자: 배포 시 확정 예정</p>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add app/privacy/page.tsx
git commit -m "content: privacy 페이지 추가 (개인정보처리방침)"
```

---

## Task 3: `/contact` 페이지

**Files:**
- Create: `app/contact/page.tsx`

**Interfaces:**
- Consumes: 없음
- Produces: 없음 (Task 4의 푸터가 `/contact`를 가리킴, 순서 무관)

- [ ] **Step 1: `app/contact/page.tsx` 작성**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의 | 피프티바이브",
  description: "피프티바이브에 문의하는 방법.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "문의 | 피프티바이브",
    description: "피프티바이브에 문의하는 방법.",
    url: "/contact",
    type: "website",
  },
};

const CHANNELS = [
  {
    label: "유튜브",
    description: "제작 과정과 사용법을 영상으로 확인하세요.",
    href: "https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w",
  },
  {
    label: "네이버 블로그",
    description: "더 자세한 글과 후기를 볼 수 있습니다.",
    href: "https://blog.naver.com/coredxi",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-navy">
      <h1 className="text-2xl font-bold">
        문의하기
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <p>
        피프티바이브는 별도의 문의 폼을 운영하지 않습니다. 아래 채널을 통해
        소통하고 있으니 편하게 연락해 주세요.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        {CHANNELS.map((channel) => (
          <a
            key={channel.href}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
          >
            <p className="text-lg font-semibold text-navy">{channel.label}</p>
            <p className="mt-2 text-sm text-navy/70">{channel.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add app/contact/page.tsx
git commit -m "content: contact 페이지 추가"
```

---

## Task 4: 푸터 링크 연결 + 회귀 검증 + 체크리스트 갱신

**Files:**
- Modify: `components/footer.tsx`
- Modify: `docs/CHECKLIST.md`

**Interfaces:**
- Consumes: Task 1~3에서 만든 라우트(`/about`, `/privacy`, `/contact`) — 이 태스크가 실제로
  링크를 연결하고 클릭 가능한지 검증하는 첫 지점
- Produces: 없음 (이 계획의 마지막 태스크)

**Step 1 이전 참고 — 현재 `components/footer.tsx` 전체 내용:**

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

- [ ] **Step 1: `components/footer.tsx` 전체를 다음으로 교체**

```tsx
import Link from "next/link";

const CHANNEL_LINKS = [
  {
    label: "유튜브",
    href: "https://www.youtube.com/channel/UCjhTmstRtldofVqiCG5-r5w",
  },
  { label: "네이버 블로그", href: "https://blog.naver.com/coredxi" },
];

const SITE_LINKS = [
  { label: "소개", href: "/about" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "문의", href: "/contact" },
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
        <nav className="flex gap-4" aria-label="사이트 링크">
          {SITE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-amber">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
```

변경 요약: `POLICY_LINKS` → `SITE_LINKS`로 이름 변경 + `href="#"` 더미를 실제 경로로 교체 +
"소개" 항목 추가, 내부 링크는 `<a>` → `next/link`의 `<Link>`로 교체(외부 `CHANNEL_LINKS`는
`<a target="_blank">` 그대로 유지), `aria-label`은 "정책 링크" → "사이트 링크"로 변경.

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: 에러 없음

- [ ] **Step 3: 정적 빌드로 프리렌더 확인**

Run: `npm run build`
Expected: `Route (app)` 표에 `/about`, `/privacy`, `/contact`가 모두 `○ (Static)`으로 표시,
기존 라우트(`/`, `/tools/*`)도 그대로 유지

- [ ] **Step 4: 기존 테스트 스위트 회귀 확인**

Run: `npm test`
Expected: 기존 46개 테스트 전부 `PASS` (이 계획은 `lib/` 계산 로직을 건드리지 않음)

- [ ] **Step 5: Lint 확인**

Run: `npx eslint .`
Expected: 이 계획에서 만든 파일들(`app/about/page.tsx`, `app/privacy/page.tsx`,
`app/contact/page.tsx`, `components/footer.tsx`)에서 에러 0건. 기존에 알려진 무관한
`components/lump-vs-pension-calculator.tsx:58` 에러는 이 계획 범위 밖이므로 무시.

- [ ] **Step 6: 개발 서버로 링크 동작 수동 확인**

`npm run dev` 실행 후 홈페이지(`/`)에서 시작해 푸터의 "소개", "개인정보처리방침", "문의"
링크를 각각 클릭해 올바른 페이지로 이동하는지 확인. 세 페이지 모두 모바일 뷰포트(375px)에서
텍스트가 읽기 편하게 줄바꿈되는지, privacy 페이지의 TODO 표시(개인정보 보호책임자, 시행일자)
가 눈에 띄게 보이는지 확인. 확인 후 개발 서버 종료.

- [ ] **Step 7: `docs/CHECKLIST.md` 갱신**

`docs/CHECKLIST.md`의 §6에서 다음 두 줄을 변경:

```diff
-- [ ] about (운영자 소개 — 피프티바이브 스토리)
-- [ ] privacy (애드센스 쿠키 고지 포함) / contact
+- [x] about (운영자 소개 — 피프티바이브 스토리) (07-28)
+- [x] privacy (애드센스 쿠키 고지 포함) / contact (07-28, 사업자 정보·시행일자는 운영자가
+  배포 전 직접 채워야 함 — TODO 표시됨)
```

- [ ] **Step 8: 커밋**

```bash
git add components/footer.tsx docs/CHECKLIST.md
git commit -m "chore: 푸터 링크 연결 + about/privacy/contact 체크리스트 완료 표시"
```

---

## 범위 밖 (다음 작업으로 이어짐)

- 가이드 5편(MDX) + `/guide` 라우팅 — 별도 하위 프로젝트, MDX 인프라 구축부터 필요
- privacy 페이지의 실제 사업자 정보·시행일자 — 운영자가 배포 전 직접 입력
- about 페이지 추가 에피소드(경력 등) — 운영자가 원하면 추후 보강
