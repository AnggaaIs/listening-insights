// src/components/TopTracks.tsx

import React from "react";
import { TrackStat } from "../utils";
import locales from "../locales.json";
import { TrendSnapshot } from "../types/dashboard";

interface Props {
  tracks: TrackStat[];
  trends?: Record<string, TrendSnapshot>;
  lang: "en" | "id";
}

export function TopTracks({ tracks, trends = {}, lang }: Props) {
  const [fetchedImages, setFetchedImages] = React.useState<Record<string, string>>({});
  const t = locales[lang];
  const trendCopy = t.trendBadge;

  React.useEffect(() => {
    if (typeof Spicetify === "undefined" || !Spicetify.CosmosAsync) return;

    const tracksToFetch = tracks.filter((t) => !t.imageUrl && !fetchedImages[t.uri]);
    if (tracksToFetch.length === 0) return;

    let cancelled = false;

    (async () => {
      for (const t of tracksToFetch) {
        if (cancelled) break;
        await new Promise((r) => setTimeout(r, 250));
        try {
          const id = t.uri.split(":").pop();
          if (!id) continue;
          const res = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/tracks/${id}`);
          const url = res.album?.images?.[2]?.url ?? res.album?.images?.[0]?.url;
          if (url) {
            setFetchedImages((prev) => ({ ...prev, [t.uri]: url }));
          }
        } catch (err) {
          console.error("Failed to fetch track image for " + t.uri, err);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [tracks]);

  if (tracks.length === 0) {
    return (
      <div
        className="li-card"
        style={{
          background: "var(--spice-card)",
          borderRadius: 10,
          padding: 20,
          border: "1px solid var(--spice-button-disabled)",
          color: "var(--spice-subtext)",
          fontSize: 13,
          textAlign: "center",
          flex: 1,
        }}
      >
        {t.noDataTitle}
        <br />
        <span style={{ fontSize: 11 }}>
          {t.noDataDesc}
        </span>
      </div>
    );
  }

  const maxCount = tracks[0].count;

  return (
    <div
      className="li-card"
      style={{
        background: "var(--spice-card)",
        borderRadius: 10,
        padding: "16px 20px",
        border: "1px solid var(--spice-button-disabled)",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--spice-text)",
          marginBottom: 12,
        }}
      >
        {t.topTracksTitle}
      </div>

      {tracks.map((t, i) => {
        const trend = trends[t.uri];
        return (
        <div
          className="li-list-row"
          key={t.uri}
          onClick={() => Spicetify.Player.playUri(t.uri)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 0",
            borderBottom:
              i < tracks.length - 1
                ? "1px solid var(--spice-button-disabled)"
                : "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--spice-subtext)",
              width: 18,
              textAlign: "center",
            }}
          >
            {i + 1}
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              overflow: "hidden",
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {t.imageUrl || fetchedImages[t.uri] ? (
              <img
                src={t.imageUrl || fetchedImages[t.uri]}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--spice-subtext)", opacity: 0.6 }}><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: t.name.length > 34 ? 10 : t.name.length > 24 ? 11 : 13,
                lineHeight: "15px",
                color: "var(--spice-text)",
                fontWeight: 500,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {t.name}
            </div>
            <div style={{ fontSize: t.artist.length > 28 ? 9 : 11, lineHeight: "13px", color: "var(--spice-subtext)", overflowWrap: "anywhere", wordBreak: "break-word" }}>
              {t.artist}
            </div>
          </div>
          {/* Play count bar */}
          <div
            style={{
              width: 80,
              height: 4,
              background: "var(--spice-button-disabled)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              className="li-bar-fill"
              style={{
                height: "100%",
                width: `${Math.round((t.count / maxCount) * 100)}%`,
                background: "var(--spice-button)",
                borderRadius: 2,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--spice-subtext)",
              width: 40,
              textAlign: "right",
            }}
          >
            {t.count}x
          </div>
          <TrendBadge trend={trend} copy={trendCopy} />
        </div>
        );
      })}
    </div>
  );
}

function TrendBadge({ trend, copy }: { trend?: TrendSnapshot; copy: typeof locales.en.trendBadge }) {
  if (!trend) return <div style={{ width: 34, flexShrink: 0 }} />;
  const isNew = trend.previousRank === null;
  const rankDelta = trend.rankDelta ?? 0;
  const positive = isNew || rankDelta > 0 || trend.countDelta > 0;
  const negative = rankDelta < 0 || trend.countDelta < 0;
  const color = positive ? "#3dcc6e" : negative ? "#ff6b6b" : "var(--spice-subtext)";
  const label = isNew ? "+" : rankDelta === 0 ? `${trend.countDelta >= 0 ? "+" : ""}${trend.countDelta}` : `${rankDelta > 0 ? "▲" : "▼"}${Math.abs(rankDelta)}`;
  return (
    <div
      title={isNew ? copy.newEntry : `${copy.rankChange}: ${rankDelta}; ${copy.playChange}: ${trend.countDelta}`}
      style={{
        width: 34,
        textAlign: "right",
        color,
        fontSize: 10,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}
