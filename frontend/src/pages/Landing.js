import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import RoiStats from "@/components/landing/RoiStats";
import Industries from "@/components/landing/Industries";
import DemoSection from "@/components/landing/DemoSection";
import HowItWorks from "@/components/landing/HowItWorks";
import LeadForm from "@/components/landing/LeadForm";
import FooterCta from "@/components/landing/FooterCta";

export default function Landing() {
  return (
    <div className="font-body min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <RoiStats />
        <Industries />
        <DemoSection />
        <HowItWorks />
        <LeadForm />
      </main>
      <FooterCta />
    </div>
  );
}
