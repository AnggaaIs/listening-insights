import React, { useState, useRef } from "react";
import { DOW_LABELS, DOW_LABELS_ID, cellColor, fmtHour, matrixMax } from "../utils";
import locales from "../locales.json";

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

interface Props {
  matrix: number[][];
  days: number;
  onRangeChange: (d: 7 | 30 | 90) => void;
  lang: "en" | "id";
}

export function HeatmapGrid({ matrix, days, onRangeChange, lang }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const max = matrixMax(matrix);
  const copy = locales[lang];

  function handleEnter(e: React.MouseEvent, hour: number, dow: number) {
    const val = matrix[hour]?.[dow] ?? 0;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const parent = wrapRef.current?.getBoundingClientRect();
    if (!parent) return;

    const dayName = (lang === "en" ? DOW_LABELS : DOW_LABELS_ID)[dow];
    const playSuffix = val === 1 ? copy.tooltipPlaySingular : copy.tooltipPlayPlural;

    setTooltip({
      text: `${dayName} ${fmtHour(hour)} — ${val} ${playSuffix}`,
      x: rect.left - parent.left,
      y: rect.top - parent.top - 32,
    });
  }

  return (
    <div
      className="li-card"
      style={{
        background: "var(--spice-card)",
        borderRadius: 10,
        padding: 20,
        border: "1px solid var(--spice-button-disabled)",
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{ fontSize: 14, fontWeight: 600, color: "var(--spice-text)" }}
        >
          {copy.activityTitle}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {([7, 30, 90] as const).map((r) => (
            <div
              className="li-action-button"
              key={r}
              onClick={() => onRangeChange(r)}
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 20,
                cursor: "pointer",
                background: days === r ? "var(--spice-button)" : "transparent",
                color:
                  days === r ? "var(--spice-main)" : "var(--spice-subtext)",
                border: `1px solid ${days === r ? "var(--spice-button)" : "var(--spice-button-disabled)"}`,
                fontWeight: days === r ? 700 : 400,
                userSelect: "none",
              }}
            >
              {r}{copy.rangeDayShort}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Container */}
      <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
        <div ref={wrapRef} style={{ position: "relative", minWidth: 560, maxWidth: 920, width: "100%", margin: "0 auto", paddingBottom: 6, paddingTop: 14 }}>
          {tooltip && (
            <div
              style={{
                position: "absolute",
                left: tooltip.x,
                top: tooltip.y,
                background: "var(--spice-main)",
                border: "1px solid var(--spice-button-disabled)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11,
                color: "var(--spice-text)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 99,
              }}
            >
              {tooltip.text}
            </div>
          )}

          {/* Hour headers at the top */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "42px repeat(24, minmax(14px, 1fr))",
              gap: 4,
              marginBottom: 6,
              alignItems: "center",
            }}
          >
            <div />
            {Array.from({ length: 24 }).map((_, hour) => (
              <div
                key={hour}
                style={{
                  fontSize: 8,
                  color: "var(--spice-subtext)",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                {hour % 4 === 0 ? String(hour).padStart(2, "0") : ""}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {Array.from({ length: 7 }).map((_, dow) => {
            const dayName = (lang === "en" ? DOW_LABELS : DOW_LABELS_ID)[dow];
            return (
              <div
                key={dow}
                style={{
                  display: "grid",
                  gridTemplateColumns: "42px repeat(24, minmax(14px, 1fr))",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                {/* Day label on the left */}
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--spice-subtext)",
                    fontWeight: 500,
                    textAlign: "right",
                    paddingRight: 6,
                    userSelect: "none",
                  }}
                >
                  {dayName}
                </div>

                {/* 24 hour cells */}
                {Array.from({ length: 24 }).map((_, hour) => {
                  const val = matrix[hour]?.[dow] ?? 0;
                  return (
                    <div
                      key={hour}
                      className="hm-cell"
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        minWidth: 14,
                        borderRadius: 3,
                        background: cellColor(val, max),
                        cursor: "pointer",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => handleEnter(e, hour, dow)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginTop: 12,
          justifyContent: "flex-end",
        }}
      >
        <span style={{ fontSize: 10, color: "var(--spice-subtext)" }}>
          {copy.legendFew}
        </span>
        {[
          "var(--hm-1)",
          "var(--hm-2)",
          "var(--hm-3)",
          "var(--hm-4)",
          "var(--hm-5)",
        ].map((c, i) => (
          <div
            key={i}
            style={{ width: 12, height: 12, borderRadius: 2, background: c }}
          />
        ))}
        <span style={{ fontSize: 10, color: "var(--spice-subtext)" }}>
          {copy.legendMany}
        </span>
      </div>
    </div>
  );
}
