import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendShoppingList } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const memberId = Number(body.memberId);
    if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const items = await prisma.shoppingItem.findMany({
      where: { completedAt: null },
      orderBy: { createdAt: "asc" },
    });
    if (items.length === 0) {
      return NextResponse.json({ error: "Shopping list is empty" }, { status: 400 });
    }

    await sendShoppingList(
      { name: member.name, email: member.email, language: member.language },
      items.map((i) => i.text),
    );

    return NextResponse.json({ ok: true, to: member.name });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-shopping error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
