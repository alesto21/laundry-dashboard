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

  const dateLabel = now
    ? now.toLocaleDateString(lang === "sr" ? "sr-RS" : lang === "no" ? "nb-NO" : "en-GB", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-slate-500 text-lg font-medium capitalize mb-1">{dateLabel}</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
              {now ? greeting(lang, now) : tr("title", lang)}
            </h1>
          </div>
          <LangSwitcher value={lang} onChange={setLang} />
        </header>

        <StatusBar initial={status} lang={lang} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <ShoppingList initial={shopping} lang={lang} showOpenLink />
          <ActivityLog initial={logs} refreshKey={refreshKey} lang={lang} />
        </div>
      </div>
    </main>
  );
}
