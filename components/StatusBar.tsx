"use client";

import { useEffect, useState } from "react";
import { Lang, tr, trashLabel } from "@/lib/i18n";

type Status = {
  people: { id: number; name: string; color: string; home: boolean | null }[];
  pihole: { status: string; blockedToday?: number; queriesToday?: number } | null;
  trash: { date: string; kind: string } | null;
};

const DOT: Record<string, string> = {
  rose: "bg-rose-400",
  blue: "bg-blue-400",
  emerald: "bg-emerald-400",
  violet: "bg-violet-400",
  amber: "bg-amber-400",
  slate: "bg-slate-400",
};

function trashRelative(iso: string, lang: Lang) {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff <= 0) return tr("today", lang);
  if (diff === 1) return tr("tomorrow", lang);
  return tr("in_days", lang, { n: diff });
}

export default function StatusBar({ initial, lang }: { initial: Status; lang: Lang }) {
  const [status, setStatus] = useState<Status>(initial);

  useEffect(() => {
    const tick = async () => {
      try {
        const r = await fetch("/api/status").then((r) => r.json());
        setStatus(r);
      } catch {}
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-5 shadow-soft md:col-span-2">
        <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
          {tr("whos_home", lang)}
        </div>
        <div className="flex flex-wrap gap-2">
          {status.people.map((p) => {
            const here = p.home === true;
            return (
              <span
                key={p.id}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium transition",
                  here ? "bg-white shadow-sm" : "bg-slate-100/60 text-slate-400",
                ].join(" ")}
              >
                <span
                  className={[
                    "w-2.5 h-2.5 rounded-full",
                    here ? DOT[p.color] ?? "bg-green-400" : "bg-slate-300",
                  ].join(" ")}
                />
                <span className={here ? "text-slate-800" : ""}>{p.name}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-5 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">
            {tr("next_trash", lang)}
          </div>
          {status.trash ? (
            <>
              <div className="text-2xl font-bold text-slate-800">
                🗑️ {trashLabel(status.trash.kind, lang)}
              </div>
              <div className="text-slate-500 mt-0.5">{trashRelative(status.trash.date, lang)}</div>
            </>
          ) : (
            <div className="text-slate-400">—</div>
          )}
        </div>

        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-5 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">
            {tr("pihole", lang)}
          </div>
          {status.pihole ? (
            status.pihole.status === "enabled" ? (
              <>
                <div className="text-2xl font-bold text-emerald-700">● {tr("active", lang)}</div>
                <div className="text-slate-500 text-sm mt-0.5">
                  {status.pihole.blockedToday?.toLocaleString() ?? 0} {tr("blocked_today", lang)}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-red-600 capitalize">{status.pihole.status}</div>
            )
          ) : (
            <div className="text-slate-400">{tr("not_set", lang)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
