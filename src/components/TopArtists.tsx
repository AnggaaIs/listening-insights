import React from "react";
import { ArtistStat } from "../utils";
import locales from "../locales.json";
import { TrendSnapshot } from "../types/dashboard";

interface Props {
  artists: ArtistStat[];
  trends?: Record<string, TrendSnapshot>;
  lang: "en" | "id";
}

export function TopArtists({ artists, trends = {}, lang }: Props) {
  const [fetchedImages, setFetchedImages] = React.useState<Record<string, string>>({});
  const t = locales[lang];
  const trendCopy = t.trendBadge;

  React.useEffect(() => {
    if (typeof Spicetify === "undefined" || !Spicetify.CosmosAsync) return;

    // Filter artists that haven't been fetched yet
    const artistsToFetch = artists.filter((a) => !fetchedImages[a.name]);
    if (artistsToFetch.length === 0) return;

    artistsToFetch.forEach(async (a) => {
      try {
        let url = "";
        if (a.uri) {
          const id = a.uri.split(":").pop();
          if (id) {
            const res = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/artists/${id}`);
            url = res.images?.[2]?.url ?? res.images?.[0]?.url ?? "";
          }
        }
        
        // Fallback to search if no uri or image found
        if (!url) {
          const searchRes = await Spicetify.CosmosAsync.get(
            `https://api.spotify.com/v1/search?type=artist&limit=1&q=${encodeURIComponent(a.name)}`
          );
          const artistItem = searchRes.artists?.items?.[0];
          url = artistItem?.images?.[2]?.url ?? artistItem?.images?.[0]?.url ?? "";
        }

        if (url) {
          setFetchedImages((prev) => ({ ...prev, [a.name]: url }));
        }
      } catch (err) {
        console.error("Failed to fetch artist image for " + a.name, err);
      }
    });
  }, [artists]);

  if (artists.length === 0) {
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
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

  const maxCount = artists[0].count;

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
        {t.topArtistsTitle}
      </div>

      {artists.map((a, i) => {
        const trend = trends[a.name];
        return (
        <div
          className="li-list-row"
          key={a.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 0",
            borderBottom:
              i < artists.length - 1
                ? "1px solid var(--spice-button-disabled)"
                : "none",
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
              borderRadius: "50%",
              overflow: "hidden",
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {fetchedImages[a.name] ? (
              <img
                src={fetchedImages[a.name]}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--spice-subtext)", opacity: 0.6 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: a.name.length > 34 ? 10 : a.name.length > 24 ? 11 : 13,
                lineHeight: "15px",
                color: "var(--spice-text)",
                fontWeight: 500,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textTransform: "capitalize",
              }}
            >
              {a.name}
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
                width: `${Math.round((a.count / maxCount) * 100)}%`,
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
            {a.count}x
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
