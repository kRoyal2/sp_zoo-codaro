"use client";

import { motion } from "framer-motion";
import { Zap, Layers, Lock, BarChart3, BellRing, Link } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Telegram SOS Intake",
    description: "Hikers can trigger emergency alerts from Telegram, instantly creating structured incidents for responders.",
  },
  {
    icon: Layers,
    title: "Event-Driven Workflows",
    description: "Every incident event triggers the next action automatically, from intake to assignment and follow-through.",
  },
  {
    icon: Lock,
    title: "Role-Aware Command Access",
    description: "Dispatch, coordinators, and field teams see the right operational view without losing shared context.",
  },
  {
    icon: BarChart3,
    title: "Automated Risk Prioritization",
    description: "Incidents are scored and ranked in real time so critical rescues move to the front immediately.",
  },
  {
    icon: BellRing,
    title: "Escalation & Notifications",
    description: "Workflow rules notify on-call responders and leadership automatically when urgency thresholds are met.",
  },
  {
    icon: Link,
    title: "Live Command Center",
    description: "A single real-time operational picture for incident status, assignments, and cross-team coordination.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function FeatureGrid() {
  return (
    <section className="py-32 px-6 sm:px-12 bg-background">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
            Everything for <br /> rescue coordination.
          </h2>
          <p className="mt-8 max-w-2xl text-xl font-medium tracking-tight leading-relaxed text-muted-foreground">
            Multi-channel alerts, automated triage, and real-time orchestration in one event-driven emergency response platform.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              className="group p-8 rounded-4xl bg-card border border-border shadow-sm hover:shadow-xl transition-all"
            >
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-background border border-border text-foreground transition-transform group-hover:scale-110">
                <f.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {f.title}
              </h3>
              <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
