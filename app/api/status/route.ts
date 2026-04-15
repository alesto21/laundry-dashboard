import { NextResponse } from "next/server";
import { whoIsHome, piholeStatus, nextTrashPickup } from "@/lib/status";

export const dynamic = "force-dynamic";

export async function GET() {
  const [people, pihole, trash] = await Promise.all([
    whoIsHome(),
    piholeStatus(),
    nextTrashPickup(),
  ]);
  return NextResponse.json({
    people,
    pihole,
    trash: trash ? { date: trash.date.toISOString(), kind: trash.kind } : null,
  });
}
