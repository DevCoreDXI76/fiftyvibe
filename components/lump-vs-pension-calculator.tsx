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
                <Tooltip formatter={(value) => formatWon(Number(value))} />
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
