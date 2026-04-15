import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { sendNotifications } from "@/lib/email";

const KINDS = new Set(["laundry", "dinner"]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const kind = typeof body.kind === "string" && KINDS.has(body.kind) ? body.kind : "laundry";
    const memberIds: number[] = Array.isArray(body.memberIds) ? body.memberIds : [];
    const all: boolean = Boolean(body.all);

    const members = all
      ? await prisma.member.findMany({ orderBy: { id: "asc" } })
      : await prisma.member.findMany({ where: { id: { in: memberIds } } });

    if (members.length === 0) {
      return NextResponse.json({ error: "No recipients selected" }, { status: 400 });
    }

    const deliveries = members.map((m) => ({
      member: m,
      token: randomBytes(16).toString("hex"),
    }));

    await sendNotifications(
      kind as "laundry" | "dinner",
      deliveries.map((d) => ({
        name: d.member.name,
        email: d.member.email,
        token: d.token,
        language: d.member.language,
      })),
    );

    const log = await prisma.notificationLog.create({
      data: {
        kind,
        recipients: members.map((m) => m.name).join(", "),
        deliveries: {
          create: deliveries.map((d) => ({ memberId: d.member.id, token: d.token })),
        },
      },
    });

    return NextResponse.json({ ok: true, recipients: members.map((m) => m.name), logId: log.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("notify error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
