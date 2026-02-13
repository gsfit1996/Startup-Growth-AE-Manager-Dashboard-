"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

type ForecastTrendChartProps = {
  data: { quarter: string; commit: number; actual: number }[];
};

export function ForecastTrendChart({ data }: ForecastTrendChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="quarter" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
          <Legend />
          <Line type="monotone" dataKey="commit" stroke="#14b8a6" strokeWidth={2} />
          <Line type="monotone" dataKey="actual" stroke="#eab308" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
