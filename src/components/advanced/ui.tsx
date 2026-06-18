import React from "react";

export const cardStyle: React.CSSProperties = {
  background: "var(--spice-card)",
  borderRadius: 10,
  padding: "16px 20px",
  border: "1px solid var(--spice-button-disabled)",
  minWidth: 0,
  overflowWrap: "break-word",
  wordBreak: "break-word",
};

export const buttonStyle: React.CSSProperties = {
  border: "1px solid var(--spice-button-disabled)",
  background: "rgba(255,255,255,0.05)",
  color: "var(--spice-text)",
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

export function sectionTitle(children: React.ReactNode) {
  return (
    <div className="li-soft-enter" style={{ fontSize: 14, fontWeight: 700, color: "var(--spice-text)", marginBottom: 12 }}>
      {children}
    </div>
  );
}

export function statLine(label: string, value: React.ReactNode) {
  const valueText = typeof value === "string" ? value : "";
  return (
    <div className="li-list-row" style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--spice-button-disabled)" }}>
      <span style={{ color: "var(--spice-subtext)", fontSize: 12 }}>{label}</span>
      <span
        style={{
          color: "var(--spice-text)",
          fontSize: valueText.length > 28 ? 10 : valueText.length > 20 ? 11 : 12,
          lineHeight: "14px",
          fontWeight: 700,
          textAlign: "right",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          maxWidth: "58%",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function compactCard(label: string, value: React.ReactNode, sub?: React.ReactNode) {
  const valueText = typeof value === "string" ? value : "";
  const valueFontSize = valueText.length > 34 ? 14 : valueText.length > 24 ? 16 : valueText.length > 16 ? 18 : 22;
  return (
    <div className="li-card" style={{ ...cardStyle, minHeight: 86 }}>
      <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", letterSpacing: ".4px", fontWeight: 700, marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: valueFontSize,
          lineHeight: `${valueFontSize + 4}px`,
          fontWeight: 900,
          color: "var(--spice-text)",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, lineHeight: "14px", color: "var(--spice-button)", marginTop: 4, overflowWrap: "anywhere", wordBreak: "break-word" }}>{sub}</div>}
    </div>
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
