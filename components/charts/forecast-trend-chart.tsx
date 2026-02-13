"use client";

import { motion } from "framer-motion";
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
import { formatCurrency } from "@/lib/format";

type ForecastTrendChartProps = {
  data: { quarter: string; commit: number; actual: number }[];
};

export function ForecastTrendChart({ data }: ForecastTrendChartProps) {
  return (
    <motion.div
      className="h-72 w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: 0.08 }}
    >
      <ResponsiveContainer minWidth={220} minHeight={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="2 5" stroke="#24324d" />
          <XAxis dataKey="quarter" stroke="#95a8c7" />
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
          <Line type="monotone" dataKey="commit" stroke="#1ac9c0" strokeWidth={2.2} dot={{ r: 2 }} />
          <Line type="monotone" dataKey="actual" stroke="#f6b23f" strokeWidth={2.2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

