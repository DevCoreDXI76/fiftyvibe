# 퇴직소득세 계산기 화면 (Phase 2) — 설계

작성일: 2026-07-27 · 대상: CHECKLIST.md §3 "퇴직소득세 계산기" 나머지 (화면·콘텐츠·SEO)

## 배경

Phase 1(계산 로직: `lib/tax-tables.ts`, `lib/calculators/severance-tax.ts`, `lib/calculators/service-years.ts`)이
완료·병합됐다. 이번 Phase 2는 `/tools/severance-tax` 실제 화면과 콘텐츠, SEO 메타를 만든다.
홈택스 대조는 여전히 보류 상태(D-11)이며, 이 화면도 그 사실을 사용자에게 고지한다(Disclaimer +
설명 콘텐츠 마지막 문단).

## 1. 파일 구조

- `lib/format-currency.ts` — `formatWon`/`parseWonInput` 순수 함수 (신규, 테스트 포함)
- `components/severance-tax-calculator.tsx` — `"use client"` 폼+결과 컴포넌트 (신규)
- `app/tools/severance-tax/page.tsx` — 페이지 셸: metadata, JSON-LD, 콘텐츠, FAQ, 계산기 렌더 (신규)

## 2. `lib/format-currency.ts`

```ts
export function formatWon(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function parseWonInput(value: string): number {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}
```

테스트: `formatWon`(0, 소액, 억 단위), `parseWonInput`(빈 문자열→0, 콤마 섞인 문자열, 숫자 아닌
문자 섞인 입력).

## 3. `components/severance-tax-calculator.tsx`

**입력**
- 퇴직급여 총액: `<input>` (text, inputMode="numeric"), `parseWonInput`으로 원 단위 정수 저장,
  화면엔 `formatWon`(원 단위 없이 콤마만)으로 실시간 표시
- 모드 토글(라디오 2개): "입사일/퇴사일로 계산" / "근속연수 직접 입력"
  - date 모드: `<input type="date">` ×2 → `calculateServiceYears(start, end)`
  - manual 모드: 근속연수 숫자 입력 → 그대로 `serviceYears`로 사용(계산 함수 내부에서 이미
    `Math.max(1, Math.ceil(...))` 정규화되므로 UI에서 추가 정규화 불필요)
- 유효성 검사(Phase 1 리뷰에서 지적된 미검증 갭을 여기서 막음):
  - 퇴직급여 미입력/0 이하 → 에러
  - date 모드: 입사일·퇴사일 미입력, 또는 **퇴사일 < 입사일** → 에러
  - manual 모드: 근속연수 미입력 또는 0 이하 → 에러

**계산**
- "계산하기" 버튼(`<form onSubmit>`으로 Enter도 지원) → `calculateSeveranceTax({ severancePay, serviceYears })`
  호출, 결과를 `{ input: {severancePay, serviceYears}, output: SeveranceTaxResult }` 형태로 state에 저장
- 성공 시 `trackEvent("calculate_click", { tool: "severance-tax" })` 호출 (SPEC §7)

**결과 표시**
- 히어로: `실수령액` (result.output.netAmount, 크게)
- 보조: 총 세금(`severanceTax + localIncomeTax`), 실효세율(`총세금/severancePay*100`, 소수 1자리)
- "계산 과정 보기" 아코디언(라이브러리 없이 버튼+상태로 직접 구현) — 7행 표:
  근속연수공제 → 환산급여 → 환산급여공제 → 과세표준 → 환산산출세액 → 퇴직소득세 → 지방소득세
  (SeveranceTaxResult의 7개 필드를 순서대로, `formatWon`으로 포맷)
- `<Disclaimer />`
- `<AdSlot variant="result" />`
- `<ToolCTA title="일시금 vs 연금 수령, 뭐가 유리할까?" description="..." href={`/tools/lump-vs-pension?amount=${input.severancePay}&years=${input.serviceYears}`} ctaLabel="비교해보기" />`
  (도구 2는 아직 없어 클릭 시 404 — Footer의 privacy/contact 링크와 동일한 forward-reference 패턴,
  §4에서 실제 페이지가 생기면 자동으로 연결됨)

## 4. `app/tools/severance-tax/page.tsx`

**메타데이터**
```ts
export const metadata: Metadata = {
  title: "퇴직소득세 계산기 (2026) — 퇴직금 실수령액 세후 계산 | 피프티바이브",
  description: "퇴직금 실수령액과 세금을 미리 계산해보세요. 근속연수공제부터 지방소득세까지 계산 과정을 단계별로 확인할 수 있습니다.",
};
```

**JSON-LD** (`<script type="application/ld+json">`): `@graph`에 WebApplication + FAQPage(4문항) +
BreadcrumbList(홈 → 퇴직소득세 계산기). 절대 URL은 `https://fiftyvibe.kr` 기준으로 하드코딩
(DNS 연결은 §7에서 진행 예정이지만 메타데이터는 최종 도메인 기준으로 미리 작성).

**본문 구성 순서**: h1 제목 → `<SeveranceTaxCalculator />` → 설명 콘텐츠 앞부분(배경+계산 3단계 문단) →
`<AdSlot variant="content" />` (SPEC §5 "설명 섹션 중간" 요구사항 — 문단 사이에 배치) →
설명 콘텐츠 뒷부분(지방소득세+사용법+법적근거 문단) → FAQ(아래)

## 5. 콘텐츠 (초안 — 운영자 개인 경험담은 추후 별도 문단으로 삽입)

### 설명 콘텐츠 (943자, SPEC 요구 800자 이상 충족)

> 퇴직금을 한 번에 받을 때 부과되는 퇴직소득세는 일반 근로소득세와는 다른 방식으로 계산됩니다.
> 근속연수가 길수록, 그리고 퇴직급여가 근속연수에 비해 과도하게 크지 않을수록 세금 부담이
> 줄어드는 구조인데, 이는 퇴직금을 오랜 기간 일한 대가를 한 번에 정산받는 소득으로 보고
> 누진세율의 충격을 완화하기 위한 장치입니다.
>
> 계산은 크게 세 단계로 나뉩니다. 첫째, 근속연수에 비례한 근속연수공제를 퇴직급여에서 뺍니다.
> 근속연수가 길수록 공제액이 커집니다. 둘째, 남은 금액을 근속연수로 나눈 뒤 12를 곱해
> 환산급여라는 1년치 환산 소득을 만듭니다. 이 환산 과정 때문에 근속연수가 짧을수록(예: 1~2년)
> 환산급여가 급격히 커져서 더 높은 세율 구간이 적용되는 효과가 생깁니다. 짧은 근속을 반복하며
> 퇴직금을 나눠 받는 방식으로 세금을 피하는 것을 막기 위한 설계입니다. 셋째, 환산급여에서 다시
> 환산급여공제를 뺀 과세표준에 일반 소득세와 같은 누진세율을 적용해 세액을 구한 뒤, 다시
> 근속연수 비율만큼 되돌려 최종 퇴직소득세를 산출합니다.
>
> 여기에 퇴직소득세의 10%에 해당하는 지방소득세가 추가로 부과되며, 두 세금을 뺀 나머지가
> 실제로 통장에 들어오는 실수령액입니다.
>
> 이 계산기에 퇴직급여 총액과 근속연수(또는 입사일·퇴사일)를 입력하면 실수령액과 예상 세금을
> 바로 확인할 수 있고, 계산 과정 보기를 펼치면 근속연수공제부터 지방소득세까지 7단계 계산
> 과정을 각각 얼마인지 확인할 수 있습니다. 근속연수가 애매하거나 여러 시나리오를 비교하고
> 싶다면 숫자를 바꿔가며 여러 번 계산해보는 것을 추천합니다.
>
> 이 계산기는 소득세법(§48, §55, §64의4)에 규정된 공식을 그대로 구현했습니다. 다만 세부
> 단수처리(원 단위 반올림·절사 규칙)는 홈택스 모의계산 결과와 최종 대조 중이므로, 정확한
> 금액은 반드시 홈택스 모의계산이나 세무 전문가를 통해 다시 한번 확인하시기 바랍니다.

컴포넌트 코드에는 이 문단들 뒤에 `{/* TODO(운영자): DB→DC 전환 준비 경험담 문단 삽입 예정 */}`
주석을 남겨, 나중에 운영자가 개인 경험 문단을 쉽게 찾아 추가할 수 있게 한다.

### FAQ 4문항

1. **Q. 근속연수는 어떻게 계산하나요?**
   A. 입사일부터 퇴사일까지의 기간을 연 단위로 계산하며, 1년 미만의 기간이 있으면 그 부분은
   1년으로 올려서 계산합니다. 예를 들어 9년 3개월을 근무했다면 근속연수는 10년으로 처리됩니다.

2. **Q. 왜 근속연수가 짧으면 세금이 더 많이 나오나요?**
   A. 계산 과정에서 퇴직급여를 근속연수로 나눈 뒤 12를 곱해 1년치로 환산한 소득(환산급여)을
   구하는 단계가 있습니다. 근속연수가 짧을수록 이 환산급여가 커져서 더 높은 세율 구간이
   적용되기 때문입니다. 짧은 근속을 반복하며 세금을 회피하는 것을 막기 위한 제도적 장치입니다.

3. **Q. 이 계산기 결과와 실제 회사에서 지급하는 금액이 다를 수 있나요?**
   A. 네, 다를 수 있습니다. 이 계산기는 소득세법에 규정된 퇴직소득세 계산 공식을 기준으로
   하지만, 실제 원천징수 시 단수처리(원 단위 반올림·절사) 방식이나 회사의 급여 시스템에 따라
   소액의 차이가 발생할 수 있습니다. 정확한 금액은 반드시 홈택스 모의계산이나 세무 전문가를
   통해 확인하세요.

4. **Q. 퇴직금을 일시금과 연금 중 무엇으로 받는 게 유리한가요?**
   A. 근속연수, 예상 수령 기간, 다른 소득 여부 등에 따라 달라집니다. 일반적으로 연금으로
   나눠 받으면 이연퇴직소득세 감면 혜택이 있어 세금 부담이 줄어드는 경우가 많습니다. 자세한
   비교는 "일시금 vs 연금 수령 비교 계산기"에서 확인하실 수 있습니다.

## 6. 테스트

- `lib/format-currency.test.ts`: `formatWon`(0원, 소액, 억 단위 콤마), `parseWonInput`(빈 문자열,
  콤마 섞인 입력, 숫자 아닌 문자 섞인 입력)
- 계산기 컴포넌트·페이지는 상호작용 UI라 자동 유닛테스트 대신 Playwright로 검증(아래)

## 7. 검증

- `npm test` / `npm run build`
- Playwright: `npm run dev` 기동 → `/tools/severance-tax` 접속 → 퇴직급여·근속연수 입력 →
  계산하기 클릭 → 결과(실수령액) 표시 확인 → 계산 과정 아코디언 펼침 확인 → 잘못된 입력(퇴사일
  < 입사일) 시 에러 메시지 확인 → 콘솔 에러 없음 확인

## 범위 밖

- 도구 2(`/tools/lump-vs-pension`) 실제 페이지 — §4에서 진행, 그 전까지 ToolCTA 링크는 404
- 운영자 개인 경험담 문단 — 코드에 삽입 위치만 표시, 실제 문구는 운영자가 나중에 채움
- 홈택스 대조 — D-11 상태 그대로 유지
