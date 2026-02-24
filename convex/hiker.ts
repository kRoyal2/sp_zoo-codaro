import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============= CREATE =============
export const createHiker = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    height: v.number(),
    weight: v.number(),
    experienceLevel: v.string(), // "beginner", "intermediate", "advanced", "expert"
    contactInfo: v.string(),
    status: v.string(), // "In way", "Lost", "Finished"
  },
  handler: async (ctx, args) => {
    const hikerId = await ctx.db.insert("hiker", {
      name: args.name,
      age: args.age,
      height: args.height,
      weight: args.weight,
      experienceLevel: args.experienceLevel,
      contactInfo: args.contactInfo,
      status: args.status,
    });
    return hikerId;
  },
});

// ============= READ =============
export const getHikerById = query({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    const hiker = await ctx.db.get(args.hikerId);
    return hiker;
  },
});

export const listHikers = query({
  args: {},
  handler: async (ctx) => {
    const hikers = await ctx.db.query("hiker").collect();
    return hikers;
  },
});

export const getHikersByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const allHikers = await ctx.db.query("hiker").collect();
    return allHikers.filter(hiker => hiker.status === args.status);
  },
});

export const getLostHikers = query({
  args: {},
  handler: async (ctx) => {
    const allHikers = await ctx.db.query("hiker").collect();
    return allHikers.filter(hiker => hiker.status === "Lost");
  },
});

export const getActiveHikers = query({
  args: {},
  handler: async (ctx) => {
    const allHikers = await ctx.db.query("hiker").collect();
    return allHikers.filter(hiker => hiker.status === "In way");
  },
});

export const getHikersByExperience = query({
  args: { experienceLevel: v.string() },
  handler: async (ctx, args) => {
    const allHikers = await ctx.db.query("hiker").collect();
    return allHikers.filter(hiker => hiker.experienceLevel === args.experienceLevel);
  },
});

// ============= UPDATE =============
export const updateHiker = mutation({
  args: {
    hikerId: v.id("hiker"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    experienceLevel: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { hikerId, ...updates } = args;
    await ctx.db.patch(hikerId, updates);
    return { success: true };
  },
});

export const updateHikerStatus = mutation({
  args: {
    hikerId: v.id("hiker"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.hikerId, {
      status: args.status,
    });
    return { success: true };
  },
});

export const markHikerAsLost = mutation({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.hikerId, {
      status: "Lost",
    });
    return { success: true };
  },
});

export const markHikerAsFinished = mutation({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.hikerId, {
      status: "Finished",
    });
    return { success: true };
  },
});

// ============= DELETE =============
export const deleteHiker = mutation({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    // Delete all check-ins for this hiker
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .collect();
    
    for (const checkIn of checkIns) {
      await ctx.db.delete(checkIn._id);
    }
    
    // Delete the hiker
    await ctx.db.delete(args.hikerId);
    return { success: true };
  },
});

// ============= ANALYTICS / EXTRA =============
export const getHikerStats = query({
  args: {},
  handler: async (ctx) => {
    const allHikers = await ctx.db.query("hiker").collect();
    
    const stats = {
      total: allHikers.length,
      inWay: allHikers.filter(h => h.status === "In way").length,
      lost: allHikers.filter(h => h.status === "Lost").length,
      finished: allHikers.filter(h => h.status === "Finished").length,
      beginner: allHikers.filter(h => h.experienceLevel === "beginner").length,
      intermediate: allHikers.filter(h => h.experienceLevel === "intermediate").length,
      advanced: allHikers.filter(h => h.experienceLevel === "advanced").length,
      expert: allHikers.filter(h => h.experienceLevel === "expert").length,
      averageAge: allHikers.length > 0 
        ? allHikers.reduce((sum, h) => sum + h.age, 0) / allHikers.length 
        : 0,
    };
    
    return stats;
  },
});

export const getHikerWithCheckIns = query({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    const hiker = await ctx.db.get(args.hikerId);
    if (!hiker) return null;
    
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .order("desc")
      .collect();
    
    return {
      ...hiker,
      checkIns,
      totalCheckIns: checkIns.length,
      lastCheckIn: checkIns[0] || null,
    };
  },
});

export const getHikersNeedingAttention = query({
  args: { hoursWithoutCheckIn: v.number() },
  handler: async (ctx, args) => {
    const allHikers = await ctx.db.query("hiker").collect();
    const now = Date.now();
    const thresholdTime = now - (args.hoursWithoutCheckIn * 60 * 60 * 1000);
    
    const hikersNeedingAttention = [];
    
    for (const hiker of allHikers) {
      if (hiker.status !== "In way") continue;
      
      const checkIns = await ctx.db
        .query("checkin")
        .withIndex("by_hiker", (q) => q.eq("hikerId", hiker._id))
        .order("desc")
        .take(1);
      
      if (checkIns.length === 0 || checkIns[0].datetime < thresholdTime) {
        hikersNeedingAttention.push({
          ...hiker,
          lastCheckIn: checkIns[0] || null,
          hoursSinceLastCheckIn: checkIns[0] 
            ? (now - checkIns[0].datetime) / (60 * 60 * 1000)
            : null,
        });
      }
    }
    
    return hikersNeedingAttention;
  },
});
