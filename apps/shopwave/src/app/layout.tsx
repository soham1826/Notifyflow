import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shopwave — Demo E-commerce Store",
  description: "A minimal demo e-commerce store showcasing real-time notification flows powered by Notifyflow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-background text-primary">
        {children}
      </body>
    </html>
  );
}
