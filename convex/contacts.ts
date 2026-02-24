import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============= CONTACTS =============
export const listContacts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").order("desc").collect();
  },
});

export const getContact = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.string(),
    stage: v.string(),
    score: v.number(),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contacts", {
      ...args,
      lastContact: Date.now(),
      createdAt: Date.now(),
    });
    await ctx.db.insert("analytics_events", {
      type: "contact_created",
      entityId: id,
      entityType: "contact",
      timestamp: Date.now(),
    });
    return id;
  },
});

export const updateContact = mutation({
  args: {
    id: v.id("contacts"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    stage: v.optional(v.string()),
    score: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    lastContact: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteContact = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const appendContactNote = mutation({
  args: {
    id: v.id("contacts"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) throw new Error("Contact not found");
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${args.note}`;
    const existing = contact.notes ?? "";
    await ctx.db.patch(args.id, {
      notes: existing ? `${existing}\n${newNote}` : newNote,
      lastContact: Date.now(),
    });
  },
});

export const getContactDeals = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deals")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
  },
});

export const getContactTasks = query({
  args: { contactId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("relatedId"), args.contactId))
      .collect();
  },
});
