import React from "react";
import { DOW_LABELS, DOW_LABELS_ID } from "../../utils";
import { DashboardData, DayRange, Language } from "../../types/dashboard";
import { AdvancedInsights } from "../AdvancedInsights";

interface Props {
  data: DashboardData;
  days: DayRange;
  lang: Language;
  copy: any;
  onDataChange: () => void;
}

export function PatternsTab({ data, days, lang, copy, onDataChange }: Props) {
  return (
    <>
      <AdvancedInsights history={data.historyEvents} days={days} lang={lang} onDataChange={onDataChange} />
      {data.totalPlays > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 16 }}>
          <WeeklyActivityChart data={data} lang={lang} copy={copy} />
          <TimeOfDayChart data={data} copy={copy} />
        </div>
      )}
    </>
  );
}

function WeeklyActivityChart({ data, lang, copy }: { data: DashboardData; lang: Language; copy: any }) {
  return (
    <div style={chartCardStyle}>
      <div style={chartTitleStyle}>{copy.weeklyActivityTitle}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: 7 }).map((_, dow) => {
          const dayPlays = data.dowPlays[dow];
          const pct = Math.round((dayPlays / data.maxDowPlays) * 100);
          const dayName = (lang === "en" ? DOW_LABELS : DOW_LABELS_ID)[dow];
          return (
            <div key={dow} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, fontSize: 11, color: "var(--spice-subtext)", fontWeight: 500, userSelect: "none" }}>{dayName}</div>
              <div style={barTrackStyle}>
                <div className="li-bar-fill" style={{ ...barFillStyle, width: `${pct}%`, background: "linear-gradient(90deg, var(--hm-3) 0%, var(--spice-button) 100%)" }} />
              </div>
              <div style={{ width: 40, fontSize: 11, color: "var(--spice-text)", textAlign: "right", fontWeight: 600 }}>{dayPlays}x</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeOfDayChart({ data, copy }: { data: DashboardData; copy: any }) {
  const rows = [
    { key: "morning", label: copy.timeLabels.morning, icon: "M", desc: "06:00 - 12:00" },
    { key: "afternoon", label: copy.timeLabels.afternoon, icon: "A", desc: "12:00 - 18:00" },
    { key: "evening", label: copy.timeLabels.evening, icon: "E", desc: "18:00 - 22:00" },
    { key: "night", label: copy.timeLabels.night, icon: "N", desc: "22:00 - 06:00" },
  ] as const;

  return (
    <div style={chartCardStyle}>
      <div style={chartTitleStyle}>{copy.dailyTimeTitle}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((item) => {
          const plays = data.timeOfDayPlays[item.key];
          const pct = Math.round((plays / data.maxTimePlays) * 100);
          return (
            <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.06)", color: "var(--spice-button)", fontSize: 10, fontWeight: 900, display: "grid", placeItems: "center", userSelect: "none" }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--spice-text)" }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: "var(--spice-subtext)", fontWeight: 600 }}>{plays}x</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.03)", borderRadius: 3, overflow: "hidden" }}>
                  <div className="li-bar-fill" style={{ height: "100%", width: `${pct}%`, background: "var(--spice-button)", borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--spice-subtext)", marginTop: 4 }}>{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const chartCardStyle: React.CSSProperties = {
  background: "var(--spice-card)",
  borderRadius: 10,
  padding: "16px 20px",
  border: "1px solid var(--spice-button-disabled)",
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--spice-text)",
  marginBottom: 12,
};

const barTrackStyle: React.CSSProperties = {
  flex: 1,
  height: 12,
  background: "rgba(255,255,255,0.03)",
  borderRadius: 6,
  overflow: "hidden",
};

const barFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 6,
  transition: "width 0.5s ease-out",
};
