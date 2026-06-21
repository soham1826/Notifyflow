import "./globals.css";
import React from "react";

export const metadata = {
  title: "Notifyflow | Developer Notification Platform",
  description: "A minimalist, multi-tenant notification delivery infrastructure and control dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased selection:bg-zinc-800 selection:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
