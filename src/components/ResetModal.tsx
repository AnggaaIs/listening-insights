import React, { useEffect, useState } from "react";
import locales from "../locales.json";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lang: "en" | "id";
}

export function ResetModal({ isOpen, onClose, onConfirm, lang }: Props) {
  const [animate, setAnimate] = useState(false);
  const t = locales[lang];

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(id);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return Spicetify.ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        opacity: animate ? 1 : 0,
        transition: "opacity 0.2s ease-in-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#282828",
          borderRadius: 12,
          padding: 24,
          maxWidth: 360,
          width: "85%",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          transform: animate ? "scale(1)" : "scale(0.93)",
          opacity: animate ? 1 : 0,
          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 700,
            margin: "0 0 10px 0",
          }}
        >
          {t.resetModalTitle}
        </h2>
        
        {/* Body Description */}
        <p
          style={{
            color: "#b3b3b3",
            fontSize: 13,
            lineHeight: "18px",
            margin: "0 0 24px 0",
          }}
        >
          {t.resetModalDesc}
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Cancel button */}
          <div
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              color: "#ffffff",
              cursor: "pointer",
              userSelect: "none",
              transition: "transform 0.1s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {t.cancel}
          </div>

          {/* Confirm Button */}
          <div
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: "10px 24px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              color: "#ffffff",
              backgroundColor: "#e91429", // Spotify Danger Red
              cursor: "pointer",
              userSelect: "none",
              transition: "transform 0.1s ease, background-color 0.2s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ff2e43")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e91429")}
          >
            {t.confirmReset}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
