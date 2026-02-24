import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============= CREATE =============
export const createCheckIn = mutation({
  args: {
    hikerId: v.id("hiker"),
    geolocation: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const checkInId = await ctx.db.insert("checkin", {
      hikerId: args.hikerId,
      geolocation: args.geolocation,
      message: args.message,
      datetime: Date.now(),
    });
    return checkInId;
  },
});

// ============= READ =============
export const getCheckInById = query({
  args: { checkInId: v.id("checkin") },
  handler: async (ctx, args) => {
    const checkIn = await ctx.db.get(args.checkInId);
    return checkIn;
  },
});

export const getCheckInsByHiker = query({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .order("desc")
      .collect();
    return checkIns;
  },
});

export const getLatestCheckInByHiker = query({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .order("desc")
      .take(1);
    return checkIns[0] || null;
  },
});

export const getRecentCheckIns = query({
  args: { 
    hikerId: v.id("hiker"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .order("desc")
      .take(args.limit ?? 10);
    return checkIns;
  },
});

export const listAllCheckIns = query({
  args: {},
  handler: async (ctx) => {
    const checkIns = await ctx.db.query("checkin").order("desc").collect();
    return checkIns;
  },
});

export const getCheckInsInTimeRange = query({
  args: {
    hikerId: v.id("hiker"),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .collect();
    
    return checkIns.filter(
      c => c.datetime >= args.startTime && c.datetime <= args.endTime
    );
  },
});

// ============= UPDATE =============
export const updateCheckIn = mutation({
  args: {
    checkInId: v.id("checkin"),
    geolocation: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { checkInId, ...updates } = args;
    await ctx.db.patch(checkInId, updates);
    return { success: true };
  },
});

// ============= DELETE =============
export const deleteCheckIn = mutation({
  args: { checkInId: v.id("checkin") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.checkInId);
    return { success: true };
  },
});

export const deleteCheckInsByHiker = mutation({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .collect();
    
    for (const checkIn of checkIns) {
      await ctx.db.delete(checkIn._id);
    }
    
    return { success: true, deleted: checkIns.length };
  },
});

// ============= ANALYTICS / EXTRA =============
export const getCheckInStats = query({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .collect();
    
    if (checkIns.length === 0) {
      return {
        total: 0,
        withMessage: 0,
        firstCheckIn: null,
        lastCheckIn: null,
        averageTimeBetweenCheckIns: 0,
      };
    }
    
    const sorted = checkIns.sort((a, b) => a.datetime - b.datetime);
    const withMessage = checkIns.filter(c => c.message).length;
    
    let totalTimeDiff = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalTimeDiff += sorted[i].datetime - sorted[i - 1].datetime;
    }
    
    const averageTimeBetweenCheckIns = sorted.length > 1
      ? totalTimeDiff / (sorted.length - 1)
      : 0;
    
    return {
      total: checkIns.length,
      withMessage,
      firstCheckIn: sorted[0],
      lastCheckIn: sorted[sorted.length - 1],
      averageTimeBetweenCheckIns: averageTimeBetweenCheckIns / (60 * 60 * 1000), // in hours
    };
  },
});

export const getCheckInsWithHikerInfo = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("checkin")
      .order("desc")
      .take(args.limit ?? 50);
    
    const checkInsWithHiker = await Promise.all(
      checkIns.map(async (checkIn) => {
        const hiker = await ctx.db.get(checkIn.hikerId);
        return {
          ...checkIn,
          hikerName: hiker?.name || "Unknown",
          hikerStatus: hiker?.status || "Unknown",
        };
      })
    );
    
    return checkInsWithHiker;
  },
});

export const getTodayCheckIns = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    
    const allCheckIns = await ctx.db.query("checkin").collect();
    return allCheckIns.filter(
      c => c.datetime >= startOfDay && c.datetime < endOfDay
    );
  },
});

export const getCheckInRoute = query({
  args: { hikerId: v.id("hiker") },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("checkin")
      .withIndex("by_hiker", (q) => q.eq("hikerId", args.hikerId))
      .order("asc")
      .collect();
    
    return checkIns.map(c => ({
      geolocation: c.geolocation,
      datetime: c.datetime,
      message: c.message,
    }));
  },
});

export const getHikersWithoutRecentCheckIn = query({
  args: { hoursThreshold: v.number() },
  handler: async (ctx, args) => {
    const allHikers = await ctx.db.query("hiker").collect();
    const now = Date.now();
    const thresholdTime = now - (args.hoursThreshold * 60 * 60 * 1000);
    
    const result = [];
    
    for (const hiker of allHikers) {
      if (hiker.status !== "In way") continue;
      
      const lastCheckIn = await ctx.db
        .query("checkin")
        .withIndex("by_hiker", (q) => q.eq("hikerId", hiker._id))
        .order("desc")
        .take(1);
      
      if (lastCheckIn.length === 0 || lastCheckIn[0].datetime < thresholdTime) {
        result.push({
          hiker,
          lastCheckIn: lastCheckIn[0] || null,
          hoursSinceLastCheckIn: lastCheckIn[0]
            ? (now - lastCheckIn[0].datetime) / (60 * 60 * 1000)
            : null,
        });
      }
    }
    
    return result;
  },
});
