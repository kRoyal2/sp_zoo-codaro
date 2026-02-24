import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentOrganization = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.organizationId) return null;
    return await ctx.db.get(user.organizationId);
  },
});

export const createWorkspace = mutation({
  args: {
    name: v.string(),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("User must be authenticated to create a workspace");
    }

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      industry: args.industry,
      teamSize: args.teamSize,
      ownerId: userId,
      createdAt: Date.now(),
    });

    await ctx.db.patch(userId, {
      organizationId: organizationId,
      role: "owner",
    });

    return organizationId;
  },
});
