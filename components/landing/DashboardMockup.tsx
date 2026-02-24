"use client";

import { motion } from "framer-motion";

export default function DashboardMockup() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full rounded-2xl overflow-hidden border border-border bg-background shadow-xl"
    >
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-border" />
          <span className="w-3 h-3 rounded-full bg-border" />
          <span className="w-3 h-3 rounded-full bg-border" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center justify-center bg-background border border-border rounded-md px-24 py-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground tracking-tight">app.rescuestack.io</span>
          </div>
        </div>
      </div>

      {/* Dashboard body */}
      <div className="flex h-80 sm:h-96">
        {/* Sidebar */}
        <div className="w-16 sm:w-20 flex flex-col items-center gap-6 py-6 bg-card border-r border-border">
          <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center mb-4">
             <div className="w-3 h-3 bg-background rounded-sm"></div>
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg transition-colors ${i === 0 ? "bg-foreground" : "bg-transparent border border-border hover:bg-neutral-200 dark:hover:bg-neutral-800"}`}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-8 bg-background">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h3 className="text-foreground text-2xl font-bold tracking-tight">Live Command Center</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1">Active incidents, triage, and response flow in real time.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-foreground rounded-full text-xs font-bold text-background">Now</span>
              <span className="px-4 py-1.5 bg-card border border-border rounded-full text-xs font-bold text-foreground">6h</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Active Incidents", value: "18", trend: "+5" },
              { label: "Avg Dispatch", value: "4m 12s", trend: "-1m" },
              { label: "Teams Routed", value: "12", trend: "+2" },
            ].map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="rounded-xl bg-card border border-border p-5 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold tracking-tight text-muted-foreground uppercase">{card.label}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${card.trend.startsWith("+") ? "bg-card border border-border text-foreground" : "bg-border text-muted-foreground"}`}
                  >
                    {card.trend}
                  </span>
                </div>
                <span className="text-3xl font-black text-foreground tracking-tighter">{card.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Chart placeholder */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex-1 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Incident Throughput</span>
            </div>
            {/* Fake bar chart wrapper */}
            <div className="flex-1 flex items-end gap-3 relative border-b border-border pb-4">
              
              {/* Bars */}
              <div className="w-full h-full flex items-end justify-between gap-2 z-10 pt-4 px-2">
                {[20, 35, 25, 60, 48, 85, 55, 92, 45, 76, 50, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.05, ease: "circOut" }}
                    className="flex-1 rounded-t-sm bg-foreground hover:opacity-80 transition-opacity"
                    style={{
                      opacity: i === 11 ? 1 : 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
