import { TAX_TABLES } from "../tax-tables";

export type PensionWithdrawalLimitInput = {
  /** 과세기간 개시일(연금수령연차 첫 해는 개시 신청일) 기준 연금계좌 평가액(원) */
  accountValue: number;
  /** 연금수령연차 (최초 수령 가능일이 속한 과세기간을 1년차로, 이후 누적 합산) */
  withdrawalYear: number;
};

export type PensionWithdrawalLimitResult = {
  /** 해당 연차에 연금소득으로 인출할 수 있는 한도(원) */
  limit: number;
  /** 연금수령연차 11년 이상이라 한도 자체가 없는(전액 인출 가능) 경우 true */
  isUnlimited: boolean;
};

function floorWon(value: number): number {
  return Math.floor(value + 1e-6);
}

/**
 * 연금수령한도 = 연금계좌 평가액 ÷ (11 − 연금수령연차) × 120%
 * (소득세법 시행령 제40조의2 제3항제3호, 연금수령연차 11년 이상은 같은 조 제4항에 따라 전액)
 * 이 한도를 초과해 인출한 금액은 연금외수령(퇴직소득세 등 상대적으로 무거운 과세)으로 처리된다.
 */
export function calculatePensionWithdrawalLimit(
  input: PensionWithdrawalLimitInput,
): PensionWithdrawalLimitResult {
  const { accountValue, withdrawalYear } = input;
  const { yearThreshold, multiplier } = TAX_TABLES[2026].pensionWithdrawalLimit;

  if (withdrawalYear < 1) {
    throw new Error(`연금수령연차는 1 이상이어야 합니다: ${withdrawalYear}`);
  }

  if (withdrawalYear >= yearThreshold) {
    return { limit: accountValue, isUnlimited: true };
  }

  const limit = floorWon(
    (accountValue / (yearThreshold - withdrawalYear)) * multiplier,
  );
  return { limit, isUnlimited: false };
}
