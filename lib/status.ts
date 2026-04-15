import { exec } from "node:child_process";
import { prisma } from "./db";

const PING_TIMEOUT_MS = 1500;

function pingHost(host: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (ok: boolean) => {
      if (!settled) { settled = true; resolve(ok); }
    };
    const child = exec(`ping -c 1 ${host}`, (err) => done(!err));
    setTimeout(() => {
      try { child.kill(); } catch {}
      done(false);
    }, PING_TIMEOUT_MS);
  });
}

export async function whoIsHome() {
  const members = await prisma.member.findMany({ orderBy: { id: "asc" } });
  return Promise.all(
    members.map(async (m) => ({
      id: m.id,
      name: m.name,
      color: m.color,
      home: m.hostname ? await pingHost(m.hostname) : null,
    })),
  );
}

export async function piholeStatus() {
  const url = process.env.PIHOLE_URL;
  if (!url) return null;
  const base = url.replace(/\/$/, "").replace(/\/admin$/, "");
  try {
    const res = await fetch(`${base}/api/stats/summary`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { status: "error" as const };
    const data = await res.json();
    if (data?.queries) {
      return {
        status: "enabled" as const,
        blockedToday: Number(data.queries.blocked ?? 0),
        queriesToday: Number(data.queries.total ?? 0),
      };
    }
    return {
      status: data.status ?? "unknown",
      blockedToday: Number(String(data.ads_blocked_today ?? "0").replace(/,/g, "")),
      queriesToday: Number(String(data.dns_queries_today ?? "0").replace(/,/g, "")),
    };
  } catch {
    return { status: "unreachable" as const };
  }
}

export async function nextTrashPickup() {
  return prisma.trashPickup.findFirst({
    where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    orderBy: { date: "asc" },
  });
}
