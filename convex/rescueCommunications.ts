import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============= CREATE =============
export const createRescueCommunication = mutation({
  args: {
    incidentId: v.id("incidents"),
    rescueGroupId: v.id("rescueGroup"),
    message: v.string(),
    messageType: v.string(), // "status_update", "request", "coordinate"
  },
  handler: async (ctx, args) => {
    const commId = await ctx.db.insert("rescue_communications", {
      incidentId: args.incidentId,
      rescueGroupId: args.rescueGroupId,
      message: args.message,
      messageType: args.messageType,
      createdAt: Date.now(),
    });
    return commId;
  },
});

// ============= READ =============
export const getCommunicationById = query({
  args: { commId: v.id("rescue_communications") },
  handler: async (ctx, args) => {
    const comm = await ctx.db.get(args.commId);
    return comm;
  },
});

export const getCommunicationsByIncident = query({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .order("desc")
      .collect();
    return comms;
  },
});

export const getCommunicationsByGroup = query({
  args: { rescueGroupId: v.id("rescueGroup") },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_group", (q) => q.eq("rescueGroupId", args.rescueGroupId))
      .order("desc")
      .collect();
    return comms;
  },
});

export const getCommunicationsByType = query({
  args: { 
    incidentId: v.id("incidents"),
    messageType: v.string(),
  },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .collect();
    return comms.filter(comm => comm.messageType === args.messageType);
  },
});

export const getLatestCommunications = query({
  args: { 
    incidentId: v.id("incidents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .order("desc")
      .take(args.limit ?? 10);
    return comms;
  },
});

export const getGroupLatestCommunications = query({
  args: { 
    rescueGroupId: v.id("rescueGroup"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_group", (q) => q.eq("rescueGroupId", args.rescueGroupId))
      .order("desc")
      .take(args.limit ?? 10);
    return comms;
  },
});

export const listAllCommunications = query({
  args: {},
  handler: async (ctx) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .order("desc")
      .collect();
    return comms;
  },
});

// ============= UPDATE =============
export const updateCommunication = mutation({
  args: {
    commId: v.id("rescue_communications"),
    message: v.optional(v.string()),
    messageType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { commId, ...updates } = args;
    await ctx.db.patch(commId, updates);
    return { success: true };
  },
});

// ============= DELETE =============
export const deleteCommunication = mutation({
  args: { commId: v.id("rescue_communications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.commId);
    return { success: true };
  },
});

export const deleteCommunicationsByIncident = mutation({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .collect();
    
    for (const comm of comms) {
      await ctx.db.delete(comm._id);
    }
    
    return { success: true, deleted: comms.length };
  },
});

export const deleteCommunicationsByGroup = mutation({
  args: { rescueGroupId: v.id("rescueGroup") },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_group", (q) => q.eq("rescueGroupId", args.rescueGroupId))
      .collect();
    
    for (const comm of comms) {
      await ctx.db.delete(comm._id);
    }
    
    return { success: true, deleted: comms.length };
  },
});

// ============= ANALYTICS / EXTRA =============
export const getCommunicationStats = query({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .collect();
    
    const stats = {
      total: comms.length,
      statusUpdates: comms.filter(c => c.messageType === "status_update").length,
      requests: comms.filter(c => c.messageType === "request").length,
      coordinates: comms.filter(c => c.messageType === "coordinate").length,
      groupsInvolved: new Set(comms.map(c => c.rescueGroupId)).size,
    };
    
    return stats;
  },
});

export const getGroupCommunicationStats = query({
  args: { rescueGroupId: v.id("rescueGroup") },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_group", (q) => q.eq("rescueGroupId", args.rescueGroupId))
      .collect();
    
    const stats = {
      total: comms.length,
      statusUpdates: comms.filter(c => c.messageType === "status_update").length,
      requests: comms.filter(c => c.messageType === "request").length,
      coordinates: comms.filter(c => c.messageType === "coordinate").length,
      incidentsInvolved: new Set(comms.map(c => c.incidentId)).size,
    };
    
    return stats;
  },
});

export const getIncidentGroupCommunications = query({
  args: { 
    incidentId: v.id("incidents"),
    rescueGroupId: v.id("rescueGroup"),
  },
  handler: async (ctx, args) => {
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .collect();
    return comms.filter(comm => comm.rescueGroupId === args.rescueGroupId);
  },
});
