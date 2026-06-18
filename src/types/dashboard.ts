import { PlayEvent } from "../store";
import { topArtists, topTracks } from "../utils";

export type DayRange = 7 | 30 | 90;
export type Language = "en" | "id";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type PageTab = "overview" | "patterns" | "library" | "data";

export interface TrendSnapshot {
  currentRank: number;
  previousRank: number | null;
  rankDelta: number | null;
  countDelta: number;
}

export interface DashboardData {
  matrix: number[][];
  historyEvents: PlayEvent[];
  tracks: ReturnType<typeof topTracks>;
  artists: ReturnType<typeof topArtists>;
  trackTrends: Record<string, TrendSnapshot>;
  artistTrends: Record<string, TrendSnapshot>;
  totalPlays: number;
  peak: number;
  peakDay: number;
  peakTime: TimeOfDay;
  dailyAverage: string;
  uniqueTracksCount: number;
  uniqueArtistsCount: number;
  listeningTimeMin: number;
  consistencyPct: number;
  skipRate: number;
  weekdayPct: number;
  weekendPct: number;
  currentStreak: number;
  longestStreak: number;
  playsPct: number;
  timePct: number;
  consistencyDiff: number;
  uniqueTracksDiff: number;
  hasPrevData: boolean;
  top3Hours: string[];
  discoveryRate: number;
  dowPlays: number[];
  maxDowPlays: number;
  timeOfDayPlays: Record<TimeOfDay, number>;
  maxTimePlays: number;
}
