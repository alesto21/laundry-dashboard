import { prisma } from "@/lib/db";
import ShoppingPage from "@/components/ShoppingPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await prisma.shoppingItem.findMany({
    orderBy: [{ completedAt: "asc" }, { createdAt: "asc" }],
  });

  return (
    <ShoppingPage
      initial={items.map((s) => ({
        id: s.id,
        text: s.text,
        completedAt: s.completedAt ? s.completedAt.toISOString() : null,
      }))}
    />
  );
}
