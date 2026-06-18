import React from "react";
import { ListeningCoachReport } from "../../analytics/listeningCoach";

interface Props {
  report: ListeningCoachReport;
  onAction: (query: string) => void;
}

const toneColors: Record<string, string> = {
  good: "var(--spice-button)",
  watch: "#ffc107",
  action: "#00bfff",
};

export function ListeningCoachPanel({ report, onAction }: Props) {
  return (
    <div
      className="li-card"
      style={{
        background: "linear-gradient(135deg, rgba(29,185,84,.14), rgba(0,191,255,.05))",
        borderRadius: 10,
        padding: "16px 20px",
        border: "1px solid rgba(29,185,84,.28)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--spice-text)", marginBottom: 6 }}>{report.title}</div>
          <div style={{ fontSize: 18, lineHeight: "24px", fontWeight: 900, color: "var(--spice-text)", marginBottom: 8 }}>{report.summary}</div>
          <button
            className="li-action-button"
            type="button"
            onClick={() => onAction(report.actionQuery)}
            style={{
              border: "1px solid var(--spice-button-disabled)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--spice-text)",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {report.actionLabel}
          </button>
        </div>
        <div style={{ minWidth: 260, flex: 1, display: "grid", gap: 8 }}>
          {report.insights.map((insight) => (
            <div className="li-list-row" key={insight.label} style={{ display: "grid", gridTemplateColumns: "8px 1fr", gap: 9, alignItems: "start" }}>
              <span className="li-soft-enter" style={{ width: 8, height: 8, borderRadius: 4, marginTop: 5, background: toneColors[insight.tone] }} />
              <span>
                <span style={{ display: "block", color: "var(--spice-text)", fontSize: 12, lineHeight: "16px", fontWeight: 800 }}>{insight.label}</span>
                <span style={{ display: "block", color: "var(--spice-subtext)", fontSize: 11, lineHeight: "15px", marginTop: 1 }}>{insight.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
