"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, CheckSquare, BookOpen, TrendingUp, Plus, MapPin, Activity } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { WORKSPACE_CONTEXT as WC } from "@/lib/config";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

type StatusKey = "preparing" | "in_way" | "problem" | "finish";

function stringHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getMarkerStyle(status: string) {
  if (status === "problem") {
    return {
      dotClass: "fill-red-600",
      pulseClass: "fill-red-300/50",
      labelClass: "text-red-700",
    };
  }
  if (status === "finish") {
    return {
      dotClass: "fill-green-600",
      pulseClass: "fill-green-300/50",
      labelClass: "text-green-700",
    };
  }
  if (status === "in_way") {
    return {
      dotClass: "fill-blue-600",
      pulseClass: "fill-blue-300/50",
      labelClass: "text-blue-700",
    };
  }
  return {
    dotClass: "fill-slate-600",
    pulseClass: "fill-slate-300/50",
    labelClass: "text-slate-700",
  };
}

function getStatusLabel(status: string) {
  if (status === "in_way") return "In Way";
  if (status === "finish") return "Finish";
  if (status === "problem") return "Problem";
  return "Preparing";
}

export default function DashboardPage() {
  const stats = useQuery(api.analytics.getDashboardStats);
  const events = useQuery(api.analytics.listRecentEvents, { limit: 10 });
  const hikersTracking = useQuery(api.telegram_bot.listHikersLiveTracking);
  const createContact = useMutation(api.contacts.createContact);

  const [form, setForm] = useState({ name: "", email: "", company: "", stage: "Lead" });
  const [submitting, setSubmitting] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((currentTick) => currentTick + 1);
    }, 1200);
    return () => window.clearInterval(timer);
  }, []);

  const liveMarkers = useMemo(() => {
    if (!hikersTracking) {
      return [];
    }

    return hikersTracking.map((hiker) => {
      const hikerSeed = stringHash(hiker._id);
      const baseLat = hiker.geo_lat ?? 46.852 + ((hikerSeed % 100) - 50) * 0.0016;
      const baseLon = hiker.geo_lon ?? 7.68 + (((Math.floor(hikerSeed / 100) % 100) - 50) * 0.0022);

      const statusDriftScale = hiker.status === "problem" ? 0.15 : hiker.status === "finish" ? 0.05 : 0.28;
      const latDrift = Math.sin((tick + hikerSeed % 17) / 2.8) * 0.0013 * statusDriftScale;
      const lonDrift = Math.cos((tick + hikerSeed % 29) / 3.2) * 0.0018 * statusDriftScale;

      const currentLat = baseLat + latDrift;
      const currentLon = baseLon + lonDrift;
      const statusStyle = getMarkerStyle(hiker.status);
      const hikerName = hiker.telegram_username
        ? `@${hiker.telegram_username}`
        : `Hiker ${hiker.telegram_user_id}`;

      return {
        ...hiker,
        hikerName,
        currentLat,
        currentLon,
        ...statusStyle,
      };
    });
  }, [hikersTracking, tick]);

  const mapBounds = useMemo(() => {
    if (liveMarkers.length === 0) {
      return {
        minLat: 46.835,
        maxLat: 46.872,
        minLon: 7.61,
        maxLon: 7.76,
      };
    }

    const latitudes = liveMarkers.map((marker) => marker.currentLat);
    const longitudes = liveMarkers.map((marker) => marker.currentLon);
    const minLat = Math.min(...latitudes) - 0.004;
    const maxLat = Math.max(...latitudes) + 0.004;
    const minLon = Math.min(...longitudes) - 0.006;
    const maxLon = Math.max(...longitudes) + 0.006;

    return { minLat, maxLat, minLon, maxLon };
  }, [liveMarkers]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusKey, number> = {
      preparing: 0,
      in_way: 0,
      problem: 0,
      finish: 0,
    };

    for (const marker of liveMarkers) {
      if (marker.status in counts) {
        counts[marker.status as StatusKey] += 1;
      }
    }

    return counts;
  }, [liveMarkers]);

  const plottedMarkers = useMemo(() => {
    if (liveMarkers.length === 0) {
      return [];
    }

    const latSpan = mapBounds.maxLat - mapBounds.minLat;
    const lonSpan = mapBounds.maxLon - mapBounds.minLon;

    return liveMarkers.map((marker) => {
      const xPercent = ((marker.currentLon - mapBounds.minLon) / lonSpan) * 100;
      const yPercent = (1 - (marker.currentLat - mapBounds.minLat) / latSpan) * 100;

      return {
        ...marker,
        x: Math.min(97, Math.max(3, xPercent)) * 10,
        y: Math.min(96, Math.max(4, yPercent)) * 4.2,
      };
    });
  }, [liveMarkers, mapBounds]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await createContact({ name: form.name, email: form.email, company: form.company, stage: form.stage, score: 50, tags: [], notes: "" });
      toast.success(`${WC.contactLabel} added successfully`);
      setForm({ name: "", email: "", company: "", stage: "Lead" });
    } catch {
      toast.error("Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back — here&apos;s what&apos;s happening</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title={`Total ${WC.contactLabel}s`} value={stats?.totalContacts ?? null} icon={<Users className="h-5 w-5 text-indigo-600" />} bg="bg-indigo-50" />
        <KpiCard title={`Open ${WC.dealLabel}s`} value={stats ? formatCurrency(stats.openDealsValue, WC.currency) : null} subtitle={stats ? `${stats.openDealsCount} open` : undefined} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} bg="bg-emerald-50" />
        <KpiCard title="Tasks Due Today" value={stats?.tasksDueToday ?? null} icon={<CheckSquare className="h-5 w-5 text-amber-600" />} bg="bg-amber-50" />
        <KpiCard title="Onboarding Active" value={stats?.onboardingInProgress ?? null} icon={<BookOpen className="h-5 w-5 text-violet-600" />} bg="bg-violet-50" />
      </div>

      {/* Activity + Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events === undefined ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : events.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 capitalize">{event.type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-slate-400 capitalize">{event.entityType}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{formatRelativeTime(event.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" /> Quick Add {WC.contactLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="q-name">Name *</Label>
                <Input id="q-name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="q-email">Email *</Label>
                <Input id="q-email" type="email" placeholder="email@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="q-company">Company *</Label>
                <Input id="q-company" placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WC.stageLabels.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : `Add ${WC.contactLabel}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Lead", "Qualified", "Proposal", "Closed Won"].map((stage) => (
              <div key={stage} className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-2xl font-bold text-slate-900">
                  {stats !== undefined ? (stats.dealsByStage[stage] ?? 0) : <Skeleton className="h-8 w-8 mx-auto" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{stage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" /> Live Hiker Tracking (Demo)
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" /> Real-time
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-90 w-full overflow-hidden rounded-xl border border-slate-200 bg-linear-to-br from-slate-100 via-blue-50 to-emerald-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.12),transparent_28%)]" />
            <div className="absolute inset-0 opacity-35 bg-size-[28px_28px] bg-[linear-gradient(to_right,#94a3b81f_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81f_1px,transparent_1px)]" />

            {hikersTracking === undefined ? (
              <div className="absolute inset-0 p-4">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : plottedMarkers.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-slate-500">No hikers available yet</p>
              </div>
            ) : (
              <svg viewBox="0 0 1000 420" className="absolute inset-0 h-full w-full" role="img" aria-label="Live demo map of hiker locations">
                <path d="M35 360 C 180 285, 270 275, 385 225 C 500 178, 660 205, 945 88" className="fill-none stroke-slate-300/80 stroke-2" />
                <path d="M45 300 C 150 250, 250 210, 370 205 C 540 195, 710 150, 930 38" className="fill-none stroke-blue-300/60 stroke-[1.5]" />
                {plottedMarkers.map((marker) => (
                  <g key={marker._id} transform={`translate(${marker.x}, ${marker.y})`}>
                    <circle r="17" className={`${marker.pulseClass} animate-pulse`} />
                    <circle r="7" className={marker.dotClass} />
                    <title>{`${marker.hikerName} • ${getStatusLabel(marker.status)}`}</title>
                  </g>
                ))}
              </svg>
            )}
          </div>

          {plottedMarkers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {plottedMarkers.map((marker) => (
                <div key={marker._id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-xs font-medium text-slate-800 truncate">{marker.hikerName}</p>
                  <p className={`text-[11px] font-medium ${marker.labelClass}`}>{getStatusLabel(marker.status)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Preparing</p>
              <p className="text-lg font-semibold text-slate-800">{statusCounts.preparing}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-blue-600">In Way</p>
              <p className="text-lg font-semibold text-blue-700">{statusCounts.in_way}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-red-600">Problem</p>
              <p className="text-lg font-semibold text-red-700">{statusCounts.problem}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-green-600">Finish</p>
              <p className="text-lg font-semibold text-green-700">{statusCounts.finish}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, bg }: { title: string; value: string | number | null; subtitle?: string; icon: React.ReactNode; bg: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {value === null ? <Skeleton className="h-8 w-24 mt-1" /> : <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
