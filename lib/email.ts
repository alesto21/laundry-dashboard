import nodemailer from "nodemailer";

type Delivery = { name: string; email: string; token: string; language: string };

const COPY = {
  laundry: {
    en: { subject: "Laundry Ready",     body: "Your clothes are ready to be picked up.", cta: "Got it" },
    no: { subject: "Vask er klar",      body: "Klærne dine er klare til å hentes.",      cta: "OK, henter" },
    sr: { subject: "Veš je spreman",    body: "Tvoja odeća je spremna za podizanje.",    cta: "Razumem" },
  },
  dinner: {
    en: { subject: "Dinner's Ready",    body: "Come to the kitchen — dinner is on the table.", cta: "On my way" },
    no: { subject: "Middag er klar",    body: "Kom til kjøkkenet — middagen står på bordet.",  cta: "Kommer" },
    sr: { subject: "Večera je spremna", body: "Dođi u kuhinju — večera je na stolu.",          cta: "Dolazim" },
  },
} as const;

function baseUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function pickLang(l: string): "en" | "no" | "sr" {
  return l === "sr" || l === "no" ? l : "en";
}

function buildMessage(kind: "laundry" | "dinner", d: Delivery) {
  const lang = pickLang(d.language);
  const copy = COPY[kind][lang];
  const ackUrl = `${baseUrl()}/ack/${d.token}`;
  const text = `${d.name},\n\n${copy.body}\n\n${copy.cta}: ${ackUrl}\n`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fafaf9">
      <div style="background:#fff;border-radius:24px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
        <h2 style="margin:0 0 16px;font-size:28px;color:#0f172a">${copy.subject}</h2>
        <p style="font-size:17px;color:#334155;line-height:1.5">${d.name}, ${copy.body}</p>
        <p style="margin:36px 0 8px">
          <a href="${ackUrl}"
             style="display:inline-block;background:#2563eb;color:#fff;
                    padding:16px 32px;border-radius:14px;font-size:18px;
                    text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(37,99,235,0.3)">
            ${copy.cta}
          </a>
        </p>
      </div>
    </div>`;
  return { subject: copy.subject, text, html };
}

export async function sendNotifications(kind: "laundry" | "dinner", deliveries: Delivery[]) {
  if (deliveries.length === 0) throw new Error("No recipients selected");

  if (process.env.RESEND_API_KEY) {
    for (const d of deliveries) {
      const m = buildMessage(kind, d);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM ?? "Home <onboarding@resend.dev>",
          to: [d.email],
          subject: m.subject,
          text: m.text,
          html: m.html,
        }),
      });
      if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
    }
    return;
  }

  if (!process.env.SMTP_HOST) {
    throw new Error("No email provider configured. Set SMTP_* or RESEND_API_KEY in .env");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: String(process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  for (const d of deliveries) {
    const m = buildMessage(kind, d);
    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to: `${d.name} <${d.email}>`,
      subject: m.subject,
      text: m.text,
      html: m.html,
    });
  }
}
