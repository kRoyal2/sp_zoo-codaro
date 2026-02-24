import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============= CREATE =============
export const createRescueGroup = mutation({
  args: {
    name: v.string(),
    contact_info: v.string(),
    availability_status: v.string(), // "available", "busy", "offline"
    current_status: v.string(), // "standby", "deployed", "returning"
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("rescueGroup", {
      name: args.name,
      contact_info: args.contact_info,
      availability_status: args.availability_status,
      current_status: args.current_status,
    });
    return groupId;
  },
});

// ============= READ =============
export const getRescueGroupById = query({
  args: { groupId: v.id("rescueGroup") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    return group;
  },
});

export const listRescueGroups = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("rescueGroup").collect();
    return groups;
  },
});

export const getAvailableRescueGroups = query({
  args: {},
  handler: async (ctx) => {
    const allGroups = await ctx.db.query("rescueGroup").collect();
    return allGroups.filter(group => group.availability_status === "available");
  },
});

export const getRescueGroupsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const allGroups = await ctx.db.query("rescueGroup").collect();
    return allGroups.filter(group => group.current_status === args.status);
  },
});

// ============= UPDATE =============
export const updateRescueGroup = mutation({
  args: {
    groupId: v.id("rescueGroup"),
    name: v.optional(v.string()),
    contact_info: v.optional(v.string()),
    availability_status: v.optional(v.string()),
    current_status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { groupId, ...updates } = args;
    await ctx.db.patch(groupId, updates);
    return { success: true };
  },
});

export const updateAvailabilityStatus = mutation({
  args: {
    groupId: v.id("rescueGroup"),
    availability_status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.groupId, {
      availability_status: args.availability_status,
    });
    return { success: true };
  },
});

export const updateCurrentStatus = mutation({
  args: {
    groupId: v.id("rescueGroup"),
    current_status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.groupId, {
      current_status: args.current_status,
    });
    return { success: true };
  },
});

export const deployRescueGroup = mutation({
  args: {
    groupId: v.id("rescueGroup"),
    incidentId: v.id("incidents"),
  },
  handler: async (ctx, args) => {
    // Update rescue group status
    await ctx.db.patch(args.groupId, {
      availability_status: "busy",
      current_status: "deployed",
    });
    
    // Assign rescue group to incident
    await ctx.db.patch(args.incidentId, {
      assignedTo: args.groupId,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

export const returnRescueGroup = mutation({
  args: { groupId: v.id("rescueGroup") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.groupId, {
      availability_status: "available",
      current_status: "standby",
    });
    return { success: true };
  },
});

// ============= DELETE =============
export const deleteRescueGroup = mutation({
  args: { groupId: v.id("rescueGroup") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.groupId);
    return { success: true };
  },
});

// ============= ANALYTICS / EXTRA =============
export const getRescueGroupStats = query({
  args: {},
  handler: async (ctx) => {
    const allGroups = await ctx.db.query("rescueGroup").collect();
    
    const stats = {
      total: allGroups.length,
      available: allGroups.filter(g => g.availability_status === "available").length,
      busy: allGroups.filter(g => g.availability_status === "busy").length,
      offline: allGroups.filter(g => g.availability_status === "offline").length,
      deployed: allGroups.filter(g => g.current_status === "deployed").length,
      standby: allGroups.filter(g => g.current_status === "standby").length,
      returning: allGroups.filter(g => g.current_status === "returning").length,
    };
    
    return stats;
  },
});

export const getGroupIncidents = query({
  args: { groupId: v.id("rescueGroup") },
  handler: async (ctx, args) => {
    const allIncidents = await ctx.db.query("incidents").collect();
    return allIncidents.filter(incident => incident.assignedTo === args.groupId);
  },
});
