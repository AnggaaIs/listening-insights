import React from "react";
import { THEME_COLORS, ThemeName } from "../theme";
import { TimeOfDay } from "../types/dashboard";

interface Props {
  totalPlays: number;
  peakTime: TimeOfDay;
  currentStreak: number;
  longestStreak: number;
  theme: ThemeName;
  copy: any;
}

export function PersonaBanner({ totalPlays, peakTime, currentStreak, longestStreak, theme, copy }: Props) {
  if (totalPlays <= 0) return null;
  const persona = copy.personas[peakTime];

  return (
    <div
      className="li-card li-soft-enter"
      style={{
        background: `linear-gradient(135deg, ${THEME_COLORS[theme].gradientStart} 0%, ${THEME_COLORS[theme].gradientEnd} 100%)`,
        border: `1px solid ${THEME_COLORS[theme].glow}30`,
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600 }}>
          {copy.musicPersona}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--spice-text)", marginTop: 2 }}>
          {persona.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--spice-subtext)", marginTop: 2 }}>
          {persona.desc}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600 }}>
            {copy.activeStreak}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--spice-text)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
            {currentStreak} {copy.days}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#3dcc6e", opacity: 0.9 }}>
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
        </div>
        <div style={{ textAlign: "right", borderLeft: "1px solid var(--spice-button-disabled)", paddingLeft: 24 }}>
          <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600 }}>
            {copy.longestStreak}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--spice-button)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
            {longestStreak} {copy.days}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--spice-button)", opacity: 0.9 }}>
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
