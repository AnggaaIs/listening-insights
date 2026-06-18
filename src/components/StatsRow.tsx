import React from "react";
import { DOW_LABELS, DOW_LABELS_ID, fmtHour } from "../utils";
import locales from "../locales.json";

interface Props {
  totalPlays: number;
  peak: number; // peak hour index
  peakDowIdx: number; // peak day of week index
  days: number;
  lang: "en" | "id";
  listeningTimeMin: number;
  uniqueTracksCount: number;
  uniqueArtistsCount: number;
  consistencyPct: number;
  playsPct: number;
  timePct: number;
  consistencyDiff: number;
  uniqueTracksDiff: number;
  hasPrevData: boolean;
  top3Hours: string[];
  discoveryRate: number;
}

function fmtDuration(mins: number, t: any): string {
  if (mins < 60) return `${mins} ${t.mins}`;
  const hrs = (mins / 60).toFixed(1);
  return `${hrs} ${t.hrs}`;
}

export function StatsRow({
  totalPlays,
  peak,
  peakDowIdx,
  days,
  lang,
  listeningTimeMin,
  uniqueTracksCount,
  uniqueArtistsCount,
  consistencyPct,
  playsPct,
  timePct,
  consistencyDiff,
  uniqueTracksDiff,
  hasPrevData,
  top3Hours,
  discoveryRate,
}: Props) {
  const dayName = (lang === "en" ? DOW_LABELS : DOW_LABELS_ID)[peakDowIdx] ?? "-";
  const t = locales[lang];

  function renderTrend(val: number, isPct = true) {
    if (!hasPrevData || val === 0) return null;
    const isPositive = val > 0;
    const color = isPositive ? "#3dcc6e" : "#ff4d4d"; // Green / Red
    const arrow = isPositive ? "▲" : "▼";
    const displayVal = Math.abs(val);
    return (
      <span style={{ color, fontSize: 10, fontWeight: 700, marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 2 }}>
        {arrow} {displayVal}{isPct ? "%" : ""}
      </span>
    );
  }

  const stats = [
    {
      label: t.totalPlays,
      value: String(totalPlays),
      sub: t.lastDays.replace("{days}", String(days)),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      ),
      trend: renderTrend(playsPct, true),
    },
    {
      label: t.listeningTime,
      value: totalPlays > 0 ? fmtDuration(listeningTimeMin, t) : "-",
      sub: t.estimatedTotal,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      trend: renderTrend(timePct, true),
    },
    {
      label: t.consistency,
      value: totalPlays > 0 ? `${consistencyPct}%` : "-",
      sub: t.activeDays,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
      ),
      trend: renderTrend(consistencyDiff, false),
    },
    {
      label: t.peakHour,
      value: totalPlays > 0 ? fmtHour(peak) : "-",
      sub: totalPlays > 0 && top3Hours.length > 0 
        ? `${t.top3}: ${top3Hours.join(" / ")}`
        : t.busiestHour,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      trend: null,
    },
    {
      label: t.favDay,
      value: totalPlays > 0 ? dayName : "-",
      sub: t.mostActiveDay,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      trend: null,
    },
    {
      label: t.diversity,
      value: totalPlays > 0 ? `${uniqueTracksCount}/${uniqueArtistsCount}` : "-",
      sub: totalPlays > 0 
        ? `${t.discovery}: ${discoveryRate}%`
        : t.songsArtists,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          <path d="M2 12h20"></path>
        </svg>
      ),
      trend: renderTrend(uniqueTracksDiff, false),
    },
  ];

  function fitTextSize(text: string, base: number) {
    if (text.length > 28) return Math.max(10, base - 4);
    if (text.length > 18) return Math.max(11, base - 2);
    return base;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: "var(--spice-card)",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid var(--spice-button-disabled)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--spice-subtext)",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: ".5px",
              fontWeight: 600,
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontSize: fitTextSize(String(s.value), 22),
              fontWeight: 800,
              color: "var(--spice-text)",
              lineHeight: "26px",
              display: "flex",
              alignItems: "center",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {s.value}
            {s.trend}
          </div>
          <div
            style={{ fontSize: fitTextSize(String(s.sub), 11), lineHeight: "14px", color: "var(--spice-button)", marginTop: 2, overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            {s.sub}
          </div>
          <div
            style={{
              position: "absolute",
              right: 12,
              bottom: 8,
              opacity: 0.15,
              color: "var(--spice-text)",
              pointerEvents: "none",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
