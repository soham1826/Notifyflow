import { notify } from "@/lib/notifyflow";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const ticketId = `SUP-${Math.floor(Math.random() * 9000) + 1000}`;

    const res = await notify({
      channel: "IN_APP",
      recipient: "demo-user",
      rawSubject: "Support ticket opened",
      rawBody: `Ticket #${ticketId} received. We'll respond within 24 hours.`,
      priority: "DEFAULT"
    });

    return NextResponse.json({
      ticketId,
      notificationId: res.notificationId || res.notification_id,
      status: "queued"
    });
  } catch (error: any) {
    console.error("[Support API] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
