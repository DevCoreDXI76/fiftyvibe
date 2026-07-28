# 가이드 시스템 (MDX 인프라 + 5편) — 설계

작성일: 2026-07-28 · 대상: CHECKLIST.md §6 나머지 항목 (가이드 5편, 최신 가이드 섹션, 상호 링크)

## 배경

about/privacy/contact까지 완료되어 CHECKLIST §6의 마지막 하위 프로젝트인 가이드 시스템을
구현한다. SPEC.md §8 목록의 5편을 MDX로 작성하고, `/guide` 라우팅과 홈페이지·도구 페이지와의
상호 링크를 연결한다.

운영자 확정 사항:
- 가이드 1편("내가 DC 전환을 결정한 과정")의 서사는 운영자 인터뷰(5개 질문·답변)를 기반으로
  Claude가 문장으로 다듬는다
- 라우팅은 가이드마다 독립 파일(`app/guide/<slug>/page.mdx`)로 구현 — 동적 `[slug]` 라우트나
  frontmatter 파싱 라이브러리 없이 Next.js가 파일을 그대로 라우트로 인식하는 방식

## 1. 파일 구조

**인프라**
- `package.json` — `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`(dependencies), `@types/mdx`
  (devDependencies) 추가
- `next.config.ts` — MDX 지원 설정 (수정)
- `mdx-components.tsx` — 프로젝트 루트, MDX 마크다운 타이포그래피를 사이트 디자인 토큰에 매핑
  (신규)
- `lib/guides.ts` — 가이드 5편의 메타데이터 배열 + 도구별 관련 가이드 매핑 (신규)
- `components/related-guides.tsx` — 도구 페이지 하단에 넣는 "관련 가이드 3링크" 컴포넌트 (신규)

**라우팅**
- `app/guide/layout.tsx` — `/guide`와 `/guide/*` 공통 컨테이너 레이아웃 (신규)
- `app/guide/page.tsx` — 가이드 목록 페이지 (신규)
- `app/guide/db-vs-dc/page.mdx` — 1편 (신규)
- `app/guide/severance-tax-explained/page.mdx` — 2편 (신규)
- `app/guide/lump-vs-pension-guide/page.mdx` — 3편 (신규)
- `app/guide/dc-switch-checklist/page.mdx` — 4편 (신규)
- `app/guide/risk-asset-70/page.mdx` — 5편 (신규)

**연결**
- `app/page.tsx` — "최신 가이드" 섹션 추가 (수정)
- `app/tools/severance-tax/page.tsx` — `<RelatedGuides tool="severance-tax" />` 삽입 (수정)
- `app/tools/lump-vs-pension/page.tsx` — `<RelatedGuides tool="lump-vs-pension" />` 삽입 (수정)
- `app/tools/db-dc/page.tsx` — `<RelatedGuides tool="db-dc" />` 삽입 (수정)
- `docs/CHECKLIST.md` — §6 나머지 항목 완료 표시 (수정)

## 2. 신규 npm 의존성 정당화

콘텐츠 포맷 자체가 MDX(마크다운 안에 리액트 컴포넌트를 섞어 쓰는 포맷)이므로 대체 불가능한
의존성이다. Next.js 공식 MDX 통합 패키지(`@next/mdx`)와 그 피어 의존성(`@mdx-js/loader`,
`@mdx-js/react`)만 추가하며, 별도의 콘텐츠 관리 라이브러리(contentlayer 등)는 쓰지 않는다 —
가이드가 5편(향후 8~10편)뿐이라 파일 기반 라우팅만으로 충분하기 때문이다(YAGNI).

## 3. `next.config.ts` 수정

```ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx", "mdx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
```

## 4. `mdx-components.tsx` (프로젝트 루트)

```tsx
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-8 text-xl font-bold text-navy" {...props} />,
    h3: (props) => <h3 className="mt-6 text-lg font-semibold text-navy" {...props} />,
    p: (props) => <p className="mt-4 leading-relaxed text-navy" {...props} />,
    ul: (props) => <ul className="mt-4 list-disc pl-6 text-navy" {...props} />,
    ol: (props) => <ol className="mt-4 list-decimal pl-6 text-navy" {...props} />,
    li: (props) => <li className="mt-1" {...props} />,
    a: (props) => <a className="underline decoration-amber" {...props} />,
    strong: (props) => <strong className="font-semibold text-navy" {...props} />,
    ...components,
  };
}
```

가이드 본문은 마크다운 `##`/`###`/문단/목록/링크만 쓰면 이 매핑을 통해 사이트 타이포그래피가
자동 적용된다. h1(제목)은 브랜드 커서(▮) 모티프 때문에 마크다운이 아니라 각 `.mdx` 파일에서
JSX로 직접 작성한다(§7 참고).

## 5. `lib/guides.ts`

```ts
export type Guide = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // YYYY-MM-DD
};

export const GUIDES: Guide[] = [
  {
    slug: "db-vs-dc",
    title: "DB형 vs DC형 차이, 그리고 제가 DC 전환을 결정하기까지",
    description: "퇴직연금 DB형과 DC형의 차이, 그리고 제가 전환을 고민하고 결정한 과정.",
    publishedAt: "2026-07-28",
  },
  {
    slug: "severance-tax-explained",
    title: "퇴직소득세 계산 구조를 예시로 이해하기",
    description: "근속연수공제부터 지방소득세까지, 실제 숫자로 따라가 보는 퇴직소득세 계산.",
    publishedAt: "2026-07-28",
  },
  {
    slug: "lump-vs-pension-guide",
    title: "일시금 vs 연금 수령, 감면 70%/60% 규칙 이해하기",
    description: "이연퇴직소득세와 연차별 감면율을 예시로 알아봅니다.",
    publishedAt: "2026-07-28",
  },
  {
    slug: "dc-switch-checklist",
    title: "DC 전환 전 체크리스트 5가지",
    description: "DB에서 DC로 전환하기 전 반드시 확인해야 할 다섯 가지.",
    publishedAt: "2026-07-28",
  },
  {
    slug: "risk-asset-70",
    title: "위험자산 70% 규칙과 안전자산 30%",
    description: "DC/IRP 계좌의 투자 한도 규정을 알아봅니다.",
    publishedAt: "2026-07-28",
  },
];

export const RELATED_GUIDES: Record<string, string[]> = {
  "severance-tax": ["severance-tax-explained", "lump-vs-pension-guide", "db-vs-dc"],
  "lump-vs-pension": ["lump-vs-pension-guide", "severance-tax-explained", "dc-switch-checklist"],
  "db-dc": ["db-vs-dc", "dc-switch-checklist", "risk-asset-70"],
};
```

5편 모두 같은 날짜로 한 번에 발행되므로 `publishedAt`은 정렬 기준이 아니라 표시용이며, 홈페이지
"최신 가이드" 섹션과 각 도구의 "관련 가이드"는 `GUIDES` 배열 순서 / `RELATED_GUIDES` 매핑
순서를 그대로 사용한다(추가 정렬 로직 없음 — YAGNI).

`RELATED_GUIDES`의 매핑 근거: 각 도구의 "다음 단계" 여정(세금 계산 → 수령 방식 비교 → DC 전환
검토)과 자연스럽게 이어지는 가이드를 우선 배치했다.

## 6. `components/related-guides.tsx`

```tsx
import Link from "next/link";
import { GUIDES, RELATED_GUIDES } from "@/lib/guides";

type RelatedGuidesProps = {
  tool: keyof typeof RELATED_GUIDES;
};

export function RelatedGuides({ tool }: RelatedGuidesProps) {
  const slugs = RELATED_GUIDES[tool];
  const guides = slugs
    .map((slug) => GUIDES.find((guide) => guide.slug === slug))
    .filter((guide): guide is (typeof GUIDES)[number] => guide !== undefined);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-navy">관련 가이드</h2>
      <ul className="flex flex-col gap-2">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guide/${guide.slug}`}
              className="text-navy underline decoration-amber"
            >
              {guide.title} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## 7. `app/guide/layout.tsx`

`/guide`와 `/guide/*` 전체에 적용되는 공통 컨테이너. 도구 페이지·about/privacy/contact와 동일한
읽기 폭(`max-w-3xl`)을 재사용해 개별 `.mdx` 파일에서 컨테이너 div를 반복하지 않는다.

```tsx
export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-navy">
      {children}
    </div>
  );
}
```

## 8. `app/guide/page.tsx` (목록 페이지)

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "가이드 | 피프티바이브",
  description: "퇴직연금, 퇴직소득세, DB/DC 전환에 관한 가이드 모음.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "가이드 | 피프티바이브",
    description: "퇴직연금, 퇴직소득세, DB/DC 전환에 관한 가이드 모음.",
    url: "/guide",
    type: "website",
  },
};

export default function GuidePage() {
  return (
    <>
      <h1 className="text-2xl font-bold">
        가이드
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>
      <div className="flex flex-col gap-4">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guide/${guide.slug}`}
            className="rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
          >
            <p className="text-lg font-semibold text-navy">{guide.title}</p>
            <p className="mt-2 text-sm text-navy/70">{guide.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
```

## 9. 가이드 1편 — `app/guide/db-vs-dc/page.mdx`

```mdx
export const metadata = {
  title: "DB형 vs DC형 차이, 그리고 제가 DC 전환을 결정하기까지 | 피프티바이브",
  description: "퇴직연금 DB형과 DC형의 차이, 그리고 제가 전환을 고민하고 결정한 과정.",
  alternates: { canonical: "/guide/db-vs-dc" },
  openGraph: {
    title: "DB형 vs DC형 차이, 그리고 제가 DC 전환을 결정하기까지 | 피프티바이브",
    description: "퇴직연금 DB형과 DC형의 차이, 그리고 제가 전환을 고민하고 결정한 과정.",
    url: "/guide/db-vs-dc",
    type: "article",
  },
};

import { ToolCTA } from "@/components/tool-cta";

<h1 className="text-2xl font-bold">
  DB형 vs DC형 차이, 그리고 제가 DC 전환을 결정하기까지
  <span className="brand-cursor" aria-hidden="true">▮</span>
</h1>

## DB형과 DC형, 무엇이 다른가

퇴직연금 제도에는 크게 두 가지 방식이 있습니다. DB형(확정급여형, Defined Benefit)은 회사가
퇴직연금 적립금을 직접 운용하고, 근로자가 퇴직할 때 "퇴직 직전 평균임금 × 근속연수"라는 정해진
공식에 따라 확정된 금액을 지급하는 방식입니다. 운용 성과가 좋든 나쁘든 근로자가 받는 금액은
변하지 않고, 그 리스크는 회사가 집니다.

반대로 DC형(확정기여형, Defined Contribution)은 회사가 매년 연간 임금총액의 1/12 이상을
근로자 개인의 퇴직연금 계좌에 납입하고, 그 돈을 어떤 상품에 투자할지는 근로자 본인이 정합니다.
운용 성과에 따라 퇴직 시점에 받는 금액이 달라지고, 그 리스크(와 기회)는 근로자가 집니다.

저는 2027년 3월에 회사의 DB형 퇴직연금을 DC형으로 전환할 예정입니다. 이 글은 그 결정을
내리기까지의 과정을 정리한 것입니다.

## 제가 DC 전환을 고민하게 된 계기

요즘은 연봉 인상률이 물가상승률을 따라가지 못하는 경우가 많습니다. DB형은 "퇴직 직전
평균임금 × 근속연수"로 결정되기 때문에, 평균임금 자체가 잘 오르지 않으면 퇴직금이 늘어날
여지도 별로 없습니다. 반면 DC형으로 전환하면 여러 금융상품에 투자해서 적립금을 불릴 기회가
생깁니다. 물론 안정적이지는 않지만, 지금 상황에서는 그 "기회"가 눈에 들어왔습니다.

## 가장 크게 걸렸던 고민

막상 전환을 생각하니 걸리는 부분이 한둘이 아니었습니다. 가장 컸던 건 세 가지였습니다.
원금이 보장되지 않는다는 점, 정말 수익이 날 수 있을지에 대한 확신이 없다는 점, 그리고 어떤
상품을 골라야 할지 감이 안 잡힌다는 점이었습니다. DB형은 그냥 두면 되는데, DC형은 제가 직접
결정하고 책임져야 한다는 게 생각보다 부담스러웠습니다.

## 고민을 풀어나간 방법

일단 직접 계산부터 해봤습니다. 지금 제 연봉과 남은 근속연수, DC로 굴렸을 때 기대할 수 있는
수익률을 이것저것 넣어보면서 DB로 남았을 때와 DC로 전환했을 때 최종적으로 얼마나 차이가
나는지 비교해봤습니다. 이 사이트의 DB/DC 전환 계산기도 그 과정에서 만들게 됐습니다. 계산만으로는
부족해서 주변 동료들에게도 물어보고, 관련 자료도 찾아봤습니다. 사실 지금도 계속 공부하는
중입니다 — 이런 결정에 "이제 다 알았다"는 시점은 없는 것 같습니다.

## 제가 내린 결론

여러 계산과 고민 끝에, 저는 지금이 평균임금이 가장 높아질 수 있는 시기라는 결론을 내렸습니다.
앞으로는 임금피크제가 적용될 수도 있고, 회사 경영 상황이 나빠지면 성과급 같은 인센티브가
줄어들 수도 있습니다. 그렇게 되면 DB형의 기준이 되는 "평균임금"도 같이 낮아질 가능성이
큽니다. 지금 이 시점에 전환하는 것이 제게는 더 유리하다고 판단했습니다.

## 비슷한 고민을 하신다면

제 개인적인 결론이지만, 직장생활 초반에는 DB형이 유리할 수 있다고 생각합니다. 아직 연봉이
계속 오르는 시기라면 회사가 그 상승분을 그대로 반영해서 퇴직금을 불려주는 DB형의 장점이
큽니다. 하지만 연봉 상승이 둔화되는 후반부에 접어들었다면, 오히려 빨리 DC로 갈아타서 그
시점부터 투자를 시작하는 편이 유리할 수 있다고 봅니다.

물론 이건 어디까지나 제 상황과 판단 기준일 뿐, 모든 분께 적용되는 정답은 아닙니다. 근속연수,
남은 근무 기간, 투자 성향에 따라 유불리가 달라지니 반드시 본인의 상황에 맞춰 직접
계산해보시길 권합니다.

<ToolCTA
  title="DB/DC 전환 계산기"
  description="현재 연봉과 잔여 근속연수를 넣으면 DB와 DC 중 어느 쪽이 유리한지 확인할 수 있습니다."
  href="/tools/db-dc"
  ctaLabel="계산해보기"
/>

전환 후 투자 비율을 정할 때 참고할 수 있는 위험자산 70% 규칙은 [이 가이드](/guide/risk-asset-70)에서
다뤘습니다.
```

## 10. 가이드 2편 — `app/guide/severance-tax-explained/page.mdx`

계산 예시는 `lib/calculators/severance-tax.ts`의 실제 계산 로직을 손으로 재현한 값이다
(근속 15년, 퇴직급여 1억 5천만원 — 나누어떨어지는 케이스라 예시로 적합).

```mdx
export const metadata = {
  title: "퇴직소득세 계산 구조를 예시로 이해하기 | 피프티바이브",
  description: "근속연수공제부터 지방소득세까지, 실제 숫자로 따라가 보는 퇴직소득세 계산.",
  alternates: { canonical: "/guide/severance-tax-explained" },
  openGraph: {
    title: "퇴직소득세 계산 구조를 예시로 이해하기 | 피프티바이브",
    description: "근속연수공제부터 지방소득세까지, 실제 숫자로 따라가 보는 퇴직소득세 계산.",
    url: "/guide/severance-tax-explained",
    type: "article",
  },
};

import { ToolCTA } from "@/components/tool-cta";

<h1 className="text-2xl font-bold">
  퇴직소득세 계산 구조를 예시로 이해하기
  <span className="brand-cursor" aria-hidden="true">▮</span>
</h1>

## 퇴직소득세는 왜 이렇게 복잡할까

퇴직금은 수십 년간 일한 대가를 한 번에 받는 소득입니다. 만약 일반 근로소득세처럼 그대로
누진세율을 적용하면, 한 해에 몰린 소득으로 취급돼 세금 부담이 지나치게 커집니다. 그래서
퇴직소득세는 이 금액을 여러 해에 나눠 번 것처럼 "환산"한 뒤 세율을 적용하고, 다시 원래
비율로 되돌리는 방식을 씁니다. 복잡해 보이지만, 이 복잡함 자체가 세금 부담을 줄여주는
장치입니다.

## 계산은 7단계로 이뤄집니다

1. 근속연수공제 — 근속연수에 비례해 퇴직급여에서 먼저 공제
2. 환산급여 — (퇴직급여 − 근속연수공제) ÷ 근속연수 × 12
3. 환산급여공제 — 환산급여 구간별로 추가 공제
4. 과세표준 — 환산급여 − 환산급여공제
5. 환산산출세액 — 과세표준에 일반 소득세 누진세율 적용
6. 퇴직소득세 — 환산산출세액 ÷ 12 × 근속연수 (다시 원래 비율로 환원)
7. 지방소득세 — 퇴직소득세의 10%

## 예시로 따라가보기: 근속 15년, 퇴직급여 1억 5천만원

1. 근속연수공제: 1,500만원 + 250만원 × (15 − 10) = **2,750만원**
2. 환산급여: (1억 5천만원 − 2,750만원) ÷ 15 × 12 = **9,800만원**
3. 환산급여공제: 4,520만원 + (9,800만원 − 7,000만원) × 55% = **6,060만원**
4. 과세표준: 9,800만원 − 6,060만원 = **3,740만원**
5. 환산산출세액: 3,740만원 × 15% − 126만원 = **435만원**
6. 퇴직소득세: 435만원 ÷ 12 × 15 = **5,437,500원**
7. 지방소득세: 5,437,500원 × 10% = **543,750원**

두 세금을 합치면 5,981,250원, 실수령액은 **144,018,750원**입니다. 실효세율로 보면 약 4%
수준입니다.

## 근속연수가 짧으면 왜 세금이 더 많이 나올까

2단계 "환산급여"를 보면, 퇴직급여를 근속연수로 나눈 뒤 다시 12를 곱합니다. 근속연수가
짧을수록 나누는 값이 작아서 환산급여가 급격히 커지고, 더 높은 세율 구간이 적용됩니다.
짧은 근속을 반복하며 퇴직금을 나눠 받는 방식으로 세금을 피하는 것을 막기 위한 설계입니다.

## 직접 계산해보기

본인의 퇴직급여와 근속연수를 넣으면 이 7단계를 자동으로 계산해줍니다.

<ToolCTA
  title="퇴직소득세 계산기"
  description="퇴직급여와 근속연수를 입력하면 실수령액과 세금을 바로 확인할 수 있습니다."
  href="/tools/severance-tax"
  ctaLabel="계산해보기"
/>
```

## 11. 가이드 3편 — `app/guide/lump-vs-pension-guide/page.mdx`

계산 예시는 가이드 2편과 동일한 케이스(근속 15년/1.5억)를 10년 연금으로 수령하는 경우로
이어간다. `lib/calculators/pension-compare.ts`의 실제 로직(연차별 감면율 적용 후 원단위
절사·누적)을 손으로 재현한 값이다.

```mdx
export const metadata = {
  title: "일시금 vs 연금 수령, 감면 70%/60% 규칙 이해하기 | 피프티바이브",
  description: "이연퇴직소득세와 연차별 감면율을 예시로 알아봅니다.",
  alternates: { canonical: "/guide/lump-vs-pension-guide" },
  openGraph: {
    title: "일시금 vs 연금 수령, 감면 70%/60% 규칙 이해하기 | 피프티바이브",
    description: "이연퇴직소득세와 연차별 감면율을 예시로 알아봅니다.",
    url: "/guide/lump-vs-pension-guide",
    type: "article",
  },
};

import { ToolCTA } from "@/components/tool-cta";

<h1 className="text-2xl font-bold">
  일시금 vs 연금 수령, 감면 70%/60% 규칙 이해하기
  <span className="brand-cursor" aria-hidden="true">▮</span>
</h1>

## 왜 연금으로 받으면 세금이 줄어들까

퇴직금을 한 번에(일시금) 받으면 퇴직소득세가 그 자리에서 전액 부과됩니다. 반면 연금계좌로
옮겨 나눠 받으면, 세금 납부 시점 자체가 실제 수령하는 시점까지 미뤄집니다. 이를
"이연퇴직소득세"라고 합니다. 그리고 이렇게 미뤄둔 세금은 실제 수령 연차에 따라 감면된
세율로 부과됩니다 — 국가가 노후 소득을 나눠 쓰도록 유도하기 위한 장치입니다.

## 감면율 규칙: 1~10년차 70%, 11년차부터 60%

연금을 수령하는 첫 10년 동안은 원래 세액의 70%만 부과되고(30% 감면), 11년차부터는 60%만
부과됩니다(40% 감면). 오래 나눠 받을수록, 그리고 늦은 연차에 받을수록 세금이 더 줄어드는
구조입니다.

## 예시로 확인해보기

앞선 가이드에서 계산한 근속 15년, 퇴직급여 1억 5천만원 케이스를 그대로 가져오겠습니다. 이
경우 일시금으로 받으면 퇴직소득세 5,437,500원 + 지방소득세 543,750원, 합계
**5,981,250원**을 냅니다.

같은 퇴직급여를 **10년에 걸쳐 연금으로** 받는다고 가정해보겠습니다. 원래 세액을 10년으로
균등하게 나누면 1년치는 543,750원이고, 10년 모두 1~10년차 구간(70% 적용)에 해당하므로 매년
380,625원(+ 지방소득세 38,062원)만 부과됩니다. 10년 합계는 퇴직소득세 3,806,250원 +
지방소득세 380,620원, 총 **4,186,870원**입니다.

일시금(5,981,250원)과 비교하면 **1,794,380원, 약 30%를 절세**하는 셈입니다. 수령 기간을
11년 이상으로 늘리면 60% 구간이 섞이면서 절세 효과는 더 커집니다.

## 주의할 점

여기서 계산하는 세금은 어디까지나 이연된 "퇴직소득세"입니다. 연금계좌에 있는 동안 발생하는
운용수익에는 별도로 연금소득세(통상 3.3~5.5%)가 부과되며, 이 계산기는 그 부분을 포함하지
않습니다. 운용수익까지 고려한 실제 수령액은 이 계산보다 달라질 수 있습니다.

## 직접 비교해보기

퇴직급여와 근속연수, 원하는 수령 기간을 넣으면 일시금과 연금 각각의 세금을 비교해줍니다.

<ToolCTA
  title="일시금 vs 연금 비교 계산기"
  description="수령 방식에 따른 세금 차이와 절세액을 확인할 수 있습니다."
  href="/tools/lump-vs-pension"
  ctaLabel="비교해보기"
/>
```

## 12. 가이드 4편 — `app/guide/dc-switch-checklist/page.mdx`

```mdx
export const metadata = {
  title: "DC 전환 전 체크리스트 5가지 | 피프티바이브",
  description: "DB에서 DC로 전환하기 전 반드시 확인해야 할 다섯 가지.",
  alternates: { canonical: "/guide/dc-switch-checklist" },
  openGraph: {
    title: "DC 전환 전 체크리스트 5가지 | 피프티바이브",
    description: "DB에서 DC로 전환하기 전 반드시 확인해야 할 다섯 가지.",
    url: "/guide/dc-switch-checklist",
    type: "article",
  },
};

import { ToolCTA } from "@/components/tool-cta";

<h1 className="text-2xl font-bold">
  DC 전환 전 체크리스트 5가지
  <span className="brand-cursor" aria-hidden="true">▮</span>
</h1>

DB에서 DC로 전환하기 전에 확인해두면 좋은 다섯 가지를 정리했습니다. 전환은 한 번 하면
되돌릴 수 없으니, 서두르지 말고 하나씩 짚어보시길 권합니다.

## 1. 잔여 근속연수를 확인하세요

DB와 DC 중 어느 쪽이 유리한지는 앞으로 얼마나 더 일할 예정인지에 따라 크게 달라집니다.
잔여 근속연수가 길수록 DC로 투자할 수 있는 기간도 길어져 상대적으로 유리해지는 경향이
있습니다.

## 2. 과거 근속분은 전환과 무관합니다

DC로 전환해도 이미 DB형으로 쌓아온 과거 근속분은 전환 시점의 가치로 그대로 확정되어
넘어옵니다. 전환 이후 미래 적립분만 새로운 방식(DC)으로 쌓이는 구조라는 점을 알아두면
막연한 손해 걱정을 덜 수 있습니다.

## 3. 본인의 투자 성향을 파악하세요

DC는 운용 성과에 따라 퇴직 시 받는 금액이 달라집니다. 원금 손실 가능성을 감당할 수
있는지, 시장 변동에 마음이 크게 흔들리지는 않는지 스스로 점검해보는 것이 좋습니다.

## 4. 위험자산 70% 규칙을 이해하세요

DC·IRP 계좌는 위험자산(실적배당형 상품)에 적립금의 최대 70%까지만 투자할 수 있고, 나머지
30%는 안전자산(원리금보장형)에 두도록 법으로 정해져 있습니다. 자세한 내용은 아래 가이드를
참고하세요.

## 5. 전환은 되돌릴 수 없다는 점을 기억하세요

DB에서 DC로 전환하면 다시 DB로 되돌아갈 수 없습니다. 계산기로 여러 시나리오를 충분히
비교해보고, 확신이 설 때 전환하시길 권합니다.

<ToolCTA
  title="DB/DC 전환 계산기"
  description="전환 전후 예상 금액을 미리 비교해볼 수 있습니다."
  href="/tools/db-dc"
  ctaLabel="계산해보기"
/>

위험자산 70% 규칙은 [이 가이드](/guide/risk-asset-70)에서 더 자세히 다룹니다.
```

## 13. 가이드 5편 — `app/guide/risk-asset-70/page.mdx`

D-02(특정 금융상품 추천 금지, 절대 규칙) 준수 — 비율 규정만 설명하고 특정 상품·종목명은
전혀 언급하지 않는다.

```mdx
export const metadata = {
  title: "위험자산 70% 규칙과 안전자산 30% | 피프티바이브",
  description: "DC/IRP 계좌의 투자 한도 규정을 알아봅니다.",
  alternates: { canonical: "/guide/risk-asset-70" },
  openGraph: {
    title: "위험자산 70% 규칙과 안전자산 30% | 피프티바이브",
    description: "DC/IRP 계좌의 투자 한도 규정을 알아봅니다.",
    url: "/guide/risk-asset-70",
    type: "article",
  },
};

import { ToolCTA } from "@/components/tool-cta";

<h1 className="text-2xl font-bold">
  위험자산 70% 규칙과 안전자산 30%
  <span className="brand-cursor" aria-hidden="true">▮</span>
</h1>

## DC·IRP 계좌엔 투자 한도가 있습니다

DC형 퇴직연금과 개인형 퇴직연금(IRP) 계좌는 아무 상품에나 자유롭게 투자할 수 있는 게
아닙니다. 근로자퇴직급여보장법 시행령은 원금이 보장되지 않는 실적배당형 상품, 이른바
"위험자산"에는 전체 적립금의 최대 70%까지만 투자하도록 제한하고, 나머지 30% 이상은 원금이
보장되는 "안전자산"에 두도록 정하고 있습니다.

## 왜 이런 규칙이 있을까

퇴직연금은 노후 생활을 위한 자금입니다. 개인이 자유롭게 투자를 결정할 수 있는 DC형의
장점을 살리면서도, 전 재산을 고위험 상품에 몰아넣어 노후자금 전체가 흔들리는 상황을
막기 위한 최소한의 안전장치입니다.

## 위험자산과 안전자산이란

위험자산은 원금 손실 가능성이 있는 실적배당형 상품(주식형 펀드 등)을 말하고, 안전자산은
원리금이 보장되는 상품(예금성 상품, 보험사의 원리금보장형 상품 등)을 말합니다. 이
가이드에서는 특정 상품이나 종목을 추천하지 않습니다 — 어떤 상품을 고를지는 본인의 투자
성향과 목표에 따라 직접 판단하셔야 합니다.

## 실제 적용은 이렇게

예를 들어 적립금이 1억원이라면, 위험자산에는 최대 7,000만원까지만 투자할 수 있고 나머지
3,000만원 이상은 안전자산에 두어야 합니다. 이 한도는 계좌를 운용하는 금융회사 시스템에서
자동으로 관리되는 경우가 많아, 투자자가 직접 비율을 계산해서 지켜야 하는 것은 아닙니다.
다만 본인의 적립금이 지금 어떤 비율로 나뉘어 있는지는 스스로 확인해두는 것이 좋습니다.

## 유의사항

이 글은 제도 이해를 돕기 위한 정보 제공용이며, 투자자문이 아닙니다. 구체적인 상품 선택이나
비중 조절은 반드시 본인의 판단과 책임 하에 결정하시고, 필요하다면 금융 전문가와 상담하시길
권합니다.

<ToolCTA
  title="DB/DC 전환 계산기"
  description="DC 전환을 검토 중이라면 예상 금액부터 비교해보세요."
  href="/tools/db-dc"
  ctaLabel="계산해보기"
/>
```

## 14. `app/page.tsx` 수정 — "최신 가이드" 섹션

기존 도구 카드 그리드(`<section className="px-6 py-12">...`) 바로 아래에 새 섹션을 추가한다.
`GUIDES` 배열의 앞 3개를 노출하고, 전체 목록으로 가는 링크를 둔다.

```tsx
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
// ...(기존 import 유지)

// TOOL_CARDS 아래, export default function Home() 내부의 두 번째 <section> 다음에 추가:

      <section className="py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy">최신 가이드</h2>
            <Link href="/guide" className="text-sm font-medium text-navy underline decoration-amber">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {GUIDES.slice(0, 3).map((guide) => (
              <Link
                key={guide.slug}
                href={`/guide/${guide.slug}`}
                className="rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
              >
                <p className="text-lg font-semibold text-navy">{guide.title}</p>
                <p className="mt-2 text-sm text-navy/70">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
```

`Link`는 현재 `app/page.tsx`에 import돼 있지 않으므로(지금은 `HomeToolCard`만 import) 새로
추가해야 한다. 컨테이너 패턴은 반드시 `<section>`에는 `px-6`을 넣지 않고 안쪽
`mx-auto max-w-5xl ... px-6` 요소 하나에만 패딩을 몰아준다 — 홈페이지 히어로/카드 섹션에서
이미 확립된 정렬 버그 수정 패턴(`px-6`을 `<section>`과 내부 `<div>`에 분산시키면 데스크톱
폭에서 헤더·푸터와 좌우 정렬이 24px 어긋남, 2026-07-28 홈페이지 작업에서 발견·수정됨)을 그대로
따른다.

## 15. 도구 페이지 3곳 수정 — `<RelatedGuides />` 삽입

세 페이지 모두 동일한 위치(마지막 설명 `<section>` 다음, FAQ `<section>` 이전)에 삽입한다.

`app/tools/severance-tax/page.tsx`:
```diff
+import { RelatedGuides } from "@/components/related-guides";
 ...
       </section>

+      <RelatedGuides tool="severance-tax" />
+
       <section className="flex flex-col gap-6">
         <h2 className="text-xl font-bold text-navy">자주 묻는 질문</h2>
```

`app/tools/lump-vs-pension/page.tsx`, `app/tools/db-dc/page.tsx`도 동일한 패턴으로
`<RelatedGuides tool="lump-vs-pension" />`, `<RelatedGuides tool="db-dc" />`를 각각
마지막 설명 섹션과 FAQ 섹션 사이에 삽입한다.

## 16. CHECKLIST.md 갱신

```diff
-- [ ] 가이드 5편 MDX (SPEC §8 목록)
-- [ ] 홈 "최신 가이드" 섹션 추가 (가이드 5편 작성 후, SPEC §1)
-- [ ] 각 가이드 ↔ 도구 상호 링크 확인
-- [ ] 도구 1·2·3(퇴직소득세 계산기, 일시금 vs 연금 비교, DB/DC 전환 계산기) 하단에 관련 가이드 3링크 삽입 (SPEC §1 요구사항 — §3·§4·§5에서 누락, 가이드 작성 후 추가)
+- [x] 가이드 5편 MDX (SPEC §8 목록) (07-28)
+- [x] 홈 "최신 가이드" 섹션 추가 (가이드 5편 작성 후, SPEC §1) (07-28)
+- [x] 각 가이드 ↔ 도구 상호 링크 확인 (07-28, 모든 가이드가 최소 1개 도구로 연결됨)
+- [x] 도구 1·2·3(퇴직소득세 계산기, 일시금 vs 연금 비교, DB/DC 전환 계산기) 하단에 관련 가이드 3링크 삽입 (07-28)
```

## 17. 포함하지 않는 것

- 가이드 8~10편 증량 (PRD Phase 1.5 — 애드센스 신청 전 별도 작업)
- 자산배분 시뮬레이터 (D-05로 Phase 1.5 연기 확정)
- 특정 금융상품·종목 추천 (D-02 절대 규칙)
- frontmatter 자동 파싱, MDX 콘텐츠 관리 라이브러리 (5편뿐이라 불필요 — YAGNI)
- `app/tools/db-dc/page.tsx`와 `app/tools/severance-tax/page.tsx`에 이미 있는
  `{/* TODO(운영자): ... 경험담 문단 삽입 예정 */}` 자리 채우기 — 이번에 받은 인터뷰
  답변으로 채울 수 있지만, 이 계획의 승인된 범위(가이드 시스템)를 벗어나므로 별도 작업으로
  처리한다

## 18. 테스트·검증

- 순수 함수 없음 — `npm test`는 회귀 확인용으로만 실행 (기존 46개 테스트가 그대로 통과해야
  함, 이 작업은 `lib/calculators/*`를 건드리지 않음)
- `npm run build`로 `/guide` + 가이드 5개 라우트가 정적 생성되는지, 기존 라우트가 그대로
  유지되는지 확인
- 가이드 2·3편의 예시 숫자는 이 문서 §10~11에서 실제 계산 함수 로직으로 손계산 검증됨 —
  구현 시 오타 없이 그대로 옮겨적는지 확인
- 구현 후 dev 서버에서: `/guide` 목록 → 가이드 5개 클릭 확인, 각 가이드의 `<ToolCTA />` 클릭
  → 해당 도구로 이동 확인, 홈 "최신 가이드" 섹션 확인, 도구 3개 하단 "관련 가이드" 링크 확인,
  모바일 뷰포트에서 가이드 본문 가독성 확인
