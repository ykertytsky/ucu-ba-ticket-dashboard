"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LineChartProps {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
  color?: string;
}

export function LineChart({ data, labelKey, valueKey, color = "#2563eb" }: LineChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey={labelKey} stroke="#71717a" />
          <YAxis stroke="#71717a" />
          <Tooltip />
          <Line type="monotone" dataKey={valueKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
