"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

type ForecastStageChartProps = {
  data: { stage: string; commit: number; bestCase: number; pipeline: number }[];
};

export function ForecastStageChart({ data }: ForecastStageChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="stage" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
          <Legend />
          <Bar dataKey="commit" stackId="a" fill="#14b8a6" />
          <Bar dataKey="bestCase" stackId="a" fill="#f59e0b" />
          <Bar dataKey="pipeline" stackId="a" fill="#64748b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
