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
// 명시하지 않아, 이 구현은 반올림으로 가정한다. 홈택스 실측 대조 시 가장 먼저
// 재검증해야 할 항목 — 국내 원천징수 실무는 절사(내림)가 더 일반적이라 이 가정이
// 틀렸을 가능성이 있다.
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

/**
 * ⚠️ 검증 게이트 미통과: 이 함수의 기댓값(테스트 포함)은 SPEC.md §2 공식을
 * 손계산한 값이며, 홈택스 모의계산 실측 대조가 아직 이뤄지지 않았다.
 * CLAUDE.md 검증 게이트("홈택스 대조 오차 0원 확인 전까지 다음 도구 개발 금지")에
 * 따라 실측 대조 전까지 도구 2(§4) 착수 금지.
 * 미검증 가정: (1) 2·3·5단계 반올림 처리, (2) 6·7단계 원단위 절사 처리,
 * (3) 지방소득세 10원 단위 절사 여부. 홈택스 대조 시 이 세 가지를 우선 확인할 것.
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
