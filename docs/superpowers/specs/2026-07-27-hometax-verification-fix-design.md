# 홈택스 대조 결과 반영 (근속연수 버그 수정 + 10원 절사) — 설계

작성일: 2026-07-27 · 대상: CHECKLIST.md §3 "홈택스 모의계산 대조 오차 0원" 게이트 해제

## 배경

운영자가 홈택스 "2024년 귀속 퇴직소득 지급명세서 모의계산"으로 SPEC.md §2의 검증 3케이스를
직접 대조했다. 결과: **세율표·계산 공식은 전부 정확**했고, 버그 2개만 발견됐다.

### 대조 과정에서 확인된 사실 (증거)

**1. 근속연수 계산 버그.** 홈택스 페이지 자체에 실린 공식 예제표:

| 기산일 | 퇴사일 | 근속연수 |
|---|---|---|
| 1994-04-15 | 1998-04-14 (정확히 4년 하루 전) | 4년 |
| 1994-04-15 | 1998-04-15 (**정확히 4년째 그날**) | **5년** |
| 2016-01-31 | 2017-01-30 | 1년 |
| 2016-01-31 | 2017-01-31 (정확히 1년째 그날) | **2년** |
| 2015-02-28 | 2016-02-27 | 1년 |
| 2015-02-28 | 2016-02-28 (정확히 1년째 그날) | **2년** |

**규칙: 퇴사일이 입사일로부터 정확히 N년째 되는 날이면 근속연수는 N+1년.** 하루라도 못 미치면
N년. 기존 `calculateServiceYears`는 "그날과 같으면 N년"(부등호 `>`)으로 짜여 있어 이 경우를
놓쳤다.

**2. 실측 대조로 확인된 나머지 사실:**
- 실제 홈택스 케이스 (a) 1억/**11년**(정확히 10년째 되는 날 = 위 버그로 인해 11년 처리됨)의
  (28)~(33) 전 단계가 우리 공식으로 재계산한 값과 **소수점 하나 틀리지 않고 정확히 일치**
  (근속연수공제 17,500,000 / 환산급여 90,000,000 / 환산급여공제 56,200,000 /
  과세표준 33,800,000 / 환산산출세액 3,810,000 / 신고대상세액 3,492,500).
- 케이스 (c) 5,000만/**6년**(같은 이유로 5→6년)도 1,770,000으로 정확히 일치.
- 케이스 (b) 2억/**21년**은 환산급여 계산에서 나누어떨어지지 않는(89,714,285.71...) 유일한
  케이스였는데, 우리 코드의 반올림 가정(2·3·5단계 `Math.round`, 6·7단계 `Math.floor`)으로
  계산한 결과가 홈택스의 "신고대상세액"(6,633,749 / 663,374)과 **1원까지 정확히 일치**했다.
  → **반올림 가정은 검증 완료, 수정 불필요.**
- 다만 홈택스의 최종 "차감원천징수세액"(실제 원천징수액)은 신고대상세액을 **10원 단위로
  절사**한 값이었다(6,633,749→6,633,740, 663,374→663,370). 케이스 (a)·(c)는 원래 값이
  이미 10의 배수라 이 차이가 드러나지 않았을 뿐이다.

## 수정 범위

### 1. `lib/calculators/service-years.ts`

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
  // (하루라도 못 미치면 N년). 따라서 anniversary와 "같은 날"도 партial year로
  // 취급해야 하므로 >= 를 쓴다 (> 가 아님 — 2026-07-27 홈택스 실측 대조로 확정).
  const hasPartialYear = end.getTime() >= anniversary.getTime();
  const years = hasPartialYear ? exactYears + 1 : exactYears;

  return Math.max(years, 1);
}
```

(UTC 관련 주석·로직은 기존 그대로 유지, `>` → `>=` 한 글자만 변경 + 주석 갱신)

### 2. `lib/calculators/service-years.test.ts`

- 기존 "정확히 n년 경과하면 올림 없이 n년" 테스트: 이름과 기댓값을 정정
  ("정확히 n년째 되는 날 퇴사하면 n+1년으로 처리한다", `2015-03-01`~`2025-03-01` → **11**)
- 홈택스 공식 예제표 7개 행을 전부 테스트 케이스로 추가 (정부 공식 자료와의 대조이므로
  가장 신뢰도 높은 회귀 테스트)
- 기존 나머지 테스트(1년+1일 초과, 1년 미만, 같은 날)는 변경 없음 (이 버그와 무관하게 이미
  정확했음 — `>` 를 `>=`로 바꿔도 결과가 같은 케이스들)

### 3. `lib/calculators/severance-tax.ts`

`netAmount` 계산에 10원 단위 절사 적용. `severanceTax`/`localIncomeTax` 필드 자체는 변경하지
않는다(신고대상세액 그대로, 이미 홈택스와 1원 단위로 일치 검증됨) — 오직 실수령액 산출 시
내부적으로만 절사값을 사용한다.

```ts
// 홈택스의 "차감원천징수세액"은 신고대상세액을 10원 단위로 절사한 값이다
// (2026-07-27 홈택스 실측 대조로 확인: 케이스 (b)에서 663,374원 → 663,370원).
// severanceTax/localIncomeTax 필드 자체는 "신고대상세액"이라 그대로 두고,
// 실수령액 계산에만 이 절사를 반영한다.
function floorTo10Won(value: number): number {
  return Math.floor((value + 1e-6) / 10) * 10;
}
```

`calculateSeveranceTax` 함수 마지막의 `netAmount` 계산 줄만 아래로 교체:

```ts
const netAmount =
  severancePay - floorTo10Won(severanceTax) - floorTo10Won(localIncomeTax);
```

### 4. `lib/calculators/severance-tax.test.ts`

기존 10개 테스트 중 **케이스 (c) 하나만** `netAmount` 기댓값 변경: `47_641_875` →
**`47_641_880`** (지방소득세 214,375원이 10원 단위 절사로 214,370원이 되기 때문에 5원 차이
발생 — 나머지 9개 테스트는 severanceTax/localIncomeTax가 이미 10의 배수라 영향 없음, 직접
확인 완료).

### 5. 문서 갱신

- `docs/CHECKLIST.md` §3: "홈택스 모의계산 대조 오차 0원" 항목 체크 완료로 변경, 단위 테스트
  줄의 "⚠️ 홈택스 실측 아님" 문구를 "✅ 홈택스 실측 대조 완료 (07-27)"로 갱신
- `docs/DECISIONS.md` D-11: 상태를 "확정 (임시 — 홈택스 대조 완료 시 게이트 해제)" →
  "완료 (홈택스 대조 완료, 게이트 해제)"로 갱신, 트레이드오프 항목에 대조 결과 요약 추가
- `docs/superpowers/specs/2026-07-27-severance-tax-calc-design.md`,
  `docs/superpowers/specs/2026-07-27-severance-tax-screen-design.md`의 "미검증 가정" 관련
  문구 뒤에 검증 완료 사실 한 줄 추가 (과거 문서 수정이므로 최소한으로, 기존 내용은 보존)

## 테스트

- `service-years.test.ts`: 정정된 1개 + 신규 7개(홈택스 공식 예제) + 기존 3개 유지 = 총 11개
- `severance-tax.test.ts`: 기존 12개 중 1개(케이스 c의 netAmount) 값만 수정, 나머지 11개 그대로
- 전체 `npm test` 통과 확인

## 검증

- `npm test` / `npm run build`
- 이 스펙 자체가 이미 홈택스 실측값과의 대조 결과이므로, 별도 Playwright 스모크 테스트는
  불필요(계산 로직 레벨 수정이며 화면은 변경 없음). 단, `npm run dev`로 `/tools/severance-tax`
  접속해 기존 화면이 여전히 정상 동작하는지 육안 확인은 진행.

## 범위 밖

- 게이트가 해제되므로 다음 세션에서 CHECKLIST.md §4(도구 2) 착수가 가능해짐 — 이 스펙 자체는
  도구 2 구현을 다루지 않음
