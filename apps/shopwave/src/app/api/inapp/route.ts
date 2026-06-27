import { getInAppNotifications, markInAppNotificationsAsRead } from "@/lib/notifyflow";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getInAppNotifications("demo-user");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Proxy GET In-App] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const data = await markInAppNotificationsAsRead("demo-user");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Proxy POST In-App Read] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
