# 홈페이지 — 설계

작성일: 2026-07-28 · 대상: CHECKLIST.md §6 `/` (홈)

## 배경

도구 1·2·3(퇴직소득세, 일시금 vs 연금, DB/DC 전환)이 모두 완료되어, `app/page.tsx`의
create-next-app 기본 템플릿을 실제 홈페이지로 교체한다. SPEC.md §1 요구사항("브랜드 소개 +
도구 3종 카드 + 최신 가이드")을 기반으로 하되, 가이드 5편이 아직 작성 전이므로 "최신 가이드"
섹션은 이번 범위에서 제외한다(운영자 확정 — 가이드 작성 후 별도 작업으로 추가).

추가로 운영자가 명시한 원칙:
- **모바일 우선**: 접속자 대부분이 모바일일 것으로 예상 — 반응형을 기본 설계에서부터 고려
- **비전문가 대상**: 용어·계산식 디테일을 숨기고 필요 시에만 옵션으로 노출
- **전연령 친화**: 직관적이고 심플한 UI/UX

홈 자체에는 계산식이나 전문용어가 들어가지 않으므로(그건 도구 페이지의 "계산 과정 보기"
아코디언 영역), 이 원칙은 주로 ①반응형 레이아웃, ②쉬운 문구, ③충분한 폰트 크기·대비로
구현한다.

## 1. 파일 구조

- `app/page.tsx` — 전면 교체 (Server Component, 정적)
- `components/home-tool-card.tsx` — 신규, 도구 카드 3개용
- 신규 npm 의존성 없음 (아이콘은 인라인 SVG로 직접 작성)

## 2. 히어로 섹션

다크 네이비 배경(`bg-navy text-ivory`), SPEC §6에서 다크가 허용되는 영역(헤더·히어로·푸터)에
해당. `app/page.tsx` 최상단에 위치.

```
피프티바이브▮
퇴직금, 세금 떼면 얼마 남을까

저도 2027년 3월 DB에서 DC로 전환합니다.
그 과정에 필요했던 계산기를 직접 만들었습니다.

숫자만 입력하면 1분 안에 끝나요.
```

- h1: 브랜드명 + 헤드라인, `brand-cursor` 앰버 블록 커서 포함 (기존 헤더/도구 페이지 h1과
  동일한 시그니처 패턴)
- 반응형 폰트: 모바일 `text-3xl` → `sm:text-4xl` → `lg:text-5xl`
- 서브카피 2문단: (1) 운영자 실경험(E-E-A-T) (2) 안심 문구("숫자만 입력하면 1분 안에
  끝나요") — 진입 장벽을 낮추는 목적
- 패딩: 모바일에서 좌우 여백 충분히 확보(`px-6`), 상하 패딩은 `py-16 sm:py-24`

## 3. 도구 카드 섹션

밝은 배경(`bg-ivory`, body 기본값 그대로), 히어로 아래.

```
grid grid-cols-1 sm:grid-cols-3 gap-4
```

- 모바일: 세로 1열 스택 (터치 스크롤 자연스러움)
- `sm:`(640px) 이상부터 3열 그리드로 전환

카드 3개, 여정 순서(SPEC/PRD의 "세금 계산 → 수령 방식 비교 → DC 전환 검토" 흐름)대로 배치:

| 순서 | 아이콘 | 제목 | 설명 | href |
|---|---|---|---|---|
| ① | 계산기 라인 아이콘 | 퇴직소득세 계산기 | 퇴직금 실수령액이 궁금하다면 | `/tools/severance-tax` |
| ② | 저울 라인 아이콘 | 일시금 vs 연금 비교 | 어떻게 받을지 고민된다면 | `/tools/lump-vs-pension` |
| ③ | 전환 화살표 라인 아이콘 | DB/DC 전환 계산기 | DC 전환을 검토 중이라면 | `/tools/db-dc` |

카드 설명 문구는 전문용어 없이 "상황·결과 중심"으로 작성(이미 위 표 반영) — 비전문가가
읽고 바로 자신에게 해당하는 카드를 고를 수 있도록.

## 4. `components/home-tool-card.tsx`

```tsx
"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type HomeToolCardProps = {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
};

export function HomeToolCard({ step, icon, title, description, href }: HomeToolCardProps) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent("tool_cross_link", { from: "home", to: href })}
      className="flex flex-col gap-3 rounded-lg border border-steel/30 bg-white p-6 transition hover:border-amber hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-ivory">
          {step}
        </span>
        {icon}
      </div>
      <p className="text-lg font-semibold text-navy">{title}</p>
      <p className="text-sm text-navy/70">{description}</p>
    </Link>
  );
}
```

- 기존 `<ToolCTA />`(도구 페이지 하단, 단일 카드용)와 시각 톤은 맞추되 별도 컴포넌트로
  분리 — `ToolCTA`는 "다음 도구 1개 유도"용, `HomeToolCard`는 "3개 중 선택"용으로 목적이
  달라 props 형태(step/icon 유무)가 다르다. 억지로 공유 컴포넌트화하지 않는다(YAGNI).
- 터치 영역: 카드 전체가 `<Link>`이므로 모바일에서 탭하기 충분히 넓음. `p-6`로 패딩 확보.
- 아이콘 3종은 `app/page.tsx` 내부에 인라인 SVG(24x24, `stroke-navy`, `strokeWidth=1.5`)로
  정의해 각 카드에 전달 — 별도 아이콘 파일/라이브러리 없이 최소 의존성 원칙 유지.

## 5. `app/page.tsx` 메타데이터

```ts
export const metadata: Metadata = {
  title: "피프티바이브 — 퇴직연금 계산 도구",
  description:
    "50세 1인 개발자가 만드는 퇴직소득세·일시금 vs 연금·DB/DC 전환 계산 도구. 숫자만 입력하면 1분 안에 결과를 확인할 수 있습니다.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "피프티바이브 — 퇴직연금 계산 도구",
    description:
      "50세 1인 개발자가 만드는 퇴직소득세·일시금 vs 연금·DB/DC 전환 계산 도구.",
    url: "/",
    type: "website",
  },
};
```

`layout.tsx`의 root metadata와 내용은 겹치지만, SPEC §7 "canonical, OG 전 페이지" 요구사항에
맞춰 페이지 레벨에도 명시적으로 선언한다(다른 도구 페이지들과 동일 패턴).

## 6. 접근성·반응형 체크리스트

- 본문 최소 폰트 `text-sm`(14px) 이상만 사용, 핵심 텍스트는 `text-base`(16px) 이상
- 네이비(#0E1A2F) on 아이보리(#F2F6FC), 아이보리 on 네이비 모두 WCAG AA 대비 충분(구현 후
  Lighthouse 접근성 점수로 최종 확인 — CHECKLIST §7 항목과 함께 처리)
- 호버 전용 인터랙션 없음 — 카드 강조 효과(`hover:border-amber`)는 부가적 시각 효과일 뿐,
  탭 자체는 호버 없이도 100% 동작
- 앰버 블록 커서 애니메이션은 기존 `prefers-reduced-motion` 규칙(globals.css) 그대로 적용

## 7. 포함하지 않는 것

- `<Disclaimer />`, `<AdSlot />` — 홈은 도구 페이지가 아니므로 SPEC §2~4/CLAUDE.md 규칙 4의
  대상이 아님
- "최신 가이드" 섹션 — 가이드 5편 작성 후 별도 작업으로 추가(CHECKLIST §6에 후속 항목으로
  이미 존재)
- 신규 npm 패키지(아이콘 라이브러리 등)

## 8. 테스트·검증

- 정적 마크업 + 클릭 이벤트 트래킹뿐이라 `lib/calculators` 같은 순수 함수 단위 테스트 대상
  없음 — `npm test`는 기존 스위트가 그대로 통과하는지만 확인
- `npm run build`로 정적 export 정상 생성 확인
- 구현 후 dev 서버에서 모바일 뷰포트(375px 등)로 직접 확인: 카드 1열 스택, 히어로 텍스트
  줄바꿈, 터치 영역, 데스크톱 폭(1280px)에서 3열 그리드 전환 확인
- Lighthouse 모바일 90+ 확인은 CHECKLIST §7(배포·검수 단계)에서 사이트 전체 기준으로 처리
