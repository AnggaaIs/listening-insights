// src/store.ts
// Handles all read/write to localStorage

export interface PlayEvent {
  ts: number;
  trackUri: string;
  trackName: string;
  artist: string;
  artistUri?: string;
  imageUrl?: string;
}

const KEY = "spicetify-heatmap-v1";
const SKIPS_KEY = "spicetify-heatmap-skips-v1";
const MAX_DAYS = 90;

export interface BackupData {
  app: "listening-insights";
  version: 1;
  exportedAt: string;
  history: PlayEvent[];
  skips: number[];
}

export function saveEvent(event: PlayEvent): void {
  const history = loadHistory();
  history.push(event);

  // Keep only last 90 days / Simpan hanya 90 hari terakhir
  const cutoff = Date.now() - MAX_DAYS * 864e5;
  const trimmed = history.filter((e) => e.ts > cutoff);

  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full — drop oldest 100 entries
    localStorage.setItem(KEY, JSON.stringify(trimmed.slice(100)));
  }
}

export function loadHistory(): PlayEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlayEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(SKIPS_KEY);
}

export function clearSkips(): void {
  localStorage.removeItem(SKIPS_KEY);
}

export function saveSkip(): void {
  const skips = loadSkips();
  skips.push(Date.now());

  // Keep last 90 days
  const cutoff = Date.now() - MAX_DAYS * 864e5;
  const trimmed = skips.filter((ts) => ts > cutoff);

  try {
    localStorage.setItem(SKIPS_KEY, JSON.stringify(trimmed));
  } catch {
    localStorage.setItem(SKIPS_KEY, JSON.stringify(trimmed.slice(100)));
  }
}

export function loadSkips(): number[] {
  try {
    const raw = localStorage.getItem(SKIPS_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function exportBackup(): BackupData {
  return {
    app: "listening-insights",
    version: 1,
    exportedAt: new Date().toISOString(),
    history: loadHistory(),
    skips: loadSkips(),
  };
}

export function importBackup(data: unknown): void {
  const backup = data as Partial<BackupData>;
  if (!backup || backup.app !== "listening-insights" || !Array.isArray(backup.history) || !Array.isArray(backup.skips)) {
    throw new Error("Invalid Listening Insights backup file");
  }

  const history = backup.history
    .filter((e): e is PlayEvent =>
      Boolean(e)
      && typeof e.ts === "number"
      && typeof e.trackUri === "string"
      && typeof e.trackName === "string"
      && typeof e.artist === "string"
    )
    .sort((a, b) => a.ts - b.ts);
  const skips = backup.skips
    .filter((ts): ts is number => typeof ts === "number" && Number.isFinite(ts))
    .sort((a, b) => a - b);

  localStorage.setItem(KEY, JSON.stringify(history));
  localStorage.setItem(SKIPS_KEY, JSON.stringify(skips));
}

export function getStorageFootprint(): number {
  return (localStorage.getItem(KEY)?.length ?? 0) + (localStorage.getItem(SKIPS_KEY)?.length ?? 0);
}

export function generateDummyData(): void {
  const now = Date.now();
  const history: PlayEvent[] = [];
  const skips: number[] = [];

  const artists = [
    { name: "Coldplay", uri: "spotify:artist:4gzpq5DP66w7t8SgIT1uPs", tracks: [
      { name: "Yellow", uri: "spotify:track:3AJwNck6V12xiZJVmZr4FZ", img: "https://i.scdn.co/image/ab67616d0000b273e430d8329606d09320e8b2ec" },
      { name: "Fix You", uri: "spotify:track:7LVHVx3Oocx5GLwQ2Gv7IQ", img: "https://i.scdn.co/image/ab67616d0000b27382d2a45053744955c3c0b11e" },
      { name: "Viva La Vida", uri: "spotify:track:1rqqQZz4554m8916zrzDs2", img: "https://i.scdn.co/image/ab67616d0000b27367675ab5cfd71ef69c6f2e29" }
    ]},
    { name: "NIKI", uri: "spotify:artist:2xD6w44che8qD1TRiJWW4m", tracks: [
      { name: "Every Summertime", uri: "spotify:track:58H3tOGPLTM6az4z786J35", img: "https://i.scdn.co/image/ab67616d0000b273b0a2e6f4977464016fb639fa" },
      { name: "Lowkey", uri: "spotify:track:5daN4uQmq636086LZU87u4", img: "https://i.scdn.co/image/ab67616d0000b273d2f9ec0d19e48fa2eb2ebf17" }
    ]},
    { name: "Hindia", uri: "spotify:artist:6G6t495AVFqILml8N582Sg", tracks: [
      { name: "Secukupnya", uri: "spotify:track:4Hk5a42u9Qk8N2040n2e3a", img: "https://i.scdn.co/image/ab67616d0000b273623fa55c91ffc56cf46ec088" },
      { name: "Evaluasi", uri: "spotify:track:27N1429Qkml8n2040N2e3b", img: "https://i.scdn.co/image/ab67616d0000b273623fa55c91ffc56cf46ec088" }
    ]},
    { name: "LANY", uri: "spotify:artist:49tQo2Q1UQ1TRiJWw4m2xD", tracks: [
      { name: "ILYSB", uri: "spotify:track:27N14uQmq636086LZU87u4", img: "https://i.scdn.co/image/ab67616d0000b2738a16db8a2a537f8e70a6c253" }
    ]},
    { name: "Taylor Swift", uri: "spotify:artist:06HL4z0tbzZEehGCOw23m9", tracks: [
      { name: "Cruel Summer", uri: "spotify:track:1BxfuUi2vDkuZ68xuey4w0", img: "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647" }
    ]}
  ];

  // Generate around 450 play events over last 30 days
  for (let i = 0; i < 450; i++) {
    // Distribute timestamps over last 30 days
    const dayOffset = Math.floor(Math.random() * 30);
    
    // Create hourly bias: Peak in the evening/night (18:00 - 23:00) and afternoon (12:00 - 15:00)
    let hour = Math.floor(Math.random() * 24);
    if (Math.random() < 0.6) {
      const peakHours = [12, 13, 14, 18, 19, 20, 21, 22];
      hour = peakHours[Math.floor(Math.random() * peakHours.length)];
    }

    // Create day-of-week bias: busier on Friday, Saturday, Sunday
    let dayOffsetAdjusted = dayOffset;
    const dateCandidate = new Date(now - dayOffset * 864e5);
    dateCandidate.setHours(hour, Math.floor(Math.random() * 60));
    const dayOfWeek = dateCandidate.getDay();
    if ((dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) && Math.random() < 0.3) {
      // Add extra plays on weekends by duplicating the entry with slight offset
      i--; 
    }

    // Pick artist & track (skewed towards Coldplay and NIKI for top lists)
    let artistIdx = Math.floor(Math.random() * artists.length);
    if (Math.random() < 0.4) artistIdx = 0; // Coldplay bias
    else if (Math.random() < 0.25) artistIdx = 1; // NIKI bias

    const artist = artists[artistIdx];
    const track = artist.tracks[Math.floor(Math.random() * artist.tracks.length)];

    history.push({
      ts: dateCandidate.getTime(),
      trackUri: track.uri,
      trackName: track.name,
      artist: artist.name,
      artistUri: artist.uri,
      imageUrl: track.img
    });
  }

  // Generate 85 skips
  for (let i = 0; i < 85; i++) {
    const dayOffset = Math.floor(Math.random() * 30);
    const dateCandidate = new Date(now - dayOffset * 864e5);
    dateCandidate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    skips.push(dateCandidate.getTime());
  }

  // Sort chronological
  history.sort((a, b) => a.ts - b.ts);
  skips.sort((a, b) => a - b);

  localStorage.setItem(KEY, JSON.stringify(history));
  localStorage.setItem(SKIPS_KEY, JSON.stringify(skips));
}

