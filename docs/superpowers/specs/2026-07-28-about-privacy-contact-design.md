# about / privacy / contact 페이지 — 설계

작성일: 2026-07-28 · 대상: CHECKLIST.md §6 `- [ ] about`, `- [ ] privacy / contact`

## 배경

홈페이지·도구 3종이 완료되어 SPEC.md §1의 나머지 정적 페이지(`/about`, `/privacy`,
`/contact`)를 구현한다. 가이드 5편(MDX)은 별도 하위 프로젝트로 분리했다(운영자 확정 —
MDX 인프라가 아직 없고, 가이드 1편은 운영자의 실제 DC 전환 경험담이 핵심이라 지금 함께
진행할 수 없음).

운영자 확정 사항:
- contact는 서버가 없는 정적 사이트 특성상 문의 폼 대신 유튜브·네이버 블로그 채널 링크로만
  안내
- privacy의 사업자 정보(책임자명·연락처 등 법적 고지 사항)는 운영자가 직접 채워 넣을 자리만
  비워두고, 실제 값은 임의로 기재하지 않음
- about은 CLAUDE.md에 있는 페르소나 정보(50세 IT 대기업 부장, 2027년 3월 DB→DC 전환 예정,
  유튜브/블로그 운영)를 기반으로 초안을 작성하고, 법인(CoreDXI)은 언급하지 않음(D-06/브랜드
  비노출 원칙)

## 1. 파일 구조

- `app/about/page.tsx` — 신규
- `app/privacy/page.tsx` — 신규
- `app/contact/page.tsx` — 신규
- `components/footer.tsx` — 수정 (더미 `href="#"` 링크를 실제 경로로 연결)

세 페이지 모두 계산 로직이 없는 정적 콘텐츠라 `lib/` 대상 순수 함수 테스트 없음. 도구
페이지가 아니므로 `<Disclaimer />`, `<AdSlot />` 미포함(CLAUDE.md 규칙 4는 "도구 페이지"에만
적용).

## 2. `components/footer.tsx` 수정

기존 `POLICY_LINKS`(전부 `href="#"` 더미)를 `SITE_LINKS`로 이름을 바꾸고 실제 경로를
연결한다. 내부 경로이므로 `<a>` 대신 `next/link`의 `<Link>`를 사용한다(다른 내부 링크
컴포넌트 `ToolCTA`/`HomeToolCard`와 동일한 패턴).

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

`CHANNEL_LINKS`는 외부 링크라 그대로 `<a target="_blank">` 유지, `SITE_LINKS`만 내부 라우팅
이라 `<Link>`로 변경한다.

## 3. `app/about/page.tsx`

레이아웃은 도구 페이지와 동일한 읽기 폭(`max-w-3xl`, 밝은 배경, 콘텐츠 섹션 패턴)을
재사용한다.

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

## 4. `app/privacy/page.tsx`

정적 사이트의 실제 데이터 처리 방식(서버 없음, localStorage 미사용, GA4만 사용, 향후
애드센스 예정)에 맞춘 표준 개인정보처리방침 구조. 시행일자와 개인정보 보호책임자 정보는
운영자가 채워 넣도록 TODO로 비워둔다.

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

## 5. `app/contact/page.tsx`

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

## 6. CHECKLIST.md 갱신

구현 완료 후 §6의 두 줄을 완료 표시한다:

```diff
-- [ ] about (운영자 소개 — 피프티바이브 스토리)
-- [ ] privacy (애드센스 쿠키 고지 포함) / contact
+- [x] about (운영자 소개 — 피프티바이브 스토리) (07-28)
+- [x] privacy (애드센스 쿠키 고지 포함) / contact (07-28, 사업자 정보·시행일자는 운영자가
+  배포 전 직접 채워야 함 — TODO 표시됨)
```

## 7. 포함하지 않는 것

- 문의 폼(백엔드 없음, D-03/서버 추가 금지)
- privacy의 실제 사업자 정보·시행일자(운영자 직접 입력 대상)
- 가이드 5편, `/guide` 라우팅 — 별도 하위 프로젝트

## 8. 테스트·검증

- 순수 함수 없음 — `npm test`는 회귀 확인용으로만 실행
- `npm run build`로 3개 신규 라우트가 정적 생성되는지 확인
- 구현 후 dev 서버에서 세 페이지 + 갱신된 푸터 링크를 직접 클릭해 목적지 확인, 모바일
  뷰포트에서 레이아웃 확인
