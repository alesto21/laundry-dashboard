import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.notificationDelivery.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.member.deleteMany();

  await prisma.member.createMany({
    data: [
      { name: "Mama",       fullName: "Jana",       email: "jana@example.com",       language: "sr", color: "rose",    hostname: "jana-phone.local" },
      { name: "Tata",       fullName: "Krsta",      email: "krsta@example.com",      language: "sr", color: "blue",    hostname: "krsta-phone.local" },
      { name: "Sasa",       fullName: "Aleksandar", email: "aleksking405@gmail.com", language: "en", color: "emerald", hostname: "sasa-phone.local" },
      { name: "Sara",       fullName: "Sara",       email: "sara@example.com",       language: "no", color: "violet",  hostname: "sara-phone.local" },
      { name: "Anja",       fullName: "Anja",       email: "anja@example.com",       language: "no", color: "amber",   hostname: "anja-phone.local" },
    ],
  });
  console.log("Seeded members.");

  if ((await prisma.shoppingItem.count()) === 0) {
    await prisma.shoppingItem.createMany({
      data: [{ text: "Mleko" }, { text: "Hleb" }, { text: "Banane" }],
    });
    console.log("Seeded shopping items.");
  }

  if ((await prisma.trashPickup.count()) === 0) {
    const base = new Date();
    base.setHours(7, 0, 0, 0);
    const day = (o: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() + o);
      return d;
    };
    await prisma.trashPickup.createMany({
      data: [
        { date: day(2),  kind: "Paper" },
        { date: day(9),  kind: "Rest" },
        { date: day(16), kind: "Plastic" },
        { date: day(23), kind: "Paper" },
      ],
    });
    console.log("Seeded trash pickups.");
  }
}

main().finally(() => prisma.$disconnect());
