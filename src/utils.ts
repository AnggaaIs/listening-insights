// src/utils.ts
// Data aggregation helpers

import { PlayEvent } from "./store";
import locales from "./locales.json";

// matrix[hour 0-23][dow 0-6, Sun=0] = play count
export function buildMatrix(events: PlayEvent[], days: number): number[][] {
  const cutoff = Date.now() - days * 864e5;
  const m = Array.from({ length: 24 }, () => Array(7).fill(0));

  for (const e of events) {
    if (e.ts < cutoff) continue;
    const d = new Date(e.ts);
    m[d.getHours()][d.getDay()]++;
  }
  return m;
}

export function matrixMax(m: number[][]): number {
  return Math.max(...m.reduce<number[]>((all, row) => all.concat(row), []), 1);
}

export function peakHour(m: number[][]): number {
  let best = 0,
    bestVal = -1;
  m.forEach((row, h) => {
    const s = row.reduce((a, b) => a + b, 0);
    if (s > bestVal) {
      bestVal = s;
      best = h;
    }
  });
  return best;
}

export function peakDow(m: number[][]): number {
  const sums = Array(7).fill(0);
  m.forEach((row) =>
    row.forEach((v, d) => {
      sums[d] += v;
    }),
  );
  return sums.indexOf(Math.max(...sums));
}

export interface TrackStat {
  uri: string;
  name: string;
  artist: string;
  count: number;
  imageUrl?: string;
}

export function topTracks(
  events: PlayEvent[],
  days: number,
  limit = 5,
): TrackStat[] {
  const cutoff = Date.now() - days * 864e5;
  const map: Record<string, TrackStat> = {};

  for (const e of events) {
    if (e.ts < cutoff) continue;
    if (!map[e.trackUri]) {
      map[e.trackUri] = {
        uri: e.trackUri,
        name: e.trackName,
        artist: e.artist,
        count: 0,
        imageUrl: e.imageUrl,
      };
    }
    map[e.trackUri].count++;
    if (!map[e.trackUri].imageUrl && e.imageUrl) {
      map[e.trackUri].imageUrl = e.imageUrl;
    }
  }

  return Object.values(map)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DOW_LABELS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function fmtHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

export function cellColor(val: number, max: number): string {
  if (val === 0) return "var(--hm-empty)";
  const t = val / max;
  if (t < 0.2) return "var(--hm-1)";
  if (t < 0.4) return "var(--hm-2)";
  if (t < 0.6) return "var(--hm-3)";
  if (t < 0.8) return "var(--hm-4)";
  return "var(--hm-5)";
}

export interface ArtistStat {
  name: string;
  count: number;
  uri?: string;
}

export function topArtists(
  events: PlayEvent[],
  days: number,
  limit = 5,
): ArtistStat[] {
  const cutoff = Date.now() - days * 864e5;
  const map: Record<string, { count: number; uri?: string }> = {};

  for (const e of events) {
    if (e.ts < cutoff) continue;
    if (!map[e.artist]) {
      map[e.artist] = { count: 0, uri: e.artistUri };
    }
    map[e.artist].count++;
    if (!map[e.artist].uri && e.artistUri) {
      map[e.artist].uri = e.artistUri;
    }
  }

  return Object.entries(map)
    .map(([name, data]) => ({ name, count: data.count, uri: data.uri }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function peakTimeOfDay(events: PlayEvent[], days: number): "morning" | "afternoon" | "evening" | "night" {
  const cutoff = Date.now() - days * 864e5;
  const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  for (const e of events) {
    if (e.ts < cutoff) continue;
    const h = new Date(e.ts).getHours();
    if (h >= 6 && h < 12) counts.morning++;
    else if (h >= 12 && h < 18) counts.afternoon++;
    else if (h >= 18 && h < 22) counts.evening++;
    else counts.night++;
  }

  let maxKey: keyof typeof counts = "afternoon";
  let maxVal = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > maxVal) {
      maxVal = v;
      maxKey = k as keyof typeof counts;
    }
  }
  return maxKey;
}

export interface StreakData {
  current: number;
  longest: number;
}

export function calculateStreaks(events: PlayEvent[]): StreakData {
  if (events.length === 0) return { current: 0, longest: 0 };

  // Get unique local dates (YYYY-MM-DD)
  const datesSet = new Set<string>();
  for (const e of events) {
    const d = new Date(e.ts);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    datesSet.add(`${year}-${month}-${date}`);
  }

  // Convert to sorted timestamps of start of days (UTC-like representation)
  const sortedDates = Array.from(datesSet)
    .map((dStr) => new Date(dStr).getTime())
    .sort((a, b) => b - a); // descending order (newest first)

  if (sortedDates.length === 0) return { current: 0, longest: 0 };

  // Calculate current streak
  const oneDayMs = 864e5;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayTs = new Date(todayStr).getTime();
  
  const newestTs = sortedDates[0];
  const diffToToday = todayTs - newestTs;

  let current = 0;
  // Current streak is valid only if they listened today or yesterday
  if (diffToToday <= oneDayMs) {
    current = 1;
    let lastTs = newestTs;
    for (let i = 1; i < sortedDates.length; i++) {
      if (lastTs - sortedDates[i] === oneDayMs) {
        current++;
        lastTs = sortedDates[i];
      } else if (lastTs - sortedDates[i] > oneDayMs) {
        break; // streak broken
      }
    }
  }

  // Calculate longest streak
  let longest = 0;
  if (sortedDates.length > 0) {
    let tempStreak = 1;
    let lastTs = sortedDates[0];
    longest = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      if (lastTs - sortedDates[i] === oneDayMs) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else if (lastTs - sortedDates[i] > oneDayMs) {
        tempStreak = 1; // reset temp streak
      }
      lastTs = sortedDates[i];
    }
  }

  return { current, longest };
}

export interface MonthlyRecap {
  label: string;
  plays: number;
  uniqueTracks: number;
  uniqueArtists: number;
  topTrack?: TrackStat;
  topArtist?: ArtistStat;
  peakHour: number;
}

export interface CalendarDay {
  key: string;
  label: string;
  dayOfMonth: number;
  plays: number;
  isToday: boolean;
}

export interface GoalProgress {
  key: "streak" | "monthlyPlays" | "discovery";
  label: string;
  value: number;
  target: number;
  unit: string;
  pct: number;
}

export interface Recommendation {
  title: string;
  desc: string;
  query: string;
}

export interface ListeningScore {
  score: number;
  consistency: number;
  diversity: number;
  streak: number;
  skip: number;
}

export interface BestListeningDay {
  label: string;
  plays: number;
}

export interface RepeatAddiction {
  track?: TrackStat;
  repeatPct: number;
}

export interface ArtistLoyalty {
  artist?: ArtistStat;
  pct: number;
}

export interface ListeningSessionSummary {
  count: number;
  longestMin: number;
  favoriteStartHour: number;
}

export interface SkipHotspot {
  label: string;
  skips: number;
}

export interface ComparePeriods {
  currentPlays: number;
  previousPlays: number;
  playDiffPct: number;
  currentUnique: number;
  previousUnique: number;
  uniqueDiff: number;
}

export interface MoodPoint {
  label: string;
  mood: "morning" | "afternoon" | "evening" | "night";
  plays: number;
}

export interface MiniWrapped {
  title: string;
  lines: string[];
}

export interface TasteHint {
  title: string;
  desc: string;
  query: string;
}

export interface DataQualityStatus {
  level: "good" | "medium" | "low";
  sampleSize: number;
  activeDays: number;
  message: string;
}

export interface SyncNotice {
  lastTrackedLabel: string;
  hoursSinceLastEvent: number | null;
  message: string;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function monthlyRecap(events: PlayEvent[], lang: "en" | "id"): MonthlyRecap {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthEvents = events.filter((e) => {
    const d = new Date(e.ts);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const matrix = buildMatrix(monthEvents, 31);

  return {
    label: now.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "long", year: "numeric" }),
    plays: monthEvents.length,
    uniqueTracks: new Set(monthEvents.map((e) => e.trackUri)).size,
    uniqueArtists: new Set(monthEvents.map((e) => e.artist)).size,
    topTrack: topTracks(monthEvents, 31, 1)[0],
    topArtist: topArtists(monthEvents, 31, 1)[0],
    peakHour: peakHour(matrix),
  };
}

export function listeningCalendar(events: PlayEvent[], days: number): CalendarDay[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    counts.set(localDateKey(new Date(e.ts)), (counts.get(localDateKey(new Date(e.ts))) ?? 0) + 1);
  }

  const today = new Date();
  const todayKey = localDateKey(today);
  return Array.from({ length: days }).map((_, idx) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(today.getDate() - (days - idx - 1));
    const key = localDateKey(d);
    return {
      key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      dayOfMonth: d.getDate(),
      plays: counts.get(key) ?? 0,
      isToday: key === todayKey,
    };
  });
}

export function goalProgress(events: PlayEvent[], days: number): GoalProgress[] {
  const cutoff = Date.now() - days * 864e5;
  const filtered = events.filter((e) => e.ts > cutoff);
  const streak = calculateStreaks(events).current;
  const month = monthlyRecap(events, "en");
  const uniqueTracks = new Set(filtered.map((e) => e.trackUri)).size;
  const discoveryRate = filtered.length > 0 ? Math.round((uniqueTracks / filtered.length) * 100) : 0;

  return [
    { key: "streak", label: "Active streak", value: streak, target: 7, unit: "days", pct: Math.min(100, Math.round((streak / 7) * 100)) },
    { key: "monthlyPlays", label: "Monthly plays", value: month.plays, target: 100, unit: "plays", pct: Math.min(100, Math.round((month.plays / 100) * 100)) },
    { key: "discovery", label: "Discovery rate", value: discoveryRate, target: 40, unit: "%", pct: Math.min(100, Math.round((discoveryRate / 40) * 100)) },
  ];
}

export function recommendations(events: PlayEvent[], days: number, lang: "en" | "id"): Recommendation[] {
  const copy = locales[lang].analyticsCopy;
  const cutoff = Date.now() - days * 864e5;
  const filtered = events.filter((e) => e.ts > cutoff);
  if (filtered.length === 0) {
    return [
      {
        title: copy.dailyMixTitle,
        desc: copy.dailyMixDesc,
        query: "Daily Mix",
      },
    ];
  }

  const peak = peakTimeOfDay(events, days);
  const topArtistName = topArtists(events, days, 1)[0]?.name;
  const topTrackArtist = topTracks(events, days, 1)[0]?.artist;
  const baseArtist = topArtistName || topTrackArtist || "";
  const periodQuery = peak === "night" ? "late night mix" : peak === "morning" ? "morning mix" : peak === "evening" ? "evening chill" : "focus mix";

  return [
    {
      title: copy.activeHoursTitle,
      desc: formatTemplate(copy.activeHoursDesc, { peak }),
      query: periodQuery,
    },
    {
      title: copy.favoriteArtistTitle,
      desc: baseArtist
        ? formatTemplate(copy.favoriteArtistDesc, { artist: baseArtist })
        : copy.favoriteArtistFallback,
      query: baseArtist ? `artist radio ${baseArtist}` : "artist radio",
    },
    {
      title: copy.boostDiscoveryTitle,
      desc: copy.boostDiscoveryDesc,
      query: "discover weekly",
    },
  ];
}

function eventsInDays(events: PlayEvent[], days: number): PlayEvent[] {
  const cutoff = Date.now() - days * 864e5;
  return events.filter((e) => e.ts > cutoff);
}

export function listeningScore(events: PlayEvent[], skips: number[], days: number): ListeningScore {
  const filtered = eventsInDays(events, days);
  const activeDays = new Set(filtered.map((e) => localDateKey(new Date(e.ts)))).size;
  const uniqueTracks = new Set(filtered.map((e) => e.trackUri)).size;
  const skipCount = skips.filter((ts) => ts > Date.now() - days * 864e5).length;
  const attempts = filtered.length + skipCount;

  const consistency = Math.min(100, Math.round((activeDays / days) * 100));
  const diversity = filtered.length > 0 ? Math.min(100, Math.round((uniqueTracks / filtered.length) * 100)) : 0;
  const streak = Math.min(100, Math.round((calculateStreaks(events).current / 7) * 100));
  const skip = attempts > 0 ? Math.max(0, 100 - Math.round((skipCount / attempts) * 100)) : 0;
  const score = Math.round(consistency * 0.32 + diversity * 0.26 + streak * 0.22 + skip * 0.2);

  return { score, consistency, diversity, streak, skip };
}

export function bestListeningDay(events: PlayEvent[], days: number, lang: "en" | "id"): BestListeningDay {
  const counts = new Map<string, { date: Date; plays: number }>();
  for (const event of eventsInDays(events, days)) {
    const date = new Date(event.ts);
    const key = localDateKey(date);
    const current = counts.get(key);
    counts.set(key, { date, plays: (current?.plays ?? 0) + 1 });
  }

  const best = Array.from(counts.values()).sort((a, b) => b.plays - a.plays)[0];
  if (!best) return { label: "-", plays: 0 };
  return {
    label: best.date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "short", month: "short", day: "numeric" }),
    plays: best.plays,
  };
}

export function repeatAddiction(events: PlayEvent[], days: number): RepeatAddiction {
  const filtered = eventsInDays(events, days);
  const track = topTracks(events, days, 1)[0];
  return {
    track,
    repeatPct: filtered.length > 0 && track ? Math.round((track.count / filtered.length) * 100) : 0,
  };
}

export function artistLoyalty(events: PlayEvent[], days: number): ArtistLoyalty {
  const filtered = eventsInDays(events, days);
  const artist = topArtists(events, days, 1)[0];
  return {
    artist,
    pct: filtered.length > 0 && artist ? Math.round((artist.count / filtered.length) * 100) : 0,
  };
}

export function listeningSessions(events: PlayEvent[], days: number): ListeningSessionSummary {
  const filtered = eventsInDays(events, days).slice().sort((a, b) => a.ts - b.ts);
  if (filtered.length === 0) return { count: 0, longestMin: 0, favoriteStartHour: 0 };

  const sessions: Array<{ start: number; end: number; count: number }> = [];
  let current = { start: filtered[0].ts, end: filtered[0].ts, count: 1 };

  for (let i = 1; i < filtered.length; i++) {
    const event = filtered[i];
    if (event.ts - current.end <= 30 * 60 * 1000) {
      current.end = event.ts;
      current.count++;
    } else {
      sessions.push(current);
      current = { start: event.ts, end: event.ts, count: 1 };
    }
  }
  sessions.push(current);

  const startHours = Array(24).fill(0);
  sessions.forEach((session) => {
    startHours[new Date(session.start).getHours()]++;
  });

  return {
    count: sessions.length,
    longestMin: Math.max(...sessions.map((session) => Math.max(1, Math.round((session.end - session.start) / 60000) + 3))),
    favoriteStartHour: startHours.indexOf(Math.max(...startHours)),
  };
}

export function skipHotspot(skips: number[], days: number, lang: "en" | "id"): SkipHotspot {
  const cutoff = Date.now() - days * 864e5;
  const counts: Record<string, { label: string; skips: number }> = {};
  skips.filter((ts) => ts > cutoff).forEach((ts) => {
    const date = new Date(ts);
    const day = (lang === "en" ? DOW_LABELS : DOW_LABELS_ID)[date.getDay()];
    const hour = fmtHour(date.getHours());
    const key = `${date.getDay()}-${date.getHours()}`;
    counts[key] = { label: `${day} ${hour}`, skips: (counts[key]?.skips ?? 0) + 1 };
  });
  return Object.values(counts).sort((a, b) => b.skips - a.skips)[0] ?? { label: "-", skips: 0 };
}

export function comparePeriods(events: PlayEvent[], days: number): ComparePeriods {
  const now = Date.now();
  const currentStart = now - days * 864e5;
  const previousStart = now - days * 2 * 864e5;
  const current = events.filter((e) => e.ts > currentStart);
  const previous = events.filter((e) => e.ts > previousStart && e.ts <= currentStart);
  const currentUnique = new Set(current.map((e) => e.trackUri)).size;
  const previousUnique = new Set(previous.map((e) => e.trackUri)).size;

  return {
    currentPlays: current.length,
    previousPlays: previous.length,
    playDiffPct: previous.length > 0 ? Math.round(((current.length - previous.length) / previous.length) * 100) : 0,
    currentUnique,
    previousUnique,
    uniqueDiff: currentUnique - previousUnique,
  };
}

export function moodTimeline(events: PlayEvent[], days: number): MoodPoint[] {
  const filtered = eventsInDays(events, days).slice().sort((a, b) => a.ts - b.ts);
  const bucketMs = Math.max(1, Math.ceil(days / 4)) * 864e5;
  const start = Date.now() - days * 864e5;
  const points: MoodPoint[] = [];

  for (let i = 0; i < 4; i++) {
    const from = start + i * bucketMs;
    const to = i === 3 ? Date.now() + 1 : from + bucketMs;
    const bucket = filtered.filter((e) => e.ts >= from && e.ts < to);
    const date = new Date(from);
    points.push({
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      mood: peakTimeOfDay(bucket, 365),
      plays: bucket.length,
    });
  }

  return points;
}

export function miniWrapped(events: PlayEvent[], skips: number[], days: number, lang: "en" | "id"): MiniWrapped {
  const copy = locales[lang].analyticsCopy;
  const score = listeningScore(events, skips, days).score;
  const best = bestListeningDay(events, days, lang);
  const repeat = repeatAddiction(events, days);
  const loyalty = artistLoyalty(events, days);
  const topTrack = repeat.track?.name ?? "-";
  const topArtist = loyalty.artist?.name ?? "-";

  return {
    title: formatTemplate(copy.miniWrappedTitle, { days: String(days) }),
    lines: [
      formatTemplate(copy.miniWrappedScore, { score: String(score) }),
      formatTemplate(copy.miniWrappedTrack, { track: topTrack }),
      formatTemplate(copy.miniWrappedArtist, { artist: topArtist }),
      formatTemplate(copy.miniWrappedBestDay, { label: best.label, plays: String(best.plays) }),
    ],
  };
}

export function currentTasteHint(events: PlayEvent[], days: number, lang: "en" | "id"): TasteHint {
  const copy = locales[lang].analyticsCopy;
  const peak = peakTimeOfDay(events, days);
  const artist = topArtists(events, days, 1)[0]?.name;
  const title = copy.tasteTitle;
  const mode = copy.tasteModes[peak];
  const artistText = artist ? formatTemplate(copy.tasteArtistSuffix, { artist }) : "";
  return {
    title,
    desc: `${mode}${artistText}`,
    query: artist ? `${artist} ${mode}` : mode,
  };
}

export function dataQualityStatus(events: PlayEvent[], days: number, lang: "en" | "id"): DataQualityStatus {
  const copy = locales[lang].analyticsCopy.dataQuality;
  const filtered = eventsInDays(events, days);
  const activeDays = new Set(filtered.map((event) => localDateKey(new Date(event.ts)))).size;
  const sampleSize = filtered.length;
  const level =
    sampleSize >= 60 && activeDays >= Math.min(10, days) ? "good" :
    sampleSize >= 20 && activeDays >= Math.min(4, days) ? "medium" :
    "low";

  return { level, sampleSize, activeDays, message: copy[level] };
}

export function syncNotice(events: PlayEvent[], lang: "en" | "id"): SyncNotice {
  const copy = locales[lang].analyticsCopy.sync;
  if (events.length === 0) {
    return {
      lastTrackedLabel: "-",
      hoursSinceLastEvent: null,
      message: copy.empty,
    };
  }

  const last = events.reduce((max, event) => Math.max(max, event.ts), 0);
  const hours = Math.max(0, Math.round((Date.now() - last) / 36e5));
  const lastDate = new Date(last);
  const lastTrackedLabel = lastDate.toLocaleString(lang === "id" ? "id-ID" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const message = hours <= 6
    ? copy.active
    : hours <= 24
      ? copy.recentGap
      : copy.longGap;

  return { lastTrackedLabel, hoursSinceLastEvent: hours, message };
}

function formatTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template);
}

