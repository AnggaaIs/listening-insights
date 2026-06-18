import React from "react";
import { PageTab } from "../types/dashboard";

interface Props {
  tabs: Array<{ key: PageTab; label: string }>;
  activeTab: PageTab;
  onChange: (tab: PageTab) => void;
}

export function TabNav({ tabs, activeTab, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 16,
        padding: 4,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--spice-button-disabled)",
        borderRadius: 8,
      }}
    >
      {tabs.map((tab) => {
        const selected = activeTab === tab.key;
        return (
          <button
            className="li-tab-button"
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              border: "none",
              background: selected ? "var(--spice-button)" : "transparent",
              color: selected ? "var(--spice-main)" : "var(--spice-subtext)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
