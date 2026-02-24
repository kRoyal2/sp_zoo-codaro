export const WORKSPACE_CONTEXT = {
  appName: "FlowDesk",
  industry: "Sales", // swap to: HR | Healthcare | RealEstate | Education | Agency
  contactLabel: "Contact", // swap to: Candidate | Patient | Student | Client
  dealLabel: "Deal", // swap to: Application | Treatment | Enrollment | Project
  stageLabels: ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won"],
  pipelineStages: ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won"],
  taskPriorities: ["High", "Medium", "Low"] as const,
  taskStatuses: ["Todo", "In Progress", "Done"] as const,
  industries: ["Sales", "HR", "Healthcare", "Real Estate", "Education", "Agency"] as const,
  currency: "PLN",
  mockUsers: ["Alice", "Bob", "Charlie"] as const,
};

export type Industry = typeof WORKSPACE_CONTEXT.industries[number];
export type TaskPriority = typeof WORKSPACE_CONTEXT.taskPriorities[number];
export type TaskStatus = typeof WORKSPACE_CONTEXT.taskStatuses[number];
