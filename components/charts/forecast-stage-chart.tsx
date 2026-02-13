"use client";

import { motion } from "framer-motion";
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
import { formatCurrency } from "@/lib/format";

type ForecastStageChartProps = {
  data: { stage: string; commit: number; bestCase: number; pipeline: number }[];
};

export function ForecastStageChart({ data }: ForecastStageChartProps) {
  return (
    <motion.div
      className="h-80 w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36 }}
    >
      <ResponsiveContainer minWidth={240} minHeight={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="2 5" stroke="#24324d" />
          <XAxis dataKey="stage" stroke="#95a8c7" />
          <YAxis stroke="#95a8c7" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              backgroundColor: "#111a2d",
              border: "1px solid #24324d",
              borderRadius: "12px",
              color: "#e7edf8",
            }}
          />
          <Legend />
          <Bar dataKey="commit" stackId="a" fill="#1ac9c0" radius={[6, 6, 0, 0]} />
          <Bar dataKey="bestCase" stackId="a" fill="#f6b23f" radius={[6, 6, 0, 0]} />
          <Bar dataKey="pipeline" stackId="a" fill="#415a86" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

