"use client";

import { useEffect, useState } from "react";
import { Lang, tr } from "@/lib/i18n";

type Item = { id: number; text: string; completedAt: string | null };

export default function ShoppingList({
  initial,
  lang,
  showOpenLink = false,
}: {
  initial: Item[];
  lang: Lang;
  showOpenLink?: boolean;
}) {
  const [items, setItems] = useState<Item[]>(initial);
  const [text, setText] = useState("");

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
    if (!trimmed) return;
    setText("");
    await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });
    refresh();
  };

  const toggle = async (item: Item) => {
    await fetch(`/api/shopping/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completedAt }),
    });
    refresh();
  };

  const remove = async (item: Item) => {
    await fetch(`/api/shopping/${item.id}`, { method: "DELETE" });
    refresh();
  };

  const active = items.filter((i) => !i.completedAt);
  const done = items.filter((i) => i.completedAt);

  return (
    <section className="rounded-3xl sm:rounded-4xl bg-white/70 backdrop-blur-xl border border-white/60 p-4 sm:p-6 md:p-8 shadow-soft">
      <header className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="text-3xl sm:text-4xl">🛒</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
            {tr("shopping", lang)}
          </h2>
        </div>
        {showOpenLink && (
          <a
            href="/shopping"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full hover:bg-slate-100"
            title="Open on phone"
          >
            📱 ↗
          </a>
        )}
      </header>

      <form onSubmit={add} className="flex gap-2 mb-4 sm:mb-5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={tr("add_item", lang)}
          autoComplete="off"
          className="flex-1 min-w-0 h-12 sm:h-14 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-base sm:text-xl shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <button
          type="submit"
          className="shrink-0 h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-base sm:text-lg font-semibold shadow-lg active:scale-[0.98] transition"
        >
          {tr("add", lang)}
        </button>
      </form>

      <ul className="space-y-1.5 sm:space-y-2">
        {active.map((item) => (
          <li key={item.id} className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => toggle(item)}
              className="flex-1 min-w-0 text-left text-base sm:text-xl px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-slate-100 hover:border-blue-300 hover:shadow-sm active:scale-[0.99] transition flex items-center gap-2.5 sm:gap-3"
            >
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-300 shrink-0" />
              <span className="truncate">{item.text}</span>
            </button>
            <button
              onClick={() => remove(item)}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl sm:rounded-2xl text-xl sm:text-2xl transition"
              aria-label="Delete"
            >
              ×
            </button>
          </li>
        ))}
        {done.length > 0 && (
          <li className="pt-3 sm:pt-4 text-xs sm:text-sm text-slate-400 uppercase tracking-wider font-semibold">
            {tr("done", lang)}
          </li>
        )}
        {done.map((item) => (
          <li key={item.id} className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => toggle(item)}
              className="flex-1 min-w-0 text-left text-sm sm:text-lg px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-slate-400 line-through flex items-center gap-2.5 sm:gap-3"
            >
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs sm:text-sm shrink-0">
                ✓
              </span>
              <span className="truncate">{item.text}</span>
            </button>
            <button
              onClick={() => remove(item)}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl sm:rounded-2xl text-xl sm:text-2xl transition"
              aria-label="Delete"
            >
              ×
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-slate-400 text-base sm:text-lg py-4 sm:py-6 text-center">
            {tr("empty_list", lang)}
          </li>
        )}
      </ul>
    </section>
  );
}
