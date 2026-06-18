import React from "react";
import { Language } from "../types/dashboard";

interface Props {
  days: number;
  lang: Language;
  subtitle: string;
  onLangChange: (lang: Language) => void;
}

export function DashboardHeader({ days, lang, subtitle, onLangChange }: Props) {
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
