import { saveEvent, saveSkip } from "./store";

let progressInterval: ReturnType<typeof setInterval> | null = null;
let playCounted = false;

function getDurationSafe(meta: any): number {
  const raw = meta.duration;
  let ms: number;
  if (typeof raw === "number") ms = raw;
  else if (raw && typeof raw === "object" && "milliseconds" in raw)
    ms = Number((raw as { milliseconds: number }).milliseconds);
  else ms = Spicetify.Player?.getDuration?.() ?? 180_000;
  if (!ms || isNaN(ms) || ms <= 0) ms = 180_000;
  else if (ms < 1000) ms *= 1000;
  return ms;
}

function thresholdForDuration(ms: number): number {
  if (ms < 30_000) return ms * 0.5;
  if (ms < 120_000) return ms * 0.35;
  if (ms < 300_000) return Math.max(ms * 0.2, 15_000);
  return Math.max(ms * 0.15, 30_000);
}

export function initTracker() {
  Spicetify.Player.addEventListener("songchange", () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
      if (!playCounted) saveSkip();
    }
    playCounted = false;

    const meta = Spicetify.Player.data?.item;
    if (!meta) return;

    const durationMs = getDurationSafe(meta);
    const thresholdMs = thresholdForDuration(durationMs);

    progressInterval = setInterval(() => {
      try {
        const progressMs = Spicetify.Player.getProgress();
        if (typeof progressMs === "number" && progressMs > 0 && progressMs >= thresholdMs) {
          saveEvent({
            ts: Date.now(),
            trackUri: meta.uri,
            trackName: meta.name,
            artist: meta.artists?.[0]?.name ?? "Unknown",
            artistUri: meta.artists?.[0]?.uri,
            imageUrl: meta.metadata?.image_url ?? meta.metadata?.image_small_url ?? meta.metadata?.image_large_url,
          });
          playCounted = true;
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
        }
      } catch {
        // Silently ignore progress check errors
      }
    }, 3000);
  });
}
