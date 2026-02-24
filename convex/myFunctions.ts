import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const verifyManagerPassword = mutation({
  args: {
    password: v.string(),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    const manager = await ctx.db
      .query("managerPasswords")
      .filter((q) => q.and(
        q.eq(q.field("department"), args.department),
        q.eq(q.field("isActive"), true)
      ))
      .first();

    if (!manager) {
      throw new Error("Invalid department or manager password");
    }

    if (manager.password !== args.password) {
      throw new Error("Invalid manager password");
    }

    return { success: true, managerName: manager.name };
  },
});

export const createWorkerProfile = mutation({
  args: {
    name: v.string(),
    surname: v.string(),
    department: v.string(),
    position: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const existingWorker = await ctx.db
      .query("workers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingWorker) {
      throw new Error("Worker profile already exists");
    }

    const workerId = await ctx.db.insert("workers", {
      userId,
      name: args.name,
      surname: args.surname,
      department: args.department,
      position: args.position,
      status: "active",
      hireDate: Date.now(),
    });

    return workerId;
  },
});

export const getCurrentWorker = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const worker = await ctx.db
      .query("workers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!worker) {
      return null;
    }

    const user = await ctx.db.get(userId);

    return {
      ...worker,
      email: user?.email,
    };
  },
});

export const listWorkers = query({
  args: {},
  handler: async (ctx) => {
    const workers = await ctx.db.query("workers").collect();

    const workersWithEmails = await Promise.all(
      workers.map(async (worker) => {
        const user = await ctx.db.get(worker.userId);
        return {
          ...worker,
          email: user?.email,
        };
      })
    );

    return workersWithEmails;
  },
});

export const createManagerPassword = mutation({
  args: {
    password: v.string(),
    department: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("managerPasswords", {
      password: args.password,
      department: args.department,
      name: args.name,
      isActive: true,
    });
    return id;
  },
});

export const listNumbers = query({
  args: {
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const numbers = await ctx.db
      .query("numbers")
      .order("desc")
      .take(args.count);
    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);
    return {
      viewer: user?.email ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

export const addNumber = mutation({
  args: {
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("numbers", { value: args.value });
    console.log("Added new document with id:", id);
  },
});
