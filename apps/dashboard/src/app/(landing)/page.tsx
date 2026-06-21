import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Logos from "./components/Logos";
import HowItWorks from "./components/HowItWorks";
import CodeSnippet from "./components/CodeSnippet";
import FeaturesGrid from "./components/FeaturesGrid";
import ChannelShowcase from "./components/ChannelShowcase";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Logos />
        <HowItWorks />
        <CodeSnippet />
        <FeaturesGrid />
        <ChannelShowcase />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
