# 퇴직소득세 계산기 화면 (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/tools/severance-tax` 실제 화면(입력 폼·결과·계산과정 아코디언), 설명 콘텐츠·FAQ, SEO 메타/JSON-LD를 구현해 CHECKLIST.md §3를 완료한다(홈택스 대조 게이트 제외).

**Architecture:** `lib/format-currency.ts`(원화 포맷 순수 함수) → `components/severance-tax-calculator.tsx`(클라이언트 폼+결과, 기존 계산 로직/공통 컴포넌트/analytics 재사용) → `app/tools/severance-tax/page.tsx`(서버 컴포넌트 셸: metadata·JSON-LD·콘텐츠·FAQ, 계산기 렌더). 상태는 전부 React state, 서버·DB·localStorage 없음.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Vitest. 신규 npm 패키지 없음.

## Global Constraints

- 서버·DB·외부 API 추가 금지, localStorage/sessionStorage 금지 — 상태는 React state로만 (CLAUDE.md #1, #5)
- 모든 도구 페이지에 `<Disclaimer />` 포함 필수 (CLAUDE.md #4)
- 계산 상수는 `lib/tax-tables.ts`에서만 관리 — 이 플랜은 새 상수를 추가하지 않는다 (기존 계산 로직 재사용만)
- 새 npm 패키지 추가 금지 (CLAUDE.md #6)
- 파일명 kebab-case, 컴포넌트명 PascalCase, 금액은 내부 원 단위 정수, 표시 시에만 콤마 포맷
- 홈택스 대조 게이트는 여전히 미충족 상태(D-11) — 이 플랜은 화면·콘텐츠만 다루고, §4(도구 2) 착수 여부에는 영향 없음(계속 금지 유지)
- 도구 2(`/tools/lump-vs-pension`)는 아직 없음 — `ToolCTA`가 그 경로로 링크해도 정상(§4에서 해결됨, Footer의 `href="#"`와 같은 forward-reference 패턴)
- 재사용할 기존 산출물: `calculateSeveranceTax`(`lib/calculators/severance-tax.ts`), `calculateServiceYears`(`lib/calculators/service-years.ts`), `trackEvent`(`lib/analytics.ts`), `Disclaimer`/`AdSlot`/`ToolCTA`(`components/`)

---

### Task 1: `lib/format-currency.ts`

**Files:**
- Create: `lib/format-currency.ts`
- Test: `lib/format-currency.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `export function formatWon(value: number): string`, `export function parseWonInput(value: string): number` — Task 2에서 사용

- [ ] **Step 1: 실패하는 테스트 작성 — `lib/format-currency.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { formatWon, parseWonInput } from "./format-currency";

describe("formatWon", () => {
  it("0원을 포맷한다", () => {
    expect(formatWon(0)).toBe("0원");
  });

  it("천단위 콤마를 붙인다", () => {
    expect(formatWon(1234567)).toBe("1,234,567원");
  });

  it("억 단위 금액도 콤마를 붙인다", () => {
    expect(formatWon(100_000_000)).toBe("100,000,000원");
  });
});

describe("parseWonInput", () => {
  it("빈 문자열은 0을 반환한다", () => {
    expect(parseWonInput("")).toBe(0);
  });

  it("콤마가 섞인 문자열에서 숫자만 추출한다", () => {
    expect(parseWonInput("1,234,567")).toBe(1234567);
  });

  it("숫자가 아닌 문자가 섞여도 숫자만 추출한다", () => {
    expect(parseWonInput("100만원")).toBe(100);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/format-currency.test.ts`
Expected: FAIL — `Cannot find module './format-currency'`

- [ ] **Step 3: `lib/format-currency.ts` 생성**

```ts
export function formatWon(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function parseWonInput(value: string): number {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/format-currency.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/format-currency.ts lib/format-currency.test.ts
git commit -m "feat: 원화 포맷 유틸(formatWon/parseWonInput) 추가"
```

---

### Task 2: `components/severance-tax-calculator.tsx`

**Files:**
- Create: `components/severance-tax-calculator.tsx`

**Interfaces:**
- Consumes: `formatWon`/`parseWonInput`(Task 1), `calculateSeveranceTax`(`@/lib/calculators/severance-tax`), `calculateServiceYears`(`@/lib/calculators/service-years`), `trackEvent`(`@/lib/analytics`), `Disclaimer`/`AdSlot`/`ToolCTA`(`@/components/*`)
- Produces: `export function SeveranceTaxCalculator()` — Task 3에서 `/tools/severance-tax` 페이지가 렌더

- [ ] **Step 1: `components/severance-tax-calculator.tsx` 생성**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { calculateSeveranceTax } from "@/lib/calculators/severance-tax";
import { calculateServiceYears } from "@/lib/calculators/service-years";
import { formatWon, parseWonInput } from "@/lib/format-currency";
import { trackEvent } from "@/lib/analytics";
import { Disclaimer } from "@/components/disclaimer";
import { AdSlot } from "@/components/ad-slot";
import { ToolCTA } from "@/components/tool-cta";

type InputMode = "date" | "manual";

type SeveranceTaxOutput = ReturnType<typeof calculateSeveranceTax>;

type CalculationState = {
  input: { severancePay: number; serviceYears: number };
  output: SeveranceTaxOutput;
};

const ACCORDION_ROWS: Array<{
  label: string;
  key: keyof SeveranceTaxOutput;
}> = [
  { label: "근속연수공제", key: "serviceYearDeduction" },
  { label: "환산급여", key: "convertedSalary" },
  { label: "환산급여공제", key: "convertedSalaryDeduction" },
  { label: "과세표준", key: "taxBase" },
  { label: "환산산출세액", key: "convertedTax" },
  { label: "퇴직소득세", key: "severanceTax" },
  { label: "지방소득세", key: "localIncomeTax" },
];

export function SeveranceTaxCalculator() {
  const [severancePayInput, setSeverancePayInput] = useState(""); // 원 단위 숫자 문자열, 콤마 없음
  const [mode, setMode] = useState<InputMode>("date");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [manualYears, setManualYears] = useState("");
  const [error, setError] = useState("");
  const [calculation, setCalculation] = useState<CalculationState | null>(
    null,
  );
  const [accordionOpen, setAccordionOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const severancePay = Number(severancePayInput) || 0;
    if (severancePay <= 0) {
      setError("퇴직급여 총액을 입력해주세요.");
      setCalculation(null);
      return;
    }

    let serviceYears: number;

    if (mode === "date") {
      if (!startDate || !endDate) {
        setError("입사일과 퇴사일을 모두 입력해주세요.");
        setCalculation(null);
        return;
      }
      if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
        setError("퇴사일은 입사일보다 이후여야 합니다.");
        setCalculation(null);
        return;
      }
      serviceYears = calculateServiceYears(startDate, endDate);
    } else {
      const parsedYears = Number(manualYears);
      if (!manualYears || Number.isNaN(parsedYears) || parsedYears <= 0) {
        setError("근속연수를 입력해주세요.");
        setCalculation(null);
        return;
      }
      serviceYears = parsedYears;
    }

    setError("");
    const output = calculateSeveranceTax({ severancePay, serviceYears });
    setCalculation({ input: { severancePay, serviceYears }, output });
    trackEvent("calculate_click", { tool: "severance-tax" });
  };

  const totalTax = calculation
    ? calculation.output.severanceTax + calculation.output.localIncomeTax
    : 0;
  const effectiveRate = calculation
    ? ((totalTax / calculation.input.severancePay) * 100).toFixed(1)
    : "0.0";

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
            onChange={(event) =>
              setSeverancePayInput(String(parseWonInput(event.target.value)))
            }
            placeholder="예: 100,000,000"
            className="w-full rounded border border-steel/40 px-3 py-2"
          />
        </div>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === "date"}
              onChange={() => setMode("date")}
            />
            입사일/퇴사일로 계산
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === "manual"}
              onChange={() => setMode("manual")}
            />
            근속연수 직접 입력
          </label>
        </div>

        {mode === "date" ? (
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="startDate"
                className="mb-1 block text-sm font-medium text-navy"
              >
                입사일
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded border border-steel/40 px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="endDate"
                className="mb-1 block text-sm font-medium text-navy"
              >
                퇴사일
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded border border-steel/40 px-3 py-2"
              />
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="manualYears"
              className="mb-1 block text-sm font-medium text-navy"
            >
              근속연수 (년)
            </label>
            <input
              id="manualYears"
              type="number"
              min="1"
              value={manualYears}
              onChange={(event) => setManualYears(event.target.value)}
              className="w-full rounded border border-steel/40 px-3 py-2"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded bg-navy px-4 py-2 font-medium text-ivory hover:bg-navy-deep"
        >
          계산하기
        </button>
      </form>

      {calculation && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-navy/70">실수령액</p>
            <p className="text-4xl font-bold text-navy">
              {formatWon(calculation.output.netAmount)}
            </p>
            <div className="mt-2 flex gap-6 text-sm text-navy/70">
              <span>총 세금: {formatWon(totalTax)}</span>
              <span>실효세율: {effectiveRate}%</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setAccordionOpen((open) => !open)}
              className="text-sm font-medium text-amber underline"
            >
              계산 과정 보기 {accordionOpen ? "▲" : "▼"}
            </button>
            {accordionOpen && (
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {ACCORDION_ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-steel/20">
                      <td className="py-2 text-navy/70">{row.label}</td>
                      <td className="py-2 text-right text-navy">
                        {formatWon(calculation.output[row.key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <Disclaimer />
          <AdSlot variant="result" />
          <ToolCTA
            title="일시금 vs 연금 수령, 뭐가 유리할까?"
            description="같은 퇴직금이라도 수령 방식에 따라 세금이 달라집니다."
            href={`/tools/lump-vs-pension?amount=${calculation.input.severancePay}&years=${calculation.input.serviceYears}`}
            ctaLabel="비교해보기"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 성공 (아직 어디서도 import하지 않으므로 화면 변화는 없음 — 정상, Task 3에서 페이지에 렌더)

- [ ] **Step 3: Commit**

```bash
git add components/severance-tax-calculator.tsx
git commit -m "feat: 퇴직소득세 계산기 폼+결과 컴포넌트 추가"
```

---

### Task 3: `app/tools/severance-tax/page.tsx`

**Files:**
- Create: `app/tools/severance-tax/page.tsx`

**Interfaces:**
- Consumes: `SeveranceTaxCalculator`(Task 2), `AdSlot`(`@/components/ad-slot`)
- Produces: 없음 (라우트 엔드포인트)

- [ ] **Step 1: `app/tools/severance-tax/page.tsx` 생성**

```tsx
import type { Metadata } from "next";
import { SeveranceTaxCalculator } from "@/components/severance-tax-calculator";
import { AdSlot } from "@/components/ad-slot";

export const metadata: Metadata = {
  title: "퇴직소득세 계산기 (2026) — 퇴직금 실수령액 세후 계산 | 피프티바이브",
  description:
    "퇴직금 실수령액과 세금을 미리 계산해보세요. 근속연수공제부터 지방소득세까지 계산 과정을 단계별로 확인할 수 있습니다.",
};

const PAGE_URL = "https://fiftyvibe.kr/tools/severance-tax";

const FAQ_ITEMS = [
  {
    question: "근속연수는 어떻게 계산하나요?",
    answer:
      "입사일부터 퇴사일까지의 기간을 연 단위로 계산하며, 1년 미만의 기간이 있으면 그 부분은 1년으로 올려서 계산합니다. 예를 들어 9년 3개월을 근무했다면 근속연수는 10년으로 처리됩니다.",
  },
  {
    question: "왜 근속연수가 짧으면 세금이 더 많이 나오나요?",
    answer:
      "계산 과정에서 퇴직급여를 근속연수로 나눈 뒤 12를 곱해 1년치로 환산한 소득(환산급여)을 구하는 단계가 있습니다. 근속연수가 짧을수록 이 환산급여가 커져서 더 높은 세율 구간이 적용되기 때문입니다. 짧은 근속을 반복하며 세금을 회피하는 것을 막기 위한 제도적 장치입니다.",
  },
  {
    question: "이 계산기 결과와 실제 회사에서 지급하는 금액이 다를 수 있나요?",
    answer:
      "네, 다를 수 있습니다. 이 계산기는 소득세법에 규정된 퇴직소득세 계산 공식을 기준으로 하지만, 실제 원천징수 시 단수처리(원 단위 반올림·절사) 방식이나 회사의 급여 시스템에 따라 소액의 차이가 발생할 수 있습니다. 정확한 금액은 반드시 홈택스 모의계산이나 세무 전문가를 통해 확인하세요.",
  },
  {
    question: "퇴직금을 일시금과 연금 중 무엇으로 받는 게 유리한가요?",
    answer:
      '근속연수, 예상 수령 기간, 다른 소득 여부 등에 따라 달라집니다. 일반적으로 연금으로 나눠 받으면 이연퇴직소득세 감면 혜택이 있어 세금 부담이 줄어드는 경우가 많습니다. 자세한 비교는 "일시금 vs 연금 수령 비교 계산기"에서 확인하실 수 있습니다.',
  },
];

export default function SeveranceTaxPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "퇴직소득세 계산기",
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
            name: "퇴직소득세 계산기",
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
        퇴직소득세 계산기
        <span className="brand-cursor" aria-hidden="true">
          ▮
        </span>
      </h1>

      <SeveranceTaxCalculator />

      <section className="flex flex-col gap-4 text-navy">
        <p>
          퇴직금을 한 번에 받을 때 부과되는 퇴직소득세는 일반 근로소득세와는 다른
          방식으로 계산됩니다. 근속연수가 길수록, 그리고 퇴직급여가 근속연수에
          비해 과도하게 크지 않을수록 세금 부담이 줄어드는 구조인데, 이는
          퇴직금을 오랜 기간 일한 대가를 한 번에 정산받는 소득으로 보고
          누진세율의 충격을 완화하기 위한 장치입니다.
        </p>
        <p>
          계산은 크게 세 단계로 나뉩니다. 첫째, 근속연수에 비례한
          근속연수공제를 퇴직급여에서 뺍니다. 근속연수가 길수록 공제액이
          커집니다. 둘째, 남은 금액을 근속연수로 나눈 뒤 12를 곱해 환산급여라는
          1년치 환산 소득을 만듭니다. 이 환산 과정 때문에 근속연수가
          짧을수록(예: 1~2년) 환산급여가 급격히 커져서 더 높은 세율 구간이
          적용되는 효과가 생깁니다. 짧은 근속을 반복하며 퇴직금을 나눠 받는
          방식으로 세금을 피하는 것을 막기 위한 설계입니다. 셋째, 환산급여에서
          다시 환산급여공제를 뺀 과세표준에 일반 소득세와 같은 누진세율을
          적용해 세액을 구한 뒤, 다시 근속연수 비율만큼 되돌려 최종
          퇴직소득세를 산출합니다.
        </p>
      </section>

      <AdSlot variant="content" />

      <section className="flex flex-col gap-4 text-navy">
        <p>
          여기에 퇴직소득세의 10%에 해당하는 지방소득세가 추가로 부과되며, 두
          세금을 뺀 나머지가 실제로 통장에 들어오는 실수령액입니다.
        </p>
        <p>
          이 계산기에 퇴직급여 총액과 근속연수(또는 입사일·퇴사일)를 입력하면
          실수령액과 예상 세금을 바로 확인할 수 있고, 계산 과정 보기를 펼치면
          근속연수공제부터 지방소득세까지 7단계 계산 과정을 각각 얼마인지
          확인할 수 있습니다. 근속연수가 애매하거나 여러 시나리오를 비교하고
          싶다면 숫자를 바꿔가며 여러 번 계산해보는 것을 추천합니다.
        </p>
        {/* TODO(운영자): DB→DC 전환 준비 경험담 문단 삽입 예정 */}
        <p>
          이 계산기는 소득세법(§48, §55, §64의4)에 규정된 공식을 그대로
          구현했습니다. 다만 세부 단수처리(원 단위 반올림·절사 규칙)는 홈택스
          모의계산 결과와 최종 대조 중이므로, 정확한 금액은 반드시 홈택스
          모의계산이나 세무 전문가를 통해 다시 한번 확인하시기 바랍니다.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-navy">자주 묻는 질문</h2>
        {FAQ_ITEMS.map((item) => (
          <div key={item.question}>
            <p className="font-medium text-navy">Q. {item.question}</p>
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
Expected: 에러 없이 빌드 성공, `Route (app)`에 `/tools/severance-tax` 추가 확인

- [ ] **Step 3: 개발 서버 육안 확인**

Run: `npm run dev`, 브라우저로 `http://localhost:3000/tools/severance-tax` 접속
Expected: 입력 폼 표시, 값 입력 후 "계산하기" 클릭 시 결과(실수령액) 표시, "계산 과정 보기" 클릭 시 7행 표 표시

- [ ] **Step 4: Commit**

```bash
git add app/tools/severance-tax/page.tsx
git commit -m "feat: /tools/severance-tax 페이지 추가 (콘텐츠+FAQ+JSON-LD)"
```

---

### Task 4: 전체 검증(Playwright 포함) + CHECKLIST.md §3 완료 표시

**Files:**
- Modify: `docs/CHECKLIST.md`

**Interfaces:**
- Consumes: Task 1~3의 모든 산출물
- Produces: 없음 (최종 검증 + 문서 갱신)

- [ ] **Step 1: 전체 테스트 + 빌드**

Run: `npm test`
Expected: PASS — 기존 22개(analytics 3 + severance-tax 12 + service-years 4 + ~~기존~~) + 새 `lib/format-currency.test.ts`(6개) 전체 통과 (정확한 총 개수는 실행 결과로 확인)

Run: `npm run build`
Expected: 에러 없이 정적 export 빌드 성공

- [ ] **Step 2: Playwright로 `/tools/severance-tax` 스모크 테스트**

Python + Playwright(sync API)로 아래 흐름을 검증하는 스크립트를 스크래치패드에 작성해 실행한다
(`page.goto`는 `wait_until="commit"` 후 `page.wait_for_selector`를 쓸 것 — 이 프로젝트의 Next dev
서버에서 `networkidle`/`load`는 안정적으로 끝나지 않는 것으로 이전 세션에서 확인됨):

1. `/tools/severance-tax` 접속, `<h1>` 텍스트에 "퇴직소득세 계산기" 포함 확인
2. 퇴직급여 입력 필드에 "100000000" 입력 → 화면에 콤마 포맷("100,000,000")으로 표시되는지 확인
3. 근속연수 직접 입력 모드로 전환 → "10" 입력 → 계산하기 클릭
4. 결과 영역에 "95,737,500원"(SPEC 검증 케이스 (a) 1억/10년의 실수령액)이 표시되는지 확인
5. "계산 과정 보기" 클릭 → 7행 표가 나타나고 "퇴직소득세" 행에 "3,875,000원"이 있는지 확인
6. 날짜 모드로 전환 → 퇴사일을 입사일보다 이전 날짜로 입력 후 계산하기 클릭 → 에러 메시지
   ("퇴사일은 입사일보다 이후여야 합니다.") 표시 확인
7. 콘솔 에러(`console.error`)와 페이지 예외(`pageerror`) 0건 확인
8. 테스트 후 dev 서버 프로세스가 완전히 종료됐는지 확인(포트 3000이 남아있으면 프로세스 강제 종료) —
   이전 세션에서 `with_server.py`가 서버를 완전히 못 죽여 좀비 프로세스가 남는 문제가 있었음

- [ ] **Step 3: `docs/CHECKLIST.md` §3 나머지 항목 체크**

```markdown
## 3. 도구 1: 퇴직소득세 계산기 (W1)
- [x] `lib/tax-tables.ts` (2026 세율·공제표) (07-27)
- [x] `lib/calculators/severance-tax.ts` 순수 함수 (07-27)
- [x] 단위 테스트: 검증 3케이스 + 경계값(근속 1년, 5/10/20년 경계) (07-27, ⚠️ SPEC 공식 손계산값 — 홈택스 실측 아님)
- [ ] **홈택스 모의계산 대조 오차 0원 (게이트 — 통과 전 도구 2 금지)** — 운영자 확인 대기 중
- [x] 화면 구현 (입력 폼, 결과, 계산과정 아코디언) (07-27, Playwright 스모크 테스트 통과)
- [x] 하단 설명 콘텐츠 800자 + FAQ 4문항 (07-27, 운영자 개인 경험담 문단은 추후 보강 예정)
- [x] 메타태그 + JSON-LD (07-27, WebApplication+FAQPage+BreadcrumbList)
```

- [ ] **Step 4: Commit**

```bash
git add docs/CHECKLIST.md
git commit -m "chore: checklist §3 화면 구현 부분 완료 표시 (홈택스 대조만 대기)"
```
