"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Server, Database, Shield, Activity } from "lucide-react";

const points = [
  "One unified system for all operations",
  "Real-time data — no stale reports",
  "Modular by design — use what you need",
  "Built for uncompromising scale",
];

export default function SolutionSection() {
  return (
    <section className="py-32 px-6 sm:px-12 bg-background border-y border-border">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
              One engine. <br /> Total clarity.
            </h2>
            <p className="mt-8 text-xl font-medium leading-relaxed text-muted-foreground max-w-lg">
              CoreStack OS replaces your patchwork stack with a single, modular control layer — so
              your team always knows what's happening, instantly.
            </p>
            <ul className="mt-12 flex flex-col gap-6">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: visual block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 sm:p-12 rounded-[2.5rem] bg-card border border-border shadow-xl"
          >
            <div className="flex items-center justify-between mb-10">
              <span className="text-2xl font-bold tracking-tight text-foreground">System Status</span>
              <span className="flex items-center gap-2 text-sm font-bold px-4 py-1.5 rounded-full bg-[#000000] text-white dark:bg-[#ffffff] dark:text-black">
                <span className="w-2 h-2 rounded-full bg-[#00e691]" />
                Live
              </span>
            </div>

            <div className="flex flex-col gap-8">
              {[
                { name: "Ops Engine", pct: 97, icon: Server },
                { name: "Data Sync", pct: 100, icon: Database },
                { name: "Security", pct: 89, icon: Shield },
                { name: "Network", pct: 94, icon: Activity },
              ].map((item, i) => (
                <motion.div 
                  key={item.name} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border text-foreground">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-base font-bold text-foreground mb-2">
                      <span>{item.name}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-border overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full bg-foreground"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-border grid grid-cols-2 gap-6">
              {[
                { label: "Uptime", value: "99.98%" },
                { label: "Latency", value: "< 40ms" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-background border border-border p-6"
                >
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-3xl font-black tracking-tighter text-foreground mt-2">{s.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
