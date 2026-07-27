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
