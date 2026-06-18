import { useCallback, useEffect, useState } from "react";
import { loadHistory, loadSkips } from "../store";
import {
  buildMatrix,
  calculateStreaks,
  fmtHour,
  peakDow,
  peakHour,
  peakTimeOfDay,
  topArtists,
  topTracks,
} from "../utils";
import { DashboardData, DayRange, TimeOfDay, TrendSnapshot } from "../types/dashboard";

const emptyMatrix = () => Array.from({ length: 24 }, () => Array(7).fill(0));

function dateBucket(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function summarizeMatrix(matrix: number[][]) {
  const dowPlays = Array(7).fill(0);
  const timeOfDayPlays: Record<TimeOfDay, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  for (let hour = 0; hour < 24; hour++) {
    let timeOfDay: TimeOfDay = "night";
    if (hour >= 6 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else if (hour >= 18 && hour < 22) timeOfDay = "evening";

    for (let dow = 0; dow < 7; dow++) {
      const plays = matrix[hour]?.[dow] ?? 0;
      dowPlays[dow] += plays;
      timeOfDayPlays[timeOfDay] += plays;
    }
  }

  return {
    dowPlays,
    maxDowPlays: Math.max(...dowPlays, 1),
    timeOfDayPlays,
    maxTimePlays: Math.max(
      timeOfDayPlays.morning,
      timeOfDayPlays.afternoon,
      timeOfDayPlays.evening,
      timeOfDayPlays.night,
      1,
    ),
  };
}

function buildTrendMap<T extends { count: number }>(
  current: T[],
  previous: T[],
  keyOf: (item: T) => string,
): Record<string, TrendSnapshot> {
  const previousRanks = new Map<string, { rank: number; count: number }>();
  previous.forEach((item, index) => {
    previousRanks.set(keyOf(item), { rank: index + 1, count: item.count });
  });

  return current.reduce<Record<string, TrendSnapshot>>((acc, item, index) => {
    const key = keyOf(item);
    const prev = previousRanks.get(key);
    const currentRank = index + 1;
    acc[key] = {
      currentRank,
      previousRank: prev?.rank ?? null,
      rankDelta: prev ? prev.rank - currentRank : null,
      countDelta: item.count - (prev?.count ?? 0),
    };
    return acc;
  }, {});
}

const initialData: DashboardData = {
  matrix: emptyMatrix(),
  historyEvents: [],
  tracks: [],
  artists: [],
  trackTrends: {},
  artistTrends: {},
  totalPlays: 0,
  peak: 0,
  peakDay: 0,
  peakTime: "afternoon",
  dailyAverage: "0",
  uniqueTracksCount: 0,
  uniqueArtistsCount: 0,
  listeningTimeMin: 0,
  consistencyPct: 0,
  skipRate: 0,
  weekdayPct: 0,
  weekendPct: 0,
  currentStreak: 0,
  longestStreak: 0,
  playsPct: 0,
  timePct: 0,
  consistencyDiff: 0,
  uniqueTracksDiff: 0,
  hasPrevData: false,
  top3Hours: [],
  discoveryRate: 0,
  ...summarizeMatrix(emptyMatrix()),
};

export function useListeningDashboard(days: DayRange) {
  const [data, setData] = useState<DashboardData>(initialData);

  const refresh = useCallback(() => {
    const history = loadHistory();
    const matrix = buildMatrix(history, days);
    const cutoff = Date.now() - days * 864e5;
    const filteredEvents = history.filter((event) => event.ts > cutoff);
    const uniqueTracks = new Set(filteredEvents.map((event) => event.trackUri));
    const uniqueArtists = new Set(filteredEvents.map((event) => event.artist));
    const streaks = calculateStreaks(history);
    const skips = loadSkips();
    const filteredSkips = skips.filter((ts) => ts > cutoff);
    const totalAttempts = filteredEvents.length + filteredSkips.length;

    let weekdayPlays = 0;
    let weekendPlays = 0;
    filteredEvents.forEach((event) => {
      const day = new Date(event.ts).getDay();
      if (day === 0 || day === 6) weekendPlays++;
      else weekdayPlays++;
    });

    const activeDaysSet = new Set(filteredEvents.map((event) => dateBucket(event.ts)));
    const consistencyPct = Math.min(100, Math.round((activeDaysSet.size / days) * 100));
    const hourlyPlays = Array(24).fill(0);
    for (let hour = 0; hour < 24; hour++) {
      for (let dow = 0; dow < 7; dow++) {
        hourlyPlays[hour] += matrix[hour]?.[dow] ?? 0;
      }
    }

    const top3Hours = hourlyPlays
      .map((plays, hour) => ({ hour, plays }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 3)
      .filter((item) => item.plays > 0)
      .map((item) => fmtHour(item.hour));

    const prevCutoff = Date.now() - 2 * days * 864e5;
    const previousEvents = history.filter((event) => event.ts > prevCutoff && event.ts <= cutoff);
    const hasPrevData = previousEvents.length > 0;
    const prevActiveDaysSet = new Set(previousEvents.map((event) => dateBucket(event.ts)));
    const prevConsistency = Math.min(100, Math.round((prevActiveDaysSet.size / days) * 100));
    const prevUniqueTracks = new Set(previousEvents.map((event) => event.trackUri)).size;
    const earliestTs = filteredEvents[0]?.ts;
    const activeSpanDays = earliestTs
      ? Math.min(days, Math.max(1, Math.round((Date.now() - earliestTs) / 864e5)))
      : 0;
    const tracks = topTracks(history, days);
    const artists = topArtists(history, days);
    const previousTrackStats = topTracks(previousEvents, days);
    const previousArtistStats = topArtists(previousEvents, days);

    setData({
      matrix,
      historyEvents: history,
      tracks,
      artists,
      trackTrends: hasPrevData ? buildTrendMap(tracks, previousTrackStats, (track) => track.uri) : {},
      artistTrends: hasPrevData ? buildTrendMap(artists, previousArtistStats, (artist) => artist.name) : {},
      totalPlays: filteredEvents.length,
      peak: peakHour(matrix),
      peakDay: peakDow(matrix),
      peakTime: peakTimeOfDay(history, days),
      dailyAverage: activeSpanDays > 0 ? (filteredEvents.length / activeSpanDays).toFixed(1) : "0",
      uniqueTracksCount: uniqueTracks.size,
      uniqueArtistsCount: uniqueArtists.size,
      listeningTimeMin: Math.round(filteredEvents.length * 3.3),
      consistencyPct,
      skipRate: totalAttempts > 0 ? Math.round((filteredSkips.length / totalAttempts) * 100) : 0,
      weekdayPct: filteredEvents.length > 0 ? Math.round((weekdayPlays / filteredEvents.length) * 100) : 0,
      weekendPct: filteredEvents.length > 0 ? Math.round((weekendPlays / filteredEvents.length) * 100) : 0,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      playsPct: hasPrevData ? Math.round(((filteredEvents.length - previousEvents.length) / previousEvents.length) * 100) : 0,
      timePct: hasPrevData
        ? Math.round(((filteredEvents.length * 3.3 - previousEvents.length * 3.3) / Math.max(1, previousEvents.length * 3.3)) * 100)
        : 0,
      consistencyDiff: hasPrevData ? consistencyPct - prevConsistency : 0,
      uniqueTracksDiff: hasPrevData ? uniqueTracks.size - prevUniqueTracks : 0,
      hasPrevData,
      top3Hours,
      discoveryRate: filteredEvents.length > 0 ? Math.round((uniqueTracks.size / filteredEvents.length) * 100) : 0,
      ...summarizeMatrix(matrix),
    });
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
      setTimeout(refresh, 100);
    };
    Spicetify.Player.addEventListener("songchange", handleSongChange);
    return () => {
      Spicetify.Player.removeEventListener("songchange", handleSongChange);
    };
  }, [refresh]);

  return { data, refresh };
}
