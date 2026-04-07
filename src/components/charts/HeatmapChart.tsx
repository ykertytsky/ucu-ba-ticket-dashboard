interface HeatmapChartProps {
  rows: string[];
  columns: string[];
  values: Record<string, number>;
}

function cellClass(value: number, maxValue: number) {
  if (maxValue === 0) {
    return "bg-zinc-100 text-zinc-500";
  }

  const intensity = value / maxValue;

  if (intensity > 0.75) {
    return "bg-violet-700 text-white";
  }

  if (intensity > 0.5) {
    return "bg-violet-500 text-white";
  }

  if (intensity > 0.25) {
    return "bg-violet-200 text-violet-950";
  }

  return "bg-zinc-100 text-zinc-700";
}

export function HeatmapChart({ rows, columns, values }: HeatmapChartProps) {
  const maxValue = Math.max(0, ...Object.values(values));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-2 text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-zinc-500">Категорія</th>
            {columns.map((column) => (
              <th key={column} className="px-3 py-2 text-left text-zinc-500">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <td className="rounded-xl bg-zinc-50 px-3 py-2 font-medium text-zinc-700">{row}</td>
              {columns.map((column) => {
                const key = `${row}::${column}`;
                const value = values[key] ?? 0;
                return (
                  <td key={key} className={`rounded-xl px-3 py-2 text-center font-semibold ${cellClass(value, maxValue)}`}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
