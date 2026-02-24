import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============= ONBOARDING TEMPLATES =============
export const listTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("onboarding_templates").collect();
  },
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    industry: v.string(),
    steps: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        done: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("onboarding_templates", args);
  },
});

export const updateTemplate = mutation({
  args: {
    id: v.id("onboarding_templates"),
    name: v.optional(v.string()),
    industry: v.optional(v.string()),
    steps: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
          done: v.boolean(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteTemplate = mutation({
  args: { id: v.id("onboarding_templates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============= ONBOARDING CLIENTS =============
export const listOnboardingClients = query({
  args: {},
  handler: async (ctx) => {
    const clients = await ctx.db.query("onboarding_clients").collect();
    const withTemplates = await Promise.all(
      clients.map(async (c) => {
        const template = c.templateId
          ? await ctx.db.get(c.templateId)
          : null;
        return { ...c, templateName: template?.name ?? null };
      })
    );
    return withTemplates;
  },
});

export const createOnboardingClient = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    templateId: v.optional(v.id("onboarding_templates")),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let steps: { title: string; description: string; done: boolean }[] = [];
    if (args.templateId) {
      const template = await ctx.db.get(args.templateId);
      if (template) {
        steps = template.steps.map((s) => ({ ...s, done: false }));
      }
    }
    return await ctx.db.insert("onboarding_clients", {
      name: args.name,
      email: args.email,
      templateId: args.templateId,
      progress: 0,
      steps,
      ownerId: args.ownerId,
      startedAt: Date.now(),
    });
  },
});

export const updateOnboardingClientStep = mutation({
  args: {
    id: v.id("onboarding_clients"),
    stepIndex: v.number(),
    done: v.boolean(),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    const steps = [...client.steps];
    steps[args.stepIndex] = { ...steps[args.stepIndex], done: args.done };
    const doneCount = steps.filter((s) => s.done).length;
    const progress = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;
    await ctx.db.patch(args.id, { steps, progress });
    await ctx.db.insert("analytics_events", {
      type: "onboarding_step_completed",
      entityId: args.id,
      entityType: "onboarding_client",
      value: progress,
      timestamp: Date.now(),
    });
    if (progress === 100) {
      await ctx.db.insert("analytics_events", {
        type: "onboarding_completed",
        entityId: args.id,
        entityType: "onboarding_client",
        value: 100,
        timestamp: Date.now(),
      });
    }
  },
});

export const assignTemplate = mutation({
  args: {
    clientId: v.id("onboarding_clients"),
    templateId: v.id("onboarding_templates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    const steps = template.steps.map((s) => ({ ...s, done: false }));
    await ctx.db.patch(args.clientId, {
      templateId: args.templateId,
      steps,
      progress: 0,
    });
  },
});

export const deleteOnboardingClient = mutation({
  args: { id: v.id("onboarding_clients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
