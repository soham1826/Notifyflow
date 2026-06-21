import React from "react";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-layout min-h-screen bg-[#FAF9F7] text-[#1C1917]">
      {children}
    </div>
  );
}
