import React from "react";
import { DashboardData, DayRange, Language } from "../../types/dashboard";
import { HeatmapGrid } from "../HeatmapGrid";

interface Props {
  data: DashboardData;
  days: DayRange;
  lang: Language;
  copy: any;
  onRangeChange: (days: DayRange) => void;
}

export function OverviewTab({ data, days, lang, copy, onRangeChange }: Props) {
  return (
    <>
      <HeatmapGrid matrix={data.matrix} days={days} onRangeChange={onRangeChange} lang={lang} />

      {data.totalPlays > 0 && (
        <div
          className="li-card"
          style={{
            background: "var(--spice-card)",
            borderRadius: 10,
            padding: "16px 20px",
            border: "1px solid var(--spice-button-disabled)",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--spice-text)", marginBottom: 12 }}>
            {copy.listeningInsights}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <InsightClock copy={copy} peakTime={data.peakTime} />
            <InsightDailyAverage copy={copy} dailyAverage={data.dailyAverage} />
            <InsightSkipRate copy={copy} skipRate={data.skipRate} />
            <InsightWeekdayWeekend copy={copy} weekdayPct={data.weekdayPct} weekendPct={data.weekendPct} />
          </div>
        </div>
      )}
    </>
  );
}

function InsightClock({ copy, peakTime }: { copy: any; peakTime: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--spice-button)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <div>
        <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>{copy.activeTime}</div>
        <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
          {copy.activeTimeDesc.replace("{time}", copy.timeOfDay[peakTime])}
        </div>
      </div>
    </div>
  );
}

function InsightDailyAverage({ copy, dailyAverage }: { copy: any; dailyAverage: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--spice-button)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <div>
        <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>{copy.dailyAverage}</div>
        <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
          {copy.dailyAverageDesc.replace("{avg}", dailyAverage)}
        </div>
      </div>
    </div>
  );
}

function InsightSkipRate({ copy, skipRate }: { copy: any; skipRate: number }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--spice-button)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polygon points="5 4 15 12 5 20 5 4" />
        <line x1="19" y1="5" x2="19" y2="19" />
      </svg>
      <div>
        <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>
          {copy.skipRate}: {skipRate}%
        </div>
        <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
          {skipRate < 15 ? copy.focusedListener : skipRate < 40 ? copy.typicalSkips : copy.highlySelective}
        </div>
      </div>
    </div>
  );
}

function InsightWeekdayWeekend({ copy, weekdayPct, weekendPct }: { copy: any; weekdayPct: number; weekendPct: number }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--spice-button)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <div>
        <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>{copy.weekdayVsWeekend}</div>
        <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
          {copy.weekdayWeekendDesc.replace("{weekday}", String(weekdayPct)).replace("{weekend}", String(weekendPct))}
        </div>
      </div>
    </div>
  );
}
