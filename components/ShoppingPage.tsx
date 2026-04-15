"use client";

import { useEffect, useRef, useState } from "react";
import LangSwitcher from "./LangSwitcher";
import ShareSheet from "./ShareSheet";
import { Lang, tr } from "@/lib/i18n";

type Item = { id: number; text: string; completedAt: string | null };
type Member = { id: number; name: string; color: string };

export default function ShoppingPage({
  initial,
  members,
}: {
  initial: Item[];
  members: Member[];
}) {
  const [lang, setLang] = useState<Lang>("sr");
  const [items, setItems] = useState<Item[]>(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "no" || saved === "sr") setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const refresh = async () => {
    try {
      const r = await fetch("/api/shopping").then((r) => r.json());
      setItems(r);
    } catch {}
  };

  useEffect(() => {
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setText("");
    inputRef.current?.focus();
    try {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const created = await res.json();
      if (created?.id) {
        setJustAdded(created.id);
        setTimeout(() => setJustAdded(null), 800);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (item: Item) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, completedAt: i.completedAt ? null : new Date().toISOString() } : i,
      ),
    );
    await fetch(`/api/shopping/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completedAt }),
    });
    refresh();
  };

  const remove = async (item: Item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await fetch(`/api/shopping/${item.id}`, { method: "DELETE" });
    refresh();
  };

  const active = items.filter((i) => !i.completedAt);
  const done = items.filter((i) => i.completedAt);
  const countLabel =
    active.length === 0
      ? tr("items_zero", lang)
      : active.length === 1
      ? tr("items_one", lang)
      : tr("items_many", lang, { n: active.length });

  const listText = active.map((i) => `• ${i.text}`).join("\n");

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <header
        className="sticky top-0 z-10 backdrop-blur-xl bg-white/60 border-b border-white/40"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2.5 min-w-0 group">
            <div className="text-3xl sm:text-4xl">🛒</div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate group-hover:text-slate-700 transition">
                {tr("shopping", lang)}
              </h1>
              <p className="text-xs text-slate-500 -mt-0.5">{countLabel}</p>
            </div>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareOpen(true)}
              disabled={active.length === 0}
              className="h-10 w-10 rounded-full bg-white/80 border border-slate-200 hover:bg-white flex items-center justify-center text-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label={tr("share", lang)}
              title={tr("share", lang)}
            >
              📤
            </button>
            <LangSwitcher value={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 pt-5 pb-10">
        <form onSubmit={add} className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tr("add_item", lang)}
            enterKeyHint="done"
            autoComplete="off"
            autoFocus
            className="flex-1 min-w-0 h-14 sm:h-16 px-5 rounded-2xl bg-white border border-slate-200
              text-lg sm:text-xl shadow-sm placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="shrink-0 h-14 sm:h-16 px-5 sm:px-7 rounded-2xl
              bg-gradient-to-br from-blue-500 to-blue-600 text-white
              text-base sm:text-lg font-semibold shadow-lg
              disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none
              active:scale-[0.97] transition"
          >
            {tr("add", lang)}
          </button>
        </form>

        {items.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-6xl mb-4 opacity-40">🛒</div>
            <p className="text-slate-500 text-lg">{tr("empty_list", lang)}</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <ul className="space-y-2 mb-6">
                {active.map((item) => (
                  <li
                    key={item.id}
                    className={[
                      "flex items-center gap-2 transition-all duration-300",
                      justAdded === item.id ? "animate-slide-in" : "",
                    ].join(" ")}
                  >
                    <button
                      onClick={() => toggle(item)}
                      className="flex-1 min-w-0 text-left px-4 sm:px-5 py-4 sm:py-5
                        rounded-2xl bg-white border border-slate-100
                        hover:border-blue-300 hover:shadow-md
                        active:scale-[0.99] transition-all
                        flex items-center gap-3 group"
                    >
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-300 shrink-0 group-hover:border-blue-400 transition" />
                      <span className="text-lg sm:text-xl truncate">{item.text}</span>
                    </button>
                    <button
                      onClick={() => remove(item)}
                      className="shrink-0 w-12 h-12 sm:w-14 sm:h-14
                        text-slate-400 hover:text-red-500 hover:bg-red-50
                        rounded-2xl text-2xl sm:text-3xl transition"
                      aria-label="Delete"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {done.length > 0 && (
              <>
                <div className="flex items-center gap-3 mt-8 mb-3 px-1">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                    {tr("done", lang)} · {done.length}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <ul className="space-y-1.5">
                  {done.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(item)}
                        className="flex-1 min-w-0 text-left px-4 sm:px-5 py-3
                          rounded-2xl text-slate-400 line-through
                          flex items-center gap-3 hover:bg-white/50 transition"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm shrink-0">
                          ✓
                        </span>
                        <span className="truncate">{item.text}</span>
                      </button>
                      <button
                        onClick={() => remove(item)}
                        className="shrink-0 w-12 h-12 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl text-2xl transition"
                        aria-label="Delete"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        lang={lang}
        listText={listText}
        title={tr("shopping", lang)}
        members={members}
      />

      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        :global(.animate-slide-in) {
          animation: slide-in 400ms ease-out;
        }
      `}</style>
    </main>
  );
}
