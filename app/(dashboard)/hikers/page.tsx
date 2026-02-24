"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Mountain } from "lucide-react";

type Hiker = {
  _id: Id<"hikers">;
  telegram_user_id: number;
  telegram_username?: string;
  status: string;
  description?: string;
  createdAt: number;
  lastSeenAt?: number;
};

const COLUMNS = [
  {
    status: "preparing",
    label: "Preparing",
    headerBg: "bg-slate-600",
    colBg: "bg-slate-50",
    border: "border-slate-200",
  },
  {
    status: "in_way",
    label: "In Way",
    headerBg: "bg-blue-600",
    colBg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    status: "problem",
    label: "Problem 🔴",
    headerBg: "bg-red-600",
    colBg: "bg-red-50",
    border: "border-red-200",
  },
  {
    status: "finish",
    label: "Finish",
    headerBg: "bg-green-600",
    colBg: "bg-green-50",
    border: "border-green-200",
  },
];

function formatTime(ts?: number) {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function HikerCard({ hiker }: { hiker: Hiker }) {
  const name = hiker.telegram_username
    ? `@${hiker.telegram_username}`
    : `User ${hiker.telegram_user_id}`;

  return (
    <Link href={`/hikers/${hiker._id}`}>
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-1.5">
        <p className="font-medium text-slate-900 text-sm">{name}</p>
        <p className="text-xs text-slate-400">
          Last seen: {formatTime(hiker.lastSeenAt)}
        </p>
        <p className="text-xs text-slate-400">
          Joined: {new Date(hiker.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}

export default function HikersPage() {
  const hikers = useQuery(api.telegram_bot.listHikers);

  const byStatus = COLUMNS.reduce<Record<string, Hiker[]>>((acc, col) => {
    acc[col.status] = (hikers ?? []).filter((h) => h.status === col.status) as Hiker[];
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mountain className="h-6 w-6 text-indigo-600" />
            Hikers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {hikers?.length ?? 0} total hikers
          </p>
        </div>
      </div>

      {hikers === undefined ? (
        <div className="flex gap-4">
          {COLUMNS.map((col) => (
            <Skeleton key={col.status} className="flex-1 h-96 min-w-[220px]" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const cards = byStatus[col.status] ?? [];
            return (
              <div
                key={col.status}
                className="flex flex-col flex-1 min-w-[220px] max-w-[280px]"
              >
                <div className={`${col.headerBg} rounded-t-xl px-4 py-3`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {col.label}
                    </span>
                    <span className="bg-white/20 text-white text-xs rounded-full px-2 py-0.5">
                      {cards.length}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex-1 ${col.colBg} ${col.border} border border-t-0 rounded-b-xl p-3 space-y-3 min-h-[400px]`}
                >
                  {cards.map((hiker) => (
                    <HikerCard key={hiker._id} hiker={hiker} />
                  ))}
                  {cards.length === 0 && (
                    <div className="flex items-center justify-center h-24">
                      <p className="text-xs text-slate-400">No hikers</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
