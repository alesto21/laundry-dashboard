"use client";

import { useEffect, useState } from "react";
import { Lang, tr } from "@/lib/i18n";

export type LogEntry = {
  id: number;
  kind: string;
  createdAt: string;
  recipients: { name: string; acknowledged: boolean }[];
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

const ICONS: Record<string, string> = { laundry: "🧺", dinner: "🍽️" };

export default function ActivityLog({
  initial,
  refreshKey,
  lang,
}: {
  initial: LogEntry[];
  refreshKey: number;
  lang: Lang;
}) {
  const [logs, setLogs] = useState<LogEntry[]>(initial);

  useEffect(() => {
    const tick = async () => {
      try {
        const r = await fetch("/api/logs").then((r) => r.json());
        setLogs(r);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [refreshKey]);

  return (
    <section className="rounded-4xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 md:p-8 shadow-soft">
      <header className="flex items-center gap-3 mb-5">
        <div className="text-4xl">🕒</div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{tr("recent_activity", lang)}</h2>
      </header>

      {logs.length === 0 ? (
        <p className="text-slate-400 text-lg py-4">{tr("no_activity", lang)}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {logs.map((log) => (
            <li key={log.id} className="py-4 flex items-start gap-4">
              <span className="text-3xl mt-0.5">{ICONS[log.kind] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-500 mb-1.5">{formatDate(log.createdAt)}</div>
                <div className="flex flex-wrap gap-1.5">
                  {log.recipients.map((r, i) => (
                    <span
                      key={i}
                      className={[
                        "px-3 py-1 rounded-full text-sm font-medium",
                        r.acknowledged
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800",
                      ].join(" ")}
                      title={r.acknowledged ? tr("picked_up", lang) : tr("pending", lang)}
                    >
                      {r.acknowledged ? "✓ " : "· "}
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
