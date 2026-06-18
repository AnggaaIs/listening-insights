import React from "react";
import { PlayEvent, clearSkips, exportBackup, getStorageFootprint, importBackup, loadSkips } from "../../store";
import { buttonStyle, cardStyle, formatBytes, sectionTitle } from "../advanced/ui";

interface Props {
  copy: any;
  history: PlayEvent[];
  onReset: () => void;
  onDataChange: () => void;
}

export function DataTab({ copy, history, onReset, onDataChange }: Props) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [status, setStatus] = React.useState("");
  const skips = loadSkips();
  const t = copy.advanced;

  const handleExport = () => {
    const backup = exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `listening-insights-backup-${backup.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        importBackup(JSON.parse(String(reader.result)));
        setStatus(t.imported);
        onDataChange();
      } catch {
        setStatus(t.importFailed);
      }
    };
    reader.readAsText(file);
  };

  const handleClearSkips = () => {
    clearSkips();
    setStatus(t.skipsCleared);
    onDataChange();
  };

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

      <div className="li-card" style={cardStyle}>
        {sectionTitle(t.dataManager)}
        <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <button className="li-action-button" style={buttonStyle} onClick={handleExport}>{t.exportData}</button>
          <button className="li-action-button" style={buttonStyle} onClick={() => fileRef.current?.click()}>{t.importData}</button>
          <button className="li-action-button" style={buttonStyle} onClick={handleClearSkips}>{t.clearSkips}</button>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", color: "var(--spice-subtext)", fontSize: 12 }}>
          <span>{history.length} {t.events}</span>
          <span>{skips.length} {t.skips}</span>
          <span>{formatBytes(getStorageFootprint())} {t.storage}</span>
          {status && <span style={{ color: "var(--spice-button)", fontWeight: 700 }}>{status}</span>}
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
