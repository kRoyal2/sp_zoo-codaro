import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listRecentEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("analytics_events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getEventsByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analytics_events")
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();
  },
});

export const logEvent = mutation({
  args: {
    type: v.string(),
    entityId: v.optional(v.string()),
    entityType: v.string(),
    value: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analytics_events", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contacts").collect();
    const deals = await ctx.db.query("deals").collect();
    const tasks = await ctx.db.query("tasks").collect();
    const onboardingClients = await ctx.db.query("onboarding_clients").collect();

    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const openDeals = deals.filter((d) => d.stage !== "Closed Won");
    const openDealsValue = openDeals.reduce((sum, d) => sum + d.value, 0);
    const tasksDueToday = tasks.filter(
      (t) =>
        t.dueDate >= todayStart.getTime() &&
        t.dueDate <= todayEnd.getTime() &&
        t.status !== "Done"
    );
    const onboardingInProgress = onboardingClients.filter(
      (c) => c.progress > 0 && c.progress < 100
    );

    // Deals per stage
    const dealsByStage: Record<string, number> = {};
    for (const deal of deals) {
      dealsByStage[deal.stage] = (dealsByStage[deal.stage] ?? 0) + 1;
    }

    return {
      totalContacts: contacts.length,
      openDealsValue,
      openDealsCount: openDeals.length,
      tasksDueToday: tasksDueToday.length,
      onboardingInProgress: onboardingInProgress.length,
      dealsByStage,
    };
  },
});

export const getContactsPerDay = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days ?? 30;
    const since = Date.now() - days * 86400000;
    const events = await ctx.db
      .query("analytics_events")
      .withIndex("by_timestamp")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "contact_created"),
          q.gte(q.field("timestamp"), since)
        )
      )
      .collect();

    const byDay: Record<string, number> = {};
    for (const e of events) {
      const day = new Date(e.timestamp).toISOString().split("T")[0];
      byDay[day] = (byDay[day] ?? 0) + 1;
    }
    return Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getDealsByStageStats = query({
  args: {},
  handler: async (ctx) => {
    const deals = await ctx.db.query("deals").collect();
    const byStage: Record<string, number> = {};
    for (const deal of deals) {
      byStage[deal.stage] = (byStage[deal.stage] ?? 0) + 1;
    }
    return Object.entries(byStage).map(([stage, count]) => ({ stage, count }));
  },
});

export const getTasksByStatus = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const byStatus: Record<string, number> = {};
    for (const task of tasks) {
      byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
    }
    return Object.entries(byStatus).map(([status, count]) => ({
      status,
      count,
    }));
  },
});

export const getOnboardingByTemplate = query({
  args: {},
  handler: async (ctx) => {
    const clients = await ctx.db.query("onboarding_clients").collect();
    const result: Record<string, { total: number; completed: number }> = {};
    for (const client of clients) {
      const key = client.templateId ?? "No Template";
      if (!result[key]) result[key] = { total: 0, completed: 0 };
      result[key].total++;
      if (client.progress === 100) result[key].completed++;
    }
    const templates = await ctx.db.query("onboarding_templates").collect();
    return Object.entries(result).map(([id, stats]) => {
      const template = templates.find((t) => t._id === id);
      return {
        name: template?.name ?? "No Template",
        industry: template?.industry ?? "Unknown",
        ...stats,
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      };
    });
  },
});
