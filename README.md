# Laundry Dashboard

A touch-friendly home laundry notification dashboard. Runs on a Raspberry Pi, displayed on an iPad or wall-mounted touchscreen.

## Stack

- Next.js (App Router) + Tailwind CSS
- SQLite via Prisma
- Nodemailer (SMTP) or Resend for email

## Setup

```bash
cd laundry-dashboard
cp .env.example .env            # then edit .env with your SMTP or Resend creds
npm install
npm run setup                   # creates SQLite DB + seeds Alex/Sara/Mom
npm run dev                     # http://localhost:3000
```

### Email

Edit `.env`:

- **Gmail**: enable 2FA, create an [app password](https://myaccount.google.com/apppasswords), put it in `SMTP_PASS`.
- **Resend**: set `RESEND_API_KEY` — takes precedence over SMTP.

Update seeded family emails in `prisma/seed.ts` (or edit `prisma/dev.db` directly with a SQLite tool) before going live.

## Production on a Raspberry Pi

```bash
npm run build
npm run start                   # listens on 0.0.0.0:3000
```

Run as a service so it boots with the Pi — example `systemd` unit at `/etc/systemd/system/laundry.service`:

```ini
[Unit]
Description=Laundry Dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/pi/laundry-dashboard
ExecStart=/usr/bin/npm run start
Restart=always
EnvironmentFile=/home/pi/laundry-dashboard/.env

[Install]
WantedBy=multi-user.target
```

Enable: `sudo systemctl enable --now laundry`.

### Kiosk mode on the iPad

In Safari, open the dashboard, tap Share → Add to Home Screen. Launch from the home screen for a fullscreen, chrome-free view. For a real kiosk, use Guided Access (Triple-click Side button → Guided Access).

## Extending

- Add members: edit `prisma/seed.ts` and rerun `npm run db:seed`, or add a small admin page that POSTs to a new `/api/members` route.
- New tiles (e.g. “Dinner ready”, “Door locked”): add a button on `components/Dashboard.tsx` and a new API route under `app/api/`.
- The DB schema lives in `prisma/schema.prisma`; run `npx prisma migrate dev --name <change>` after edits.

## Project layout

```
app/
  api/
    members/route.ts      GET family members
    notify/route.ts       POST { memberIds } or { all: true }
    logs/route.ts         GET recent notifications
  layout.tsx
  page.tsx                server component, loads initial data
  globals.css
components/
  Dashboard.tsx           main client UI
  MemberButton.tsx        touch tile
  ActivityLog.tsx         recent events
lib/
  db.ts                   Prisma client singleton
  email.ts                SMTP / Resend sender
prisma/
  schema.prisma
  seed.ts
```
