"use client";

import React, { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import NotifyflowFeed, { NotifyflowFeedRef } from "@/components/NotifyflowFeed";

export default function StorePage() {
  const feedRef = useRef<NotifyflowFeedRef>(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleBuy = async (name: string, price: number) => {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName: name, price }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.notifications) {
        feedRef.current?.addEvents(
          data.notifications.map((n: any) => ({
            id: n.notificationId,
            channel: n.channel,
            status: n.status.toUpperCase(),
            description: `Order ${data.orderId} placed successfully (${name})`
          }))
        );
      }
    }
  };

  const handleOpenTicket = async () => {
    setSupportLoading(true);
    try {
      const res = await fetch("/api/support", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        feedRef.current?.addEvents([
          {
            id: data.notificationId,
            channel: "IN_APP",
            status: "QUEUED",
            description: `Support ticket #${data.ticketId} created`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSupportLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch("/api/otp", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        feedRef.current?.addEvents([
          {
            id: data.notificationId,
            channel: "SMS",
            status: "QUEUED",
            description: `MOCK SMS: OTP generated successfully (${data.otp})`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOtpLoading(false);
    }
  };

  const products = [
    {
      name: "Pro Headphones",
      price: "₹2,999",
      priceNum: 2999,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary w-8 h-8">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6M3 14h3v4H3v-4zm15 0h3v4h-3v-4z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: "Mechanical Keyboard",
      price: "₹4,499",
      priceNum: 4499,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary w-8 h-8">
          <rect x="2" y="6" width="20" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 10h1v1H6v-1zm4 0h1v1h-1v-1zm4 0h1v1h-1v-1zm4 0h1v1h-1v-1zM6 13h1v1H6v-1zm12 0h1v1h-1v-1zM9 13h6v1H9v-1z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: "USB-C Hub",
      price: "₹1,299",
      priceNum: 1299,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary w-8 h-8">
          <rect x="7" y="2" width="10" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16v6m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 6H5m0 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm12 0h2m0 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-14 4H5m0 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm14 0h2m0 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-12">
        {/* Top Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Store Actions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-1 select-none">
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                Shopwave Store
              </h1>
              <p className="text-xs text-muted font-medium">
                A demo application showcasing Notifyflow real-time integrations in action.
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.name}
                  name={p.name}
                  price={p.price}
                  priceNum={p.priceNum}
                  icon={p.icon}
                  onBuy={handleBuy}
                />
              ))}
            </div>

            {/* Bottom Row Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Support Card */}
              <div className="bg-white border border-border rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-primary">Need Help?</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Open a customer support ticket and monitor notifications in the in-app bell menu.
                  </p>
                </div>
                <button
                  onClick={handleOpenTicket}
                  disabled={supportLoading}
                  className="w-full min-h-[38px] rounded-lg bg-primary hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {supportLoading ? "Opening Ticket..." : "Open Ticket"}
                </button>
              </div>

              {/* OTP Card */}
              <div className="bg-white border border-border rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm opacity-75">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-primary">Verify Your Account</h3>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-200">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Generate a random one-time passcode (OTP) delivered securely to your device via SMS channel.
                  </p>
                </div>
                <button
                  disabled
                  className="w-full min-h-[38px] rounded-lg bg-gray-100 border border-gray-200 text-gray-400 text-xs font-semibold px-4 py-2 flex items-center justify-center cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Feed Panel */}
          <div className="lg:col-span-1 h-full">
            <NotifyflowFeed ref={feedRef} />
          </div>

        </div>

        {/* Bottom Explainer: How It Works */}
        <section className="border-t border-border pt-12 space-y-8 select-none">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-primary tracking-tight">
              How Shopwave uses Notifyflow
            </h2>
            <p className="text-xs text-muted font-medium">
              A high-level view of the notification cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  1. One API call
                </span>
                <p className="text-xs text-muted leading-relaxed">
                  The client application triggers standard requests containing context parameters to the Notifyflow server.
                </p>
              </div>
              <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3.5 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed select-all">
{`await notify({
  channel: 'EMAIL',
  recipient: '...',
  template: 'order_confirmed',
  data: { ... }
})`}
              </pre>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  2. Notifyflow handles it
                </span>
                <p className="text-xs text-muted leading-relaxed">
                  Notifyflow automatically schedules retry configurations, logs status updates, and handles background job loops.
                </p>
              </div>
              <div className="space-y-2 font-semibold text-xs text-primary leading-loose pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✔</span>
                  <span>Ingests request into Redis queue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✔</span>
                  <span>Executes workers for backends</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✔</span>
                  <span>Fails-open & schedules retries</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  3. You see it live
                </span>
                <p className="text-xs text-muted leading-relaxed">
                  Notifications dispatch instantly across target channels, visible in real-time tracking feeds.
                </p>
              </div>
              <div className="space-y-2 text-xs font-semibold text-primary leading-loose pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-accent">•</span>
                  <span>Email delivered to inbox</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent">•</span>
                  <span>In-app notification badge counts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent">•</span>
                  <span>Webhooks dispatch payloads</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
