import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const addComment = mutation({
  args: {
    dealId: v.id("deals"),
    comment: v.string(),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("pipeline_comments", {
      dealId: args.dealId,
      comment: args.comment,
      addedBy: args.addedBy,
      createdAt: Date.now(),
    });
    return commentId;
  },
});

export const getCommentsByDeal = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("pipeline_comments")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .order("desc")
      .collect();
    return comments;
  },
});