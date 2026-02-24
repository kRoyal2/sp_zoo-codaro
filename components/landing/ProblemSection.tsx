"use client";

import { motion } from "framer-motion";
import { ZapOff, Activity, Puzzle } from "lucide-react";

const problems = [
  {
    icon: ZapOff,
    title: "Delayed Distress Intake",
    description:
      "Critical SOS alerts get buried across channels, slowing first response when hikers need immediate help.",
  },
  {
    icon: Activity,
    title: "Manual Triage Bottlenecks",
    description:
      "Teams hand-score incidents manually, creating inconsistent prioritization during fast-moving mountain emergencies.",
  },
  {
    icon: Puzzle,
    title: "Fragmented Field Coordination",
    description:
      "Dispatch, command, and responders operate in disconnected tools, causing avoidable delays and confusion.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-32 px-6 sm:px-12 bg-card">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold tracking-tighter text-foreground sm:text-6xl md:text-7xl">
            Response friction <br className="hidden sm:block" /> costs precious time.
          </h2>
          <p className="mt-8 max-w-2xl text-xl font-medium tracking-tight leading-relaxed text-muted-foreground">
            In mountain rescue, delays are dangerous. RescueStack removes communication gaps and manual routing so teams act faster under pressure.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 rounded-4xl bg-background border border-border shadow-sm hover:shadow-xl transition-all"
            >
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-foreground">
                <p.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{p.title}</h3>
              <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
