"use client";

import { useEffect, useState } from "react";
import { Lang, tr } from "@/lib/i18n";

type Member = { id: number; name: string; color: string };
type Toast = { kind: "ok" | "err"; msg: string } | null;

const DOT: Record<string, string> = {
  rose: "bg-rose-400",
  blue: "bg-blue-400",
  emerald: "bg-emerald-400",
  violet: "bg-violet-400",
  amber: "bg-amber-400",
  slate: "bg-slate-400",
};

export default function ShareSheet({
  open,
  onClose,
  lang,
  listText,
  title,
  members,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  listText: string;
  title: string;
  members: Member[];
}) {
  const [toast, setToast] = useState<Toast>(null);
  const [sending, setSending] = useState<number | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  if (!open) return null;

  const shareDevice = async () => {
    const payload = { title, text: `${title}:\n${listText}` };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        onClose();
        return;
      } catch {
        // user cancelled
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(payload.text);
      setToast({ kind: "ok", msg: tr("copied", lang) });
    } catch {
      setToast({ kind: "err", msg: "Clipboard unavailable" });
    }
  };

  const sendToMember = async (m: Member) => {
    setSending(m.id);
    try {
      const res = await fetch("/api/shopping/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: m.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setToast({ kind: "ok", msg: `${tr("sent", lang)} → ${m.name}` });
    } catch (err) {
      setToast({ kind: "err", msg: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSending(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
      role="dialog"
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        <h3 className="text-xl sm:text-2xl font-bold mb-4">{tr("share", lang)}</h3>

        <button
          onClick={shareDevice}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-lg active:scale-[0.99] transition mb-5"
        >
          <span className="text-2xl">📤</span>
          <span className="text-base sm:text-lg">{tr("share_to_device", lang)}</span>
        </button>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            {tr("email_to", lang)}
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => sendToMember(m)}
              disabled={sending !== null}
              className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold disabled:opacity-50 active:scale-[0.98] transition"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${DOT[m.color] ?? "bg-slate-400"}`} />
              <span className="truncate text-sm sm:text-base">
                {sending === m.id ? "…" : m.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full h-12 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
        >
          {tr("cancel", lang)}
        </button>

        {toast && (
          <div
            className={[
              "absolute left-1/2 -translate-x-1/2 -top-12 px-4 py-2 rounded-full text-sm font-semibold shadow-lg",
              toast.kind === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white",
            ].join(" ")}
          >
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}
