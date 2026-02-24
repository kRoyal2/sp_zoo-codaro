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
            CoreStack
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h1 className="text-6xl font-bold leading-[1.0] tracking-tighter text-foreground sm:text-7xl lg:text-[6rem]">
              Simplify your <br />
              operations.
            </h1>
            <p className="mt-8 text-xl font-medium tracking-tight leading-relaxed text-muted-foreground max-w-xl">
              One platform to manage everything. Build for speed, clarity, and uncompromising scale.
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
              <p className="text-sm font-semibold tracking-tight text-muted-foreground">Joined by <strong className="text-foreground">1M+</strong> operators.</p>
            </div>
          </motion.div>
          
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
          <p className="w-full text-center text-sm font-bold tracking-tight text-muted-foreground uppercase mb-4">Trusted by industry leaders</p>
          <div className="w-full flex items-center justify-center gap-12 sm:gap-20 opacity-40 grayscale flex-wrap">
            {['Acme Corp', 'GlobalScale', 'TechNova', 'Nexus', 'Vertex'].map(brand => (
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
            Ready for all?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-xl font-medium tracking-tight text-background/70 max-w-2xl mx-auto"
          >
            Join the fastest growing teams that rely on CoreStack OS every single day.
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
                CoreStack
              </span>
            </div>
            <p className="text-base font-medium tracking-tight text-muted-foreground max-w-xs">
              The single tool for high-performance operations.
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
