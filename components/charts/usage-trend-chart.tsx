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
} from "recharts";

type UsageTrendChartProps = {
  data: { date: string; apiCalls: number; seatsActive: number }[];
};

export function UsageTrendChart({ data }: UsageTrendChartProps) {
  return (
    <motion.div
      className="h-64 w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36 }}
    >
      <ResponsiveContainer minWidth={220} minHeight={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="2 5" stroke="#24324d" />
          <XAxis dataKey="date" stroke="#95a8c7" />
          <YAxis stroke="#95a8c7" />
          <Tooltip contentStyle={{ backgroundColor: "#111a2d", border: "1px solid #24324d", borderRadius: "12px" }} />
          <Line type="monotone" dataKey="apiCalls" stroke="#1ac9c0" strokeWidth={2.2} dot={false} />
          <Line type="monotone" dataKey="seatsActive" stroke="#8fb8ff" strokeWidth={2.2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

