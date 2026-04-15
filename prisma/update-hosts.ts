import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HOSTS: Record<string, string> = {
  Mama: "10.27.27.XX",
  Tata: "10.27.27.XX",
  Sasa: "10.27.27.XX",
  Sara: "10.27.27.XX",
  Anja: "10.27.27.XX",
};

async function main() {
  for (const [name, hostname] of Object.entries(HOSTS)) {
    if (hostname.includes("XX")) {
      console.log(`Skipping ${name} — placeholder`);
      continue;
    }
    const r = await prisma.member.updateMany({
      where: { name },
      data: { hostname },
    });
    console.log(`${name} → ${hostname} (${r.count} updated)`);
  }
}

main().finally(() => prisma.$disconnect());
