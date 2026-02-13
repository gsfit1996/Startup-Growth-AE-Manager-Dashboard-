"use client";

import { motion } from "framer-motion";
import {
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type FunnelConversionChartProps = {
  data: { stage: string; count: number }[];
};

export function FunnelConversionChart({ data }: FunnelConversionChartProps) {
  return (
    <motion.div
      className="h-72 w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <ResponsiveContainer minWidth={220} minHeight={220}>
        <FunnelChart>
          <Tooltip contentStyle={{ backgroundColor: "#111a2d", border: "1px solid #24324d", borderRadius: "12px" }} />
          <Funnel dataKey="count" data={data} isAnimationActive fill="#1ac9c0">
            <LabelList position="right" fill="#e7edf8" stroke="none" dataKey="stage" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

