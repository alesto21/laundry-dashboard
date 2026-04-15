import { prisma } from "@/lib/db";
import ShoppingPage from "@/components/ShoppingPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [items, members] = await Promise.all([
    prisma.shoppingItem.findMany({
      orderBy: [{ completedAt: "asc" }, { createdAt: "asc" }],
    }),
    prisma.member.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <ShoppingPage
      initial={items.map((s) => ({
        id: s.id,
        text: s.text,
        completedAt: s.completedAt ? s.completedAt.toISOString() : null,
      }))}
      members={members.map((m) => ({ id: m.id, name: m.name, color: m.color }))}
    />
  );
}
