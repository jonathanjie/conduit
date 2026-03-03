"use client";

import Nav from "@/components/Nav";
import Hero from "@/components/home/Hero";
import SocialProof from "@/components/home/SocialProof";
import Problem from "@/components/home/Problem";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import DashboardPreview from "@/components/home/DashboardPreview";
import ForTeachersParents from "@/components/home/ForTeachersParents";
import Pricing from "@/components/home/Pricing";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <Problem />
        <HowItWorks />
        <Features />
        <DashboardPreview />
        <ForTeachersParents />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
