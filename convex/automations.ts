import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listAutomations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("automations").collect();
  },
});

export const createAutomation = mutation({
  args: {
    name: v.string(),
    trigger: v.string(),
    webhookUrl: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("automations", {
      ...args,
      lastRun: undefined,
    });
  },
});

export const updateAutomation = mutation({
  args: {
    id: v.id("automations"),
    name: v.optional(v.string()),
    trigger: v.optional(v.string()),
    webhookUrl: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    lastRun: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteAutomation = mutation({
  args: { id: v.id("automations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
