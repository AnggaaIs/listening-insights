export function generateStyles(): string {
  return `
    :root {
      --hm-empty: rgba(255,255,255,.06);
      --hm-1: #1a3d1a;
      --hm-2: rgba(29,185,84,.35);
      --hm-3: rgba(29,185,84,.6);
      --hm-4: #1db954;
      --hm-5: #3dcc6e;
      --hm-hover-glow: #1db954;
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
