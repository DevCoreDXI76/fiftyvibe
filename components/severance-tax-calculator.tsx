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

    const severancePay = parseWonInput(severancePayInput);
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
            onChange={(event) => {
              setSeverancePayInput(event.target.value.replace(/[^0-9]/g, ""));
              setCalculation(null);
            }}
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
          <div className="flex flex-col gap-4 sm:flex-row">
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
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setCalculation(null);
                }}
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
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setCalculation(null);
                }}
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
              onChange={(event) => {
                setManualYears(event.target.value);
                setCalculation(null);
              }}
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
            <p className="mt-1 text-xs text-navy/50">
              * 실수령액은 세금을 10원 단위로 절사해 계산합니다(홈택스 원천징수 방식). &quot;총
              세금&quot;은 절사 전 정확한 금액이라 두 값의 차이가 최대 몇십 원 날 수 있습니다.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setAccordionOpen((open) => !open)}
              className="text-sm font-medium text-navy underline decoration-amber"
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

          <AdSlot variant="result" />
          <ToolCTA
            title="일시금 vs 연금 수령, 뭐가 유리할까?"
            description="같은 퇴직금이라도 수령 방식에 따라 세금이 달라집니다."
            href={`/tools/lump-vs-pension?amount=${calculation.input.severancePay}&years=${calculation.input.serviceYears}`}
            ctaLabel="비교해보기"
          />
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
