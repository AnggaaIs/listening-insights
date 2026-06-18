import { saveEvent, saveSkip } from "./store";

let trackTimeout: any = null;

export function initTracker() {
  Spicetify.Player.addEventListener("songchange", () => {
    // Clear previous song's pending play log if skipped
    if (trackTimeout) {
      clearTimeout(trackTimeout);
      trackTimeout = null;
      saveSkip();
    }

    const meta = Spicetify.Player.data?.item;
    if (!meta) return;

    // Calculate threshold: 20 seconds or half of the song duration for shorter tracks
    const rawDuration = meta.duration as unknown;
    let durationMs =
      typeof rawDuration === "number"
        ? rawDuration
        : typeof rawDuration === "object" && rawDuration !== null && "milliseconds" in rawDuration
          ? Number((rawDuration as { milliseconds: number }).milliseconds)
          : 0;
    if (typeof durationMs !== "number" || isNaN(durationMs) || durationMs <= 0) {
      durationMs = typeof Spicetify !== "undefined" && Spicetify.Player ? Spicetify.Player.getDuration() : 180_000;
    }
    if (!durationMs || isNaN(durationMs) || durationMs <= 0) {
      durationMs = 180_000;
    } else if (durationMs < 1000) {
      // If duration is less than 1000, it is likely in seconds instead of milliseconds
      durationMs = durationMs * 1000;
    }
    const thresholdMs = Math.min(20_000, durationMs / 2);

    trackTimeout = setTimeout(() => {
      const event = {
        ts: Date.now(),
        trackUri: meta.uri,
        trackName: meta.name,
        artist: meta.artists?.[0]?.name ?? "Unknown",
        artistUri: meta.artists?.[0]?.uri,
        imageUrl: meta.metadata?.image_url ?? meta.metadata?.image_small_url ?? meta.metadata?.image_large_url,
      };

      saveEvent(event);
      trackTimeout = null;
    }, thresholdMs);
  });
}

