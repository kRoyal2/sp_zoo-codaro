import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

const HIKER_DOC = v.object({
  _id: v.id("hikers"),
  _creationTime: v.number(),
  telegram_user_id: v.number(),
  telegram_username: v.optional(v.string()),
  status: v.string(),
  description: v.optional(v.string()),
  createdAt: v.number(),
  lastSeenAt: v.optional(v.number()),
});

export const generateUploadUrl = internalMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const upsertHiker = internalMutation({
  args: {
    telegram_user_id: v.number(),
    telegram_username: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.id("hikers"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("hikers")
      .withIndex("by_telegram_user_id", (q) =>
        q.eq("telegram_user_id", args.telegram_user_id)
      )
      .first();

    if (!existing) {
      return await ctx.db.insert("hikers", {
        telegram_user_id: args.telegram_user_id,
        telegram_username: args.telegram_username,
        status: args.status ?? "preparing",
        createdAt: Date.now(),
        lastSeenAt: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, {
      ...(args.telegram_username !== undefined && {
        telegram_username: args.telegram_username,
      }),
      ...(args.status !== undefined && { status: args.status }),
      lastSeenAt: Date.now(),
    });

    return existing._id;
  },
});

export const saveHikerMessage = internalMutation({
  args: {
    hiker_id: v.id("hikers"),
    telegram_user_id: v.number(),
    status_button: v.optional(v.string()),
    message: v.optional(v.string()),
    photoId: v.optional(v.id("_storage")),
    geo_lat: v.optional(v.number()),
    geo_lon: v.optional(v.number()),
  },
  returns: v.id("hiker_messages"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("hiker_messages", {
      ...args,
      datetime: Date.now(),
    });
  },
});

export const savePollOffset = internalMutation({
  args: { offset: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "telegram_poll_offset"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: String(args.offset) });
    } else {
      await ctx.db.insert("settings", {
        key: "telegram_poll_offset",
        value: String(args.offset),
      });
    }
    return null;
  },
});

export const getPollOffset = internalQuery({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const record = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "telegram_poll_offset"))
      .first();
    return record ? Number(record.value) : 0;
  },
});

export const listHikers = query({
  args: {},
  returns: v.array(HIKER_DOC),
  handler: async (ctx) => {
    return await ctx.db.query("hikers").order("desc").collect();
  },
});

export const listHikersLiveTracking = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("hikers"),
      telegram_user_id: v.number(),
      telegram_username: v.optional(v.string()),
      status: v.string(),
      lastSeenAt: v.optional(v.number()),
      geo_lat: v.optional(v.number()),
      geo_lon: v.optional(v.number()),
      geo_updated_at: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const hikers = await ctx.db.query("hikers").order("desc").collect();

    return await Promise.all(
      hikers.map(async (hiker) => {
        const messages = await ctx.db
          .query("hiker_messages")
          .withIndex("by_hiker_and_datetime", (q) => q.eq("hiker_id", hiker._id))
          .order("desc")
          .collect();

        const latestGeo = messages.find(
          (message) => message.geo_lat !== undefined && message.geo_lon !== undefined
        );

        return {
          _id: hiker._id,
          telegram_user_id: hiker.telegram_user_id,
          telegram_username: hiker.telegram_username,
          status: hiker.status,
          lastSeenAt: hiker.lastSeenAt,
          geo_lat: latestGeo?.geo_lat,
          geo_lon: latestGeo?.geo_lon,
          geo_updated_at: latestGeo?.datetime,
        };
      })
    );
  },
});

export const getHiker = query({
  args: { hikerId: v.id("hikers") },
  returns: v.union(HIKER_DOC, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.hikerId);
  },
});

export const listHikerMessages = query({
  args: { hikerId: v.id("hikers") },
  returns: v.array(
    v.object({
      _id: v.id("hiker_messages"),
      _creationTime: v.number(),
      hiker_id: v.id("hikers"),
      telegram_user_id: v.number(),
      status_button: v.optional(v.string()),
      message: v.optional(v.string()),
      photoId: v.optional(v.id("_storage")),
      photoUrl: v.optional(v.string()),
      geo_lat: v.optional(v.number()),
      geo_lon: v.optional(v.number()),
      datetime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("hiker_messages")
      .withIndex("by_hiker_and_datetime", (q) =>
        q.eq("hiker_id", args.hikerId)
      )
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        const photoUrl = msg.photoId
          ? (await ctx.storage.getUrl(msg.photoId)) ?? undefined
          : undefined;
        return { ...msg, photoUrl };
      })
    );
  },
});

export const updateHikerStatus = mutation({
  args: {
    hikerId: v.id("hikers"),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.hikerId, { status: args.status });
    return null;
  },
});
