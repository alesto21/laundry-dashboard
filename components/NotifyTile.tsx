"use client";

import { useState } from "react";
import MemberButton from "./MemberButton";
import { Lang, tr } from "@/lib/i18n";

type Member = { id: number; name: string; color: string };
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; names: string[] }
  | { kind: "error"; message: string };

function formatNames(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export default function NotifyTile({
  kind,
  title,
  icon,
  accent,
  members,
  lang,
  onSent,
}: {
  kind: "laundry" | "dinner";
  title: string;
  icon: string;
  accent: "blue" | "amber";
  members: Member[];
  lang: Lang;
  onSent: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const toggle = (id: number) => {
    setStatus({ kind: "idle" });
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setStatus({ kind: "idle" });
    setSelected(
      selected.size === members.length ? new Set() : new Set(members.map((m) => m.id)),
    );
  };

  const notify = async (all: boolean) => {
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(all ? { kind, all: true } : { kind, memberIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus({ kind: "success", names: data.recipients ?? [] });
      setSelected(new Set());
      onSent();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed" });
    }
  };

  const primary =
    accent === "blue"
      ? "bg-gradient-to-br from-blue-500 to-blue-600"
      : "bg-gradient-to-br from-amber-500 to-orange-500";
  const sending = status.kind === "sending";
  const allOn = selected.size === members.length && members.length > 0;

  return (
    <section className="rounded-4xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 md:p-8 shadow-soft">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{icon}</div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        <button
          onClick={selectAll}
          className="text-base font-semibold text-slate-500 px-4 py-2 rounded-full hover:bg-slate-100"
        >
          {allOn ? tr("clear", lang) : tr("all", lang)}
        </button>
      </header>

      <div className="grid grid-cols-5 gap-1 mb-6">
        {members.map((m) => (
          <MemberButton
            key={m.id}
            name={m.name}
            color={m.color}
            selected={selected.has(m.id)}
            onToggle={() => toggle(m.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => notify(false)}
          disabled={selected.size === 0 || sending}
          className={`h-16 rounded-2xl text-lg font-semibold text-white shadow-lg ${primary}
            disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none
            active:scale-[0.98] transition-all`}
        >
          {sending ? tr("sending", lang) : tr("notify_selected", lang)}
        </button>
        <button
          onClick={() => notify(true)}
          disabled={sending}
          className="h-16 rounded-2xl text-lg font-semibold bg-slate-900 text-white shadow-lg
            disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none
            active:scale-[0.98] transition-all"
        >
          {tr("notify_all", lang)}
        </button>
      </div>

      <div className="mt-4 min-h-[1.75rem]" aria-live="polite">
        {status.kind === "success" && (
          <p className="text-green-700 font-semibold text-lg">
            ✓ {tr("sent_to", lang)} {formatNames(status.names)}
          </p>
        )}
        {status.kind === "error" && (
          <p className="text-red-700 font-semibold">✗ {status.message}</p>
        )}
      </div>
    </section>
  );
}
