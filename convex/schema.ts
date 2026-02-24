import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),

  // Worker profiles with extended information
  workers: defineTable({
    userId: v.id("users"), // Link to auth users table
    name: v.string(),
    surname: v.string(),
    department: v.string(),
    position: v.string(),
    status: v.string(), // "active", "inactive", "pending"
    hireDate: v.number(), // timestamp
  }).index("by_user", ["userId"]),

  // Manager passwords for signup verification
  managerPasswords: defineTable({
    password: v.string(), // Hashed password
    department: v.string(),
    name: v.string(), // Manager name for reference
    isActive: v.boolean(),
  }),
});