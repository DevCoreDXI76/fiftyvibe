# 도구 2: 일시금 vs 연금 비교 계산기 — 설계

작성일: 2026-07-27 · 대상: CHECKLIST.md §4 `/tools/lump-vs-pension`

## 배경

도구 1(퇴직소득세 계산기)이 홈택스 실측 대조 게이트를 통과해 §4 착수가 가능해졌다(DECISIONS.md
D-11). SPEC.md §3에 따라 퇴직급여를 일시금으로 받을 때와 연금으로 나눠 받을 때의 세금을 비교하는
계산기를 만든다. 일시금 세금은 도구 1의 `calculateSeveranceTax`를 그대로 재사용한다(CLAUDE.md
DRY 원칙, 세금 로직 이중 관리 금지).

## 1. 파일 구조

- `lib/calculators/pension-compare.ts` — 연금 이연퇴직소득세 계산 순수 함수 (신규, 테스트 포함)
- `components/lump-vs-pension-calculator.tsx` — `"use client"` 폼+결과+차트 컴포넌트 (신규)
- `app/tools/lump-vs-pension/page.tsx` — 페이지 셸 (신규)
- `package.json` — `recharts` 의존성 추가 (SPEC이 사전 승인한 유일한 차트 라이브러리)

## 2. `lib/calculators/pension-compare.ts`

### 계산 로직 (이연퇴직소득세 감면)

세법상 연금으로 수령하면 원래 퇴직소득세를 이연했다가, 실제 수령 연차에 따라 감면된 세율로
부과한다. SPEC.md §3 요구사항대로 아래처럼 단순화한다:

1. **균등분할 가정**: 퇴직급여와 원래 퇴직소득세를 수령기간(`payoutYears`)으로 균등 안분한다.
   (실제로는 연금 재원 운용수익이 섞이지만, 그 부분은 "운용수익분 연금소득세는 별도"로
   명시적으로 범위 밖이다.)
2. **연차별 감면율**: 1~10년차는 안분된 세액의 70%, 11년차부터는 60%만 실제로 부과된다.
3. **지방소득세**: 매 연차 감면된 퇴직소득세의 10%(`TAX_TABLES[2026].localIncomeTaxRate`,
   하드코딩 금지 — CLAUDE.md 규칙 3).
4. **연차별 합산**: 전체 연차의 세액을 더해 "연금 총세금"을 구한다.

**개시 나이(55~70)는 이 계산식에 반영하지 않는다.** 실제 이연퇴직소득세 감면율은 세법상
"수령 연차"에만 연동되며 나이는 무관하다. 나이가 영향을 주는 실제 요소(연금소득세
3.3~5.5%, 10년 초과 수령 시 우대세율 등)는 SPEC이 "운용수익분은 별도"로 명시적으로 범위
밖에 둔 부분이다. 개시 나이는 화면에서 "개시 OO세 → 종료 예상 OO세" 참고 표시로만 쓴다.

### `lib/tax-tables.ts` 추가 (CLAUDE.md 규칙 3 — 계산 상수는 이 파일에서만 관리)

1~10년차/11년차~ 감면율은 세법상 확정된 상수 스케줄이므로, 다른 세율표와 동일하게
`TAX_TABLES`에 구간표로 추가한다(계산 파일에 매직넘버로 하드코딩하지 않음):

```ts
// lib/tax-tables.ts의 TAX_TABLES[2026] 객체에 추가
deferredPensionTaxReduction: [
  { upToYear: 10, rate: 0.7 },
  { upToYear: null, rate: 0.6 },
],
```

### 타입/함수

```ts
import { TAX_TABLES } from "../tax-tables";
import { calculateSeveranceTax } from "./severance-tax";

export type PensionCompareInput = {
  severancePay: number;
  serviceYears: number;
  payoutYears: number; // 수령기간(년) — 10/15/20/직접입력
};

export type YearlyPensionTax = {
  year: number; // 1-based 수령 연차
  reductionRate: number; // 0.7 또는 0.6
  severanceTax: number;
  localIncomeTax: number;
};

export type PensionCompareResult = {
  lumpSum: {
    severanceTax: number;
    localIncomeTax: number;
    totalTax: number;
  };
  pension: {
    yearlyBreakdown: YearlyPensionTax[];
    totalSeveranceTax: number;
    totalLocalIncomeTax: number;
    totalTax: number;
  };
  savings: {
    amount: number; // lumpSum.totalTax - pension.totalTax
    percentage: number; // amount / lumpSum.totalTax * 100
  };
};

function floorWon(value: number): number {
  return Math.floor(value + 1e-6);
}

function reductionRateForYear(year: number): number {
  const table = TAX_TABLES[2026].deferredPensionTaxReduction;
  const bracket = table.find((b) => b.upToYear === null || year <= b.upToYear);
  if (!bracket) {
    throw new Error(`이연퇴직소득세 감면율 구간을 찾을 수 없습니다: ${year}`);
  }
  return bracket.rate;
}

export function calculatePensionCompare(
  input: PensionCompareInput,
): PensionCompareResult {
  const { severancePay, serviceYears, payoutYears } = input;

  const lumpSumResult = calculateSeveranceTax({ severancePay, serviceYears });
  const lumpSum = {
    severanceTax: lumpSumResult.severanceTax,
    localIncomeTax: lumpSumResult.localIncomeTax,
    totalTax: lumpSumResult.severanceTax + lumpSumResult.localIncomeTax,
  };

  const yearlySeveranceTaxShare = lumpSum.severanceTax / payoutYears;
  const localIncomeTaxRate = TAX_TABLES[2026].localIncomeTaxRate;

  const yearlyBreakdown: YearlyPensionTax[] = [];
  for (let year = 1; year <= payoutYears; year++) {
    const reductionRate = reductionRateForYear(year);
    const severanceTax = floorWon(yearlySeveranceTaxShare * reductionRate);
    const localIncomeTax = floorWon(severanceTax * localIncomeTaxRate);
    yearlyBreakdown.push({ year, reductionRate, severanceTax, localIncomeTax });
  }

  const totalSeveranceTax = yearlyBreakdown.reduce(
    (sum, y) => sum + y.severanceTax,
    0,
  );
  const totalLocalIncomeTax = yearlyBreakdown.reduce(
    (sum, y) => sum + y.localIncomeTax,
    0,
  );
  const totalTax = totalSeveranceTax + totalLocalIncomeTax;

  const savingsAmount = lumpSum.totalTax - totalTax;
  // severanceTax가 0원인 입력(퇴직급여가 작아 과세표준이 0 이하)에서 0/0 = NaN을
  // 방지한다.
  const savingsPercentage =
    lumpSum.totalTax === 0 ? 0 : (savingsAmount / lumpSum.totalTax) * 100;

  return {
    lumpSum,
    pension: { yearlyBreakdown, totalSeveranceTax, totalLocalIncomeTax, totalTax },
    savings: { amount: savingsAmount, percentage: savingsPercentage },
  };
}
```

### 테스트 케이스 (손계산 기준 — 홈택스에 연금 비교 시뮬레이터가 없어 실측 대조 불가)

- 기본 케이스: severancePay=100,000,000, serviceYears=11, payoutYears=10 → 도구1 케이스(a)의
  severanceTax=3,492,500 재사용. 모든 연차(1~10)가 70% 감면 구간이므로
  `yearlySeveranceTaxShare = 349,250`, 연차별 `severanceTax = floorWon(349,250*0.7) = 244,475`,
  `localIncomeTax = floorWon(244,475*0.1) = 24,447`. `totalSeveranceTax = 2,444,750`,
  `totalLocalIncomeTax = 244,470`, `totalTax = 2,689,220`. `savings.amount = 3,841,750 - 2,689,220
  = 1,152,530`(지방소득세 포함 lumpSum.totalTax는 3,492,500+349,250=3,841,750).
- 11년차 이상 포함 케이스: payoutYears=15 → 1~10년차 70%, 11~15년차 60% 감면 구간이 섞이는 것을
  확인하는 케이스 (연차별 `reductionRate` 필드로 경계 검증).
- 경계: payoutYears=1 (수령기간 1년, 전액 1년차 70% 감면 — 사실상 즉시 수령과 유사한 극단값)
- `severanceTax=0` 시 division-by-zero 없이 전 연차 0원 (severancePay가 매우 작아 세액 0인
  경우 대비 — 도구 1에서 이미 발생 가능한 값이므로 방어)

## 3. 쿼리 파라미터 수신

도구 1의 `ToolCTA`가 이미 `/tools/lump-vs-pension?amount=<severancePay>&years=<serviceYears>`
형태로 링크를 보낸다(components/severance-tax-calculator.tsx:261). 이 페이지는:

- `"use client"` 컴포넌트 내부에서 `useSearchParams()`로 `amount`/`years` 읽기
- Next.js는 `useSearchParams()`를 쓰는 컴포넌트를 `<Suspense>`로 감싸야 정적 export 빌드가
  통과하므로, `page.tsx`(서버 컴포넌트)에서 `<Suspense><LumpVsPensionCalculator /></Suspense>`로
  감싼다
- 쿼리로 들어온 값은 폼의 **초기값**으로만 쓰고 수정 가능하게 유지(직접 URL 방문 시 값이
  없을 수 있으므로 방어)

## 4. `components/lump-vs-pension-calculator.tsx`

**입력**
- 퇴직급여 총액 / 근속연수: 도구 1과 동일한 `formatWon`/`parseWonInput` 패턴, 쿼리 초기값
- 수령기간: 라디오 3개(10/15/20년) + "직접입력"(숫자, 1~40년 범위 검증)
- 개시 나이: number input, 55~70 범위 검증(벗어나면 에러 메시지)

**유효성 검사**
- 퇴직급여 0 이하 → 에러
- 근속연수 0 이하 → 에러
- 수령기간 미입력 또는 1 미만/40 초과(직접입력 시) → 에러
- 개시 나이 55~70 범위 밖 → 에러

**계산**
- "비교하기" 버튼 → `calculatePensionCompare({severancePay, serviceYears, payoutYears})` 호출
- 성공 시 `trackEvent("calculate_click", { tool: "lump-vs-pension" })`

**결과 표시**
- 운용수익 고지문(눈에 띄게, 결과 상단): "이 비교는 이연퇴직소득세 기준이며, 연금 운용수익에
  대한 연금소득세(3.3~5.5%)는 포함하지 않습니다."
- recharts `BarChart`(2개 막대: 일시금 총세금 vs 연금 총세금)
- 절세액: 원 단위 + `savings.percentage.toFixed(1)`%
- "개시 OO세 → 종료 예상 OO세"(개시 나이 + payoutYears) 참고 표시
- 연차별 표(아코디언): 연차 / 감면율(%) / 퇴직소득세 / 지방소득세 / 소계
- `<Disclaimer />`
- `<AdSlot variant="result" />`
- `<ToolCTA title="퇴직 후 DB형 vs DC형, 어떤 게 유리할까?" ... href="/tools/db-dc?..." />` —
  도구 3(§5, 아직 없음)으로의 forward-reference. 도구 1→2 패턴과 동일하게 §5 완료 전까지는
  404이며, 이는 이미 승인된 패턴(도구 1 화면 설계 문서 참고)

**recharts 사용 범위**: `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`만
사용. 커스텀 애니메이션·복잡한 옵션 없이 최소 구성.

## 5. `app/tools/lump-vs-pension/page.tsx`

도구 1 페이지와 동일한 구조 — metadata(canonical `/tools/lump-vs-pension`, OG), JSON-LD
(WebApplication+FAQPage+BreadcrumbList), 본문 콘텐츠 2단(중간에 `<AdSlot variant="content">`),
FAQ 4문항.

**title**: `퇴직금 일시금 vs 연금 수령 세금 비교 계산기 | 피프티바이브` (SPEC.md §3 명시)

### 콘텐츠 초안 (800자 이상)

> 퇴직금을 일시금으로 한 번에 받을지, 연금으로 나눠 받을지는 세금 측면에서 큰 차이를 만듭니다.
> 퇴직급여를 연금계좌에 넣고 나눠 받으면 원래 부과됐을 퇴직소득세를 즉시 내지 않고 이연했다가,
> 실제 수령하는 시점에 감면된 세율로 나눠 냅니다. 연금 수령 1년차부터 10년차까지는 원래
> 세액의 70%만, 11년차부터는 60%만 부과되므로, 오래 나눠 받을수록 유리한 구조입니다.
>
> 이 계산기는 도구 1(퇴직소득세 계산기)에서 넘어온 퇴직급여와 근속연수를 그대로 받아, 일시금으로
> 받았을 때의 총세금과 선택한 수령기간(10·15·20년 또는 직접 입력) 동안 연금으로 나눠 받았을
> 때의 총세금을 비교해 보여줍니다. 수령기간이 길수록, 그리고 11년차 이후 구간이 포함될수록
> 절세 효과가 커지는 경향이 있습니다.
>
> 다만 이 비교는 이연된 퇴직소득세만을 기준으로 합니다. 실제로 연금계좌에 퇴직급여를 넣어두면
> 운용 수익이 발생하고, 이 운용수익 부분에는 별도로 연금소득세(3.3~5.5%, 나이와 수령 기간에
> 따라 차등)가 부과됩니다. 이 계산기는 그 운용수익분 세금은 포함하지 않으므로, 실제로 받게 될
> 세후 금액은 여기서 보여주는 절세액보다 적을 수 있습니다.
>
> 일시금과 연금 중 어느 쪽이 유리한지는 근속연수, 예상 수령 기간, 다른 소득과의 합산 여부,
> 자금이 당장 필요한지 등 개인 상황에 따라 달라집니다. 이 계산기는 세금 측면의 참고 자료로만
> 활용하고, 실제 결정 전에는 세무 전문가와 상담하시기 바랍니다.

### FAQ 4문항

1. **Q. 이연퇴직소득세가 뭔가요?**
   A. 퇴직금을 일시금으로 받으면 즉시 부과되는 퇴직소득세를, 연금계좌로 받으면 실제 수령
   시점까지 미뤄두는 것을 말합니다. 미뤄둔 세금은 실제 수령 연차에 따라 감면된 세율(1~10년차
   70%, 11년차부터 60%)로 나눠 부과됩니다.
2. **Q. 왜 오래 나눠 받을수록 세금이 줄어드나요?**
   A. 감면율이 연차가 지날수록 유리해지는 구조이기 때문입니다(11년차부터 40% 감면). 또한 이연된
   세액을 여러 해에 걸쳐 나눠 내면서 매 연차 감면 혜택을 받기 때문에, 수령기간이 길수록 전체
   감면 효과가 커집니다.
3. **Q. 연금으로 받으면 세금이 전혀 없나요?**
   A. 아닙니다. 이연퇴직소득세(이 계산기가 비교하는 부분) 외에, 연금계좌 운용수익에 대한 별도의
   연금소득세(3.3~5.5%)가 부과됩니다. 이 계산기는 운용수익분은 포함하지 않은 참고용 비교입니다.
4. **Q. 수령기간은 어떻게 정하나요?**
   A. 10·15·20년 중 선택하거나 직접 입력할 수 있습니다. 실제로는 연금 상품 약관이나 개인 자금
   계획에 따라 수령기간을 정하게 되며, 이 계산기는 각 선택지별 세금 차이를 미리 가늠해보는
   용도입니다.

## 6. 테스트

- `lib/calculators/pension-compare.test.ts`: 위 §2의 손계산 케이스(기본/11년차 경계 포함/1년/
  세액 0원) + 감면율 경계 검증(정확히 10년차=70%, 11년차=60%)
- 계산기 컴포넌트·페이지는 상호작용 UI라 Playwright로 검증(아래)

## 7. 검증

- `npm test` / `npm run build` (recharts 추가 후 정적 export 빌드 정상 확인 필수 — client
  component 내부에서만 사용되는지 확인)
- Playwright: `npm run dev` → `/tools/severance-tax`에서 계산 후 "비교해보기" 클릭 →
  `/tools/lump-vs-pension`으로 쿼리 파라미터와 함께 이동하는지 확인 → 폼에 값이 미리 채워져
  있는지 확인 → 수령기간 선택 후 비교하기 클릭 → 차트·절세액·연차별 표 렌더링 확인 → 콘솔
  에러 없음 확인

## 범위 밖

- 도구 3(`/tools/db-dc`) 실제 페이지 — §5에서 진행, 그 전까지 이 페이지의 ToolCTA 링크는 404
  (도구 1→2와 동일한 forward-reference 패턴)
- 홈택스 등 정부 시뮬레이터를 통한 실측 대조 — 홈택스에 연금 비교 시뮬레이터가 없어 대조 불가.
  손계산(도구 1의 이미 검증된 severanceTax 값 기반)으로만 검증하며, 이 사실을 페이지 콘텐츠
  마지막 문단에 고지
- 연금 운용수익분 연금소득세(3.3~5.5%) 계산 — SPEC이 명시적으로 범위 밖으로 규정
