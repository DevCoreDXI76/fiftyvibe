# 도구 3: DB/DC 전환 계산기 — 설계

작성일: 2026-07-28 · 대상: CHECKLIST.md §5 `/tools/db-dc`

## 배경

도구 1·2(퇴직소득세, 일시금 vs 연금)가 완료되어 마지막 도구인 DB/DC 전환 계산기를 구현한다.
SPEC.md §4 요구사항을 기반으로 하되, "최적 전환 시점"은 전체 탐색 방식으로(운영자 확정),
임금피크제 "시점"은 "정년까지 남은 연차 수"로 입력받는다(운영자 확정).

이 도구는 **"지금 이 시점부터"의 미래 적립분만 비교**한다. 과거 근속분은 이미 확정된
DB 권리이므로 전환 여부와 무관하다 — 이 가정을 콘텐츠에 명시한다.

## 1. 파일 구조

- `lib/calculators/db-dc.ts` — 순수 함수 `calculateDbDcCompare` (신규, 테스트 포함)
- `components/db-dc-calculator.tsx` — `"use client"` 폼+라인차트+결과 (신규)
- `components/db-dc-chart.tsx` — recharts LineChart 전용 컴포넌트, `next/dynamic`으로
  지연 로딩(도구 2 최종 리뷰에서 확립된 패턴 재사용 — 번들 즉시로딩 방지)
- `app/tools/db-dc/page.tsx` — 페이지 셸 (신규)

## 2. 연봉 궤적 (임금피크제 포함)

연도 인덱스 i = 1..n (n = 잔여 근속연수). 기본 연봉:

```
salary(i) = 현재연봉 × (1+연상승률)^(i-1)
```

**임금피크제 적용 시** (입력: `yearsBeforeRetirement`=p "정년까지 남은 연차 수",
`reductionRate`=감액률):

```
peakStart = n - p + 1   (이 연차부터 피크 발동)
peakBase = peakStart > 1
  ? 현재연봉 × (1+연상승률)^(peakStart-2)   // 피크 시작 직전 연도의 연봉
  : 현재연봉                                  // p=n인 경우(1년차부터 피크)

i < peakStart: salary(i) = 현재연봉 × (1+연상승률)^(i-1)   (평소와 동일)
i >= peakStart: salary(i) = peakBase × (1-감액률)^(i-peakStart+1)   (매년 복리 축소)
```

계단식 감액(예: 매년 10%p 추가 감액 등 실제 제도의 다양한 변형)을 단순화한 모델이며,
이 사실을 콘텐츠에 고지한다.

## 3. DB / DC 핵심 계산

**DB 가치(y년차까지 근무 후 그 시점에 DB로 정산할 경우)**, y=0..n:

```
dbValueAt(0) = 0
dbValueAt(y) = (salary(y) / 12) × y     // "30일분 평균임금 × 총근속연수" 근사, 총근속연수=y
```

**DC 잔액(y년차까지 DC로 납입해온 경우)**, y=0..n — 매년 말 `salary(i)/12`를 납입,
잔여기간 DC수익률로 복리:

```
dcValueAt(0) = 0
dcValueAt(y) = Σ_{i=1}^{y} (salary(i)/12) × (1+DC수익률)^(y-i)
```

`dbFull = dbValueAt(n)`, `dcFull = dcValueAt(n)` — 최종 금액 비교에 사용.

**연도별 라인차트**: `{year: i, dbValue: dbValueAt(i), dcValue: dcValueAt(i)}` for i=1..n.
(dbValue는 "그 연차에 DB로 퇴직했다면 받았을 금액", dcValue는 "그 연차까지 DC 누적 잔액" —
두 궤적을 나란히 비교)

## 4. 손익분기 수익률

`dcValueAt(n, rate)`가 `dbFull`과 같아지는 `rate`를 이분탐색(bisection)으로 구한다.
`dcValueAt`은 납입액이 모두 양수이므로 `rate`에 대해 단조증가 — 이분탐색이 안전하다.

```ts
function calculateBreakEvenRate(input): number {
  if (input.remainingYears <= 1) return NaN; // n<=1이면 DC_full이 rate에 의존하지 않음(마지막 항의 지수가 0) — 손익분기 정의 불가
  let lo = -0.99, hi = 2.0;
  const target = dbValueAt(input.remainingYears, input);
  for (let iter = 0; iter < 60; iter++) {
    const mid = (lo + hi) / 2;
    const dc = dcValueAt(input.remainingYears, input, mid);
    if (dc < target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
```

**n≤1 특수 케이스**: 잔여연수가 1년 이하면 DC 납입도 1건뿐이고 그 항의 복리 지수가
0이라(`n-i=0`) 수익률과 무관하게 `dcValueAt(1)=salary(1)/12=dbValueAt(1)`이 항상 성립한다.
이 경우 손익분기 자체가 정의되지 않으므로 `NaN`을 반환하고, 화면에서는 "해당 없음"으로 표시한다.

## 5. 임금피크제 적용 시 — 전체 탐색 최적 전환 시점

k=0(즉시 DC 전환)..n(전환 안 함, 계속 DB) 각각에 대해 총액을 계산:

```
Total(k) = dbValueAt(k) × (1+DC수익률)^(n-k)      // k년차까지 DB로 남았다가 그 시점 가치를
                                                    // DC/IRP로 이전해 잔여기간 복리 성장
         + Σ_{i=k+1}^{n} (salary(i)/12) × (1+DC수익률)^(n-i)   // k+1년차부터 새로 DC 납입
```

경계 확인: `Total(0) = dcFull` (dbValueAt(0)=0이므로 둘째 항만 남아 dcFull과 동일),
`Total(n) = dbFull` (둘째 항이 공집합이므로 첫째 항만 남아 dbFull과 동일) — 두 끝점이
각각 전체 DC/전체 DB와 정확히 일치해야 한다(테스트에서 이 항등식으로 검증).

`optimalYear = argmax_k Total(k)`, 동점 시 더 작은 k(더 이른 전환)를 우선한다 — 배열을
k=0부터 순회하며 **엄격히 더 큰** 값일 때만 갱신하면 자동으로 이 규칙이 적용된다.

n이 최대 40 정도이므로 O(n²)로 즉시 계산 가능(성능 이슈 없음). 피크 미적용 시에는 이
탐색을 수행하지 않는다(SPEC이 "피크 적용 시"로 한정).

## 6. `lib/calculators/db-dc.ts` 타입/함수

```ts
export type DbDcInput = {
  currentAnnualSalary: number;
  annualGrowthRate: number; // 0.03 = 3%
  remainingYears: number; // n
  dcReturnRate: number; // 0.04 = 4%
  peak?: {
    yearsBeforeRetirement: number; // p, 1 <= p <= n
    reductionRate: number; // 0.1 = 10%
  };
};

export type DbDcYearlyPoint = {
  year: number;
  dbValue: number;
  dcValue: number;
};

export type ConversionScenario = {
  year: number; // k
  total: number;
};

export type DbDcResult = {
  dbFull: number;
  dcFull: number;
  yearlyTrajectory: DbDcYearlyPoint[]; // year 1..n
  breakEvenRate: number; // NaN if remainingYears <= 1
  peakAnalysis?: {
    scenarios: ConversionScenario[]; // year 0..n
    optimalYear: number;
  };
};

export function calculateDbDcCompare(input: DbDcInput): DbDcResult;
```

모든 금액 출력(`dbFull`, `dcFull`, 각 `dbValue`/`dcValue`, 각 `total`)은 `Math.round`로
원 단위 반올림한다. `breakEvenRate`는 비율이므로 반올림하지 않고 그대로 반환(화면에서
`toFixed(1)`로 표시).

### 손계산 검증 케이스 (테스트에 사용)

**케이스 A (상승률 0%, 피크 없음 — 가장 단순한 항등식 검증)**:
연봉 1.2억, 상승률 0%, 잔여 4년, DC수익률 5%.
`dbFull = (1.2억/12)×4 = 4,000만`.
`dcFull = 1,000만×(1.05³+1.05²+1.05+1) = 1,000만×4.310125 = 43,101,250`.
연도별: y=1→10,000,000 / y=2→20,500,000 / y=3→31,525,000 / y=4→43,101,250 (DC),
DB는 10,000,000×y로 선형(10M/20M/30M/40M).
**손익분기 수익률 = 0%** (상승률=0%인 상황에서 DC수익률=0%일 때 DC_full=4,000만=dbFull과
정확히 일치 — x³+x²+x+1=4의 실근이 x=1, 즉 r=0).

**케이스 B (상승률 0%, 피크 적용 — 전체 탐색 검증)**:
연봉 1.2억, 상승률 0%, 잔여 5년, DC수익률 3%, 피크: 정년 2년 전부터(`p=2`→`peakStart=4`),
감액률 20%.
`salary(1..3)=1.2억`, `salary(4)=1.2억×0.8=9,600만`, `salary(5)=1.2억×0.64=7,680만`.
`dbFull = (7,680만/12)×5 = 6,400,000×5 = 32,000,000`.
`dcFull ≈ 47,431,358` (Σ 1,000만×1.03⁴ + 1,000만×1.03³ + 1,000만×1.03² + 800만×1.03 + 640만).
전환 시나리오: `Total(0)=Total(1)≈47,431,358`(항등식 — k=1일 때 dbValueAt(1)은 정확히
1년차 월환산 연봉과 같아 dcFull의 1년차 항과 동일해짐), `Total(2)=47,103,540`,
`Total(3)=46,467,000`, `Total(4)=39,360,000`, `Total(5)=32,000,000`(=dbFull) —
피크로 인해 늦게 전환할수록 불리해지는 패턴이 뚜렷하며, **최적 전환 시점 = 0년차(즉시 전환)**.

## 7. `components/db-dc-calculator.tsx`

**입력**
- 현재 연봉 (원, 콤마 포맷 — 도구 1·2와 동일한 `formatWon`/`parseWonInput` 패턴)
- 연 임금상승률 (%, 숫자 입력, 예: -10~30 범위)
- 잔여 근속연수 (년, 1~40)
- DC 기대수익률 (%, 숫자 입력, -10~30 범위)
- 임금피크제 체크박스(선택) → 체크 시 "정년까지 남은 연차 수"(1~잔여근속연수)와
  "감액률"(%, 1~50) 입력 필드 추가 표시

**유효성 검사**: 각 필드 미입력/범위 밖 → 에러. 피크 체크 시 `yearsBeforeRetirement`가
`remainingYears`보다 크면 에러("정년까지 남은 연차는 잔여 근속연수를 넘을 수 없습니다").

쿼리 파라미터는 수신하지 않는다 — 도구 2의 `ToolCTA`가 `?amount=&years=`로 링크하지만
이 값(퇴직급여·근속연수)은 이 도구의 입력(연봉·잔여연수)과 의미상 무관해 자동 완성이
불가능하다. 빈 폼으로 시작한다.

**계산**: "비교하기" → `calculateDbDcCompare(input)`, `trackEvent("calculate_click", {tool:
"db-dc"})`.

**결과 표시**
- 최종 금액 비교: `dbFull` vs `dcFull` (텍스트, 큰 숫자 2개 나란히)
- `<DbDcChart>` (동적 임포트) — 연도별 라인차트, DB/DC 두 라인
- 손익분기 수익률: `breakEvenRate`가 `NaN`이면 "해당 없음(잔여 근속연수 1년 이하)",
  아니면 `"연 {(rate*100).toFixed(1)}% 이상이면 DC가 유리합니다"`
- 피크 체크 시에만: "최적 전환 시점: {optimalYear}년차" + 아코디언 표(연차별 Total(k))
- **DC 전환 비가역성 경고**: `<Disclaimer />`와 별도로, 결과 상단에 눈에 띄는 경고 문구
  ("DB→DC 전환은 되돌릴 수 없습니다. 실제 전환 전 반드시 충분히 검토하세요.")
- `<AdSlot variant="result" />`
- `<Disclaimer />` (조건 없이 항상 렌더 — CLAUDE.md 규칙 4, 도구 2 최종 리뷰에서 확립된
  "Suspense/조건부 렌더 금지" 원칙 유지. 이 컴포넌트는 쿼리 파라미터를 안 쓰므로애초에
  Suspense가 필요 없음 — 도구 2에서 겪은 prerender 문제가 구조적으로 재발하지 않는다)
- 하단 `ToolCTA` 없음 — 다음 도구가 없는 마지막 도구

## 8. `components/db-dc-chart.tsx`

도구 2 최종 리뷰에서 확립한 지연 로딩 패턴을 그대로 따른다: recharts import는 이 파일에만,
`db-dc-calculator.tsx`에서는 `next/dynamic(() => import("./db-dc-chart")..., { ssr: false,
loading: () => <div className="h-64 w-full animate-pulse ..." /> })`로 불러온다.

```tsx
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatWon } from "@/lib/format-currency";
import type { DbDcYearlyPoint } from "@/lib/calculators/db-dc";

export function DbDcChart({ data }: { data: DbDcYearlyPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tickFormatter={(y: number) => `${y}년차`} />
          <YAxis
            tickFormatter={(value: number) =>
              `${(value / 10_000).toLocaleString("ko-KR")}만`
            }
          />
          <Tooltip formatter={(value) => formatWon(Number(value))} />
          <Line type="monotone" dataKey="dbValue" name="DB" stroke="#0E1A2F" />
          <Line type="monotone" dataKey="dcValue" name="DC" stroke="#F5A623" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## 9. `app/tools/db-dc/page.tsx`

도구 1·2와 동일한 셸 구조(metadata, JSON-LD `@graph`, 콘텐츠 2단+`AdSlot`, FAQ).

**title**: `퇴직연금 DB DC 전환 계산기 — 유불리 비교 | 피프티바이브` (SPEC.md §4 명시)

**콘텐츠(800자+)에 반드시 포함**:
- 이 도구는 "지금부터"의 미래 적립분만 비교하며 과거 근속분(이미 확정된 DB 권리)은
  대상이 아니라는 점
- 단순화 모델 고지: 급여구성(상여·수당 등)·수수료·세금 미반영, 임금피크제는 매년 복리
  축소로 단순화한 근사 모델
- 투자 권유 아님, DC 전환 비가역성 경고(운영자 개인 경험 문단 삽입 위치 — 2027년 3월
  DB→DC 전환 예정이라는 페르소나와 자연스럽게 연결되는 지점이므로, 이전 도구들처럼
  `{/* TODO(운영자): DB→DC 전환 결정 경험담 문단 삽입 예정 */}` 주석으로 표시)

**FAQ 4문항** (DB/DC 차이, 손익분기 수익률 의미, 임금피크제 단순화 모델 한계, 전환
비가역성)

## 10. 테스트

- `lib/calculators/db-dc.test.ts`: 케이스 A(피크 없음 — dbFull/dcFull/연도별 궤적/
  손익분기 0% 검증), 케이스 B(피크 있음 — dbFull/dcFull/시나리오 배열/최적시점=0 검증,
  `Total(0)===dcFull`·`Total(n)===dbFull` 항등식 검증), 경계값(`remainingYears=1` →
  `breakEvenRate`가 `NaN`인지, `peak` 미지정 시 `peakAnalysis`가 `undefined`인지)
- 계산기 컴포넌트·페이지는 Playwright로 검증(아래)

## 11. 검증

- `npm test` / `npm run build`
- Playwright: `/tools/db-dc` 접속 → 폼 입력(케이스 A 수치) → 비교하기 → dbFull/dcFull
  텍스트 확인 → 라인차트 svg 렌더 확인 → 손익분기 문구 확인 → 임금피크제 체크박스 켜고
  케이스 B 수치 입력 → 최적 전환 시점 "0년차" 확인 → 콘솔 에러 0건 확인

## 범위 밖

- 홈택스 등 정부 실측 대조 — DB/DC 비교는 애초에 세법 계산이 아니라 임의 가정 기반
  시뮬레이션이므로 대상 아님(콘텐츠에 명시)
- 도구 1·2와 달리 이 도구는 다음 도구로의 `ToolCTA`가 없음(마지막 도구)
- 운영자 개인 경험담 문단 — 삽입 위치만 표시, 문구는 운영자가 나중에 채움
