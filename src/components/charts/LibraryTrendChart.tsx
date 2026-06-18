import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendSnapshot } from "../../types/dashboard";
import locales from "../../locales.json";

interface Item {
  key: string;
  label: string;
  count: number;
}

interface Props {
  title: string;
  items: Item[];
  trends: Record<string, TrendSnapshot>;
  lang: "en" | "id";
}

export function LibraryTrendChart({ title, items, trends, lang }: Props) {
  const copy = locales[lang].rankCharts;
  const movers = items
    .map((item) => {
      const trend = trends[item.key];
      return trend
        ? {
            ...item,
            trend,
            shortLabel: item.label.length > 20 ? `${item.label.slice(0, 19)}...` : item.label,
            score: Math.abs(trend.rankDelta ?? 0) * 10 + Math.abs(trend.countDelta),
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => item.trend.previousRank !== null && (item.trend.rankDelta !== 0 || item.trend.countDelta !== 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item, index) => ({ ...item, seriesKey: `series${index}` }));

  const rankCeiling = movers.reduce((maxRank, item) => {
    const previousRank = item.trend.previousRank ?? item.trend.currentRank;
    return Math.max(maxRank, previousRank, item.trend.currentRank);
  }, 5);
  const previousRanks = movers.reduce<Record<string, number | null>>((acc, item) => {
    acc[item.seriesKey] = item.trend.previousRank;
    return acc;
  }, {});
  const currentRanks = movers.reduce<Record<string, number>>((acc, item) => {
    acc[item.seriesKey] = item.trend.currentRank;
    return acc;
  }, {});
  const chartData = [
    {
      period: "Prev",
      label: copy.previous,
      ...previousRanks,
    },
    {
      period: "Now",
      label: copy.current,
      ...currentRanks,
    },
  ];

  const colorFor = (index: number) => {
    const palette = ["var(--spice-button)", "#8bd5ff", "#f6c177", "#c4a7e7", "#ff7a90"];
    return palette[index % palette.length];
  };

  const tooltipFormatter = (value: unknown, name: unknown) => {
    const mover = movers.find((item) => item.seriesKey === name);
    const rank = Number(value ?? 0);
    return [`#${rank}`, mover?.label ?? String(name)];
  };

  const emptyState = Object.keys(trends).length === 0
    ? copy.needsPrevious
    : copy.noMovement;

  const metricLabel = (trend: TrendSnapshot) => {
    const rankDelta = trend.rankDelta ?? 0;
    return {
      rank: rankDelta === 0 ? copy.sameRank : `${rankDelta > 0 ? copy.up : copy.down} ${Math.abs(rankDelta)}`,
      plays: `${trend.countDelta >= 0 ? "+" : ""}${trend.countDelta} ${copy.plays}`,
    };
  };

  return (
    <div
      className="li-card"
      style={{
        background: "var(--spice-card)",
        borderRadius: 10,
        padding: "16px 20px",
        border: "1px solid var(--spice-button-disabled)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--spice-text)", marginBottom: 12 }}>{title}</div>
      {movers.length === 0 ? (
        <div
          style={{
            minHeight: 190,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--spice-subtext)",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          {emptyState}
        </div>
      ) : (
        <>
          <div style={{ width: "100%", height: 172 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--spice-subtext)", fontSize: 11, fontWeight: 700 }}
                />
                <YAxis
                  reversed
                  domain={[1, rankCeiling]}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--spice-subtext)", fontSize: 10 }}
                  tickFormatter={(value) => `#${value}`}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.18)" }}
                  contentStyle={{
                    background: "#181818",
                    border: "1px solid var(--spice-button-disabled)",
                    borderRadius: 8,
                    color: "var(--spice-text)",
                    fontSize: 12,
                  }}
                  formatter={tooltipFormatter}
                />
                {movers.map((item, index) => (
                  <Line
                    key={item.key}
                    type="monotone"
                    dataKey={item.seriesKey}
                    name={item.seriesKey}
                    stroke={colorFor(index)}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: "#181818" }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {movers.map((item, index) => {
              const metric = metricLabel(item.trend);
              return (
                <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorFor(index), flexShrink: 0 }} />
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--spice-text)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {item.shortLabel}
                  </span>
                  <span style={{ color: "var(--spice-subtext)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {metric.rank} / {metric.plays}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
