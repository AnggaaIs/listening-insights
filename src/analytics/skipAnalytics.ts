import { PlayEvent } from "../store";

export interface TimeSegmentSkipRate {
  segment: "morning" | "afternoon" | "evening" | "night";
  labelKey: string;
  plays: number;
  skips: number;
  skipRate: number;
}

export interface SkippedTrackStat {
  uri: string;
  name: string;
  artist: string;
  skipCount: number;
}

function timeSegment(hour: number): "morning" | "afternoon" | "evening" | "night" {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

function nearestPlayBeforeSkip(skipTs: number, history: PlayEvent[], windowMs: number): PlayEvent | null {
  let best: PlayEvent | null = null;
  let bestDiff = Infinity;
  for (const event of history) {
    const diff = skipTs - event.ts;
    if (diff >= 0 && diff <= windowMs && diff < bestDiff) {
      best = event;
      bestDiff = diff;
    }
  }
  return best;
}

export function skipRateByTimeSegment(history: PlayEvent[], skips: number[]): TimeSegmentSkipRate[] {
  const segments: Record<string, { plays: number; skips: number }> = {
    morning: { plays: 0, skips: 0 },
    afternoon: { plays: 0, skips: 0 },
    evening: { plays: 0, skips: 0 },
    night: { plays: 0, skips: 0 },
  };

  const windowMs = 3 * 60 * 1000;

  for (const event of history) {
    const h = new Date(event.ts).getHours();
    const seg = timeSegment(h);
    segments[seg].plays++;
  }

  for (const skip of skips) {
    const nearest = nearestPlayBeforeSkip(skip, history, windowMs);
    if (nearest) {
      const h = new Date(nearest.ts).getHours();
      const seg = timeSegment(h);
      segments[seg].skips++;
    }
  }

  return (["morning", "afternoon", "evening", "night"] as const).map((segment) => {
    const { plays, skips } = segments[segment];
    return {
      segment,
      labelKey: segment,
      plays,
      skips,
      skipRate: plays > 0 ? Math.round((skips / plays) * 100) : 0,
    };
  });
}

export interface SkippedArtistStat {
  name: string;
  skipCount: number;
}

export function mostSkippedArtists(history: PlayEvent[], skips: number[]): SkippedArtistStat[] {
  const windowMs = 3 * 60 * 1000;
  const map = new Map<string, number>();
  for (const skip of skips) {
    const nearest = nearestPlayBeforeSkip(skip, history, windowMs);
    if (nearest) {
      map.set(nearest.artist, (map.get(nearest.artist) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, skipCount: count }))
    .sort((a, b) => b.skipCount - a.skipCount)
    .slice(0, 5);
}

export function mostSkippedTracks(history: PlayEvent[], skips: number[]): SkippedTrackStat[] {
  const windowMs = 3 * 60 * 1000;
  const map = new Map<string, { name: string; artist: string; count: number }>();

  for (const skip of skips) {
    const nearest = nearestPlayBeforeSkip(skip, history, windowMs);
    if (nearest) {
      const existing = map.get(nearest.trackUri);
      if (existing) {
        existing.count++;
      } else {
        map.set(nearest.trackUri, { name: nearest.trackName, artist: nearest.artist, count: 1 });
      }
    }
  }

  return Array.from(map.entries())
    .map(([uri, data]) => ({ uri, name: data.name, artist: data.artist, skipCount: data.count }))
    .sort((a, b) => b.skipCount - a.skipCount)
    .slice(0, 5);
}
