import { notify } from "@/lib/notifyflow";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const res = await notify({
      channel: "SMS",
      recipient: "+919999999999", // mock phone number
      rawBody: `Your verification code is ${otp}. It expires in 10 minutes.`,
      priority: "HIGH"
    });

    return NextResponse.json({
      otp,
      notificationId: res.notificationId || res.notification_id,
      status: "queued"
    });
  } catch (error: any) {
    console.error("[OTP API] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
