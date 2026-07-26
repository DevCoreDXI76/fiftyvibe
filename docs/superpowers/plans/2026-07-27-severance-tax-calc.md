# 퇴직소득세 계산 로직 (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `lib/tax-tables.ts`와 `lib/calculators/severance-tax.ts`, `lib/calculators/service-years.ts`를 구현해 CHECKLIST.md §3의 계산 로직 부분(홈택스 대조 제외)을 완료한다.

**Architecture:** SPEC.md §2의 3개 표(근속연수공제·환산급여공제·기본세율)를 `TAX_TABLES[2026]` 상수로 옮기고, 이 표만 참조하는 순수 함수 `calculateSeveranceTax`를 SPEC의 8단계 순서대로 구현한다. 별도로 날짜→근속연수 변환은 `calculateServiceYears`라는 독립 순수 함수로 분리한다.

**Tech Stack:** TypeScript, Vitest. 신규 npm 패키지 없음.

## Global Constraints

- 세율·공제표 등 계산 상수는 반드시 `lib/tax-tables.ts` 한 파일에서만 관리, 컴포넌트/함수에 하드코딩 금지 (CLAUDE.md 절대 규칙 #3)
- 계산 로직은 `lib/calculators/*.ts`에 순수 함수로 분리하고 단위 테스트 작성 (CLAUDE.md 코드 컨벤션)
- 금액은 내부적으로 원 단위 정수(number)로 계산 (CLAUDE.md 코드 컨벤션)
- **게이트 미충족 상태:** 이 플랜의 테스트 기댓값은 SPEC.md §2 공식을 손계산한 값이며, 홈택스 실측 대조가 아직 안 됐다. 두 태스크 모두 완료돼도 CLAUDE.md의 "홈택스 대조 오차 0원" 게이트는 통과된 것이 아니며, §4(도구 2) 착수는 계속 금지 상태로 유지한다.
- 부동소수점 연산 오차 방지: 세율(0.6, 0.55, 0.45, 0.35, 0.38 등 소수)을 곱하는 중간 단계는 `Math.round`로, 최종 절사(6·7단계)는 `Math.floor(value + 1e-6)`로 처리한다 (아래 Task 1의 코드에 반영됨).

---

### Task 1: `lib/tax-tables.ts` + `lib/calculators/severance-tax.ts`

**Files:**
- Create: `lib/tax-tables.ts`
- Create: `lib/calculators/severance-tax.ts`
- Test: `lib/calculators/severance-tax.test.ts`

**Interfaces:**
- Consumes: 없음 (최초 작업)
- Produces: `export function calculateSeveranceTax(input: { severancePay: number; serviceYears: number }): { serviceYearDeduction: number; convertedSalary: number; convertedSalaryDeduction: number; taxBase: number; convertedTax: number; severanceTax: number; localIncomeTax: number; netAmount: number }` — 이후 §3 화면 구현(Phase 2)과 §4(도구 2, 홈택스 대조 통과 후) 재사용

- [ ] **Step 1: 실패하는 테스트 작성 — `lib/calculators/severance-tax.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { calculateSeveranceTax } from "./severance-tax";

describe("calculateSeveranceTax", () => {
  describe("SPEC 검증 케이스 (⚠️ 홈택스 미대조 — SPEC 공식 손계산값)", () => {
    it("(a) 퇴직급여 1억원, 근속 10년", () => {
      const result = calculateSeveranceTax({
        severancePay: 100_000_000,
        serviceYears: 10,
      });
      expect(result.serviceYearDeduction).toBe(15_000_000);
      expect(result.convertedSalary).toBe(102_000_000);
      expect(result.convertedSalaryDeduction).toBe(62_600_000);
      expect(result.taxBase).toBe(39_400_000);
      expect(result.convertedTax).toBe(4_650_000);
      expect(result.severanceTax).toBe(3_875_000);
      expect(result.localIncomeTax).toBe(387_500);
      expect(result.netAmount).toBe(95_737_500);
    });

    it("(b) 퇴직급여 2억원, 근속 20년", () => {
      const result = calculateSeveranceTax({
        severancePay: 200_000_000,
        serviceYears: 20,
      });
      expect(result.serviceYearDeduction).toBe(40_000_000);
      expect(result.convertedSalary).toBe(96_000_000);
      expect(result.convertedSalaryDeduction).toBe(59_500_000);
      expect(result.taxBase).toBe(36_500_000);
      expect(result.convertedTax).toBe(4_215_000);
      expect(result.severanceTax).toBe(7_025_000);
      expect(result.localIncomeTax).toBe(702_500);
      expect(result.netAmount).toBe(192_272_500);
    });

    it("(c) 퇴직급여 5,000만원, 근속 5년", () => {
      const result = calculateSeveranceTax({
        severancePay: 50_000_000,
        serviceYears: 5,
      });
      expect(result.serviceYearDeduction).toBe(5_000_000);
      expect(result.convertedSalary).toBe(108_000_000);
      expect(result.convertedSalaryDeduction).toBe(65_300_000);
      expect(result.taxBase).toBe(42_700_000);
      expect(result.convertedTax).toBe(5_145_000);
      expect(result.severanceTax).toBe(2_143_750);
      expect(result.localIncomeTax).toBe(214_375);
      expect(result.netAmount).toBe(47_641_875);
    });
  });

  describe("경계값 — 근속연수공제 구간 전환", () => {
    it("근속 1년 (최소값, 환산급여공제 최상위 구간·기본세율 4번째 구간 통과)", () => {
      const result = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 1,
      });
      expect(result.severanceTax).toBe(4_022_500);
      expect(result.localIncomeTax).toBe(402_250);
      expect(result.netAmount).toBe(25_575_250);
    });

    it("근속 5년 (≤5년 구간)", () => {
      const result = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 5,
      });
      expect(result.severanceTax).toBe(775_000);
      expect(result.localIncomeTax).toBe(77_500);
      expect(result.netAmount).toBe(29_147_500);
    });

    it("근속 6년 (6~10년 구간 진입)", () => {
      const result = calculateSeveranceTax({
        severancePay: 30_000_000,
        serviceYears: 6,
      });
      expect(result.severanceTax).toBe(510_000);
      expect(result.localIncomeTax).toBe(51_000);
      expect(result.netAmount).toBe(29_439_000);
    });

    it("근속 10년 (6~10년 구간 마지막)", () => {
      const result = calculateSeveranceTax({
        severancePay: 28_500_000,
        serviceYears: 10,
      });
      expect(result.severanceTax).toBe(164_000);
      expect(result.localIncomeTax).toBe(16_400);
      expect(result.netAmount).toBe(28_319_600);
    });

    it("근속 11년 (11~20년 구간 진입)", () => {
      const result = calculateSeveranceTax({
        severancePay: 28_500_000,
        serviceYears: 11,
      });
      expect(result.severanceTax).toBe(88_000);
      expect(result.localIncomeTax).toBe(8_800);
      expect(result.netAmount).toBe(28_403_200);
    });

    it("근속 20년 (11~20년 구간 마지막)", () => {
      const result = calculateSeveranceTax({
        severancePay: 100_000_000,
        serviceYears: 20,
      });
      expect(result.severanceTax).toBe(1_120_000);
      expect(result.localIncomeTax).toBe(112_000);
      expect(result.netAmount).toBe(98_768_000);
    });

    it("근속 21년 (20년 초과 구간 진입)", () => {
      const result = calculateSeveranceTax({
        severancePay: 64_000_000,
        serviceYears: 21,
      });
      expect(result.severanceTax).toBe(168_000);
      expect(result.localIncomeTax).toBe(16_800);
      expect(result.netAmount).toBe(63_815_200);
    });
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/calculators/severance-tax.test.ts`
Expected: FAIL — `Cannot find module './severance-tax'` (아직 구현 파일이 없음)

- [ ] **Step 3: `lib/tax-tables.ts` 생성**

```ts
export const TAX_TABLES = {
  2026: {
    serviceYearDeduction: [
      { upTo: 5, fromYear: 0, base: 0, perYear: 1_000_000 },
      { upTo: 10, fromYear: 5, base: 5_000_000, perYear: 2_000_000 },
      { upTo: 20, fromYear: 10, base: 15_000_000, perYear: 2_500_000 },
      { upTo: null, fromYear: 20, base: 40_000_000, perYear: 3_000_000 },
    ],
    convertedSalaryDeduction: [
      { upTo: 8_000_000, over: 0, base: 0, rate: 1.0 },
      { upTo: 70_000_000, over: 8_000_000, base: 8_000_000, rate: 0.6 },
      { upTo: 100_000_000, over: 70_000_000, base: 45_200_000, rate: 0.55 },
      { upTo: 300_000_000, over: 100_000_000, base: 61_700_000, rate: 0.45 },
      { upTo: null, over: 300_000_000, base: 151_700_000, rate: 0.35 },
    ],
    basicTaxRate: [
      { upTo: 14_000_000, rate: 0.06, deduction: 0 },
      { upTo: 50_000_000, rate: 0.15, deduction: 1_260_000 },
      { upTo: 88_000_000, rate: 0.24, deduction: 5_760_000 },
      { upTo: 150_000_000, rate: 0.35, deduction: 15_440_000 },
      { upTo: 300_000_000, rate: 0.38, deduction: 19_940_000 },
      { upTo: 500_000_000, rate: 0.4, deduction: 25_940_000 },
      { upTo: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
      { upTo: null, rate: 0.45, deduction: 65_940_000 },
    ],
  },
} as const;

export type TaxYear = keyof typeof TAX_TABLES;
```

- [ ] **Step 4: `lib/calculators/severance-tax.ts` 생성**

```ts
import { TAX_TABLES } from "../tax-tables";

type SeveranceTaxInput = {
  severancePay: number;
  serviceYears: number;
};

type SeveranceTaxResult = {
  serviceYearDeduction: number;
  convertedSalary: number;
  convertedSalaryDeduction: number;
  taxBase: number;
  convertedTax: number;
  severanceTax: number;
  localIncomeTax: number;
  netAmount: number;
};

// 부동소수점 연산 오차(예: 0.15 곱셈)로 정수 결과가 미세하게 어긋나는 것을 방지
function roundWon(value: number): number {
  return Math.round(value);
}

// 6·7단계(퇴직소득세·지방소득세)의 "원단위 절사" 규칙 — 부동소수점 오차 보정 포함
function floorWon(value: number): number {
  return Math.floor(value + 1e-6);
}

function calculateServiceYearDeduction(serviceYears: number): number {
  const table = TAX_TABLES[2026].serviceYearDeduction;
  const bracket = table.find((b) => b.upTo === null || serviceYears <= b.upTo);
  if (!bracket) {
    throw new Error(`근속연수공제 구간을 찾을 수 없습니다: ${serviceYears}`);
  }
  return bracket.base + bracket.perYear * (serviceYears - bracket.fromYear);
}

function calculateConvertedSalaryDeduction(convertedSalary: number): number {
  const table = TAX_TABLES[2026].convertedSalaryDeduction;
  const bracket = table.find(
    (b) => b.upTo === null || convertedSalary <= b.upTo,
  );
  if (!bracket) {
    throw new Error(`환산급여공제 구간을 찾을 수 없습니다: ${convertedSalary}`);
  }
  return roundWon(
    bracket.base + (convertedSalary - bracket.over) * bracket.rate,
  );
}

function calculateConvertedTax(taxBase: number): number {
  const table = TAX_TABLES[2026].basicTaxRate;
  const bracket = table.find((b) => b.upTo === null || taxBase <= b.upTo);
  if (!bracket) {
    throw new Error(`기본세율 구간을 찾을 수 없습니다: ${taxBase}`);
  }
  return roundWon(taxBase * bracket.rate - bracket.deduction);
}

export function calculateSeveranceTax(
  input: SeveranceTaxInput,
): SeveranceTaxResult {
  const { severancePay, serviceYears } = input;

  const serviceYearDeduction = calculateServiceYearDeduction(serviceYears);
  const convertedSalary = roundWon(
    ((severancePay - serviceYearDeduction) / serviceYears) * 12,
  );
  const convertedSalaryDeduction =
    calculateConvertedSalaryDeduction(convertedSalary);
  const taxBase = convertedSalary - convertedSalaryDeduction;
  const convertedTax = calculateConvertedTax(taxBase);
  const severanceTax = floorWon((convertedTax / 12) * serviceYears);
  const localIncomeTax = floorWon(severanceTax * 0.1);
  const netAmount = severancePay - severanceTax - localIncomeTax;

  return {
    serviceYearDeduction,
    convertedSalary,
    convertedSalaryDeduction,
    taxBase,
    convertedTax,
    severanceTax,
    localIncomeTax,
    netAmount,
  };
}
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/calculators/severance-tax.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 6: Commit**

```bash
git add lib/tax-tables.ts lib/calculators/severance-tax.ts lib/calculators/severance-tax.test.ts
git commit -m "feat: 퇴직소득세 계산 로직 추가 (홈택스 미대조 — SPEC 공식 기준)"
```

---

### Task 2: `lib/calculators/service-years.ts`

**Files:**
- Create: `lib/calculators/service-years.ts`
- Test: `lib/calculators/service-years.test.ts`

**Interfaces:**
- Consumes: 없음 (Task 1과 독립)
- Produces: `export function calculateServiceYears(startDate: string, endDate: string): number` — Phase 2(화면 구현)에서 입사일/퇴사일 입력 필드가 이 함수를 호출해 `calculateSeveranceTax`의 `serviceYears` 인자를 만든다

- [ ] **Step 1: 실패하는 테스트 작성 — `lib/calculators/service-years.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { calculateServiceYears } from "./service-years";

describe("calculateServiceYears", () => {
  it("정확히 n년 경과하면 올림 없이 n년", () => {
    expect(calculateServiceYears("2015-03-01", "2025-03-01")).toBe(10);
  });

  it("n년에서 하루라도 더 지나면 n+1년으로 올림", () => {
    expect(calculateServiceYears("2015-03-01", "2025-03-02")).toBe(11);
  });

  it("1년 미만 경과 시 1년으로 올림", () => {
    expect(calculateServiceYears("2024-01-01", "2024-06-15")).toBe(1);
  });

  it("입사일과 퇴사일이 같으면(0일 경과) 1년으로 올림", () => {
    expect(calculateServiceYears("2024-01-01", "2024-01-01")).toBe(1);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/calculators/service-years.test.ts`
Expected: FAIL — `Cannot find module './service-years'`

- [ ] **Step 3: `lib/calculators/service-years.ts` 생성**

```ts
export function calculateServiceYears(
  startDate: string,
  endDate: string,
): number {
  // ISO 날짜 문자열(YYYY-MM-DD)은 UTC 자정으로 파싱되므로, 로컬 타임존 기준
  // getFullYear/setFullYear를 쓰면 UTC-8 이하 등 일부 타임존에서 날짜가
  // 하루 밀릴 수 있다. UTC 접근자로 고정해 타임존 무관하게 동작시킨다.
  const start = new Date(startDate);
  const end = new Date(endDate);

  const exactYears = end.getUTCFullYear() - start.getUTCFullYear();
  const anniversary = new Date(start);
  anniversary.setUTCFullYear(start.getUTCFullYear() + exactYears);

  const hasPartialYear = end.getTime() > anniversary.getTime();
  const years = hasPartialYear ? exactYears + 1 : exactYears;

  return Math.max(years, 1);
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/calculators/service-years.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/calculators/service-years.ts lib/calculators/service-years.test.ts
git commit -m "feat: 입사일/퇴사일 → 근속연수 계산 유틸 추가 (1년 미만 올림)"
```

---

### Task 3: 전체 검증 + CHECKLIST.md §3 부분 갱신

**Files:**
- Modify: `docs/CHECKLIST.md`

**Interfaces:**
- Consumes: Task 1, 2의 모든 산출물
- Produces: 없음 (최종 검증 + 문서 갱신)

- [ ] **Step 1: 전체 테스트 실행**

Run: `npm test`
Expected: PASS — 기존 `lib/analytics.test.ts`(3개) + `lib/calculators/severance-tax.test.ts`(10개) + `lib/calculators/service-years.test.ts`(4개) 전체 통과

- [ ] **Step 2: 전체 빌드 실행**

Run: `npm run build`
Expected: 에러 없이 정적 export 빌드 성공

- [ ] **Step 3: `docs/CHECKLIST.md` §3 항목 중 계산 로직 부분만 체크**

`## 3. 도구 1: 퇴직소득세 계산기 (W1)` 섹션에서 아래 2개 항목만 갱신(나머지는 Phase 2/홈택스 대조 전까지 미체크 유지):

```markdown
## 3. 도구 1: 퇴직소득세 계산기 (W1)
- [x] `lib/tax-tables.ts` (2026 세율·공제표) (07-27)
- [x] `lib/calculators/severance-tax.ts` 순수 함수 (07-27)
- [x] 단위 테스트: 검증 3케이스 + 경계값(근속 1년, 5/10/20년 경계) (07-27, ⚠️ SPEC 공식 손계산값 — 홈택스 실측 아님)
- [ ] **홈택스 모의계산 대조 오차 0원 (게이트 — 통과 전 도구 2 금지)** — 운영자 확인 대기 중
- [ ] 화면 구현 (입력 폼, 결과, 계산과정 아코디언)
- [ ] 하단 설명 콘텐츠 800자 + FAQ 4문항
- [ ] 메타태그 + JSON-LD
```

- [ ] **Step 4: Commit**

```bash
git add docs/CHECKLIST.md
git commit -m "chore: checklist §3 계산 로직 부분 완료 표시 (홈택스 대조는 대기 중)"
```
