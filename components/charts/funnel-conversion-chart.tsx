"use client";

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
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <FunnelChart>
          <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
          <Funnel dataKey="count" data={data} isAnimationActive fill="#14b8a6">
            <LabelList position="right" fill="#cbd5e1" stroke="none" dataKey="stage" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}
