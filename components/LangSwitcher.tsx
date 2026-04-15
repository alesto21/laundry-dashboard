"use client";

import { Lang, LANGS } from "@/lib/i18n";

export default function LangSwitcher({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="inline-flex bg-white/70 backdrop-blur-xl border border-white/60 rounded-full p-1 shadow-soft">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={[
            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold",
            "transition flex items-center gap-1.5 sm:gap-2",
            value === l.code ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900",
          ].join(" ")}
          aria-label={l.label}
        >
          <span className="text-base sm:text-lg">{l.flag}</span>
          <span className="hidden md:inline">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
