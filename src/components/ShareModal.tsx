import React from "react";
import { TrackStat, ArtistStat } from "../utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "id";
  theme: "green" | "purple" | "orange" | "cyan";
  totalPlays: number;
  listeningTimeMin: number;
  currentStreak: number;
  personaTitle: string;
  topTrack: TrackStat | null;
  topArtist: ArtistStat | null;
}

const GRADIENTS = {
  green: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  purple: "linear-gradient(135deg, #6441a5 0%, #2a0845 100%)",
  orange: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
  cyan: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
};

export function ShareModal({
  isOpen,
  onClose,
  lang,
  theme,
  totalPlays,
  listeningTimeMin,
  currentStreak,
  personaTitle,
  topTrack,
  topArtist,
}: Props) {
  const [trackImg, setTrackImg] = React.useState("");
  const [artistImg, setArtistImg] = React.useState("");

  React.useEffect(() => {
    if (!isOpen || typeof Spicetify === "undefined" || !Spicetify.CosmosAsync) return;

    // Reset images when opened
    setTrackImg("");
    setArtistImg("");

    // Fetch Top Track image if needed
    if (topTrack) {
      if (topTrack.imageUrl) {
        setTrackImg(topTrack.imageUrl);
      } else {
        const id = topTrack.uri.split(":").pop();
        if (id) {
          Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/tracks/${id}`)
            .then((res) => {
              const url = res.album?.images?.[1]?.url ?? res.album?.images?.[0]?.url;
              if (url) setTrackImg(url);
            })
            .catch((err) => console.error("ShareModal: track fetch failed", err));
        }
      }
    }

    // Fetch Top Artist image
    if (topArtist) {
      const fetchArtistImg = async () => {
        try {
          let url = "";
          if (topArtist.uri) {
            const id = topArtist.uri.split(":").pop();
            if (id) {
              const res = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/artists/${id}`);
              url = res.images?.[1]?.url ?? res.images?.[0]?.url ?? "";
            }
          }
          if (!url) {
            const searchRes = await Spicetify.CosmosAsync.get(
              `https://api.spotify.com/v1/search?type=artist&limit=1&q=${encodeURIComponent(topArtist.name)}`
            );
            const artistItem = searchRes.artists?.items?.[0];
            url = artistItem?.images?.[1]?.url ?? artistItem?.images?.[0]?.url ?? "";
          }
          if (url) setArtistImg(url);
        } catch (err) {
          console.error("ShareModal: artist fetch failed", err);
        }
      };
      fetchArtistImg();
    }
  }, [isOpen, topTrack, topArtist]);

  if (!isOpen) return null;

  // Format estimated time
  const hrs = (listeningTimeMin / 60).toFixed(1);
  const timeStr = listeningTimeMin < 60 
    ? `${listeningTimeMin} ${lang === "en" ? "mins" : "mnt"}`
    : `${hrs} ${lang === "en" ? "hrs" : "jam"}`;

  return Spicetify.ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          maxWidth: "90%",
        }}
      >
        {/* The Card (Aspect Ratio 9:16) */}
        <div
          id="share-card-container"
          style={{
            width: 320,
            height: 568,
            background: GRADIENTS[theme],
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "white",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* Card Top Branding */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.8 }}>
              Listening Insights
            </span>
            <span style={{ fontSize: 16 }}>🎵</span>
          </div>

          {/* Card Body - Persona & Streaks */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7 }}>
              {lang === "en" ? "My Music Persona" : "Karakter Musikmu"}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              {personaTitle}
            </div>
            {currentStreak > 0 && (
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 10,
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                🔥 {currentStreak} {lang === "en" ? "Day Streak!" : "Hari Beruntun!"}
              </div>
            )}
          </div>

          {/* Card Body - Stats Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "rgba(0,0,0,0.15)", padding: 14, borderRadius: 10, backdropFilter: "blur(2px)" }}>
            <div>
              <div style={{ fontSize: 9, opacity: 0.7, textTransform: "uppercase" }}>
                {lang === "en" ? "Plays" : "Putar"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{totalPlays}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, opacity: 0.7, textTransform: "uppercase" }}>
                {lang === "en" ? "Listen Time" : "Waktu Dengar"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{timeStr}</div>
            </div>
          </div>

          {/* Card Body - Top Music (Track & Artist) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
            {topTrack && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 4, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.1)" }}>
                  {trackImg ? (
                    <img src={trackImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>🎵</div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, opacity: 0.6, textTransform: "uppercase", letterSpacing: ".5px" }}>
                    {lang === "en" ? "Top Track" : "Lagu Teratas"}
                  </div>
                  <div style={{ fontSize: topTrack.name.length > 28 ? 9 : topTrack.name.length > 18 ? 10 : 12, lineHeight: "14px", fontWeight: 700, overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {topTrack.name}
                  </div>
                  <div style={{ fontSize: topTrack.artist.length > 24 ? 8 : 10, lineHeight: "12px", opacity: 0.8, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                    {topTrack.artist}
                  </div>
                </div>
              </div>
            )}

            {topArtist && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.1)" }}>
                  {artistImg ? (
                    <img src={artistImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, opacity: 0.6, textTransform: "uppercase", letterSpacing: ".5px" }}>
                    {lang === "en" ? "Top Artist" : "Artis Teratas"}
                  </div>
                  <div style={{ fontSize: topArtist.name.length > 28 ? 9 : topArtist.name.length > 18 ? 10 : 12, lineHeight: "14px", fontWeight: 700, overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {topArtist.name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card Bottom Branding */}
          <div style={{ display: "flex", justifyContent: "center", opacity: 0.6, fontSize: 9, letterSpacing: ".5px", marginTop: 10 }}>
            {lang === "en" ? "POWERED BY SPICETIFY" : "DIHITUNG OLEH SPICETIFY"}
          </div>
        </div>

        {/* Modal Controls */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "var(--spice-subtext)", textAlign: "center" }}>
            {lang === "en" 
              ? "📸 Take a screenshot (Win + Shift + S) to share!" 
              : "📸 Ambil screenshot (Win + Shift + S) untuk membagikan!"}
          </div>
          <div
            onClick={onClose}
            style={{
              padding: "8px 24px",
              borderRadius: 20,
              background: "white",
              color: "black",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {lang === "en" ? "Close" : "Tutup"}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
