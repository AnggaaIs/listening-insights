import { PlayEvent } from "../store";
import {
  artistLoyalty,
  comparePeriods,
  currentTasteHint,
  dataQualityStatus,
  listeningScore,
  peakTimeOfDay,
  repeatAddiction,
  skipHotspot,
  topArtists,
} from "../utils";
import locales from "../locales.json";

export interface CoachInsight {
  label: string;
  value: string;
  tone: "good" | "watch" | "action";
}

export interface ListeningCoachReport {
  title: string;
  summary: string;
  insights: CoachInsight[];
  actionLabel: string;
  actionQuery: string;
}

export function listeningCoach(events: PlayEvent[], skips: number[], days: number, lang: "en" | "id"): ListeningCoachReport {
  const copy = locales[lang].listeningCoach;
  const quality = dataQualityStatus(events, days, lang);
  const score = listeningScore(events, skips, days);
  const compare = comparePeriods(events, days);
  const repeat = repeatAddiction(events, days);
  const loyalty = artistLoyalty(events, days);
  const hotspot = skipHotspot(skips, days, lang);
  const taste = currentTasteHint(events, days, lang);
  const peak = peakTimeOfDay(events, days);
  const topArtist = topArtists(events, days, 1)[0]?.name;
  const insights: CoachInsight[] = [];

  if (quality.level === "low") {
    insights.push({
      label: copy.lowSample,
      value: copy.lowSampleValue,
      tone: "watch",
    });
  }

  if (compare.previousPlays > 0 && Math.abs(compare.playDiffPct) >= 30) {
    insights.push({
      label: copy.activityShift,
      value: `${compare.playDiffPct >= 0 ? copy.activityUp : copy.activityDown} ${Math.abs(compare.playDiffPct)}% ${copy.vsPreviousPeriod}`,
      tone: compare.playDiffPct >= 0 ? "good" : "watch",
    });
  }

  if (repeat.repeatPct >= 25 && repeat.track) {
    insights.push({
      label: copy.highRepeat,
      value: formatTemplate(copy.highRepeatValue, { track: repeat.track.name, pct: String(repeat.repeatPct) }),
      tone: "action",
    });
  }

  if (loyalty.pct >= 35 && loyalty.artist) {
    insights.push({
      label: copy.artistLoyalty,
      value: formatTemplate(copy.artistLoyaltyValue, { artist: loyalty.artist.name, pct: String(loyalty.pct) }),
      tone: "good",
    });
  }

  if (hotspot.skips >= 3) {
    insights.push({
      label: copy.skipHotspot,
      value: formatTemplate(copy.skipHotspotValue, { label: hotspot.label }),
      tone: "watch",
    });
  }

  if (score.diversity < 25 && events.length > 0) {
    insights.push({
      label: copy.lowDiscovery,
      value: copy.lowDiscoveryValue,
      tone: "action",
    });
  }

  if (insights.length === 0) {
    insights.push({
      label: copy.stablePattern,
      value: copy.stablePatternValue,
      tone: "good",
    });
  }

  const actionQuery = topArtist ? `artist radio ${topArtist}` : taste.query || peakQuery(peak);
  return {
    title: copy.title,
    summary: formatTemplate(copy.summary, { score: String(score.score), focus: insights[0].label.toLowerCase() }),
    insights: insights.slice(0, 4),
    actionLabel: copy.actionLabel,
    actionQuery,
  };
}

function formatTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template);
}

function peakQuery(peak: string): string {
  if (peak === "night") return "late night mix";
  if (peak === "morning") return "morning mix";
  if (peak === "evening") return "evening chill";
  return "focus mix";
}
