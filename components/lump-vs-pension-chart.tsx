"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatWon } from "@/lib/format-currency";

type ChartDatum = { name: string; 총세금: number };

export function LumpVsPensionChart({ data }: { data: ChartDatum[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
  );
}
