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

export function AeTrendChart({ data }: { data: { month: string; wonArr: number; pipelineArr: number; activityCount: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
          <Legend />
          <Bar dataKey="wonArr" fill="#14b8a6" />
          <Bar dataKey="pipelineArr" fill="#64748b" />
          <Bar dataKey="activityCount" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
