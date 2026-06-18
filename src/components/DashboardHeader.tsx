import React from "react";
import { Language } from "../types/dashboard";
import { THEME_COLORS, ThemeName } from "../theme";

interface Props {
  days: number;
  lang: Language;
  theme: ThemeName;
  subtitle: string;
  onThemeChange: (theme: ThemeName) => void;
  onLangChange: (lang: Language) => void;
}

export function DashboardHeader({ days, lang, theme, subtitle, onThemeChange, onLangChange }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, position: "relative", zIndex: 100 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--spice-text)", margin: 0 }}>
          Listening Insights
        </h1>
        <p style={{ fontSize: 13, color: "var(--spice-subtext)", margin: "4px 0 0" }}>
          {subtitle.replace("{days}", String(days))}
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: 20, border: "1px solid var(--spice-button-disabled)" }}>
          {(["green", "purple", "orange", "cyan"] as const).map((item) => (
            <button
              className="li-action-button"
              key={item}
              type="button"
              onClick={() => onThemeChange(item)}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: THEME_COLORS[item][4],
                cursor: "pointer",
                border: theme === item ? "2.5px solid var(--spice-text)" : "1.5px solid rgba(255,255,255,0.1)",
                boxShadow: theme === item ? `0 0 8px ${THEME_COLORS[item][4]}` : "none",
                transform: theme === item ? "scale(1.15)" : "scale(1)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: 0,
              }}
              title={item.charAt(0).toUpperCase() + item.slice(1)}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 6, border: "1px solid var(--spice-button-disabled)", pointerEvents: "auto" }}>
          {(["en", "id"] as const).map((item) => {
            const selected = lang === item;
            return (
              <button
                className="li-action-button"
                key={item}
                type="button"
                onClick={() => onLangChange(item)}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: selected ? "var(--spice-button)" : "transparent",
                  color: selected ? "var(--spice-main)" : "var(--spice-subtext)",
                  border: "none",
                  fontWeight: selected ? 700 : 400,
                  transition: "all 0.2s ease",
                  userSelect: "none",
                  pointerEvents: "auto",
                }}
              >
                {item.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
