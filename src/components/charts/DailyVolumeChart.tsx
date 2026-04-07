"use client";

import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailyVolumeChartProps {
  data: Array<{ date: string; count: number }>;
  height?: number;
}

function formatDateLabel(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM", { locale: uk });
  } catch {
    return dateStr;
  }
}

export function DailyVolumeChart({ data, height = 280 }: DailyVolumeChartProps) {
  const formatted = data.map((d) => ({ ...d, label: formatDateLabel(d.date) }));

  // Show every Nth tick to avoid crowding when there are many days
  const tickInterval = Math.max(0, Math.floor(data.length / 12) - 1);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formatted}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="label"
            stroke="#71717a"
            tick={{ fontSize: 12 }}
            interval={tickInterval}
          />
          <YAxis stroke="#71717a" tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [value, "Тікети"]}
          />
          <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Тікети" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
