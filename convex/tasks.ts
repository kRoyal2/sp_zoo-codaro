import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.string(),
    status: v.string(),
    assignedTo: v.string(),
    relatedTo: v.optional(v.string()),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("tasks", {
      ...args,
      createdAt: Date.now(),
    });
    await ctx.db.insert("analytics_events", {
      type: "task_created",
      entityId: id,
      entityType: "task",
      timestamp: Date.now(),
    });
    return id;
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    relatedTo: v.optional(v.string()),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const prev = await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    if (updates.status === "Done" && prev?.status !== "Done") {
      await ctx.db.insert("analytics_events", {
        type: "task_completed",
        entityId: id,
        entityType: "task",
        timestamp: Date.now(),
      });
    }
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
