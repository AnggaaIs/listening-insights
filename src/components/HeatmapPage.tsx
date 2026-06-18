import React, { useState, useEffect, useCallback, useRef } from "react";
import { PlayEvent, loadHistory, loadSkips, generateDummyData } from "../store";
import { buildMatrix, peakHour, peakDow, topTracks, topArtists, peakTimeOfDay, DOW_LABELS, DOW_LABELS_ID, calculateStreaks, fmtHour } from "../utils";
import locales from "../locales.json";
import { StatsRow } from "./StatsRow";
import { HeatmapGrid } from "./HeatmapGrid";
import { TopTracks } from "./TopTracks";
import { TopArtists } from "./TopArtists";
import { ResetModal } from "./ResetModal";
import { AdvancedInsights } from "./AdvancedInsights";

type ThemeName = "green" | "purple" | "orange" | "cyan";

const THEME_COLORS: Record<ThemeName, {
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
  }
};

function generateStyles(theme: ThemeName): string {
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
  `;
}

function getMusicPersona(time: "morning" | "afternoon" | "evening" | "night", t: any) {
  return t.personas[time];
}

function getVibeDetails(avgVal: number, avgEng: number, avgAc: number, t: any) {
  // Gloomy / Melancholy (Galau)
  if (avgVal < 0.38 && avgEng < 0.4) {
    return {
      name: t.vibes.gloomy.name,
      desc: t.vibes.gloomy.desc,
      theme: "purple" as const,
      icon: (color: string, size = 22) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      )
    };
  }
  // Poetic / Soulful / Warm (Syahdu)
  if (avgEng < 0.38 && avgAc >= 0.45) {
    return {
      name: t.vibes.soulful.name,
      desc: t.vibes.soulful.desc,
      theme: "orange" as const,
      icon: (color: string, size = 22) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        </svg>
      )
    };
  }
  // Chill / Relaxed (Santai)
  if (avgEng < 0.48 && avgVal >= 0.38) {
    return {
      name: t.vibes.chill.name,
      desc: t.vibes.chill.desc,
      theme: "cyan" as const,
      icon: (color: string, size = 22) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
          <line x1="6" y1="2" x2="6" y2="4"></line>
          <line x1="10" y1="2" x2="10" y2="4"></line>
          <line x1="14" y1="2" x2="14" y2="4"></line>
        </svg>
      )
    };
  }
  // Energetic & Cheerful (Ceria)
  if (avgVal >= 0.48 && avgEng >= 0.48) {
    return {
      name: t.vibes.cheerful.name,
      desc: t.vibes.cheerful.desc,
      theme: "green" as const,
      icon: (color: string, size = 22) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      )
    };
  }
  // Intense & Heavy (Garang)
  if (avgVal < 0.48 && avgEng >= 0.52) {
    return {
      name: t.vibes.intense.name,
      desc: t.vibes.intense.desc,
      theme: "purple" as const,
      icon: (color: string, size = 22) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    };
  }
  // Fallback Balanced
  return {
    name: t.vibes.balanced.name,
    desc: t.vibes.balanced.desc,
    theme: "green" as const,
    icon: (color: string, size = 22) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </svg>
    )
  };
}

export function HeatmapPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [lang, setLang] = useState<"en" | "id">(() => {
    const saved = localStorage.getItem("spicetify-heatmap-lang");
    return (saved === "en" || saved === "id") ? saved : "en";
  });
  const t = locales[lang];
  const [showResetModal, setShowResetModal] = useState(false);

  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: 24 }, () => Array(7).fill(0)),
  );
  const [historyEvents, setHistoryEvents] = useState<PlayEvent[]>([]);
  const [tracks, setTracks] = useState<ReturnType<typeof topTracks>>([]);
  const [artists, setArtists] = useState<ReturnType<typeof topArtists>>([]);
  const [totalPlays, setTotalPlays] = useState(0);
  const [peak, setPeak] = useState(0);
  const [peakDay, setPeakDay] = useState(0);
  const [peakTime, setPeakTime] = useState<"morning" | "afternoon" | "evening" | "night">("afternoon");
  const [dailyAverage, setDailyAverage] = useState("0");
  const [uniqueTracksCount, setUniqueTracksCount] = useState(0);
  const [uniqueArtistsCount, setUniqueArtistsCount] = useState(0);
  const [listeningTimeMin, setListeningTimeMin] = useState(0);
  const [consistencyPct, setConsistencyPct] = useState(0);
  const [skipRate, setSkipRate] = useState(0);
  const [weekdayPct, setWeekdayPct] = useState(0);
  const [weekendPct, setWeekendPct] = useState(0);
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("spicetify-heatmap-theme");
    return (saved === "green" || saved === "purple" || saved === "orange" || saved === "cyan") ? saved : "green";
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [playsPct, setPlaysPct] = useState(0);
  const [timePct, setTimePct] = useState(0);
  const [consistencyDiff, setConsistencyDiff] = useState(0);
  const [uniqueTracksDiff, setUniqueTracksDiff] = useState(0);
  const [hasPrevData, setHasPrevData] = useState(false);
  const [top3Hours, setTop3Hours] = useState<string[]>([]);
  const [discoveryRate, setDiscoveryRate] = useState(0);
  const [recentVibeFeatures, setRecentVibeFeatures] = useState<{ valence: number; energy: number; acousticness: number } | null>(null);
  const [periodVibeFeatures, setPeriodVibeFeatures] = useState<Record<string, { valence: number; energy: number; acousticness: number }>>({});
  const lastFetchedVibeIdsRef = useRef<string>("");

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    localStorage.setItem("spicetify-heatmap-theme", newTheme);
  };

  const handleLangChange = (newLang: "en" | "id") => {
    setLang(newLang);
    localStorage.setItem("spicetify-heatmap-lang", newLang);
  };

  const refresh = useCallback(() => {
    const history = loadHistory();
    const m = buildMatrix(history, days);

    setHistoryEvents(history);
    setMatrix(m);
    setTracks(topTracks(history, days));
    setArtists(topArtists(history, days));
    setPeak(peakHour(m));
    setPeakDay(peakDow(m));
    setPeakTime(peakTimeOfDay(history, days));

    const cutoff = Date.now() - days * 864e5;
    const filteredEvents = history.filter((e) => e.ts > cutoff);
    setTotalPlays(filteredEvents.length);

    if (filteredEvents.length > 0) {
      const earliestTs = filteredEvents[0].ts;
      const spanMs = Date.now() - earliestTs;
      const activeDays = Math.min(days, Math.max(1, Math.round(spanMs / 864e5)));
      setDailyAverage((filteredEvents.length / activeDays).toFixed(1));
    } else {
      setDailyAverage("0");
    }

    // Unique Tracks
    const uniqueTracks = new Set(filteredEvents.map((e) => e.trackUri));
    setUniqueTracksCount(uniqueTracks.size);

    // Unique Artists
    const uniqueArtists = new Set(filteredEvents.map((e) => e.artist));
    setUniqueArtistsCount(uniqueArtists.size);

    // Listening Time (estimated at 3.3 minutes per song)
    setListeningTimeMin(Math.round(filteredEvents.length * 3.3));

    // Consistency (days with at least 1 play / selected days limit)
    const activeDaysSet = new Set(
      filteredEvents.map((e) => {
        const d = new Date(e.ts);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );
    const curConsistency = Math.min(100, Math.round((activeDaysSet.size / days) * 100));
    setConsistencyPct(curConsistency);

    const streaks = calculateStreaks(history);
    setCurrentStreak(streaks.current);
    setLongestStreak(streaks.longest);

    // Skips and Weekday/Weekend Calculations
    const skips = loadSkips();
    const filteredSkips = skips.filter((ts) => ts > cutoff);
    const totalAttempts = filteredEvents.length + filteredSkips.length;
    setSkipRate(totalAttempts > 0 ? Math.round((filteredSkips.length / totalAttempts) * 100) : 0);

    let weekdayPlays = 0;
    let weekendPlays = 0;
    for (const e of filteredEvents) {
      const d = new Date(e.ts);
      const day = d.getDay(); // 0 = Sun, 6 = Sat
      if (day === 0 || day === 6) {
        weekendPlays++;
      } else {
        weekdayPlays++;
      }
    }
    const totalPeriodPlays = filteredEvents.length;
    setWeekdayPct(totalPeriodPlays > 0 ? Math.round((weekdayPlays / totalPeriodPlays) * 100) : 0);
    setWeekendPct(totalPeriodPlays > 0 ? Math.round((weekendPlays / totalPeriodPlays) * 100) : 0);

    // Discovery Rate and Top 3 Peak Hours
    setDiscoveryRate(totalPeriodPlays > 0 ? Math.round((uniqueTracks.size / totalPeriodPlays) * 100) : 0);

    const hourlyPlays = Array(24).fill(0);
    for (let h = 0; h < 24; h++) {
      for (let d = 0; d < 7; d++) {
        hourlyPlays[h] += m[h]?.[d] ?? 0;
      }
    }
    const sortedHours = hourlyPlays
      .map((plays, hour) => ({ hour, plays }))
      .sort((a, b) => b.plays - a.plays);
    const top3 = sortedHours
      .slice(0, 3)
      .filter((x) => x.plays > 0)
      .map((x) => fmtHour(x.hour));
    setTop3Hours(top3);

    // Prev Period Trends
    const prevCutoff = Date.now() - 2 * days * 864e5;
    const prevPeriodEvents = history.filter((e) => e.ts > prevCutoff && e.ts <= cutoff);
    setHasPrevData(prevPeriodEvents.length > 0);

    if (prevPeriodEvents.length > 0) {
      // Plays trend
      const playsChange = filteredEvents.length - prevPeriodEvents.length;
      setPlaysPct(Math.round((playsChange / prevPeriodEvents.length) * 100));

      // Time trend (estimated)
      const curTime = filteredEvents.length * 3.3;
      const prevTime = prevPeriodEvents.length * 3.3;
      const timeChange = curTime - prevTime;
      setTimePct(Math.round((timeChange / Math.max(1, prevTime)) * 100));

      // Consistency trend
      const prevActiveDaysSet = new Set(
        prevPeriodEvents.map((e) => {
          const d = new Date(e.ts);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      );
      const prevConsistency = Math.min(100, Math.round((prevActiveDaysSet.size / days) * 100));
      setConsistencyDiff(curConsistency - prevConsistency);

      // Diversity trend (unique tracks count comparison)
      const prevUniqueTracks = new Set(prevPeriodEvents.map((e) => e.trackUri)).size;
      setUniqueTracksDiff(uniqueTracks.size - prevUniqueTracks);
    } else {
      setPlaysPct(0);
      setTimePct(0);
      setConsistencyDiff(0);
      setUniqueTracksDiff(0);
    }

    // Fetch recent vibe & period vibe from history (last 40 played songs)
    const recentTracksForVibe = history.slice(-40);
    const vibeTrackIds = recentTracksForVibe.map((t) => t.trackUri.split(":").pop()).filter(Boolean) as string[];
    const uniqueVibeTrackIds = Array.from(new Set(vibeTrackIds));
    const vibeTrackIdsStr = uniqueVibeTrackIds.join(",");

    if (vibeTrackIdsStr && vibeTrackIdsStr !== lastFetchedVibeIdsRef.current) {
      lastFetchedVibeIdsRef.current = vibeTrackIdsStr;
      (async () => {
        if (typeof Spicetify === "undefined" || !Spicetify.CosmosAsync) return;
        try {
          const res = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/audio-features?ids=${vibeTrackIdsStr}`);
          if (res && res.audio_features) {
            const featuresMap: Record<string, any> = {};
            res.audio_features.forEach((f: any) => {
              if (f) {
                featuresMap[`spotify:track:${f.id}`] = f;
              }
            });

            // Calculate overall recent vibe (using last 8 songs in history)
            const recent8 = history.slice(-8);
            let totalVal8 = 0, totalEng8 = 0, totalAc8 = 0, count8 = 0;
            recent8.forEach((t) => {
              const f = featuresMap[t.trackUri];
              if (f) {
                totalVal8 += f.valence ?? 0.5;
                totalEng8 += f.energy ?? 0.5;
                totalAc8 += f.acousticness ?? 0.5;
                count8++;
              }
            });
            if (count8 > 0) {
              setRecentVibeFeatures({
                valence: totalVal8 / count8,
                energy: totalEng8 / count8,
                acousticness: totalAc8 / count8
              });
            } else {
              setRecentVibeFeatures(null);
            }

            // Calculate time-of-day vibes (using last 40 songs in history)
            const sums = {
              morning: { val: 0, eng: 0, ac: 0, count: 0 },
              afternoon: { val: 0, eng: 0, ac: 0, count: 0 },
              evening: { val: 0, eng: 0, ac: 0, count: 0 },
              night: { val: 0, eng: 0, ac: 0, count: 0 },
            };
            recentTracksForVibe.forEach((e) => {
              const f = featuresMap[e.trackUri];
              if (f) {
                const h = new Date(e.ts).getHours();
                let cat: keyof typeof sums = "night";
                if (h >= 6 && h < 12) cat = "morning";
                else if (h >= 12 && h < 18) cat = "afternoon";
                else if (h >= 18 && h < 22) cat = "evening";

                sums[cat].val += f.valence ?? 0.5;
                sums[cat].eng += f.energy ?? 0.5;
                sums[cat].ac += f.acousticness ?? 0.5;
                sums[cat].count++;
              }
            });

            const newPeriodFeatures: Record<string, { valence: number; energy: number; acousticness: number }> = {};
            (Object.keys(sums) as Array<keyof typeof sums>).forEach((cat) => {
              if (sums[cat].count > 0) {
                newPeriodFeatures[cat] = {
                  valence: sums[cat].val / sums[cat].count,
                  energy: sums[cat].eng / sums[cat].count,
                  acousticness: sums[cat].ac / sums[cat].count
                };
              }
            });
            setPeriodVibeFeatures(newPeriodFeatures);
          }
        } catch (err) {
          console.error("Failed to fetch audio features for vibe", err);
        }
      })();
    } else if (!vibeTrackIdsStr) {
      lastFetchedVibeIdsRef.current = "";
      setRecentVibeFeatures(null);
      setPeriodVibeFeatures({});
    }
  }, [days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (typeof Spicetify === "undefined" || !Spicetify.Player) return;
    const handleSongChange = () => {
      // Tunggu 100ms agar tracker sempat menyimpan data ke localStorage terlebih dahulu
      setTimeout(refresh, 100);
    };
    Spicetify.Player.addEventListener("songchange", handleSongChange);
    return () => {
      Spicetify.Player.removeEventListener("songchange", handleSongChange);
    };
  }, [refresh]);



  // Sum up weekly plays
  const dowPlays = Array(7).fill(0);
  for (let hour = 0; hour < 24; hour++) {
    for (let dow = 0; dow < 7; dow++) {
      dowPlays[dow] += matrix[hour]?.[dow] ?? 0;
    }
  }
  const maxDowPlays = Math.max(...dowPlays, 1);

  // Sum up hourly plays into 4 periods
  const timeOfDayPlays = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  for (let hour = 0; hour < 24; hour++) {
    let cat: keyof typeof timeOfDayPlays = "night";
    if (hour >= 6 && hour < 12) cat = "morning";
    else if (hour >= 12 && hour < 18) cat = "afternoon";
    else if (hour >= 18 && hour < 22) cat = "evening";

    for (let dow = 0; dow < 7; dow++) {
      timeOfDayPlays[cat] += matrix[hour]?.[dow] ?? 0;
    }
  }
  const maxTimePlays = Math.max(
    timeOfDayPlays.morning,
    timeOfDayPlays.afternoon,
    timeOfDayPlays.evening,
    timeOfDayPlays.night,
    1
  );

  const vibe = recentVibeFeatures
    ? getVibeDetails(recentVibeFeatures.valence, recentVibeFeatures.energy, recentVibeFeatures.acousticness, t)
    : null;

  return (
    <>
      <style>{generateStyles(theme)}</style>
      <div
        style={{
          padding: "80px 24px 32px",
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, position: "relative", zIndex: 100 }}>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--spice-text)",
                margin: 0,
              }}
            >
              Listening Insights
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--spice-subtext)",
                margin: "4px 0 0",
              }}
            >
              {t.subTitle.replace("{days}", String(days))}
            </p>
          </div>
          
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* Theme Selector */}
            <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: 20, border: "1px solid var(--spice-button-disabled)" }}>
              {(["green", "purple", "orange", "cyan"] as const).map(t => (
                <div
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: THEME_COLORS[t][4],
                    cursor: "pointer",
                    border: theme === t ? "2.5px solid var(--spice-text)" : "1.5px solid rgba(255,255,255,0.1)",
                    boxShadow: theme === t ? `0 0 8px ${THEME_COLORS[t][4]}` : "none",
                    transform: theme === t ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                />
              ))}
            </div>

            {/* Language Switcher */}
            <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 6, border: "1px solid var(--spice-button-disabled)", pointerEvents: "auto" }}>
              <div
                onClick={(e) => { e.stopPropagation(); handleLangChange("en"); }}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: lang === "en" ? "var(--spice-button)" : "transparent",
                  color: lang === "en" ? "var(--spice-main)" : "var(--spice-subtext)",
                  border: "none",
                  fontWeight: lang === "en" ? 700 : 400,
                  transition: "all 0.2s ease",
                  userSelect: "none",
                  pointerEvents: "auto",
                }}
              >
                EN
              </div>
              <div
                onClick={(e) => { e.stopPropagation(); handleLangChange("id"); }}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: lang === "id" ? "var(--spice-button)" : "transparent",
                  color: lang === "id" ? "var(--spice-main)" : "var(--spice-subtext)",
                  border: "none",
                  fontWeight: lang === "id" ? 700 : 400,
                  transition: "all 0.2s ease",
                  userSelect: "none",
                  pointerEvents: "auto",
                }}
              >
                ID
              </div>
            </div>
          </div>
        </div>

        {/* Persona & Streak Banner */}
        {totalPlays > 0 && (
          <div
            style={{
              background: `linear-gradient(135deg, ${THEME_COLORS[theme].gradientStart} 0%, ${THEME_COLORS[theme].gradientEnd} 100%)`,
              border: `1px solid ${THEME_COLORS[theme].glow}30`,
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600 }}>
                {t.musicPersona}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--spice-text)", marginTop: 2 }}>
                {getMusicPersona(peakTime, t).title}
              </div>
              <div style={{ fontSize: 12, color: "var(--spice-subtext)", marginTop: 2 }}>
                {getMusicPersona(peakTime, t).desc}
              </div>
              {vibe && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    padding: "4px 8px",
                    borderRadius: 12,
                    background: `${THEME_COLORS[vibe.theme].gradientStart}`,
                    border: `1px solid ${THEME_COLORS[vibe.theme].glow}40`,
                  }}
                >
                  {vibe.icon(THEME_COLORS[vibe.theme][4], 14)}
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--spice-text)" }}>
                    {t.currentVibeLabel}: {vibe.name}
                  </span>
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600 }}>
                  {t.activeStreak}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--spice-text)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  {currentStreak} {t.days} 
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#3dcc6e", opacity: 0.9 }}>
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                  </svg>
                </div>
              </div>
              <div style={{ textAlign: "right", borderLeft: "1px solid var(--spice-button-disabled)", paddingLeft: 24 }}>
                <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600 }}>
                  {t.longestStreak}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--spice-button)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  {longestStreak} {t.days} 
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--spice-button)", opacity: 0.9 }}>
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <StatsRow
          totalPlays={totalPlays}
          peak={peak}
          peakDowIdx={peakDay}
          days={days}
          lang={lang}
          listeningTimeMin={listeningTimeMin}
          uniqueTracksCount={uniqueTracksCount}
          uniqueArtistsCount={uniqueArtistsCount}
          consistencyPct={consistencyPct}
          playsPct={playsPct}
          timePct={timePct}
          consistencyDiff={consistencyDiff}
          uniqueTracksDiff={uniqueTracksDiff}
          hasPrevData={hasPrevData}
          top3Hours={top3Hours}
          discoveryRate={discoveryRate}
        />

        {/* Heatmap grid */}
        <HeatmapGrid matrix={matrix} days={days} onRangeChange={setDays} lang={lang} />

        <AdvancedInsights
          history={historyEvents}
          days={days}
          lang={lang}
          currentVibeName={vibe?.name}
          onDataChange={refresh}
        />

        {/* Listening Insights */}
        {totalPlays > 0 && (
          <div
            style={{
              background: "var(--spice-card)",
              borderRadius: 10,
              padding: "16px 20px",
              border: "1px solid var(--spice-button-disabled)",
              marginBottom: 16,
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
              {t.listeningInsights}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {/* Insight 1: Time of day */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--spice-button)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div>
                  <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>
                    {t.activeTime}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
                    {t.activeTimeDesc.replace("{time}", t.timeOfDay[peakTime])}
                  </div>
                </div>
              </div>
              {/* Insight 2: Daily average */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--spice-button)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <div>
                  <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>
                    {t.dailyAverage}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
                    {t.dailyAverageDesc.replace("{avg}", dailyAverage)}
                  </div>
                </div>
              </div>
              {/* Insight 3: Skip Rate */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--spice-button)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
                <div>
                  <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>
                    {t.skipRate}: {skipRate}%
                  </div>
                  <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
                    {skipRate < 15
                      ? t.focusedListener
                      : skipRate < 40
                      ? t.typicalSkips
                      : t.highlySelective}
                  </div>
                </div>
              </div>
              {/* Insight 4: Weekdays vs Weekends */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--spice-button)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <div>
                  <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>
                    {t.weekdayVsWeekend}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
                    {t.weekdayWeekendDesc
                      .replace("{weekday}", String(weekdayPct))
                      .replace("{weekend}", String(weekendPct))}
                  </div>
                </div>
              </div>
              {/* Insight 5: Recent Vibe */}
              {vibe && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {vibe.icon(THEME_COLORS[vibe.theme][4], 22)}
                  <div>
                    <div style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 600 }}>
                      {t.recentVibe}: {vibe.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--spice-subtext)", marginTop: 2 }}>
                      {vibe.desc}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Visualizations */}
        {totalPlays > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 16 }}>
            {/* Weekly Activity Chart */}
            <div
              style={{
                background: "var(--spice-card)",
                borderRadius: 10,
                padding: "16px 20px",
                border: "1px solid var(--spice-button-disabled)",
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
                {t.weeklyActivityTitle}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Array.from({ length: 7 }).map((_, dow) => {
                  const dayPlays = dowPlays[dow];
                  const pct = Math.round((dayPlays / maxDowPlays) * 100);
                  const dayName = (lang === "en" ? DOW_LABELS : DOW_LABELS_ID)[dow];
                  return (
                    <div key={dow} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, fontSize: 11, color: "var(--spice-subtext)", fontWeight: 500, userSelect: "none" }}>
                        {dayName}
                      </div>
                      <div style={{ flex: 1, height: 12, background: "rgba(255,255,255,0.03)", borderRadius: 6, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, var(--hm-3) 0%, var(--spice-button) 100%)",
                            borderRadius: 6,
                            transition: "width 0.5s ease-out",
                          }}
                        />
                      </div>
                      <div style={{ width: 40, fontSize: 11, color: "var(--spice-text)", textAlign: "right", fontWeight: 600 }}>
                        {dayPlays}x
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time of Day Chart */}
            <div
              style={{
                background: "var(--spice-card)",
                borderRadius: 10,
                padding: "16px 20px",
                border: "1px solid var(--spice-button-disabled)",
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
                {t.dailyTimeTitle}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { key: "morning", label: t.timeLabels.morning, icon: "🌅", desc: "06:00 - 12:00" },
                  { key: "afternoon", label: t.timeLabels.afternoon, icon: "☀️", desc: "12:00 - 18:00" },
                  { key: "evening", label: t.timeLabels.evening, icon: "🌆", desc: "18:00 - 22:00" },
                  { key: "night", label: t.timeLabels.night, icon: "🌙", desc: "22:00 - 06:00" },
                ].map((item) => {
                  const plays = timeOfDayPlays[item.key as keyof typeof timeOfDayPlays];
                  const pct = Math.round((plays / maxTimePlays) * 100);
                  
                  const periodFeat = periodVibeFeatures[item.key];
                  const periodVibe = periodFeat 
                    ? getVibeDetails(periodFeat.valence, periodFeat.energy, periodFeat.acousticness, t) 
                    : null;

                  return (
                    <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 18, userSelect: "none" }}>{item.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--spice-text)" }}>{item.label}</span>
                          <span style={{ fontSize: 11, color: "var(--spice-subtext)", fontWeight: 600 }}>{plays}x</span>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.03)", borderRadius: 3, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: "var(--spice-button)",
                              borderRadius: 3,
                              transition: "width 0.5s ease-out",
                            }}
                          />
                        </div>
                        {periodVibe && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            {periodVibe.icon(THEME_COLORS[periodVibe.theme][4], 12)}
                            <span style={{ fontSize: 10, color: "var(--spice-subtext)", fontWeight: 500 }}>
                              {t.typicalVibe}: {periodVibe.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Top tracks & Top artists grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 16 }}>
          <TopTracks tracks={tracks} lang={lang} />
          <TopArtists artists={artists} lang={lang} />
        </div>

        {/* Tracker Warning Card */}
        <div
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
          <span style={{ fontSize: 16, lineHeight: "1" }}>⚠️</span>
          <div style={{ fontSize: 11, lineHeight: "16px", color: "var(--spice-subtext)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <strong style={{ color: "var(--spice-text)", display: "block", marginBottom: 2 }}>
                {t.warningTitle}
              </strong>
              {t.warningDesc}
            </div>
            <div>
              <strong style={{ color: "var(--spice-text)", display: "block", marginBottom: 2 }}>
                {t.antiSkipTitle}
              </strong>
              {t.antiSkipDesc}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 24,
            fontSize: 11,
            color: "var(--spice-subtext)",
            textAlign: "center",
          }}
        >
          {t.dataStoredLocally}
          <br />
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 12, alignItems: "center" }}>
            <span
              style={{ color: "var(--spice-button)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => setShowResetModal(true)}
            >
              {t.resetData}
            </span>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => {
          import("../store").then((s) => {
            s.clearHistory();
            refresh();
          });
        }}
        lang={lang}
      />
    </>
  );
}
