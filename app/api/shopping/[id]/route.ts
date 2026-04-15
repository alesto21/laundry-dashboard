import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const completed = Boolean(body.completed);
  const item = await prisma.shoppingItem.update({
    where: { id },
    data: { completedAt: completed ? new Date() : null },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.shoppingItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
