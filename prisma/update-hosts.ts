import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HOSTS: Record<string, string | null> = {
  Mama: "10.27.27.16",
  Tata: "10.27.27.27",
  Sasa: "10.27.27.11",
  Sara: "10.27.27.29",
  Anja: null,
};

async function main() {
  for (const [name, hostname] of Object.entries(HOSTS)) {
    const r = await prisma.member.updateMany({
      where: { name },
      data: { hostname },
    });
    console.log(`${name} → ${hostname ?? "(cleared)"} (${r.count} updated)`);
  }
}

main().finally(() => prisma.$disconnect());
