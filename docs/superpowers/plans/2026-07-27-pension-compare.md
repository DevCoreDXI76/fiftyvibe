# 도구 2: 일시금 vs 연금 비교 계산기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/tools/lump-vs-pension` 화면(입력 폼·비교 차트·연차별 표), 설명 콘텐츠·FAQ, SEO 메타/JSON-LD를 구현해 CHECKLIST.md §4를 완료한다.

**Architecture:** `lib/tax-tables.ts`에 이연퇴직소득세 감면율 구간표 추가 → `lib/calculators/pension-compare.ts`(순수 함수, 도구 1의 `calculateSeveranceTax` 재사용) → `components/lump-vs-pension-calculator.tsx`(클라이언트 폼+결과+recharts 차트, `useSearchParams`로 도구 1 값 수신) → `app/tools/lump-vs-pension/page.tsx`(서버 컴포넌트 셸: metadata·JSON-LD·콘텐츠·FAQ, `<Suspense>`로 계산기 감싸 렌더). 상태는 전부 React state, 서버·DB·localStorage 없음.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Vitest, recharts(신규 — SPEC이 사전 승인한 유일한 차트 라이브러리).

## Global Constraints

- 서버·DB·외부 API 추가 금지, localStorage/sessionStorage 금지 — 상태는 React state로만 (CLAUDE.md #1, #5)
- 특정 금융상품 추천 금지 (CLAUDE.md #2) — 이 도구는 세금 비교만 하며 상품 추천 문구를 넣지 않는다
- 모든 도구 페이지에 `<Disclaimer />` 포함 필수 (CLAUDE.md #4)
- 계산 상수(이연퇴직소득세 감면율 포함)는 `lib/tax-tables.ts`에서만 관리 — 컴포넌트나 계산 함수에 매직넘버 하드코딩 금지 (CLAUDE.md #3)
- 신규 npm 패키지는 `recharts` 하나만 허용(SPEC이 사전 승인) — 그 외 패키지 추가 금지 (CLAUDE.md #6)
- 파일명 kebab-case, 컴포넌트명 PascalCase, 금액은 내부 원 단위 정수, 표시 시에만 콤마 포맷
- 일시금 세금은 반드시 `calculateSeveranceTax`(`lib/calculators/severance-tax.ts`)를 재사용 — 세금 로직을 이중으로 구현하지 않는다 (DRY, SPEC.md §3)
- 개시 나이(55~70)는 이연퇴직소득세 감면 계산식에 반영하지 않는다 — 실제 세법상 감면율은 "수령 연차"에만 연동되고 나이는 무관하며, 나이가 영향을 주는 부분(연금소득세 3.3~5.5%)은 SPEC이 명시적으로 범위 밖에 둠. 화면에는 참고 표시(개시/종료 예상 나이)로만 사용
- 도구 3(`/tools/db-dc`)는 아직 없음 — 이 페이지의 `ToolCTA`가 그 경로로 링크해도 정상(§5에서 해결됨, 도구 1→2와 동일한 forward-reference 패턴)
- 재사용할 기존 산출물: `calculateSeveranceTax`(`lib/calculators/severance-tax.ts`), `formatWon`/`parseWonInput`(`lib/format-currency.ts`), `trackEvent`(`lib/analytics.ts`), `Disclaimer`/`AdSlot`/`ToolCTA`(`components/`)
- 설계 문서: `docs/superpowers/specs/2026-07-27-pension-compare-design.md`

---

### Task 1: `lib/tax-tables.ts` 확장 + `lib/calculators/pension-compare.ts`

**Files:**
- Modify: `lib/tax-tables.ts`
- Create: `lib/calculators/pension-compare.ts`
- Test: `lib/calculators/pension-compare.test.ts`

**Interfaces:**
- Consumes: `TAX_TABLES`(`lib/tax-tables.ts`), `calculateSeveranceTax`(`lib/calculators/severance-tax.ts`)
- Produces: `export function calculatePensionCompare(input: PensionCompareInput): PensionCompareResult`, `export type PensionCompareInput`, `export type PensionCompareResult`, `export type YearlyPensionTax` — Task 2에서 사용

- [ ] **Step 1: `lib/tax-tables.ts`에 이연퇴직소득세 감면율 구간표 추가**

`TAX_TABLES[2026]` 객체의 `localIncomeTaxRate: 0.1,` 줄 바로 뒤에 추가:

```ts
    localIncomeTaxRate: 0.1,
    deferredPensionTaxReduction: [
      { upToYear: 10, rate: 0.7 },
      { upToYear: null, rate: 0.6 },
    ],
```

- [ ] **Step 2: 실패하는 테스트 작성 — `lib/calculators/pension-compare.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { calculatePensionCompare } from "./pension-compare";

describe("calculatePensionCompare", () => {
  it("모든 연차가 1~10년차 구간인 경우 (100,000,000원/11년, 10년 수령)", () => {
    const result = calculatePensionCompare({
      severancePay: 100_000_000,
      serviceYears: 11,
      payoutYears: 10,
    });

    // lumpSum: 도구 1의 홈택스 실측 대조 케이스 (a) 재사용값
    expect(result.lumpSum.severanceTax).toBe(3_492_500);
    expect(result.lumpSum.localIncomeTax).toBe(349_250);
    expect(result.lumpSum.totalTax).toBe(3_841_750);

    expect(result.pension.yearlyBreakdown).toHaveLength(10);
    expect(result.pension.yearlyBreakdown[0]).toEqual({
      year: 1,
      reductionRate: 0.7,
      severanceTax: 244_475,
      localIncomeTax: 24_447,
    });
    expect(result.pension.totalSeveranceTax).toBe(2_444_750);
    expect(result.pension.totalLocalIncomeTax).toBe(244_470);
    expect(result.pension.totalTax).toBe(2_689_220);

    expect(result.savings.amount).toBe(1_152_530);
    expect(result.savings.percentage).toBeCloseTo(30.00013, 4);
  });

  it("11년차 이상 구간이 섞이는 경우 (100,000,000원/11년, 15년 수령) — 감면율 경계 확인", () => {
    const result = calculatePensionCompare({
      severancePay: 100_000_000,
      serviceYears: 11,
      payoutYears: 15,
    });

    expect(result.pension.yearlyBreakdown).toHaveLength(15);
    expect(result.pension.yearlyBreakdown[9].reductionRate).toBe(0.7); // 10년차
    expect(result.pension.yearlyBreakdown[10].reductionRate).toBe(0.6); // 11년차
  });

  it("수령기간 1년 — 전액 1년차(70% 감면)만 적용되며 절세율은 정확히 30%", () => {
    const result = calculatePensionCompare({
      severancePay: 50_000_000,
      serviceYears: 6,
      payoutYears: 1,
    });

    // lumpSum: 도구 1의 홈택스 실측 대조 케이스 (c) 재사용값
    expect(result.lumpSum.totalTax).toBe(1_947_000);
    expect(result.pension.totalTax).toBe(1_362_900);
    expect(result.savings.amount).toBe(584_100);
    expect(result.savings.percentage).toBeCloseTo(30, 5);
  });

  it("퇴직소득세가 0원인 경우 0으로 나누지 않고 절세율도 0을 반환한다", () => {
    const result = calculatePensionCompare({
      severancePay: 5_000_000,
      serviceYears: 20,
      payoutYears: 10,
    });

    expect(result.lumpSum.totalTax).toBe(0);
    expect(result.pension.totalTax).toBe(0);
    expect(
      result.pension.yearlyBreakdown.every(
        (y) => y.severanceTax === 0 && y.localIncomeTax === 0,
      ),
    ).toBe(true);
    expect(result.savings.amount).toBe(0);
    expect(result.savings.percentage).toBe(0);
    expect(Number.isNaN(result.savings.percentage)).toBe(false);
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/calculators/pension-compare.test.ts`
Expected: FAIL — `Cannot find module './pension-compare'`

- [ ] **Step 4: `lib/calculators/pension-compare.ts` 생성**

```ts
import { TAX_TABLES } from "../tax-tables";
import { calculateSeveranceTax } from "./severance-tax";

export type PensionCompareInput = {
  severancePay: number;
  serviceYears: number;
  payoutYears: number;
};

export type YearlyPensionTax = {
  year: number;
  reductionRate: number;
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
    amount: number;
    percentage: number;
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

  // 균등분할 가정(SPEC.md §3): 원래 퇴직소득세를 수령기간으로 균등 안분한 뒤,
  // 연차별 감면율(1~10년차 70%, 11년차~ 60%)을 적용한다.
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
  // severanceTax가 0원인 입력(과세표준이 0 이하)에서 0/0 = NaN을 방지한다.
  const savingsPercentage =
    lumpSum.totalTax === 0 ? 0 : (savingsAmount / lumpSum.totalTax) * 100;

  return {
    lumpSum,
    pension: {
      yearlyBreakdown,
      totalSeveranceTax,
      totalLocalIncomeTax,
      totalTax,
    },
    savings: { amount: savingsAmount, percentage: savingsPercentage },
  };
}
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/calculators/pension-compare.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: 전체 테스트 스위트 실행(회귀 확인)**

Run: `npm test`
Expected: PASS — 기존 테스트 전부 통과 + 신규 4개 추가

- [ ] **Step 7: Commit**

```bash
git add lib/tax-tables.ts lib/calculators/pension-compare.ts lib/calculators/pension-compare.test.ts
git commit -m "feat: 이연퇴직소득세 비교 계산 로직(calculatePensionCompare) 추가"
```

---

### Task 2: `components/lump-vs-pension-calculator.tsx`

**Files:**
- Modify: `package.json`, `package-lock.json` (recharts 의존성 추가)
- Create: `components/lump-vs-pension-calculator.tsx`

**Interfaces:**
- Consumes: `calculatePensionCompare`(Task 1), `formatWon`/`parseWonInput`(`@/lib/format-currency`), `trackEvent`(`@/lib/analytics`), `Disclaimer`/`AdSlot`/`ToolCTA`(`@/components/*`), `useSearchParams`(`next/navigation`), recharts(`Bar`, `BarChart`, `CartesianGrid`, `ResponsiveContainer`, `Tooltip`, `XAxis`, `YAxis`)
- Produces: `export function LumpVsPensionCalculator()` — Task 3에서 `/tools/lump-vs-pension` 페이지가 `<Suspense>`로 감싸 렌더 (이 컴포넌트는 `useSearchParams`를 쓰므로 Suspense 경계 안에서만 렌더 가능)

- [ ] **Step 1: recharts 설치**

Run: `npm install recharts`
Expected: `package.json`의 `dependencies`에 `recharts` 추가됨

- [ ] **Step 2: `components/lump-vs-pension-calculator.tsx` 생성**

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculatePensionCompare } from "@/lib/calculators/pension-compare";
import { formatWon, parseWonInput } from "@/lib/format-currency";
import { trackEvent } from "@/lib/analytics";
import { Disclaimer } from "@/components/disclaimer";
import { AdSlot } from "@/components/ad-slot";
import { ToolCTA } from "@/components/tool-cta";

type PayoutYearsOption = "10" | "15" | "20" | "custom";

type PensionCompareOutput = ReturnType<typeof calculatePensionCompare>;

type CalculationState = {
  input: {
    severancePay: number;
    serviceYears: number;
    payoutYears: number;
    startAge: number;
  };
  output: PensionCompareOutput;
};

const MIN_PAYOUT_YEARS = 1;
const MAX_PAYOUT_YEARS = 40;
const MIN_START_AGE = 55;
const MAX_START_AGE = 70;

export function LumpVsPensionCalculator() {
  const searchParams = useSearchParams();

  const [severancePayInput, setSeverancePayInput] = useState(
    searchParams.get("amount")?.replace(/[^0-9]/g, "") ?? "",
  );
  const [serviceYearsInput, setServiceYearsInput] = useState(
    searchParams.get("years") ?? "",
  );
  const [payoutYearsOption, setPayoutYearsOption] =
    useState<PayoutYearsOption>("10");
  const [customPayoutYears, setCustomPayoutYears] = useState("");
  const [startAgeInput, setStartAgeInput] = useState("55");
  const [error, setError] = useState("");
  const [calculation, setCalculation] = useState<CalculationState | null>(
    null,
  );
  const [accordionOpen, setAccordionOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const severancePay = parseWonInput(severancePayInput);
    if (severancePay <= 0) {
      setError("퇴직급여 총액을 입력해주세요.");
      setCalculation(null);
      return;
    }

    const serviceYears = Number(serviceYearsInput);
    if (
      !serviceYearsInput ||
      Number.isNaN(serviceYears) ||
      serviceYears <= 0
    ) {
      setError("근속연수를 입력해주세요.");
      setCalculation(null);
      return;
    }

    const payoutYears =
      payoutYearsOption === "custom"
        ? Number(customPayoutYears)
        : Number(payoutYearsOption);
    if (
      payoutYearsOption === "custom" &&
      (!customPayoutYears || Number.isNaN(payoutYears))
    ) {
      setError("수령기간을 입력해주세요.");
      setCalculation(null);
      return;
    }
    if (payoutYears < MIN_PAYOUT_YEARS || payoutYears > MAX_PAYOUT_YEARS) {
      setError(
        `수령기간은 ${MIN_PAYOUT_YEARS}~${MAX_PAYOUT_YEARS}년 사이로 입력해주세요.`,
      );
      setCalculation(null);
      return;
    }

    const startAge = Number(startAgeInput);
    if (
      !startAgeInput ||
      Number.isNaN(startAge) ||
      startAge < MIN_START_AGE ||
      startAge > MAX_START_AGE
    ) {
      setError(
        `개시 나이는 ${MIN_START_AGE}~${MAX_START_AGE}세 사이로 입력해주세요.`,
      );
      setCalculation(null);
      return;
    }

    setError("");
    const output = calculatePensionCompare({
      severancePay,
      serviceYears,
      payoutYears,
    });
    setCalculation({
      input: { severancePay, serviceYears, payoutYears, startAge },
      output,
    });
    trackEvent("calculate_click", { tool: "lump-vs-pension" });
  };

  const chartData = calculation
    ? [
        { name: "일시금", 총세금: calculation.output.lumpSum.totalTax },
        { name: "연금", 총세금: calculation.output.pension.totalTax },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-steel/30 bg-white p-6"
      >
        <div>
          <label
            htmlFor="severancePay"
            className="mb-1 block text-sm font-medium text-navy"
          >
            퇴직급여 총액 (원)
          </label>
          <input
            id="severancePay"
            type="text"
            inputMode="numeric"
            value={
              severancePayInput
                ? Number(severancePayInput).toLocaleString("ko-KR")
                : ""
            }
            onChange={(event) => {
              setSeverancePayInput(event.target.value.replace(/[^0-9]/g, ""));
              setCalculation(null);
            }}
            placeholder="예: 100,000,000"
            className="w-full rounded border border-steel/40 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="serviceYears"
            className="mb-1 block text-sm font-medium text-navy"
          >
            근속연수 (년)
          </label>
          <input
            id="serviceYears"
            type="number"
            min="1"
            value={serviceYearsInput}
            onChange={(event) => {
              setServiceYearsInput(event.target.value);
              setCalculation(null);
            }}
            className="w-full rounded border border-steel/40 px-3 py-2"
          />
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-navy">수령기간</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {(["10", "15", "20"] as const).map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payoutYears"
                  checked={payoutYearsOption === option}
                  onChange={() => {
                    setPayoutYearsOption(option);
                    setCalculation(null);
                  }}
                />
                {option}년
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payoutYears"
                checked={payoutYearsOption === "custom"}
                onChange={() => {
                  setPayoutYearsOption("custom");
                  setCalculation(null);
                }}
              />
              직접입력
            </label>
          </div>
          {payoutYearsOption === "custom" && (
            <input
              type="number"
              min={MIN_PAYOUT_YEARS}
              max={MAX_PAYOUT_YEARS}
              value={customPayoutYears}
              onChange={(event) => {
                setCustomPayoutYears(event.target.value);
                setCalculation(null);
              }}
              placeholder="예: 25"
              className="mt-2 w-full rounded border border-steel/40 px-3 py-2"
            />
          )}
        </div>

        <div>
          <label
            htmlFor="startAge"
            className="mb-1 block text-sm font-medium text-navy"
          >
            연금 개시 나이 (55~70세)
          </label>
          <input
            id="startAge"
            type="number"
            min={MIN_START_AGE}
            max={MAX_START_AGE}
            value={startAgeInput}
            onChange={(event) => {
              setStartAgeInput(event.target.value);
              setCalculation(null);
            }}
            className="w-full rounded border border-steel/40 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded bg-navy px-4 py-2 font-medium text-ivory hover:bg-navy-deep"
        >
          비교하기
        </button>
      </form>

      {calculation && (
        <div className="flex flex-col gap-4">
          <p className="rounded border border-steel/40 bg-steel/10 p-4 text-sm text-navy">
            이 비교는 이연퇴직소득세 기준입니다. 연금계좌 운용수익에 대한
            연금소득세(3.3~5.5%)는 별도로 부과되며 이 계산에는 포함되지
            않았습니다.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value: number) =>
                    `${(value / 10_000).toLocaleString("ko-KR")}만`
                  }
                />
                <Tooltip formatter={(value: number) => formatWon(value)} />
                <Bar dataKey="총세금" fill="#0E1A2F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <p className="text-sm text-navy/70">절세액</p>
            <p className="text-4xl font-bold text-navy">
              {formatWon(calculation.output.savings.amount)}
            </p>
            <p className="mt-1 text-sm text-navy/70">
              일시금 대비 {calculation.output.savings.percentage.toFixed(1)}%
              절감
            </p>
            <p className="mt-1 text-xs text-navy/50">
              연금 개시 {calculation.input.startAge}세 → 수령 종료 예상{" "}
              {calculation.input.startAge + calculation.input.payoutYears}세
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setAccordionOpen((open) => !open)}
              className="text-sm font-medium text-navy underline decoration-amber"
            >
              연차별 세금 보기 {accordionOpen ? "▲" : "▼"}
            </button>
            {accordionOpen && (
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-steel/40 text-left text-navy/70">
                    <th className="py-2">연차</th>
                    <th className="py-2 text-right">감면율</th>
                    <th className="py-2 text-right">퇴직소득세</th>
                    <th className="py-2 text-right">지방소득세</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.output.pension.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="border-b border-steel/20">
                      <td className="py-2 text-navy/70">{row.year}년차</td>
                      <td className="py-2 text-right text-navy">
                        {(row.reductionRate * 100).toFixed(0)}%
                      </td>
                      <td className="py-2 text-right text-navy">
                        {formatWon(row.severanceTax)}
                      </td>
                      <td className="py-2 text-right text-navy">
                        {formatWon(row.localIncomeTax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <AdSlot variant="result" />
          <ToolCTA
            title="DB형이 유리할까, DC형이 유리할까?"
            description="퇴직연금 제도 유형에 따라서도 유불리가 달라집니다."
            href={`/tools/db-dc?amount=${calculation.input.severancePay}&years=${calculation.input.serviceYears}`}
            ctaLabel="비교해보기"
          />
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공 (아직 어디서도 import하지 않으므로 화면 변화는 없음 — 정상, Task 3에서 페이지에 렌더)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json components/lump-vs-pension-calculator.tsx
git commit -m "feat: 일시금 vs 연금 비교 폼+차트+결과 컴포넌트 추가"
```

---

### Task 3: `app/tools/lump-vs-pension/page.tsx`

**Files:**
- Create: `app/tools/lump-vs-pension/page.tsx`

**Interfaces:**
- Consumes: `LumpVsPensionCalculator`(Task 2), `AdSlot`(`@/components/ad-slot`), `Suspense`(`react`)
- Produces: 없음 (라우트 엔드포인트)

- [ ] **Step 1: `app/tools/lump-vs-pension/page.tsx` 생성**

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { LumpVsPensionCalculator } from "@/components/lump-vs-pension-calculator";
import { AdSlot } from "@/components/ad-slot";

export const metadata: Metadata = {
  title: "퇴직금 일시금 vs 연금 수령 세금 비교 계산기 | 피프티바이브",
  description:
    "퇴직금을 일시금으로 받을 때와 연금으로 나눠 받을 때의 세금을 비교해보세요. 이연퇴직소득세 감면 혜택까지 반영한 절세액을 확인할 수 있습니다.",
  alternates: {
    canonical: "/tools/lump-vs-pension",
  },
  openGraph: {
    title: "퇴직금 일시금 vs 연금 수령 세금 비교 계산기 | 피프티바이브",
    description:
      "퇴직금을 일시금으로 받을 때와 연금으로 나눠 받을 때의 세금을 비교해보세요. 이연퇴직소득세 감면 혜택까지 반영한 절세액을 확인할 수 있습니다.",
    url: "/tools/lump-vs-pension",
    type: "website",
  },
};

const PAGE_URL = "https://fiftyvibe.kr/tools/lump-vs-pension";

const FAQ_ITEMS = [
  {
    question: "이연퇴직소득세가 뭔가요?",
    answer:
      "퇴직금을 일시금으로 받으면 즉시 부과되는 퇴직소득세를, 연금계좌로 받으면 실제 수령 시점까지 미뤄두는 것을 말합니다. 미뤄둔 세금은 실제 수령 연차에 따라 감면된 세율(1~10년차 70%, 11년차부터 60%)로 나눠 부과됩니다.",
  },
  {
    question: "왜 오래 나눠 받을수록 세금이 줄어드나요?",
    answer:
      "감면율이 연차가 지날수록 유리해지는 구조이기 때문입니다(11년차부터 40% 감면). 이연된 세액을 여러 해에 걸쳐 나눠 내면서 매 연차 감면 혜택을 받기 때문에, 수령기간이 길수록 전체 감면 효과가 커집니다.",
  },
  {
    question: "연금으로 받으면 세금이 전혀 없나요?",
    answer:
      "아닙니다. 이연퇴직소득세(이 계산기가 비교하는 부분) 외에, 연금계좌 운용수익에 대한 별도의 연금소득세(3.3~5.5%)가 부과됩니다. 이 계산기는 운용수익분은 포함하지 않은 참고용 비교입니다.",
  },
  {
    question: "수령기간은 어떻게 정하나요?",
    answer:
      "10·15·20년 중 선택하거나 직접 입력할 수 있습니다. 실제로는 연금 상품 약관이나 개인 자금 계획에 따라 수령기간을 정하게 되며, 이 계산기는 각 선택지별 세금 차이를 미리 가늠해보는 용도입니다.",
  },
];

export default function LumpVsPensionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "일시금 vs 연금 비교 계산기",
        url: PAGE_URL,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "홈",
            item: "https://fiftyvibe.kr",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "일시금 vs 연금 비교 계산기",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-2xl font-bold text-navy">
        일시금 vs 연금 비교 계산기
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <Suspense
        fallback={
          <div className="h-96 w-full animate-pulse rounded-lg bg-steel/10" />
        }
      >
        <LumpVsPensionCalculator />
      </Suspense>

      <section className="flex flex-col gap-4 text-navy">
        <p>
          퇴직금을 일시금으로 한 번에 받을지, 연금으로 나눠 받을지는 세금
          측면에서 큰 차이를 만듭니다. 퇴직급여를 연금계좌에 넣고 나눠 받으면
          원래 부과됐을 퇴직소득세를 즉시 내지 않고 이연했다가, 실제 수령하는
          시점에 감면된 세율로 나눠 냅니다. 연금 수령 1년차부터 10년차까지는
          원래 세액의 70%만, 11년차부터는 60%만 부과되므로, 오래 나눠 받을수록
          유리한 구조입니다.
        </p>
        <p>
          이 계산기는 도구 1(퇴직소득세 계산기)에서 넘어온 퇴직급여와
          근속연수를 그대로 받아, 일시금으로 받았을 때의 총세금과 선택한
          수령기간(10·15·20년 또는 직접 입력) 동안 연금으로 나눠 받았을 때의
          총세금을 비교해 보여줍니다. 수령기간이 길수록, 그리고 11년차 이후
          구간이 포함될수록 절세 효과가 커지는 경향이 있습니다.
        </p>
      </section>

      <AdSlot variant="content" />

      <section className="flex flex-col gap-4 text-navy">
        <p>
          다만 이 비교는 이연된 퇴직소득세만을 기준으로 합니다. 실제로
          연금계좌에 퇴직급여를 넣어두면 운용 수익이 발생하고, 이 운용수익
          부분에는 별도로 연금소득세(3.3~5.5%, 나이와 수령 기간에 따라
          차등)가 부과됩니다. 이 계산기는 그 운용수익분 세금은 포함하지
          않으므로, 실제로 받게 될 세후 금액은 여기서 보여주는 절세액보다
          적을 수 있습니다.
        </p>
        <p>
          일시금과 연금 중 어느 쪽이 유리한지는 근속연수, 예상 수령 기간,
          다른 소득과의 합산 여부, 자금이 당장 필요한지 등 개인 상황에 따라
          달라집니다. 이 계산기는 세금 측면의 참고 자료로만 활용하고, 실제
          결정 전에는 세무 전문가와 상담하시기 바랍니다.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-navy">자주 묻는 질문</h2>
        {FAQ_ITEMS.map((item) => (
          <div key={item.question}>
            <h3 className="font-medium text-navy">Q. {item.question}</h3>
            <p className="mt-1 text-navy/80">A. {item.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 정적 export 빌드 성공, `Route (app)`에 `/tools/lump-vs-pension` 추가 확인. `useSearchParams`를 쓰는 컴포넌트가 `<Suspense>` 밖에서 렌더된다는 경고/에러가 없는지 확인(있으면 Suspense 경계 위치를 점검)

- [ ] **Step 3: Commit**

```bash
git add app/tools/lump-vs-pension/page.tsx
git commit -m "feat: /tools/lump-vs-pension 페이지 추가 (콘텐츠+FAQ+JSON-LD)"
```

---

### Task 4: 전체 검증(Playwright 포함) + CHECKLIST.md §4 완료 표시

**Files:**
- Modify: `docs/CHECKLIST.md`

**Interfaces:**
- Consumes: Task 1~3의 모든 산출물
- Produces: 없음 (최종 검증 + 문서 갱신)

- [ ] **Step 1: 전체 테스트 + 빌드**

Run: `npm test`
Expected: PASS — 기존 테스트 전부 + `lib/calculators/pension-compare.test.ts`(4개) 통과

Run: `npm run build`
Expected: 에러 없이 정적 export 빌드 성공

- [ ] **Step 2: Playwright로 도구 1 → 도구 2 흐름 스모크 테스트**

Python + Playwright(sync API)로 아래 흐름을 검증하는 스크립트를 스크래치패드에 작성해 실행한다
(`page.goto`는 `wait_until="commit"` 후 `page.wait_for_selector`를 쓸 것 — 이 프로젝트의 Next dev
서버에서 `networkidle`/`load`는 안정적으로 끝나지 않는 것으로 이전 세션에서 확인됨):

1. `/tools/severance-tax` 접속 → 퇴직급여 "100000000" 입력, 근속연수 직접 입력 모드로 "10" 입력,
   계산하기 클릭 → 결과 표시 확인
2. "비교해보기" `ToolCTA` 클릭 → `/tools/lump-vs-pension?amount=100000000&years=11`로 이동하는지
   확인(도구 1이 근속연수를 11로 정규화해 보내는지, URL의 쿼리 파라미터 값으로 확인)
3. 퇴직급여 입력 필드에 쿼리로 받은 "100,000,000"이 미리 채워져 있는지, 근속연수 입력 필드에
   "11"이 미리 채워져 있는지 확인
4. 수령기간 "10년" 라디오 선택(기본값 확인) → 개시 나이 기본값 "55" 확인 → "비교하기" 클릭
5. 결과 영역에 절세액("1,152,530원")과 "일시금 대비 30.0% 절감" 텍스트가 표시되는지 확인
   (Task 1 테스트 케이스 1과 동일한 입력이므로 같은 값)
6. 막대 차트(recharts SVG)가 렌더되는지 확인 (`svg` 요소 존재 확인 정도로 충분)
7. "연차별 세금 보기" 클릭 → 10행 표가 나타나고 1행("1년차")에 "70%"가 있는지 확인
8. 수령기간을 "직접입력"으로 바꾸고 "0" 입력 후 비교하기 클릭 → 에러 메시지("수령기간은
   1~40년 사이로 입력해주세요.") 표시 확인
9. 콘솔 에러(`console.error`)와 페이지 예외(`pageerror`) 0건 확인
10. 테스트 후 dev 서버 프로세스가 완전히 종료됐는지 확인(포트 3000이 남아있으면 프로세스
    강제 종료)

- [ ] **Step 3: `docs/CHECKLIST.md` §4 항목 체크**

```markdown
## 4. 도구 2: 일시금 vs 연금 (W2)
- [x] `lib/calculators/pension-compare.ts` (도구 1 로직 import) (07-27)
- [x] 쿼리 파라미터 수신 (도구 1 → 2 값 전달) (07-27)
- [x] 화면 + 비교 차트 + 연차별 표 (07-27, Playwright 스모크 테스트 통과)
- [x] 고지문(운용수익 별도) + 설명 콘텐츠 + SEO (07-27)
```

- [ ] **Step 4: Commit**

```bash
git add docs/CHECKLIST.md
git commit -m "chore: checklist §4 도구 2(일시금 vs 연금) 완료 표시"
```
