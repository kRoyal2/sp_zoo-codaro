import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";



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

  hiker: defineTable({
    name: v.string(),
    age: v.number(),
    height: v.number(),
    weight: v.number(),
    experienceLevel: v.string(),
    contactInfo: v.string(),
    status: v.string(), // In way, Lost, Finished 
  }),

  checkin: defineTable({
    hikerId: v.id("hiker"),
    geolocation: v.string(),
    message: v.optional(v.string()),
    datetime: v.number(),
  }).index("by_hiker", ["hikerId"]),


  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.string(),
    stage: v.string(),
    score: v.number(),
    tags: v.array(v.string()),
    lastContact: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    ownerId: v.optional(v.string()),
  })
    .index("by_stage", ["stage"])
    .index("by_owner", ["ownerId"]),

  deals: defineTable({
    title: v.string(),
    contactId: v.id("contacts"),
    value: v.number(),
    stage: v.string(),
    probability: v.number(),
    expectedClose: v.number(),
    notes: v.optional(v.string()),
    ownerId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_stage", ["stage"])
    .index("by_contact", ["contactId"])
    .index("by_owner", ["ownerId"]),

  pipeline_comments: defineTable({
    dealId: v.id("deals"),
    comment: v.string(),
    addedBy: v.string(), // User name or ID
    createdAt: v.number(),
  }).index("by_deal", ["dealId"]),

  incidents: defineTable({
    status: v.string(),
    severity: v.string(),
    description: v.string(),
    reportedBy: v.string(),
    assignedTo: v.optional(v.id('rescueGroup')),
    createdAt: v.number(),
    updatedAt: v.number(),
    last_known_location: v.optional(v.string()),
    terrain_type: v.optional(v.string()),
    score: v.number(),
  }),

  rescueGroup: defineTable({
    name: v.string(),
    contact_info: v.string(),
    availability_status: v.string(),
    current_status: v.string(),
  }),

  // Internal rescue team communications
  rescue_communications: defineTable({
    incidentId: v.id("incidents"),
    rescueGroupId: v.id("rescueGroup"),
    message: v.string(),
    messageType: v.string(), // "status_update", "request", "coordinate"
    createdAt: v.number(),
  }).index("by_incident", ["incidentId"])
    .index("by_group", ["rescueGroupId"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.string(),
    status: v.string(),
    assignedTo: v.string(),
    relatedTo: v.optional(v.string()),
    relatedId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_assignee", ["assignedTo"]),

  onboarding_clients: defineTable({
    name: v.string(),
    email: v.string(),
    templateId: v.optional(v.id("onboarding_templates")),
    progress: v.number(),
    steps: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        done: v.boolean(),
      })
    ),
    ownerId: v.optional(v.string()),
    startedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  onboarding_templates: defineTable({
    name: v.string(),
    industry: v.string(),
    steps: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        done: v.boolean(),
      })
    ),
  }).index("by_industry", ["industry"]),

  analytics_events: defineTable({
    type: v.string(),
    entityId: v.optional(v.string()),
    entityType: v.string(),
    value: v.optional(v.number()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  automations: defineTable({
    name: v.string(),
    trigger: v.string(),
    webhookUrl: v.string(),
    lastRun: v.optional(v.number()),
    enabled: v.boolean(),
  }),

  workers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    surname: v.string(),
    department: v.string(),
    position: v.string(),
    status: v.string(),
    hireDate: v.number(),
  }).index("by_user", ["userId"]),

  managerPasswords: defineTable({
    password: v.string(),
    department: v.string(),
    name: v.string(),
    isActive: v.boolean(),
  }),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});