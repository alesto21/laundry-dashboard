import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.shoppingItem.findMany({
    orderBy: [{ completedAt: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 });
  const item = await prisma.shoppingItem.create({ data: { text } });
  return NextResponse.json(item);
}
