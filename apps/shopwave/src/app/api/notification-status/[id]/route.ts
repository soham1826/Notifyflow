import { getNotificationStatus } from "@/lib/notifyflow";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
    }

    const data = await getNotificationStatus(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[Proxy GET Notification Status] Error for ${params.id}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
