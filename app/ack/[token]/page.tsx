import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const COPY = {
  en: { thanks: "Got it, {name}!",      msg: "Thanks — marked as picked up.",   invalid_title: "Link not found", invalid_msg: "This link is invalid or expired." },
  no: { thanks: "Takk, {name}!",         msg: "Merket som hentet.",               invalid_title: "Lenken finnes ikke", invalid_msg: "Denne lenken er ugyldig eller utløpt." },
  sr: { thanks: "Hvala, {name}!",        msg: "Označeno kao podignuto.",         invalid_title: "Link nije pronađen", invalid_msg: "Ovaj link nije važeći ili je istekao." },
};

function lang(code: string): "en" | "no" | "sr" {
  return code === "sr" || code === "no" ? code : "en";
}

export default async function AckPage({ params }: { params: { token: string } }) {
  const delivery = await prisma.notificationDelivery.findUnique({
    where: { token: params.token },
    include: { member: true, log: true },
  });

  if (!delivery) {
    const c = COPY.en;
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-4xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-card p-12 text-center">
          <div className="text-7xl mb-6">🔗</div>
          <h1 className="text-3xl font-bold mb-3 text-slate-900">{c.invalid_title}</h1>
          <p className="text-lg text-slate-600">{c.invalid_msg}</p>
        </div>
      </main>
    );
  }

  if (!delivery.acknowledgedAt) {
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { acknowledgedAt: new Date() },
    });
  }

  const c = COPY[lang(delivery.member.language)];
  const title = c.thanks.replace("{name}", delivery.member.name);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-4xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-card p-12 text-center">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-3 text-slate-900">{title}</h1>
        <p className="text-lg text-slate-600">{c.msg}</p>
      </div>
    </main>
  );
}
