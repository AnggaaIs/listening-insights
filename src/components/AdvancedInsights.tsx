import React from "react";
import {
  ArtistStat,
  CalendarDay,
  GoalProgress,
  Recommendation,
  TrackStat,
  artistLoyalty,
  bestListeningDay,
  comparePeriods,
  currentTasteHint,
  dataQualityStatus,
  fmtHour,
  goalProgress,
  listeningCalendar,
  listeningScore,
  listeningSessions,
  miniWrapped,
  monthlyRecap,
  moodTimeline,
  recommendations,
  repeatAddiction,
  skipHotspot,
  syncNotice,
  topArtists,
} from "../utils";
import {
  PlayEvent,
  clearSkips,
  exportBackup,
  getStorageFootprint,
  importBackup,
  loadSkips,
} from "../store";
import { listeningCoach } from "../analytics/listeningCoach";
import { ListeningCoachPanel } from "./panels/ListeningCoachPanel";
import { advancedCopy } from "./advanced/copy";
import { buttonStyle, cardStyle, compactCard, formatBytes, sectionTitle, statLine } from "./advanced/ui";

interface Props {
  history: PlayEvent[];
  days: 7 | 30 | 90;
  lang: "en" | "id";
  onDataChange: () => void;
}

interface GenreStat {
  name: string;
  count: number;
}

function goalLabel(goal: GoalProgress, lang: "en" | "id"): string {
  const t = advancedCopy[lang];
  if (goal.key === "streak") return t.activeStreak;
  if (goal.key === "monthlyPlays") return t.monthlyPlays;
  return t.discoveryRate;
}

function goalUnit(goal: GoalProgress, lang: "en" | "id"): string {
  if (goal.key === "streak") return advancedCopy[lang].daysUnit;
  return goal.unit;
}

function openSpotifySearch(query: string) {
  const path = `/search/${encodeURIComponent(query)}`;
  try {
    Spicetify.Platform?.History?.push?.(path);
  } catch {
    window.location.hash = path;
  }
}

function calendarColor(plays: number, max: number): string {
  if (plays === 0) return "var(--hm-empty)";
  const pct = plays / max;
  if (pct < 0.2) return "var(--hm-1)";
  if (pct < 0.4) return "var(--hm-2)";
  if (pct < 0.6) return "var(--hm-3)";
  if (pct < 0.8) return "var(--hm-4)";
  return "var(--hm-5)";
}

function moodLabel(mood: "morning" | "afternoon" | "evening" | "night", lang: "en" | "id") {
  return advancedCopy[lang].moodShort[mood];
}

export function AdvancedInsights({ history, days, lang, onDataChange }: Props) {
  const t = advancedCopy[lang];
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [genres, setGenres] = React.useState<GenreStat[]>([]);
  const [status, setStatus] = React.useState("");
  const recap = React.useMemo(() => monthlyRecap(history, lang), [history, lang]);
  const calendar = React.useMemo(() => listeningCalendar(history, days), [history, days]);
  const goals = React.useMemo(() => goalProgress(history, days), [history, days]);
  const recs = React.useMemo(() => recommendations(history, days, lang), [history, days, lang]);
  const skips = loadSkips();
  const score = React.useMemo(() => listeningScore(history, skips, days), [history, skips, days]);
  const coach = React.useMemo(() => listeningCoach(history, skips, days, lang), [history, skips, days, lang]);
  const bestDay = React.useMemo(() => bestListeningDay(history, days, lang), [history, days, lang]);
  const repeat = React.useMemo(() => repeatAddiction(history, days), [history, days]);
  const loyalty = React.useMemo(() => artistLoyalty(history, days), [history, days]);
  const sessions = React.useMemo(() => listeningSessions(history, days), [history, days]);
  const hotspot = React.useMemo(() => skipHotspot(skips, days, lang), [skips, days, lang]);
  const compare = React.useMemo(() => comparePeriods(history, days), [history, days]);
  const mood = React.useMemo(() => moodTimeline(history, days), [history, days]);
  const wrapped = React.useMemo(() => miniWrapped(history, skips, days, lang), [history, skips, days, lang]);
  const taste = React.useMemo(() => currentTasteHint(history, days, lang), [history, days, lang]);
  const quality = React.useMemo(() => dataQualityStatus(history, days, lang), [history, days, lang]);
  const sync = React.useMemo(() => syncNotice(history, lang), [history, lang]);
  const maxCalendarPlays = Math.max(...calendar.map((d: CalendarDay) => d.plays), 1);
  const calendarWeeks = React.useMemo(() => {
    if (calendar.length === 0) return [] as Array<Array<CalendarDay | null>>;
    const firstDate = new Date(`${calendar[0].key}T00:00:00`);
    const cells: Array<CalendarDay | null> = [
      ...Array.from({ length: firstDate.getDay() }, () => null),
      ...calendar,
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: Array<Array<CalendarDay | null>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [calendar]);

  React.useEffect(() => {
    if (typeof Spicetify === "undefined" || !Spicetify.CosmosAsync) return;
    const artists = topArtists(history, days, 8).filter((a: ArtistStat) => a.uri);
    if (artists.length === 0) {
      setGenres([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const counts: Record<string, number> = {};
      await Promise.all(artists.map(async (artist) => {
        const id = artist.uri?.split(":").pop();
        if (!id) return;
        try {
          const res = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/artists/${id}`);
          const artistGenres = Array.isArray(res.genres) ? res.genres.slice(0, 4) : [];
          artistGenres.forEach((genre: string) => {
            counts[genre] = (counts[genre] ?? 0) + artist.count;
          });
        } catch (err) {
          console.error("Failed to fetch artist genres", err);
        }
      }));
      if (!cancelled) {
        setGenres(Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [history, days]);

  const handleExport = () => {
    const backup = exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `listening-insights-backup-${backup.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        importBackup(JSON.parse(String(reader.result)));
        setStatus(t.imported);
        onDataChange();
      } catch {
        setStatus(t.importFailed);
      }
    };
    reader.readAsText(file);
  };

  const handleClearSkips = () => {
    clearSkips();
    setStatus(t.skipsCleared);
    onDataChange();
  };

  const handleCopyWrapped = async () => {
    const text = [wrapped.title, ...wrapped.lines].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setStatus(t.copied);
    } catch {
      setStatus(text);
    }
  };

  const maxGenre = Math.max(...genres.map((g) => g.count), 1);
  const maxMoodPlays = Math.max(...mood.map((point) => point.plays), 1);

  return (
    <div style={{ display: "grid", gap: 16, marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <ListeningCoachPanel report={coach} onAction={openSpotifySearch} />

        <div className="li-card" style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(29,185,84,.16), rgba(29,185,84,.03))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              {sectionTitle(t.listeningScore)}
              <div style={{ fontSize: 42, lineHeight: "44px", fontWeight: 900, color: "var(--spice-button)" }}>{score.score}</div>
              <div style={{ fontSize: 12, color: "var(--spice-subtext)", marginTop: 4 }}>{t.consistency} {score.consistency}% / {t.diversity} {score.diversity}%</div>
            </div>
            <div style={{ minWidth: 210, flex: 1, display: "grid", gap: 8 }}>
              {[
                [t.consistency, score.consistency],
                [t.diversity, score.diversity],
                [t.streak, score.streak],
                [t.skipHealth, score.skip],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--spice-subtext)", marginBottom: 3 }}>
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                    <div className="li-bar-fill" style={{ height: "100%", width: `${value}%`, background: "var(--spice-button)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.miniWrapped)}
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--spice-text)", marginBottom: 8 }}>{wrapped.title}</div>
          <div style={{ display: "grid", gap: 5, marginBottom: 12 }}>
            {wrapped.lines.map((line) => (
              <div key={line} style={{ color: "var(--spice-subtext)", fontSize: 12 }}>{line}</div>
            ))}
          </div>
          <button className="li-action-button" style={buttonStyle} onClick={handleCopyWrapped}>{t.copyText}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {compactCard(t.dataQuality, quality.level.toUpperCase(), `${quality.sampleSize} ${t.samples} / ${quality.activeDays} ${t.activeDaysShort}`)}
        {compactCard(t.syncStatus, sync.lastTrackedLabel, `${t.lastTracked}: ${sync.hoursSinceLastEvent ?? "-"}h`)}
        {compactCard(t.bestDay, bestDay.label, `${bestDay.plays} ${t.plays}`)}
        {compactCard(t.repeatAddiction, repeat.track?.name ?? "-", `${repeat.repeatPct}% ${t.plays}`)}
        {compactCard(t.artistLoyalty, loyalty.artist?.name ?? "-", `${loyalty.pct}% ${t.plays}`)}
        {compactCard(t.sessions, `${sessions.count}x`, `${t.longest}: ${sessions.longestMin}m / ${t.startsAt}: ${fmtHour(sessions.favoriteStartHour)}`)}
        {compactCard(t.skipHotspot, hotspot.label, `${hotspot.skips} ${t.skips}`)}
        {compactCard(t.compareMode, `${compare.playDiffPct >= 0 ? "+" : ""}${compare.playDiffPct}%`, `${t.vsPrev}: ${compare.previousPlays} -> ${compare.currentPlays}`)}
      </div>

      {(quality.level !== "good" || (sync.hoursSinceLastEvent !== null && sync.hoursSinceLastEvent > 6)) && (
        <div className="li-card" style={{ ...cardStyle, borderColor: quality.level === "low" ? "rgba(255,193,7,.35)" : "var(--spice-button-disabled)", background: quality.level === "low" ? "rgba(255,193,7,.06)" : "var(--spice-card)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", fontWeight: 800, letterSpacing: ".4px", marginBottom: 4 }}>{t.dataQuality}</div>
              <div style={{ color: "var(--spice-text)", fontSize: 13, lineHeight: "18px", fontWeight: 700 }}>{quality.message}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--spice-subtext)", textTransform: "uppercase", fontWeight: 800, letterSpacing: ".4px", marginBottom: 4 }}>{t.syncStatus}</div>
              <div style={{ color: "var(--spice-text)", fontSize: 13, lineHeight: "18px", fontWeight: 700 }}>{sync.message}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.monthlyRecap)}
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--spice-text)", marginBottom: 8 }}>{recap.label}</div>
          {statLine(t.plays, `${recap.plays}x`)}
          {statLine(t.unique, `${recap.uniqueTracks} / ${recap.uniqueArtists}`)}
          {statLine(t.topTrack, recap.topTrack ? `${(recap.topTrack as TrackStat).name}` : t.noData)}
          {statLine(t.topArtist, recap.topArtist ? (recap.topArtist as ArtistStat).name : t.noData)}
          {statLine(t.peakHour, recap.plays > 0 ? fmtHour(recap.peakHour) : "-")}
        </div>

        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.goals)}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {goals.map((goal) => (
              <div key={goal.key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--spice-text)", fontWeight: 700 }}>{goalLabel(goal, lang)}</span>
                  <span style={{ fontSize: 12, color: "var(--spice-subtext)" }}>
                    {goal.value}/{goal.target} {goalUnit(goal, lang)}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div className="li-bar-fill" style={{ height: "100%", width: `${goal.pct}%`, background: "var(--spice-button)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.moodTimeline)}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", alignItems: "end", gap: 10, minHeight: 132 }}>
            {mood.map((point) => (
              <div key={point.label} style={{ display: "grid", gap: 6, alignItems: "end" }}>
                <div style={{ height: 72, display: "flex", alignItems: "flex-end" }}>
                  <div
                    title={`${point.label}: ${point.plays} ${t.plays}`}
                    className="li-bar-fill"
                    style={{
                      width: "100%",
                      height: `${Math.max(10, Math.round((point.plays / maxMoodPlays) * 72))}px`,
                      borderRadius: 6,
                      background: point.plays > 0 ? "var(--spice-button)" : "rgba(255,255,255,.06)",
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: "var(--spice-subtext)", textAlign: "center" }}>{point.label}</div>
                <div style={{ fontSize: 11, color: "var(--spice-text)", textAlign: "center", fontWeight: 800 }}>{moodLabel(point.mood, lang)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.tasteHint)}
          <div style={{ color: "var(--spice-text)", fontSize: 18, lineHeight: "24px", fontWeight: 900, marginBottom: 8 }}>{taste.desc}</div>
          <div style={{ color: "var(--spice-subtext)", fontSize: 12, marginBottom: 12 }}>
            {t.tasteHintDesc}
          </div>
          <button className="li-action-button" style={buttonStyle} onClick={() => openSpotifySearch(taste.query)}>{t.openSearch}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.genreInsights)}
          {genres.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {genres.map((genre) => (
                <div className="li-list-row" key={genre.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 116, color: "var(--spice-text)", fontSize: genre.name.length > 18 ? 10 : 12, lineHeight: "14px", fontWeight: 700, overflowWrap: "anywhere", wordBreak: "break-word", textTransform: "capitalize" }}>
                    {genre.name}
                  </div>
                  <div style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div className="li-bar-fill" style={{ height: "100%", width: `${Math.round((genre.count / maxGenre) * 100)}%`, background: "var(--spice-button)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "var(--spice-subtext)", fontSize: 12 }}>{t.noGenres}</div>
          )}
        </div>

        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.recommendations)}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recs.map((rec: Recommendation) => (
              <div className="li-list-row" key={rec.title} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--spice-text)", fontSize: 12, fontWeight: 700 }}>{rec.title}</div>
                  <div style={{ color: "var(--spice-subtext)", fontSize: 11, marginTop: 2 }}>{rec.desc}</div>
                </div>
                <button className="li-action-button" style={buttonStyle} onClick={() => openSpotifySearch(rec.query)}>{t.openSearch}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.calendar)}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", overflowX: "auto", paddingBottom: 2 }}>
            <div style={{ display: "grid", gridTemplateRows: "repeat(7, 13px)", gap: 4, paddingTop: 1, color: "var(--spice-subtext)", fontSize: 10, flexShrink: 0 }}>
              {(lang === "id" ? ["Min", "", "Sel", "", "Kam", "", "Sab"] : ["Sun", "", "Tue", "", "Thu", "", "Sat"]).map((label, idx) => (
                <div key={`${label}-${idx}`} style={{ height: 13, lineHeight: "13px" }}>{label}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, minWidth: 0 }}>
              {calendarWeeks.map((week, weekIdx) => (
                <div key={weekIdx} style={{ display: "grid", gridTemplateRows: "repeat(7, 13px)", gap: 4 }}>
                  {week.map((day, dayIdx) => (
                    <div
                      className="li-soft-enter"
                      key={day?.key ?? `${weekIdx}-${dayIdx}`}
                      title={day ? `${day.label}: ${day.plays} ${t.plays}` : ""}
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: 3,
                        background: day ? calendarColor(day.plays, maxCalendarPlays) : "transparent",
                        border: day?.isToday ? "1px solid var(--spice-button)" : "1px solid rgba(255,255,255,0.04)",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: "var(--spice-subtext)", fontSize: 10, flexShrink: 0 }}>
              <span>0</span>
              {[1, 2, 3, 4, 5].map((level) => (
                <span
                  key={level}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: `var(--hm-${level})`,
                    display: "inline-block",
                  }}
                />
              ))}
              <span>{maxCalendarPlays}x</span>
            </div>
          </div>
        </div>

        <div className="li-card" style={cardStyle}>
          {sectionTitle(t.dataManager)}
          <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <button className="li-action-button" style={buttonStyle} onClick={handleExport}>{t.exportData}</button>
            <button className="li-action-button" style={buttonStyle} onClick={() => fileRef.current?.click()}>{t.importData}</button>
            <button className="li-action-button" style={buttonStyle} onClick={handleClearSkips}>{t.clearSkips}</button>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", color: "var(--spice-subtext)", fontSize: 12 }}>
            <span>{history.length} {t.events}</span>
            <span>{skips.length} {t.skips}</span>
            <span>{formatBytes(getStorageFootprint())} {t.storage}</span>
            {status && <span style={{ color: "var(--spice-button)", fontWeight: 700 }}>{status}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
