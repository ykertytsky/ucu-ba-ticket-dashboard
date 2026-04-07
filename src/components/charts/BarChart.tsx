"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartProps {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
  color?: string;
  height?: number;
  horizontal?: boolean;
}

export function BarChart({
  data,
  labelKey,
  valueKey,
  color = "#7c3aed",
  height = 280,
  horizontal = false,
}: BarChartProps) {
  return (
    <div className="h-[280px] w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={
            horizontal
              ? { top: 8, right: 12, left: 4, bottom: 4 }
              : { top: 8, right: 12, left: 0, bottom: 0 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          {horizontal ? (
            <>
              <XAxis type="number" stroke="#71717a" tick={{ fontSize: 10, fill: "#71717a" }} />
              <YAxis
                type="category"
                dataKey={labelKey}
                width={162}
                stroke="#71717a"
                tick={{ fontSize: 10, fill: "#71717a" }}
                tickMargin={6}
                interval={0}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={labelKey} stroke="#71717a" />
              <YAxis stroke="#71717a" />
            </>
          )}
          <Tooltip />
          <Bar dataKey={valueKey} fill={color} radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
