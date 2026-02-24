import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============= CREATE =============
export const createIncident = mutation({
  args: {
    status: v.string(),
    severity: v.string(),
    description: v.string(),
    reportedBy: v.string(),
    assignedTo: v.optional(v.id("rescueGroup")),
    last_known_location: v.optional(v.string()),
    terrain_type: v.optional(v.string()),
    score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const incidentId = await ctx.db.insert("incidents", {
      status: args.status,
      severity: args.severity,
      description: args.description,
      reportedBy: args.reportedBy,
      assignedTo: args.assignedTo,
      createdAt: now,
      updatedAt: now,
      last_known_location: args.last_known_location,
      terrain_type: args.terrain_type,
      score: args.score ?? 0,
    });
    return incidentId;
  },
});

// ============= READ =============
export const getIncidentById = query({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    const incident = await ctx.db.get(args.incidentId);
    return incident;
  },
});

export const listIncidents = query({
  args: {},
  handler: async (ctx) => {
    const incidents = await ctx.db.query("incidents").order("desc").collect();
    return incidents;
  },
});

export const getIncidentsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const allIncidents = await ctx.db.query("incidents").collect();
    return allIncidents.filter(incident => incident.status === args.status);
  },
});

export const getIncidentsBySeverity = query({
  args: { severity: v.string() },
  handler: async (ctx, args) => {
    const allIncidents = await ctx.db.query("incidents").collect();
    return allIncidents.filter(incident => incident.severity === args.severity);
  },
});

export const getActiveIncidents = query({
  args: {},
  handler: async (ctx) => {
    const allIncidents = await ctx.db.query("incidents").collect();
    return allIncidents.filter(
      incident => incident.status !== "Resolved" && incident.status !== "Closed"
    );
  },
});

export const getIncidentsByRescueGroup = query({
  args: { rescueGroupId: v.id("rescueGroup") },
  handler: async (ctx, args) => {
    const allIncidents = await ctx.db.query("incidents").collect();
    return allIncidents.filter(incident => incident.assignedTo === args.rescueGroupId);
  },
});

export const getUnassignedIncidents = query({
  args: {},
  handler: async (ctx) => {
    const allIncidents = await ctx.db.query("incidents").collect();
    return allIncidents.filter(incident => !incident.assignedTo);
  },
});

// ============= UPDATE =============
export const updateIncident = mutation({
  args: {
    incidentId: v.id("incidents"),
    status: v.optional(v.string()),
    severity: v.optional(v.string()),
    description: v.optional(v.string()),
    reportedBy: v.optional(v.string()),
    assignedTo: v.optional(v.id("rescueGroup")),
    last_known_location: v.optional(v.string()),
    terrain_type: v.optional(v.string()),
    score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { incidentId, ...updates } = args;
    await ctx.db.patch(incidentId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const changeStatus = mutation({
  args: {
    incidentId: v.id("incidents"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const changeLastKnownLocation = mutation({
  args: {
    incidentId: v.id("incidents"),
    last_known_location: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      last_known_location: args.last_known_location,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const updateScore = mutation({
  args: {
    incidentId: v.id("incidents"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      score: args.score,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const assignRescueGroup = mutation({
  args: {
    incidentId: v.id("incidents"),
    rescueGroupId: v.id("rescueGroup"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      assignedTo: args.rescueGroupId,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const unassignRescueGroup = mutation({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      assignedTo: undefined,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// ============= DELETE =============
export const deleteIncident = mutation({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    // Delete related rescue communications
    const comms = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .collect();
    
    for (const comm of comms) {
      await ctx.db.delete(comm._id);
    }
    
    // Delete the incident
    await ctx.db.delete(args.incidentId);
    return { success: true };
  },
});

// ============= ANALYTICS / EXTRA =============
export const getIncidentStats = query({
  args: {},
  handler: async (ctx) => {
    const allIncidents = await ctx.db.query("incidents").collect();
    
    const stats = {
      total: allIncidents.length,
      active: allIncidents.filter(
        i => i.status !== "Resolved" && i.status !== "Closed"
      ).length,
      assigned: allIncidents.filter(i => i.assignedTo).length,
      unassigned: allIncidents.filter(i => !i.assignedTo).length,
      bySeverity: {
        critical: allIncidents.filter(i => i.severity === "critical").length,
        high: allIncidents.filter(i => i.severity === "high").length,
        medium: allIncidents.filter(i => i.severity === "medium").length,
        low: allIncidents.filter(i => i.severity === "low").length,
      },
      averageScore: allIncidents.length > 0
        ? allIncidents.reduce((sum, i) => sum + i.score, 0) / allIncidents.length
        : 0,
    };
    
    return stats;
  },
});

export const getIncidentWithDetails = query({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    const incident = await ctx.db.get(args.incidentId);
    if (!incident) return null;
    
    // Get assigned rescue group
    let rescueGroup = null;
    if (incident.assignedTo) {
      rescueGroup = await ctx.db.get(incident.assignedTo);
    }
    
    // Get rescue communications
    const communications = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .order("desc")
      .collect();
    
    return {
      ...incident,
      rescueGroup,
      communications,
      totalCommunications: communications.length,
    };
  },
});

export const getHighPriorityIncidents = query({
  args: {},
  handler: async (ctx) => {
    const allIncidents = await ctx.db.query("incidents").collect();
    return allIncidents
      .filter(i => i.severity === "critical" || i.severity === "high")
      .filter(i => i.status !== "Resolved" && i.status !== "Closed")
      .sort((a, b) => b.score - a.score);
  },
});

export const getIncidentTimeline = query({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    const incident = await ctx.db.get(args.incidentId);
    if (!incident) return null;
    
    const communications = await ctx.db
      .query("rescue_communications")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .order("asc")
      .collect();
    
    return {
      incident,
      timeline: [
        {
          timestamp: incident.createdAt,
          type: "created",
          description: `Incident created - ${incident.description}`,
        },
        ...communications.map(comm => ({
          timestamp: comm.createdAt,
          type: comm.messageType,
          description: comm.message,
        })),
      ].sort((a, b) => a.timestamp - b.timestamp),
    };
  },
});
