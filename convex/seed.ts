import { mutation, query } from "./_generated/server";

export const isSeeded = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contacts").take(1);
    return contacts.length > 0;
  },
});

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingContacts = await ctx.db.query("contacts").take(1);
    if (existingContacts.length > 0) return { message: "Already seeded" };

    const now = Date.now();

    // Seed contacts
    const contactIds = await Promise.all([
      ctx.db.insert("contacts", {
        name: "Sarah Johnson",
        email: "sarah@techcorp.com",
        phone: "+1-555-0101",
        company: "TechCorp Inc.",
        stage: "Qualified",
        score: 85,
        tags: ["hot", "enterprise"],
        lastContact: now - 2 * 86400000,
        notes: "[2026-01-15T10:00:00.000Z] Initial call went well. They are interested in our Premium plan.",
        createdAt: now - 10 * 86400000,
      }),
      ctx.db.insert("contacts", {
        name: "Mike Chen",
        email: "mike@startup.io",
        phone: "+1-555-0102",
        company: "Startup.io",
        stage: "Lead",
        score: 45,
        tags: ["startup", "warm"],
        lastContact: now - 5 * 86400000,
        notes: "[2026-01-20T14:00:00.000Z] Reached out via LinkedIn. Following up next week.",
        createdAt: now - 8 * 86400000,
      }),
      ctx.db.insert("contacts", {
        name: "Emily Davis",
        email: "emily@globalretail.com",
        phone: "+1-555-0103",
        company: "Global Retail Co.",
        stage: "Proposal",
        score: 72,
        tags: ["retail", "medium"],
        lastContact: now - 1 * 86400000,
        notes: "[2026-02-01T09:00:00.000Z] Sent proposal. Waiting for decision from board.",
        createdAt: now - 15 * 86400000,
      }),
      ctx.db.insert("contacts", {
        name: "James Wilson",
        email: "james@financeplus.com",
        phone: "+1-555-0104",
        company: "Finance Plus",
        stage: "Negotiation",
        score: 91,
        tags: ["finance", "enterprise", "hot"],
        lastContact: now - 86400000,
        notes: "[2026-02-10T16:00:00.000Z] In final negotiation. Contract review in progress.",
        createdAt: now - 20 * 86400000,
      }),
      ctx.db.insert("contacts", {
        name: "Lisa Park",
        email: "lisa@mediasolutions.com",
        phone: "+1-555-0105",
        company: "Media Solutions",
        stage: "Lead",
        score: 22,
        tags: ["cold", "media"],
        lastContact: now - 14 * 86400000,
        notes: "",
        createdAt: now - 3 * 86400000,
      }),
    ]);

    // Seed deals
    const dealIds = await Promise.all([
      ctx.db.insert("deals", {
        title: "TechCorp Enterprise License",
        contactId: contactIds[0],
        value: 85000,
        stage: "Qualified",
        probability: 70,
        expectedClose: now + 30 * 86400000,
        notes: "Annual enterprise license for 200 seats.",
        createdAt: now - 9 * 86400000,
      }),
      ctx.db.insert("deals", {
        title: "Startup.io Starter Pack",
        contactId: contactIds[1],
        value: 12000,
        stage: "Lead",
        probability: 30,
        expectedClose: now + 45 * 86400000,
        notes: "Small deal, but good reference customer.",
        createdAt: now - 7 * 86400000,
      }),
      ctx.db.insert("deals", {
        title: "Global Retail Integration",
        contactId: contactIds[2],
        value: 48000,
        stage: "Proposal",
        probability: 55,
        expectedClose: now + 20 * 86400000,
        notes: "Integration with their existing POS system.",
        createdAt: now - 12 * 86400000,
      }),
      ctx.db.insert("deals", {
        title: "Finance Plus Premium",
        contactId: contactIds[3],
        value: 120000,
        stage: "Negotiation",
        probability: 85,
        expectedClose: now + 10 * 86400000,
        notes: "Big ticket deal. Legal review ongoing.",
        createdAt: now - 18 * 86400000,
      }),
    ]);

    // Seed tasks
    await Promise.all([
      ctx.db.insert("tasks", {
        title: "Follow up with Sarah Johnson",
        description: "Send updated pricing sheet and schedule demo call.",
        dueDate: now - 86400000, // overdue
        priority: "High",
        status: "Todo",
        assignedTo: "Alice",
        relatedTo: "contact",
        relatedId: contactIds[0],
        createdAt: now - 3 * 86400000,
      }),
      ctx.db.insert("tasks", {
        title: "Prepare proposal for Global Retail",
        description: "Include custom SLA terms and integration roadmap.",
        dueDate: now + 3600000, // due today
        priority: "High",
        status: "In Progress",
        assignedTo: "Bob",
        relatedTo: "deal",
        relatedId: dealIds[2],
        createdAt: now - 2 * 86400000,
      }),
      ctx.db.insert("tasks", {
        title: "Onboarding call for new client",
        description: "Setup Zoom call for onboarding walkthrough.",
        dueDate: now + 7 * 86400000,
        priority: "Medium",
        status: "Todo",
        assignedTo: "Charlie",
        createdAt: now - 1 * 86400000,
      }),
    ]);

    // Seed onboarding template
    const templateId = await ctx.db.insert("onboarding_templates", {
      name: "Sales Onboarding",
      industry: "Sales",
      steps: [
        { title: "Account Setup", description: "Create user account and configure profile", done: false },
        { title: "Product Demo", description: "Schedule and complete product walkthrough", done: false },
        { title: "Data Migration", description: "Import existing contacts and deals", done: false },
        { title: "Team Training", description: "Complete training session with all team members", done: false },
        { title: "Go Live Review", description: "Final check before going live", done: false },
      ],
    });

    // Seed onboarding clients
    await Promise.all([
      ctx.db.insert("onboarding_clients", {
        name: "TechCorp Inc.",
        email: "admin@techcorp.com",
        templateId,
        progress: 60,
        steps: [
          { title: "Account Setup", description: "Create user account and configure profile", done: true },
          { title: "Product Demo", description: "Schedule and complete product walkthrough", done: true },
          { title: "Data Migration", description: "Import existing contacts and deals", done: true },
          { title: "Team Training", description: "Complete training session with all team members", done: false },
          { title: "Go Live Review", description: "Final check before going live", done: false },
        ],
        startedAt: now - 7 * 86400000,
      }),
      ctx.db.insert("onboarding_clients", {
        name: "Finance Plus",
        email: "team@financeplus.com",
        templateId,
        progress: 20,
        steps: [
          { title: "Account Setup", description: "Create user account and configure profile", done: true },
          { title: "Product Demo", description: "Schedule and complete product walkthrough", done: false },
          { title: "Data Migration", description: "Import existing contacts and deals", done: false },
          { title: "Team Training", description: "Complete training session with all team members", done: false },
          { title: "Go Live Review", description: "Final check before going live", done: false },
        ],
        startedAt: now - 2 * 86400000,
      }),
    ]);

    // Seed automations
    await Promise.all([
      ctx.db.insert("automations", {
        name: "New Contact Welcome Email",
        trigger: "New Contact",
        webhookUrl: "https://n8n.example.com/webhook/new-contact",
        enabled: false,
      }),
      ctx.db.insert("automations", {
        name: "Deal Won Notification",
        trigger: "Deal Stage Change",
        webhookUrl: "https://n8n.example.com/webhook/deal-stage",
        enabled: false,
      }),
    ]);

    // Seed analytics events
    const types = ["contact_created", "deal_created", "task_completed", "onboarding_step_completed"];
    const entityTypes = ["contact", "deal", "task", "onboarding_client"];
    for (let i = 0; i < 20; i++) {
      const typeIdx = i % types.length;
      await ctx.db.insert("analytics_events", {
        type: types[typeIdx],
        entityType: entityTypes[typeIdx],
        entityId: i < 5 ? contactIds[i % contactIds.length] : undefined,
        value: Math.floor(Math.random() * 100),
        timestamp: now - Math.floor(Math.random() * 30) * 86400000,
      });
    }

    // Seed default settings
    await Promise.all([
      ctx.db.insert("settings", { key: "appName", value: "FlowDesk" }),
      ctx.db.insert("settings", { key: "currency", value: "PLN" }),
      ctx.db.insert("settings", { key: "timezone", value: "Europe/Warsaw" }),
      ctx.db.insert("settings", { key: "n8nBaseUrl", value: "https://n8n.example.com" }),
      ctx.db.insert("settings", {
        key: "aiSystemPrompt",
        value: "You are a helpful CRM assistant. Summarize the contact's activity, deals, and tasks in a concise business summary.",
      }),
    ]);

    return { message: "Seeded successfully" };
  },
});
