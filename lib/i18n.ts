export type Lang = "en" | "no" | "sr";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "sr", label: "Srpski",  flag: "🇷🇸" },
  { code: "no", label: "Norsk",   flag: "🇳🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

type Dict = Record<string, { en: string; no: string; sr: string }>;

export const t: Dict = {
  title:            { en: "Home Dashboard",       no: "Hjem-tavle",            sr: "Kućna Tabla" },
  good_morning:     { en: "Good morning",          no: "God morgen",            sr: "Dobro jutro" },
  good_afternoon:   { en: "Good afternoon",        no: "God ettermiddag",       sr: "Dobar dan" },
  good_evening:     { en: "Good evening",          no: "God kveld",             sr: "Dobro veče" },

  whos_home:        { en: "Who's home",            no: "Hvem er hjemme",        sr: "Ko je kod kuće" },
  next_trash:       { en: "Next pickup",           no: "Neste søppel",          sr: "Sledeće đubre" },
  pihole:           { en: "Pi-hole",               no: "Pi-hole",               sr: "Pi-hole" },
  active:           { en: "Active",                no: "Aktiv",                 sr: "Aktivan" },
  not_set:          { en: "not set",               no: "ikke satt",             sr: "nije podešeno" },
  blocked_today:    { en: "blocked today",         no: "blokkert i dag",        sr: "blokirano danas" },

  laundry_ready:    { en: "Laundry Ready",         no: "Vask Klar",             sr: "Veš Spreman" },
  dinner_ready:     { en: "Dinner Ready",          no: "Middag Klar",           sr: "Večera Spremna" },
  notify_selected:  { en: "Notify Selected",       no: "Varsle valgte",         sr: "Obavesti izabrane" },
  notify_all:       { en: "Notify All",            no: "Varsle alle",           sr: "Obavesti sve" },
  sending:          { en: "Sending…",              no: "Sender…",               sr: "Šaljem…" },
  sent_to:          { en: "Sent to",               no: "Sendt til",             sr: "Poslato za" },
  all:              { en: "All",                   no: "Alle",                  sr: "Svi" },
  clear:            { en: "Clear",                 no: "Tøm",                   sr: "Obriši" },

  shopping:         { en: "Shopping List",         no: "Handleliste",           sr: "Spisak za kupovinu" },
  add_item:         { en: "Add item…",             no: "Legg til…",             sr: "Dodaj stavku…" },
  add:              { en: "Add",                   no: "Legg til",              sr: "Dodaj" },
  empty_list:       { en: "Nothing yet — add what you need.", no: "Ingenting enda — legg til noe.", sr: "Nema ničega — dodaj šta treba." },
  done:             { en: "Done",                  no: "Ferdig",                sr: "Gotovo" },

  recent_activity:  { en: "Recent activity",       no: "Nylig aktivitet",       sr: "Nedavne aktivnosti" },
  no_activity:      { en: "No notifications yet.", no: "Ingen varsler enda.",   sr: "Još nema obaveštenja." },
  picked_up:        { en: "Picked up",             no: "Hentet",                sr: "Podignuto" },
  pending:          { en: "Pending",               no: "Venter",                sr: "Čeka" },

  today:            { en: "today",                 no: "i dag",                 sr: "danas" },
  tomorrow:         { en: "tomorrow",              no: "i morgen",              sr: "sutra" },
  in_days:          { en: "in {n} days",           no: "om {n} dager",          sr: "za {n} dana" },

  trash_Paper:      { en: "Paper",                 no: "Papir",                 sr: "Papir" },
  trash_Rest:       { en: "General",               no: "Restavfall",            sr: "Opšti otpad" },
  trash_Plastic:    { en: "Plastic",               no: "Plast",                 sr: "Plastika" },
  trash_Food:       { en: "Food",                  no: "Matavfall",             sr: "Organski" },
};

export function tr(key: keyof typeof t, lang: Lang, vars: Record<string, string | number> = {}) {
  let s = t[key]?.[lang] ?? t[key]?.en ?? String(key);
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export function greeting(lang: Lang, d = new Date()) {
  const h = d.getHours();
  if (h < 11) return tr("good_morning", lang);
  if (h < 18) return tr("good_afternoon", lang);
  return tr("good_evening", lang);
}

export function trashLabel(kind: string, lang: Lang) {
  const key = `trash_${kind}` as keyof typeof t;
  return t[key] ? tr(key, lang) : kind;
}
