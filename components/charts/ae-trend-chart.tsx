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

export function AeTrendChart({ data }: { data: { month: string; wonArr: number; pipelineArr: number; activityCount: number }[] }) {
  return (
    <motion.div
      className="h-56 w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34 }}
    >
      <ResponsiveContainer minWidth={220} minHeight={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="2 5" stroke="#24324d" />
          <XAxis dataKey="month" stroke="#95a8c7" />
          <YAxis stroke="#95a8c7" />
          <Tooltip contentStyle={{ backgroundColor: "#111a2d", border: "1px solid #24324d", borderRadius: "12px" }} />
          <Legend />
          <Bar dataKey="wonArr" fill="#1ac9c0" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pipelineArr" fill="#415a86" radius={[4, 4, 0, 0]} />
          <Bar dataKey="activityCount" fill="#f6b23f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

