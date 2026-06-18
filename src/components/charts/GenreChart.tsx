import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface GenreItem {
  name: string;
  count: number;
}

interface Props {
  data: GenreItem[];
  max: number;
}

const COLORS = ["#1db954", "#8bd5ff", "#f6c177", "#c4a7e7", "#ff7a90", "#ff6b6b", "#3dcc6e", "#f9a8d4"];

export function GenreChart({ data, max }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map((g) => ({ name: g.name, value: g.count }));

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={72}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#181818",
              border: "1px solid var(--spice-button-disabled)",
              borderRadius: 8,
              color: "var(--spice-text)",
              fontSize: 12,
            }}
            formatter={(value: unknown) => [`${value} plays`]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
