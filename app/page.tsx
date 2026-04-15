import { prisma } from "@/lib/db";
import { whoIsHome, piholeStatus, nextTrashPickup } from "@/lib/status";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [members, logs, shopping, people, pihole, trash] = await Promise.all([
    prisma.member.findMany({ orderBy: { id: "asc" } }),
    prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { deliveries: { include: { member: true } } },
    }),
    prisma.shoppingItem.findMany({ orderBy: [{ completedAt: "asc" }, { createdAt: "asc" }] }),
    whoIsHome(),
    piholeStatus(),
    nextTrashPickup(),
  ]);

  return (
    <Dashboard
      members={members.map(({ id, name, color }) => ({ id, name, color }))}
      shopping={shopping.map((s) => ({
        id: s.id,
        text: s.text,
        completedAt: s.completedAt ? s.completedAt.toISOString() : null,
      }))}
      logs={logs.map((l) => ({
        id: l.id,
        kind: l.kind,
        createdAt: l.createdAt.toISOString(),
        recipients: l.deliveries.map((d) => ({
          name: d.member.name,
          acknowledged: Boolean(d.acknowledgedAt),
        })),
      }))}
      status={{
        people,
        pihole,
        trash: trash ? { date: trash.date.toISOString(), kind: trash.kind } : null,
      }}
    />
  );
}
