"use client";

import { useEffect, useState } from "react";
import ShoppingList from "./ShoppingList";
import LangSwitcher from "./LangSwitcher";
import { Lang, tr } from "@/lib/i18n";

type Item = { id: number; text: string; completedAt: string | null };

export default function ShoppingPage({ initial }: { initial: Item[] }) {
  const [lang, setLang] = useState<Lang>("sr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "no" || saved === "sr") setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <main className="min-h-screen p-5 md:p-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-5xl">🛒</div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
              {tr("shopping", lang)}
            </h1>
          </div>
          <LangSwitcher value={lang} onChange={setLang} />
        </header>

        <div className="rounded-4xl bg-white/70 backdrop-blur-xl border border-white/60 p-5 md:p-8 shadow-soft">
          <ShoppingList initial={initial} lang={lang} standalone />
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          <a href="/" className="hover:text-slate-600">← {tr("title", lang)}</a>
        </p>
      </div>
    </main>
  );
}
