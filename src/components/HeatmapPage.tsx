import React, { useState } from "react";
import locales from "../locales.json";
import { clearHistory } from "../store";
import { generateStyles } from "../theme";
import { DayRange, Language, PageTab } from "../types/dashboard";
import { useListeningDashboard } from "../hooks/useListeningDashboard";
import { DashboardHeader } from "./DashboardHeader";
import { DataTab } from "./tabs/DataTab";
import { LibraryTab } from "./tabs/LibraryTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { PatternsTab } from "./tabs/PatternsTab";
import { PersonaBanner } from "./PersonaBanner";
import { ResetModal } from "./ResetModal";
import { StatsRow } from "./StatsRow";
import { TabNav } from "./TabNav";

export function HeatmapPage() {
  const [days, setDays] = useState<DayRange>(30);
  const [activeTab, setActiveTab] = useState<PageTab>("overview");
  const [showResetModal, setShowResetModal] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("spicetify-heatmap-lang");
    return saved === "en" || saved === "id" ? saved : "en";
  });
  const { data, refresh } = useListeningDashboard(days);
  const copy = locales[lang];
  const tabs: Array<{ key: PageTab; label: string }> = [
    { key: "overview", label: copy.tabs.overview },
    { key: "patterns", label: copy.tabs.patterns },
    { key: "library", label: copy.tabs.library },
    { key: "data", label: copy.tabs.data },
  ];

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("spicetify-heatmap-lang", newLang);
  };

  const handleReset = () => {
    clearHistory();
    refresh();
  };

  return (
    <>
      <style>{generateStyles()}</style>
      <div
        style={{
          padding: "80px 24px 32px",
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
        <DashboardHeader
          days={days}
          lang={lang}
          subtitle={copy.subTitle}
          onLangChange={handleLangChange}
        />

        <PersonaBanner
          totalPlays={data.totalPlays}
          peakTime={data.peakTime}
          currentStreak={data.currentStreak}
          longestStreak={data.longestStreak}
          copy={copy}
        />

        <StatsRow
          totalPlays={data.totalPlays}
          peak={data.peak}
          peakDowIdx={data.peakDay}
          days={days}
          lang={lang}
          listeningTimeMin={data.listeningTimeMin}
          uniqueTracksCount={data.uniqueTracksCount}
          uniqueArtistsCount={data.uniqueArtistsCount}
          consistencyPct={data.consistencyPct}
          playsPct={data.playsPct}
          timePct={data.timePct}
          consistencyDiff={data.consistencyDiff}
          uniqueTracksDiff={data.uniqueTracksDiff}
          hasPrevData={data.hasPrevData}
          top3Hours={data.top3Hours}
          discoveryRate={data.discoveryRate}
        />

        <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" && (
          <div className="li-tab-panel">
            <OverviewTab data={data} days={days} lang={lang} copy={copy} onRangeChange={setDays} />
          </div>
        )}
        {activeTab === "patterns" && (
          <div className="li-tab-panel">
            <PatternsTab data={data} days={days} lang={lang} copy={copy} onDataChange={refresh} />
          </div>
        )}
        {activeTab === "library" && (
          <div className="li-tab-panel">
            <LibraryTab data={data} lang={lang} />
          </div>
        )}
        {activeTab === "data" && (
          <div className="li-tab-panel">
            <DataTab copy={copy} history={data.historyEvents} onReset={() => setShowResetModal(true)} onDataChange={refresh} />
          </div>
        )}
      </div>

      <ResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        lang={lang}
      />
    </>
  );
}
