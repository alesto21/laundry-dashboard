import nodemailer from "nodemailer";

type Delivery = { name: string; email: string; token: string; language: string };
type Lang = "en" | "no" | "sr";
type Kind = "laundry" | "dinner";

type Copy = {
  hero: string;
  gradient: string;
  subjects: string[];
  headlines: string[];
  bodies: string[];
  cta: string;
  signoff: string;
};

const COPY: Record<Kind, Record<Lang, Copy>> = {
  laundry: {
    en: {
      hero: "🧺",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
      subjects: ["🧺 Your laundry is free!", "Fresh clothes, hot off the drum", "Laundry — mission accomplished"],
      headlines: ["Hey {name}, your clothes miss you.", "Clean clothes alert, {name}!", "{name}, laundry duty incoming."],
      bodies: [
        "Freshly washed and folded (mostly). Come get it before someone buries it under theirs.",
        "The spin cycle has spoken. Your wardrobe awaits.",
        "Still warm. Smells good. Just saying.",
      ],
      cta: "Got it, on my way",
      signoff: "— Your friendly laundry bot 🤖",
    },
    no: {
      hero: "🧺",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
      subjects: ["🧺 Vasken er klar!", "Ferskt, varmt og rent", "Oppdrag fullført: vask"],
      headlines: ["Hei {name}, klærne dine savner deg!", "Rene klær-alarm, {name}!", "{name}, vaskeoppdrag venter."],
      bodies: [
        "Nyvasket og (nesten) brettet. Hent det før noen begraver det.",
        "Vaskemaskinen har talt. Garderoben din venter.",
        "Fortsatt varmt. Lukter godt. Bare nevner det.",
      ],
      cta: "OK, henter det nå",
      signoff: "— Din vennlige vaskebot 🤖",
    },
    sr: {
      hero: "🧺",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
      subjects: ["🧺 Veš te čeka!", "Svež veš, topao sa mašine", "Misija opranog veša: završena"],
      headlines: ["Zdravo {name}, veš te zove!", "Pažnja {name} — čist veš!", "{name}, veš je na redu."],
      bodies: [
        "Sveže opran i skoro složen. Uzmi pre nego što ga neko zatrpa.",
        "Mašina je rekla svoje. Tvoj garderober čeka.",
        "Još je topao. Miriše fino. Samo napominjem.",
      ],
      cta: "Razumem, dolazim",
      signoff: "— Tvoj prijateljski bot za veš 🤖",
    },
  },
  dinner: {
    en: {
      hero: "🍽️",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
      subjects: ["🍽️ Dinner's served!", "Food. Now.", "The kitchen calls"],
      headlines: ["{name}, food's on the table!", "Get down here, {name}.", "Dinner time, {name}!"],
      bodies: [
        "It smells amazing. Last one to the table does dishes. Maybe. 😉",
        "Hot food + empty stomach = perfect timing.",
        "Come quick — it gets cold fast and nobody likes reheated food.",
      ],
      cta: "On my way!",
      signoff: "— The kitchen 👨‍🍳",
    },
    no: {
      hero: "🍽️",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
      subjects: ["🍽️ Middagen er servert!", "Mat. Nå.", "Kjøkkenet kaller"],
      headlines: ["{name}, maten står på bordet!", "Kom ned, {name}.", "Middagstid, {name}!"],
      bodies: [
        "Det lukter fantastisk. Siste mann tar oppvasken. Kanskje. 😉",
        "Varm mat + sulten mage = perfekt timing.",
        "Skynd deg — den blir kald fort, og ingen liker oppvarmet mat.",
      ],
      cta: "Jeg kommer!",
      signoff: "— Kjøkkenet 👨‍🍳",
    },
    sr: {
      hero: "🍽️",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
      subjects: ["🍽️ Večera je spremna!", "Hrana. Sada.", "Kuhinja te zove"],
      headlines: ["{name}, večera je na stolu!", "Dolazi dole, {name}.", "Vreme za večeru, {name}!"],
      bodies: [
        "Miriše fantastično. Poslednji za sto pere sudove. Možda. 😉",
        "Topla hrana + gladan stomak = savršen trenutak.",
        "Požuri — hladi se brzo, a niko ne voli podgrejanu hranu.",
      ],
      cta: "Dolazim!",
      signoff: "— Kuhinja 👨‍🍳",
    },
  },
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function baseUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function pickLang(l: string): Lang {
  return l === "sr" || l === "no" ? l : "en";
}

function buildMessage(kind: Kind, d: Delivery) {
  const lang = pickLang(d.language);
  const copy = COPY[kind][lang];
  const subject = pick(copy.subjects);
  const headline = pick(copy.headlines).replace("{name}", d.name);
  const body = pick(copy.bodies);
  const ackUrl = `${baseUrl()}/ack/${d.token}`;

  const text = `${headline}\n\n${body}\n\n${copy.cta}: ${ackUrl}\n\n${copy.signoff}\n`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf8f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 10px 40px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:${copy.gradient};padding:48px 32px;text-align:center;">
              <div style="font-size:72px;line-height:1;">${copy.hero}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 36px 8px;">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;line-height:1.2;">
                ${headline}
              </h1>
              <p style="margin:0 0 32px;font-size:17px;line-height:1.6;color:#475569;">
                ${body}
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:16px;background:${copy.gradient};box-shadow:0 6px 20px rgba(37,99,235,0.25);">
                    <a href="${ackUrl}"
                       style="display:inline-block;padding:18px 36px;color:#ffffff;
                              text-decoration:none;font-size:18px;font-weight:600;letter-spacing:-0.01em;">
                      ${copy.cta} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 36px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;font-style:italic;">
                ${copy.signoff}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

const SHOPPING_COPY: Record<Lang, { subject: string; intro: string; signoff: string }> = {
  en: {
    subject: "🛒 Shopping list",
    intro: "Here's the shopping list from the Home Dashboard:",
    signoff: "Tip: long-press the list below → Add to Notes",
  },
  no: {
    subject: "🛒 Handleliste",
    intro: "Her er handlelisten fra Hjem-tavlen:",
    signoff: "Tips: hold fingeren på listen under → Legg til i Notater",
  },
  sr: {
    subject: "🛒 Spisak za kupovinu",
    intro: "Evo spiska za kupovinu iz kućne table:",
    signoff: "Savet: drži prst na listi ispod → Dodaj u Beleške",
  },
};

export async function sendShoppingList(
  recipient: { name: string; email: string; language: string },
  items: string[],
) {
  if (items.length === 0) throw new Error("Shopping list is empty");

  const lang = pickLang(recipient.language);
  const c = SHOPPING_COPY[lang];
  const listText = items.map((i) => `• ${i}`).join("\n");
  const listHtml = items
    .map((i) => `<li style="padding:10px 0;font-size:18px;color:#0f172a;border-bottom:1px solid #f1f5f9">${i}</li>`)
    .join("");

  const subject = c.subject;
  const text = `${c.intro}\n\n${listText}\n\n${c.signoff}\n`;
  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#faf8f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 10px 40px rgba(15,23,42,0.08)">
        <tr><td style="background:linear-gradient(135deg,#60a5fa,#2563eb);padding:40px;text-align:center">
          <div style="font-size:64px;line-height:1">🛒</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 8px;font-size:24px;color:#0f172a">${subject}</h1>
          <p style="margin:0 0 20px;font-size:16px;color:#475569">${c.intro}</p>
          <ul style="margin:0;padding:0;list-style:none">${listHtml}</ul>
          <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;font-style:italic">${c.signoff}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? "Home <onboarding@resend.dev>",
        to: [recipient.email],
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
    return;
  }

  if (!process.env.SMTP_HOST) throw new Error("No email provider configured.");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: String(process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to: `${recipient.name} <${recipient.email}>`,
    subject,
    text,
    html,
  });
}

export async function sendNotifications(kind: Kind, deliveries: Delivery[]) {
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
