"use client";

import DashboardMockup from "@/components/landing/DashboardMockup";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 sm:px-12 bg-background/90 backdrop-blur-xl border-b border-transparent transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
             <div className="w-3 h-3 bg-background rounded-sm"></div>
          </div>
          <span className="text-xl font-bold tracking-tighter text-foreground">
            RescueStack
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:scale-105 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 sm:px-12 lg:pt-48 lg:pb-32 overflow-hidden bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <h1 className="text-6xl font-bold leading-none tracking-tighter text-foreground sm:text-7xl lg:text-[6rem]">
                Coordinate mountain <br />
                rescue in real time.
              </h1>
              <p className="mt-8 text-xl font-medium tracking-tight leading-relaxed text-muted-foreground max-w-xl">
                RescueStack is a multi-channel emergency coordination platform that automates triage, orchestration, and escalation when every second matters.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-14 items-center rounded-full bg-foreground px-8 text-lg font-semibold tracking-tight text-background transition-transform hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
                <button className="inline-flex h-14 items-center rounded-full bg-card px-8 text-lg font-semibold tracking-tight text-foreground transition-transform hover:bg-neutral-200 dark:hover:bg-neutral-800">
                  Learn more
                </button>
              </div>
              <div className="mt-12 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 3}&backgroundColor=f5f5f5`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold tracking-tight text-muted-foreground">Built for search-and-rescue teams, dispatch leaders, and field responders.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:flex justify-end"
            >
              <svg
                viewBox="0 0 420 360"
                className="w-full max-w-[420px] text-foreground opacity-70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Mountain rescue route vector"
              >
                <rect x="20" y="20" width="380" height="320" rx="28" className="stroke-border" />
                <path d="M70 286L152 170L214 248L272 134L350 286" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M96 286L136 230L182 286" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60" />
                <path d="M112 110C138 84 180 84 206 110C232 136 232 178 206 204L160 250L114 204C88 178 88 136 112 110Z" stroke="currentColor" strokeWidth="3" />
                <circle cx="160" cy="148" r="18" stroke="currentColor" strokeWidth="3" />
                <path d="M262 102H338" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-70" />
                <path d="M262 132H322" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-50" />
                <path d="M262 162H306" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-40" />
                <circle cx="302" cy="246" r="10" className="fill-foreground" />
                <path d="M302 224V268" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M280 246H324" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-20 w-full"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* Credibility Strip */}
      <div className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-12 flex-wrap">
          <p className="w-full text-center text-sm font-bold tracking-tight text-muted-foreground uppercase mb-4">Designed for life-critical response operations</p>
          <div className="w-full flex items-center justify-center gap-12 sm:gap-20 opacity-40 grayscale flex-wrap">
            {['Alpine SAR', 'Rescue Command', 'Trail Safety Ops', 'Summit Response', 'Mountain Dispatch'].map(brand => (
              <span key={brand} className="text-2xl font-bold tracking-tighter text-foreground">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Problem */}
      <ProblemSection />

      {/* Solution */}
      <SolutionSection />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Final CTA */}
      <section className="py-40 px-6 sm:px-12 bg-foreground text-background rounded-b-[3rem] sm:rounded-b-[4rem] relative overflow-hidden">
        <div className="mx-auto max-w-5xl text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold tracking-tighter sm:text-7xl lg:text-[7rem]"
          >
            Ready when seconds matter?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-xl font-medium tracking-tight text-background/70 max-w-2xl mx-auto"
          >
            Replace fragmented rescue communication with one live command center for alerts, risk scoring, and automated escalation.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="inline-flex w-full sm:w-auto h-16 items-center justify-center rounded-full bg-background px-10 text-xl font-bold tracking-tight text-foreground transition-transform hover:scale-105"
            >
              Get Started for free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background px-6 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                 <div className="w-3 h-3 bg-background rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold tracking-tighter text-foreground">
                RescueStack
              </span>
            </div>
            <p className="text-base font-medium tracking-tight text-muted-foreground max-w-xs">
              Event-driven mountain rescue coordination for high-pressure emergencies.
            </p>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-foreground mb-6 text-sm uppercase">Product</h3>
            <ul className="space-y-4 text-base font-medium tracking-tight text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Security</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Updates</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-foreground mb-6 text-sm uppercase">Company</h3>
            <ul className="space-y-4 text-base font-medium tracking-tight text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-foreground mb-6 text-sm uppercase">Legal</h3>
            <ul className="space-y-4 text-base font-medium tracking-tight text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
