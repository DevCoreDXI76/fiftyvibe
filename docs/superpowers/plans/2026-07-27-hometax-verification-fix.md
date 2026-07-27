# 홈택스 대조 결과 반영 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈택스 실측 대조로 발견된 근속연수 계산 버그와 10원 절사 누락을 수정해 CHECKLIST.md §3의 홈택스 대조 게이트를 통과시킨다.

**Architecture:** `calculateServiceYears`의 "정확히 N년째 되는 날" 처리를 부등호 한 글자(`>`→`>=`)로 수정하고, `calculateSeveranceTax`의 `netAmount` 계산에 10원 단위 절사를 추가한다. 둘 다 이미 홈택스 실측값으로 검증된 수정이라 별도 미확정 사항 없음.

**Tech Stack:** TypeScript, Vitest. 신규 npm 패키지 없음.

## Global Constraints

- 계산 상수는 `lib/tax-tables.ts` 한 파일에서만 관리 — 이 플랜은 상수를 추가하지 않는다
- 계산 로직은 `lib/calculators/*.ts` 순수 함수 + 단위 테스트 (CLAUDE.md 코드 컨벤션)
- 새 npm 패키지 추가 금지
- **모든 수정은 이미 홈택스 실측 대조로 검증된 내용이다** — 아래 각 태스크의 기댓값은 추측이 아니라 실제 홈택스 화면에서 확인한 결과다

---

### Task 1: `calculateServiceYears` 근속연수 버그 수정

**Files:**
- Modify: `lib/calculators/service-years.ts`
- Modify: `lib/calculators/service-years.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `calculateServiceYears(startDate: string, endDate: string): number` — 시그니처 변경 없음, 동작만 정정

- [ ] **Step 1: `lib/calculators/service-years.test.ts` 전체를 아래 내용으로 교체**

```ts
import { describe, expect, it } from "vitest";
import { calculateServiceYears } from "./service-years";

describe("calculateServiceYears", () => {
  it("정확히 n년째 되는 날 퇴사하면 n+1년으로 처리한다 (홈택스 실측 확인)", () => {
    expect(calculateServiceYears("2015-03-01", "2025-03-01")).toBe(11);
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

  describe("홈택스 공식 예제표 (2024년 귀속 퇴직소득 지급명세서 모의계산 페이지 게재)", () => {
    it("1994-04-15 ~ 1998-04-14 (4년 하루 전) → 4년", () => {
      expect(calculateServiceYears("1994-04-15", "1998-04-14")).toBe(4);
    });

    it("1994-04-15 ~ 1998-04-15 (정확히 4년째 되는 날) → 5년", () => {
      expect(calculateServiceYears("1994-04-15", "1998-04-15")).toBe(5);
    });

    it("2016-01-31 ~ 2017-01-30 (1년 하루 전) → 1년", () => {
      expect(calculateServiceYears("2016-01-31", "2017-01-30")).toBe(1);
    });

    it("2016-01-31 ~ 2017-01-31 (정확히 1년째 되는 날) → 2년", () => {
      expect(calculateServiceYears("2016-01-31", "2017-01-31")).toBe(2);
    });

    it("2015-02-28 ~ 2016-02-27 (1년 하루 전) → 1년", () => {
      expect(calculateServiceYears("2015-02-28", "2016-02-27")).toBe(1);
    });

    it("2015-02-28 ~ 2016-02-28 (정확히 1년째 되는 날) → 2년", () => {
      expect(calculateServiceYears("2015-02-28", "2016-02-28")).toBe(2);
    });

    it("2016-02-29 ~ 2017-02-28 (윤년 2/29 입사, 익년 2/28 퇴사) → 1년", () => {
      expect(calculateServiceYears("2016-02-29", "2017-02-28")).toBe(1);
    });
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/calculators/service-years.test.ts`
Expected: FAIL — 첫 번째 테스트("정확히 n년째...")가 실제로 10을 반환해 기댓값 11과
불일치. 나머지 새 테스트들도 현재 구현(`>` 비교)에서는 anniversary와 같은 날짜인 케이스들이
전부 실패해야 한다 (5년/2년/2년 기대하는 3개 테스트 실패, 4년/1년/1년/1년 기대하는 4개는
이미 통과할 수 있음 — 그 케이스들은 anniversary 이전이라 버그와 무관)

- [ ] **Step 3: `lib/calculators/service-years.ts` 전체를 아래 내용으로 교체**

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

  // 홈택스 공식 예제표(소득세법 시행령 제105조1항 해석)로 확인된 규칙:
  // 퇴사일이 입사일로부터 "정확히 N년째 되는 날"이어도 N+1년으로 계산한다
  // (하루라도 못 미치면 N년). anniversary와 "같은 날"도 부분년으로 취급해야
  // 하므로 >= 를 쓴다 (2026-07-27 홈택스 실측 대조로 확정).
  const hasPartialYear = end.getTime() >= anniversary.getTime();
  const years = hasPartialYear ? exactYears + 1 : exactYears;

  return Math.max(years, 1);
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/calculators/service-years.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/calculators/service-years.ts lib/calculators/service-years.test.ts
git commit -m "fix: 근속연수 계산 - 정확히 N년째 되는 날은 N+1년으로 처리 (홈택스 실측 확인)"
```

---

### Task 2: `netAmount` 10원 단위 절사 추가

**Files:**
- Modify: `lib/calculators/severance-tax.ts`
- Modify: `lib/calculators/severance-tax.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `calculateSeveranceTax`의 반환 타입·`severanceTax`/`localIncomeTax` 필드는 변경 없음. `netAmount` 필드의 계산 방식만 내부적으로 변경(10원 단위 절사 반영)

- [ ] **Step 1: `lib/calculators/severance-tax.test.ts`에서 케이스 (c)의 기댓값 1줄만 수정**

파일에서 아래 블록을 찾아:

```ts
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
```

마지막 `expect(result.netAmount)` 줄만 아래로 교체 (나머지는 그대로 유지):

```ts
      expect(result.netAmount).toBe(47_641_880);
```

(케이스 (a), (b)와 나머지 경계값 테스트는 severanceTax/localIncomeTax가 이미 10의 배수라
영향받지 않으므로 수정하지 않는다.)

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/calculators/severance-tax.test.ts`
Expected: FAIL — 케이스 (c)의 `netAmount` 기대값(47,641,880)이 현재 구현이 반환하는
47,641,875와 불일치

- [ ] **Step 3: `lib/calculators/severance-tax.ts`에서 2곳 수정**

**3-1.** `roundWon` 함수 바로 다음, `floorWon` 함수 정의 뒤에 새 함수 추가. 파일에서 아래
블록을 찾아:

```ts
// 6·7단계(퇴직소득세·지방소득세)의 "원단위 절사" 규칙 — 부동소수점 오차 보정 포함
function floorWon(value: number): number {
  return Math.floor(value + 1e-6);
}
```

바로 뒤에 아래 함수를 추가:

```ts

// 홈택스의 "차감원천징수세액"은 신고대상세액을 10원 단위로 절사한 값이다
// (2026-07-27 홈택스 실측 대조로 확인: 케이스 (b)에서 663,374원 → 663,370원).
// severanceTax/localIncomeTax 필드 자체는 "신고대상세액"이라 그대로 두고,
// 실수령액 계산에만 이 절사를 반영한다.
function floorTo10Won(value: number): number {
  return Math.floor((value + 1e-6) / 10) * 10;
}
```

**3-2.** `calculateSeveranceTax` 함수 안의 `netAmount` 계산 줄을 찾아:

```ts
  const netAmount = severancePay - severanceTax - localIncomeTax;
```

아래로 교체:

```ts
  const netAmount =
    severancePay - floorTo10Won(severanceTax) - floorTo10Won(localIncomeTax);
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/calculators/severance-tax.test.ts`
Expected: PASS (12 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/calculators/severance-tax.ts lib/calculators/severance-tax.test.ts
git commit -m "fix: 실수령액 계산 시 세금 10원 단위 절사 추가 (홈택스 실측 확인)"
```

---

### Task 3: 전체 검증 + 문서 갱신 (게이트 해제)

**Files:**
- Modify: `docs/CHECKLIST.md`
- Modify: `docs/DECISIONS.md`
- Modify: `docs/superpowers/specs/2026-07-27-severance-tax-calc-design.md`
- Modify: `docs/superpowers/specs/2026-07-27-severance-tax-screen-design.md`

**Interfaces:**
- Consumes: Task 1, 2의 모든 산출물
- Produces: 없음 (최종 검증 + 문서 갱신 + 게이트 해제)

- [ ] **Step 1: 전체 테스트 + 빌드**

Run: `npm test`
Expected: PASS — 전체 스위트(analytics 3 + severance-tax 12 + service-years 11 +
format-currency 6 = 32개) 통과

Run: `npm run build`
Expected: 에러 없이 정적 export 빌드 성공

- [ ] **Step 2: 개발 서버 육안 확인 (계산 로직만 바뀌었으므로 화면 자체 확인은 간단히)**

Run: `npm run dev`, 브라우저로 `http://localhost:3000/tools/severance-tax` 접속
Expected: 페이지가 §2 Phase 2 때와 동일하게 정상 렌더링됨 (이번 수정은 화면 코드를
건드리지 않았으므로 회귀 없어야 함)

- [ ] **Step 3: `docs/CHECKLIST.md` §3 갱신**

`## 3. 도구 1: 퇴직소득세 계산기 (W1)` 섹션을 찾아 아래로 전체 교체:

```markdown
## 3. 도구 1: 퇴직소득세 계산기 (W1)
- [x] `lib/tax-tables.ts` (2026 세율·공제표) (07-27)
- [x] `lib/calculators/severance-tax.ts` 순수 함수 (07-27)
- [x] 단위 테스트: 검증 3케이스 + 경계값(근속 1년, 5/10/20년 경계) (07-27, ✅ 홈택스 실측 대조 완료)
- [x] **홈택스 모의계산 대조 오차 0원 (게이트 — 통과 전 도구 2 금지)** (07-27, 운영자 직접 대조 — 근속연수 계산 버그 1건 + 10원 절사 로직 1건 수정 후 오차 0원 확인. §4 착수 가능)
- [x] 화면 구현 (입력 폼, 결과, 계산과정 아코디언) (07-27, Playwright 스모크 테스트 통과)
- [x] 하단 설명 콘텐츠 800자 + FAQ 4문항 (07-27, 운영자 개인 경험담 문단은 추후 보강 예정)
- [x] 메타태그 + JSON-LD (07-27, WebApplication+FAQPage+BreadcrumbList)
```

- [ ] **Step 4: `docs/DECISIONS.md` D-11 갱신**

`## D-11. 퇴직소득세 계산 로직 우선 구현, 홈택스 대조는 별도 진행` 항목을 찾아 전체를
아래로 교체:

```markdown
## D-11. 퇴직소득세 계산 로직 우선 구현, 홈택스 대조는 별도 진행
- 결정일: 2026-07-27 / 상태: 완료 (홈택스 대조 완료, 게이트 해제)
- 배경: CLAUDE.md 검증 게이트("홈택스 대조 오차 0원 확인 전까지 다음 도구 개발 금지")를
  충족하려면 홈택스 모의계산 실측값이 필요하나, 정부 사이트 자동 접근이 불안정해
  운영자 수동 확인이 필요
- 결정: 계산 로직(lib/tax-tables.ts, lib/calculators/severance-tax.ts)은 SPEC.md §2
  공식을 손계산한 값으로 먼저 구현·테스트하고, 홈택스 실측 대조는 운영자가 별도로 진행
- 트레이드오프: 게이트 미충족 상태로 계산 로직이 커밋됨 — §4(도구 2) 착수는 계속 금지.
  반올림 vs 절사 등 단수처리 가정(lib/calculators/severance-tax.ts 주석 참고)이
  틀릴 가능성 있음
- 결과(07-27): 운영자가 홈택스 "2024년 귀속 퇴직소득 지급명세서 모의계산"으로 SPEC 3케이스
  전부 대조. 세율표·계산 공식·반올림 가정은 전부 정확했고, 버그 2건 발견·수정: (1)
  `calculateServiceYears`가 "입사일로부터 정확히 N년째 되는 날" 퇴사를 N년으로 처리하던
  것을 N+1년으로 정정(홈택스 공식 예제표로 확인), (2) 실수령액 계산 시 세금을 10원 단위로
  절사하는 로직 추가(홈택스 "차감원천징수세액" 방식). 수정 후 3케이스 전부 오차 0원 확인.
  §4(도구 2) 착수 가능
```

- [ ] **Step 5: 설계 스펙 문서 2개에 검증 완료 주석 추가**

`docs/superpowers/specs/2026-07-27-severance-tax-calc-design.md` 파일을 읽고,
"**단수처리 가정(미검증):**"으로 시작하는 문단을 찾아 그 문단 바로 뒤(같은 섹션 안)에
아래 문단을 추가 (기존 문단은 그대로 유지):

```markdown

**✅ 검증 완료 (2026-07-27):** 홈택스 실측 대조 결과 이 반올림 가정은 정확했다. 다만
근속연수 계산에 별도 버그가 있었고, 실수령액 계산에는 10원 단위 절사가 추가로 필요했다.
자세한 내용은 `docs/superpowers/specs/2026-07-27-hometax-verification-fix-design.md` 참고.
```

`docs/superpowers/specs/2026-07-27-severance-tax-screen-design.md` 파일을 읽고,
"홈택스 대조는 여전히 보류 상태(D-11)"라는 문구가 포함된 문장을 찾아, 그 문장이 있는
문단 끝에 아래를 덧붙임:

```markdown
(→ 2026-07-27 홈택스 실측 대조 완료, 게이트 해제됨 — 자세한 내용은 DECISIONS.md D-11 참고)
```

- [ ] **Step 6: Commit**

```bash
git add docs/CHECKLIST.md docs/DECISIONS.md docs/superpowers/specs/2026-07-27-severance-tax-calc-design.md docs/superpowers/specs/2026-07-27-severance-tax-screen-design.md
git commit -m "docs: 홈택스 대조 완료 반영 — CHECKLIST 게이트 체크, DECISIONS D-11 완료 처리"
```
