import React from "react";
import { DashboardData, Language } from "../../types/dashboard";
import locales from "../../locales.json";
import { LibraryTrendChart } from "../charts/LibraryTrendChart";
import { TopArtists } from "../TopArtists";
import { TopTracks } from "../TopTracks";

interface Props {
  data: DashboardData;
  lang: Language;
}

export function LibraryTab({ data, lang }: Props) {
  const copy = locales[lang].rankCharts;
  return (
    <div style={{ display: "grid", gap: 16, marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <LibraryTrendChart
          title={copy.trackTitle}
          items={data.tracks.map((track) => ({ key: track.uri, label: track.name, count: track.count }))}
          trends={data.trackTrends}
          lang={lang}
        />
        <LibraryTrendChart
          title={copy.artistTitle}
          items={data.artists.map((artist) => ({ key: artist.name, label: artist.name, count: artist.count }))}
          trends={data.artistTrends}
          lang={lang}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <TopTracks tracks={data.tracks} trends={data.trackTrends} lang={lang} />
        <TopArtists artists={data.artists} trends={data.artistTrends} lang={lang} />
      </div>
    </div>
  );
}
