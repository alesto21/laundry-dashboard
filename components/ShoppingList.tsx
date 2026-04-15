"use client";

import { useEffect, useState } from "react";
import { Lang, tr } from "@/lib/i18n";

type Item = { id: number; text: string; completedAt: string | null };

export default function ShoppingList({ initial, lang }: { initial: Item[]; lang: Lang }) {
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
    <section className="rounded-4xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 md:p-8 shadow-soft">
      <header className="flex items-center gap-3 mb-5">
        <div className="text-4xl">🛒</div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{tr("shopping", lang)}</h2>
      </header>

      <form onSubmit={add} className="flex gap-2 mb-5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={tr("add_item", lang)}
          className="flex-1 h-14 px-5 rounded-2xl bg-white border border-slate-200 text-xl
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
            shadow-sm placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="h-14 px-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
            text-white text-lg font-semibold shadow-lg active:scale-[0.98] transition"
        >
          {tr("add", lang)}
        </button>
      </form>

      <ul className="space-y-2">
        {active.map((item) => (
          <li key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => toggle(item)}
              className="flex-1 text-left text-xl px-5 py-4 rounded-2xl bg-white
                border border-slate-100 hover:border-blue-300 hover:shadow-sm
                active:scale-[0.99] transition flex items-center gap-3"
            >
              <span className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
              {item.text}
            </button>
            <button
              onClick={() => remove(item)}
              className="w-12 h-12 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl text-2xl transition"
              aria-label="Delete"
            >
              ×
            </button>
          </li>
        ))}
        {done.length > 0 && (
          <li className="pt-4 text-sm text-slate-400 uppercase tracking-wider font-semibold">
            {tr("done", lang)}
          </li>
        )}
        {done.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <button
              onClick={() => toggle(item)}
              className="flex-1 text-left text-lg px-5 py-3 rounded-2xl text-slate-400 line-through
                flex items-center gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shrink-0">✓</span>
              {item.text}
            </button>
            <button
              onClick={() => remove(item)}
              className="w-12 h-12 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl text-2xl transition"
              aria-label="Delete"
            >
              ×
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-slate-400 text-lg py-6 text-center">{tr("empty_list", lang)}</li>
        )}
      </ul>
    </section>
  );
}
