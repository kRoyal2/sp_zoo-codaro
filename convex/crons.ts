import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "poll telegram",
  { seconds: 3 },
  internal.telegram_poll.pollTelegram,
  {}
);

export default crons;
