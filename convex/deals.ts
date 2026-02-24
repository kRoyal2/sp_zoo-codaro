import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============= DEALS =============
export const listDeals = query({
  args: {},
  handler: async (ctx) => {
    const deals = await ctx.db.query("deals").order("desc").collect();
    // Attach contact name
    const dealsWithContactName = await Promise.all(
      deals.map(async (deal) => {
        const contact = await ctx.db.get(deal.contactId);
        return { ...deal, contactName: contact?.name ?? "Unknown" };
      })
    );
    return dealsWithContactName;
  },
});

export const getDealsByStage = query({
  args: { stage: v.string() },
  handler: async (ctx, args) => {
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_stage", (q) => q.eq("stage", args.stage))
      .collect();
    const dealsWithContactName = await Promise.all(
      deals.map(async (deal) => {
        const contact = await ctx.db.get(deal.contactId);
        return { ...deal, contactName: contact?.name ?? "Unknown" };
      })
    );
    return dealsWithContactName;
  },
});

export const createDeal = mutation({
  args: {
    title: v.string(),
    contactId: v.id("contacts"),
    value: v.number(),
    stage: v.string(),
    probability: v.number(),
    expectedClose: v.number(),
    notes: v.optional(v.string()),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("deals", {
      ...args,
      createdAt: Date.now(),
    });
    await ctx.db.insert("analytics_events", {
      type: "deal_created",
      entityId: id,
      entityType: "deal",
      value: args.value,
      timestamp: Date.now(),
    });
    return id;
  },
});

export const updateDeal = mutation({
  args: {
    id: v.id("deals"),
    title: v.optional(v.string()),
    contactId: v.optional(v.id("contacts")),
    value: v.optional(v.number()),
    stage: v.optional(v.string()),
    probability: v.optional(v.number()),
    expectedClose: v.optional(v.number()),
    notes: v.optional(v.string()),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const prev = await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    if (updates.stage && prev?.stage !== updates.stage) {
      await ctx.db.insert("analytics_events", {
        type: "deal_stage_changed",
        entityId: id,
        entityType: "deal",
        timestamp: Date.now(),
      });
    }
  },
});

export const deleteDeal = mutation({
  args: { id: v.id("deals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
