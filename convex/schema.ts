import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  users: defineTable({
    ...authTables.users.validator.fields,
    organizationId: v.optional(v.id("organizations")),
    role: v.optional(v.string()), // "owner", etc.
  }).index("email", ["email"]).index("phone", ["phone"]),
  
  organizations: defineTable({
    name: v.string(),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    ownerId: v.id("users"),
    createdAt: v.number(),
  }),

  numbers: defineTable({
    value: v.number(),
  }),
});
