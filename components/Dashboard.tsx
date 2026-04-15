"use client";

import { useEffect, useState } from "react";
import NotifyTile from "./NotifyTile";
import ShoppingList from "./ShoppingList";
import StatusBar from "./StatusBar";
import ActivityLog, { LogEntry } from "./ActivityLog";
import LangSwitcher from "./LangSwitcher";
import { Lang, tr, greeting } from "@/lib/i18n";

type Member = { id: number; name: string; color: string };
type ShoppingItem = { id: number; text: string; completedAt: string | null };
type StatusData = React.ComponentProps<typeof StatusBar>["initial"];

const DEFAULT_LANG: Lang = "sr";

export default function Dashboard({
  members,
  logs,
  shopping,
  status,
}: {
  members: Member[];
  logs: LogEntry[];
  shopping: ShoppingItem[];
  status: StatusData;
}) {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [refreshKey, setRefreshKey] = useState(0);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "no" || saved === "sr") setLang(saved);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const bump = () => setRefreshKey((k) => k + 1);

  const locale = lang === "sr" ? "sr-RS" : lang === "no" ? "nb-NO" : "en-GB";
  const dateLabel = now
    ? now.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <main
      className="min-h-screen"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 py-5 sm:py-8 md:py-10">
        <header className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-sm sm:text-base md:text-lg font-medium capitalize mb-0.5 sm:mb-1 truncate">
              {dateLabel}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent truncate">
              {now ? greeting(lang, now) : tr("title", lang)}
            </h1>
          </div>
          <div className="shrink-0">
            <LangSwitcher value={lang} onChange={setLang} />
          </div>
        </header>

        <StatusBar initial={status} lang={lang} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-3 sm:mb-4 md:mb-5">
          <NotifyTile
            kind="laundry"
            title={tr("laundry_ready", lang)}
            icon="🧺"
            accent="blue"
            members={members}
            lang={lang}
            onSent={bump}
          />
          <NotifyTile
            kind="dinner"
            title={tr("dinner_ready", lang)}
            icon="🍽️"
            accent="amber"
            members={members}
            lang={lang}
            onSent={bump}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <ShoppingList initial={shopping} lang={lang} showOpenLink />
          <ActivityLog initial={logs} refreshKey={refreshKey} lang={lang} />
        </div>
      </div>
    </main>
  );
}
