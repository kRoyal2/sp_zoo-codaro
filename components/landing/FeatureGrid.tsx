"use client";

import { motion } from "framer-motion";
import { Zap, Layers, Lock, BarChart3, BellRing, Link } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Every update is reflected instantly across your entire team. Zero lag, zero drift.",
  },
  {
    icon: Layers,
    title: "Modular Architecture",
    description: "Enable only what your team needs. Every module is purpose-built for serious ops.",
  },
  {
    icon: Lock,
    title: "Role-Based Access",
    description: "Granular permissions so the right people see the right data, nothing more.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Live dashboards and historical trends — built in, no third-party needed.",
  },
  {
    icon: BellRing,
    title: "Smart Alerts",
    description: "Define thresholds. Get notified before issues become incidents. Stay ahead.",
  },
  {
    icon: Link,
    title: "API-First",
    description: "Integrate with anything. REST and webhooks ready out of the box.",
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
            Everything your <br /> ops team needs.
          </h2>
          <p className="mt-8 max-w-2xl text-xl font-medium tracking-tight leading-relaxed text-muted-foreground">
            No bloat. No compromise. Six core capabilities that work together seamlessly to handle massive scale.
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
