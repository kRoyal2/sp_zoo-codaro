"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Image, MessageSquare, Activity } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; btn: string }
> = {
  preparing: {
    label: "Preparing",
    badge: "bg-slate-100 text-slate-700",
    btn: "bg-slate-600 hover:bg-slate-700 text-white",
  },
  in_way: {
    label: "In Way",
    badge: "bg-blue-100 text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  problem: {
    label: "Problem",
    badge: "bg-red-100 text-red-700",
    btn: "bg-red-600 hover:bg-red-700 text-white",
  },
  finish: {
    label: "Finish",
    badge: "bg-green-100 text-green-700",
    btn: "bg-green-600 hover:bg-green-700 text-white",
  },
};

function getButtonColor(text: string): string {
  if (text.startsWith("🟢")) return "bg-green-100 text-green-800 border-green-200";
  if (text.startsWith("🟡")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (text.startsWith("🟠")) return "bg-orange-100 text-orange-800 border-orange-200";
  if (text.startsWith("🔴")) return "bg-red-100 text-red-800 border-red-200";
  return "bg-slate-100 text-slate-800 border-slate-200";
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function HikerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hikerId = params.id as Id<"hikers">;

  const hiker = useQuery(api.telegram_bot.getHiker, { hikerId });
  const messages = useQuery(api.telegram_bot.listHikerMessages, { hikerId });
  const updateStatus = useMutation(api.telegram_bot.updateHikerStatus);

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus({ hikerId, status });
      toast.success(`Status updated to ${STATUS_CONFIG[status]?.label ?? status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (hiker === undefined || messages === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (hiker === null) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Hiker not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/hikers")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Hikers
        </Button>
      </div>
    );
  }

  const name = hiker.telegram_username
    ? `@${hiker.telegram_username}`
    : `User ${hiker.telegram_user_id}`;

  const statusCfg = STATUS_CONFIG[hiker.status] ?? {
    label: hiker.status,
    badge: "bg-slate-100 text-slate-700",
    btn: "bg-slate-600 text-white",
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/hikers")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Hikers
        </Button>
      </div>

      {/* Hiker info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Telegram ID: {hiker.telegram_user_id}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusCfg.badge}`}
          >
            {statusCfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div>
            <span className="text-slate-400">Joined:</span>{" "}
            {formatDateTime(hiker.createdAt)}
          </div>
          <div>
            <span className="text-slate-400">Last seen:</span>{" "}
            {hiker.lastSeenAt ? formatDateTime(hiker.lastSeenAt) : "—"}
          </div>
          <div className="col-span-2">
            <span className="text-slate-400">Messages:</span> {messages.length}
          </div>
        </div>

        {/* Status change */}
        <div>
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-medium">
            Change status
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={hiker.status === status}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${cfg.btn}`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message feed */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <Activity className="h-4 w-4" /> Messages ({messages.length})
        </h2>

        {messages.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-400 text-sm">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-2"
              >
                <p className="text-xs text-slate-400">{formatDateTime(msg.datetime)}</p>

                {msg.status_button && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium border ${getButtonColor(msg.status_button)}`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    {msg.status_button}
                  </span>
                )}

                {msg.message && (
                  <p className="flex items-start gap-2 text-sm text-slate-700">
                    <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    {msg.message}
                  </p>
                )}

                {msg.photoUrl && (
                  <div className="flex items-start gap-2">
                    <Image className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                    <img
                      src={msg.photoUrl}
                      alt="Hiker photo"
                      className="rounded-lg max-h-64 max-w-full object-contain border border-slate-100"
                    />
                  </div>
                )}

                {msg.geo_lat !== undefined && msg.geo_lon !== undefined && (
                  <a
                    href={`https://maps.google.com/?q=${msg.geo_lat},${msg.geo_lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <MapPin className="h-4 w-4" />
                    View on map ({msg.geo_lat.toFixed(5)},{" "}
                    {msg.geo_lon.toFixed(5)})
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
