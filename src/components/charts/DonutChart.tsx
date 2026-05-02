"use client";

import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";

const palette = ["#7c3aed", "#0f766e", "#f59e0b", "#ef4444", "#2563eb", "#ea580c"];

interface DonutChartProps {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
}

const CHART_HEIGHT_PX = 280;

export function DonutChart({ data, labelKey, valueKey }: DonutChartProps) {
  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_PX}>
        <RechartsPieChart>
          <Pie data={data} dataKey={valueKey} nameKey={labelKey} innerRadius={64} outerRadius={100} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={`${entry[labelKey]}-${index}`} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
