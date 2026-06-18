import React from "react";

interface Props {
  copy: any;
  onReset: () => void;
}

export function DataTab({ copy, onReset }: Props) {
  return (
    <>
      <div
        className="li-card"
        style={{
          background: "rgba(255, 193, 7, 0.05)",
          border: "1px solid rgba(255, 193, 7, 0.2)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 16, lineHeight: "1" }}>!</span>
        <div style={{ fontSize: 11, lineHeight: "16px", color: "var(--spice-subtext)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <strong style={{ color: "var(--spice-text)", display: "block", marginBottom: 2 }}>{copy.warningTitle}</strong>
            {copy.warningDesc}
          </div>
          <div>
            <strong style={{ color: "var(--spice-text)", display: "block", marginBottom: 2 }}>{copy.antiSkipTitle}</strong>
            {copy.antiSkipDesc}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: "var(--spice-subtext)", textAlign: "center" }}>
        {copy.dataStoredLocally}
        <br />
        <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 12, alignItems: "center" }}>
          <button
            className="li-action-button"
            type="button"
            style={{ color: "var(--spice-button)", cursor: "pointer", fontWeight: 600, border: 0, background: "transparent", padding: 0 }}
            onClick={onReset}
          >
            {copy.resetData}
          </button>
        </div>
      </div>
    </>
  );
}
