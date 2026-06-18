export type ThemeName = "green" | "purple" | "orange" | "cyan";

export const THEME_COLORS: Record<ThemeName, {
  empty: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  glow: string;
  gradientStart: string;
  gradientEnd: string;
}> = {
  green: {
    empty: "rgba(255,255,255,.06)",
    1: "#1a3d1a",
    2: "rgba(29,185,84,.35)",
    3: "rgba(29,185,84,.6)",
    4: "#1db954",
    5: "#3dcc6e",
    glow: "#1db954",
    gradientStart: "rgba(29,185,84,0.12)",
    gradientEnd: "rgba(29,185,84,0.02)",
  },
  purple: {
    empty: "rgba(255,255,255,.06)",
    1: "#221130",
    2: "rgba(186,85,211,.3)",
    3: "rgba(186,85,211,.55)",
    4: "#ba55d3",
    5: "#df7bf3",
    glow: "#ba55d3",
    gradientStart: "rgba(186,85,211,0.12)",
    gradientEnd: "rgba(186,85,211,0.02)",
  },
  orange: {
    empty: "rgba(255,255,255,.06)",
    1: "#301810",
    2: "rgba(255,127,80,.3)",
    3: "rgba(255,127,80,.55)",
    4: "#ff7f50",
    5: "#ff9f7d",
    glow: "#ff7f50",
    gradientStart: "rgba(255,127,80,0.12)",
    gradientEnd: "rgba(255,127,80,0.02)",
  },
  cyan: {
    empty: "rgba(255,255,255,.06)",
    1: "#0f2b33",
    2: "rgba(0,191,255,.3)",
    3: "rgba(0,191,255,.55)",
    4: "#00bfff",
    5: "#4ad2ff",
    glow: "#00bfff",
    gradientStart: "rgba(0,191,255,0.12)",
    gradientEnd: "rgba(0,191,255,0.02)",
  },
};

export function generateStyles(theme: ThemeName): string {
  const c = THEME_COLORS[theme];
  return `
    :root {
      --hm-empty: ${c.empty};
      --hm-1: ${c[1]};
      --hm-2: ${c[2]};
      --hm-3: ${c[3]};
      --hm-4: ${c[4]};
      --hm-5: ${c[5]};
      --hm-hover-glow: ${c.glow};
    }

    .hm-cell {
      transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.12s ease, background-color 0.2s ease !important;
    }
    .hm-cell:hover {
      transform: scale(1.25) !important;
      z-index: 10 !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5), 0 0 4px var(--hm-hover-glow) !important;
      outline: 1px solid rgba(255,255,255,0.2);
    }

    .li-tab-panel {
      animation: li-panel-in 120ms ease-out both;
    }

    .li-soft-enter {
      animation: li-panel-in 120ms ease-out both;
    }

    .li-tab-button,
    .li-action-button {
      transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease, opacity 140ms ease, transform 90ms ease;
    }

    .li-tab-button:active,
    .li-action-button:active {
      transform: scale(0.985);
    }

    .li-bar-fill {
      transition: width 300ms ease-out, background-color 140ms ease;
    }

    .li-list-row {
      transition: background-color 140ms ease, border-color 140ms ease, opacity 140ms ease;
    }

    @media (prefers-reduced-motion: reduce) {
      .hm-cell,
      .hm-cell:hover,
      .li-tab-panel,
      .li-soft-enter,
      .li-bar-fill,
      .li-tab-button,
      .li-action-button,
      .li-card,
      .li-list-row,
      button {
        animation: none !important;
        transition: none !important;
        transform: none !important;
      }
    }

    @keyframes li-panel-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;
}
