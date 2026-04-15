import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const logs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    include: {
      deliveries: { include: { member: true } },
    },
  });
  return NextResponse.json(
    logs.map((l) => ({
      id: l.id,
      kind: l.kind,
      createdAt: l.createdAt.toISOString(),
      recipients: l.deliveries.map((d) => ({
        name: d.member.name,
        acknowledged: Boolean(d.acknowledgedAt),
      })),
    })),
  );
}
