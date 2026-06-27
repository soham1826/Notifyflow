import { notify } from "@/lib/notifyflow";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { productName, price } = await request.json();
    
    const orderId = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
    
    const results = await Promise.allSettled([
      // 1. Email confirmation — HIGH priority
      notify({
        channel: "EMAIL",
        recipient: process.env.DEMO_EMAIL!,
        template: "order_confirmed",
        data: {
          customerName: "Soham Demo",
          orderId,
          productName,
          amount: price,
          estimatedDelivery: "3-5 business days"
        },
        priority: "HIGH"
      }),

      // 2. Webhook — shipment event to logistics system
      notify({
        channel: "WEBHOOK",
        recipient: process.env.DEMO_WEBHOOK_URL!,
        rawBody: `Order ${orderId} placed event`,
        data: {
          event: "order.placed",
          orderId,
          productName,
          amount: price,
          timestamp: Date.now()
        },
        priority: "DEFAULT"
      }),

      // 3. In-app — order confirmation bell notification
      notify({
        channel: "IN_APP",
        recipient: "demo-user",
        rawSubject: `Order ${orderId} confirmed`,
        rawBody: `Your ${productName} order has been placed successfully.`,
        priority: "DEFAULT"
      })
    ]);

    const notifications = results.map((result, index) => {
      const channels = ["EMAIL", "WEBHOOK", "IN_APP"];
      if (result.status === "fulfilled") {
        return { 
          channel: channels[index], 
          notificationId: result.value.notificationId || result.value.notification_id,
          status: "QUEUED"
        };
      }
      return { 
        channel: channels[index], 
        error: true,
        message: result.reason instanceof Error ? result.reason.message : String(result.reason)
      };
    });

    return NextResponse.json({ orderId, notifications });
  } catch (error: any) {
    console.error("[Order API] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
