"use client";

const COLOR: Record<string, { bg: string; text: string; ring: string; ringSoft: string; selBg: string }> = {
  rose:    { bg: "bg-rose-100",    text: "text-rose-700",    ring: "ring-rose-400",    ringSoft: "ring-rose-200",    selBg: "bg-rose-500" },
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    ring: "ring-blue-400",    ringSoft: "ring-blue-200",    selBg: "bg-blue-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-400", ringSoft: "ring-emerald-200", selBg: "bg-emerald-500" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700",  ring: "ring-violet-400",  ringSoft: "ring-violet-200",  selBg: "bg-violet-500" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700",   ring: "ring-amber-400",   ringSoft: "ring-amber-200",   selBg: "bg-amber-500" },
  slate:   { bg: "bg-slate-100",   text: "text-slate-700",   ring: "ring-slate-400",   ringSoft: "ring-slate-200",   selBg: "bg-slate-600" },
};

export default function MemberButton({
  name,
  color = "slate",
  selected,
  onToggle,
}: {
  name: string;
  color?: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const c = COLOR[color] ?? COLOR.slate;
  const initial = name.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "group flex flex-col items-center gap-1.5 sm:gap-2 p-1.5 sm:p-3 rounded-2xl sm:rounded-3xl",
        "transition-all active:scale-95",
        selected ? "bg-white shadow-card ring-2 " + c.ring : "hover:bg-white/60",
      ].join(" ")}
    >
      <div
        className={[
          "rounded-full flex items-center justify-center font-bold transition-all",
          "w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24",
          "text-2xl sm:text-4xl md:text-5xl",
          selected
            ? `${c.selBg} text-white shadow-lg`
            : `${c.bg} ${c.text} ring-2 sm:ring-4 ${c.ringSoft}`,
        ].join(" ")}
      >
        {selected ? "✓" : initial}
      </div>
      <span
        className={[
          "font-semibold truncate max-w-full",
          "text-xs sm:text-lg md:text-xl",
          selected ? c.text : "text-slate-700",
        ].join(" ")}
      >
        {name}
      </span>
    </button>
  );
}
