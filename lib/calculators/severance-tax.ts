import { TAX_TABLES } from "../tax-tables";

export type SeveranceTaxInput = {
  severancePay: number;
  serviceYears: number;
};

export type SeveranceTaxResult = {
  serviceYearDeduction: number;
  convertedSalary: number;
  convertedSalaryDeduction: number;
  taxBase: number;
  convertedTax: number;
  severanceTax: number;
  localIncomeTax: number;
  netAmount: number;
};

// SPEC.md §2가 2·3·5단계(환산급여·환산급여공제·환산산출세액)의 단수처리 규칙을
// 명시하지 않아 반올림으로 가정했다. 2026-07-27 홈택스 실측 대조(케이스 (b), 2억/21년
// — 나누어떨어지지 않는 유일한 케이스)로 이 가정이 정확함을 확인했다.
function roundWon(value: number): number {
  return Math.round(value);
}

// 6·7단계(퇴직소득세·지방소득세)의 "원단위 절사" 규칙 — 부동소수점 오차 보정 포함
function floorWon(value: number): number {
  return Math.floor(value + 1e-6);
}

// 홈택스의 "차감원천징수세액"은 신고대상세액을 10원 단위로 절사한 값이다
// (2026-07-27 홈택스 실측 대조로 확인: 케이스 (b)에서 663,374원 → 663,370원).
// severanceTax/localIncomeTax 필드 자체는 "신고대상세액"이라 그대로 두고,
// 실수령액 계산에만 이 절사를 반영한다.
function floorTo10Won(value: number): number {
  return Math.floor((value + 1e-6) / 10) * 10;
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

/**
 * ✅ 검증 게이트 통과 (2026-07-27 홈택스 실측 대조 완료): 이 함수의 기댓값(테스트 포함)은
 * SPEC.md §2 공식을 손계산한 값으로 먼저 구현했고, 이후 홈택스 모의계산 실측 대조로
 * 검증했다. CLAUDE.md 검증 게이트("홈택스 대조 오차 0원 확인 전까지 다음 도구 개발
 * 금지")를 통과했으므로 도구 2(§4) 착수 가능.
 * 검증했던 가정: (1) 2·3·5단계 반올림 처리 — 확인 결과 정확함, (2) 6·7단계 원단위
 * 절사 처리 — 확인 결과 정확함, (3) 지방소득세 10원 단위 절사 여부 — 확인 결과
 * 신고대상세액이 아닌 실수령액 계산 단계에서만 적용되는 것으로 확인되어
 * `floorTo10Won` 함수를 추가 구현함. 자세한 내용은 docs/DECISIONS.md D-11,
 * docs/superpowers/specs/2026-07-27-hometax-verification-fix-design.md 참고.
 */
export function calculateSeveranceTax(
  input: SeveranceTaxInput,
): SeveranceTaxResult {
  const { severancePay } = input;
  // 소득세법상 "근속연수 1년 미만은 1년으로 본다" 규칙. calculateServiceYears
  // (날짜 입력 경로)는 이미 이를 보장하지만, 근속연수 직접 입력 경로는 보장하지
  // 않으므로 이 함수 내부에서도 동일하게 정규화한다.
  const serviceYears = Math.max(1, Math.ceil(input.serviceYears));

  const serviceYearDeduction = calculateServiceYearDeduction(serviceYears);
  const convertedSalary = roundWon(
    ((severancePay - serviceYearDeduction) / serviceYears) * 12,
  );
  const convertedSalaryDeduction =
    calculateConvertedSalaryDeduction(convertedSalary);
  const taxBase = convertedSalary - convertedSalaryDeduction;
  const convertedTax = calculateConvertedTax(taxBase);
  const severanceTax = floorWon((convertedTax / 12) * serviceYears);
  const localIncomeTax = floorWon(
    severanceTax * TAX_TABLES[2026].localIncomeTaxRate,
  );
  const netAmount =
    severancePay - floorTo10Won(severanceTax) - floorTo10Won(localIncomeTax);

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
