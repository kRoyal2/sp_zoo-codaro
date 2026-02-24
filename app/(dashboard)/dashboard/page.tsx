"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, CheckSquare, BookOpen, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { WORKSPACE_CONTEXT as WC } from "@/lib/config";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const stats = useQuery(api.analytics.getDashboardStats);
  const events = useQuery(api.analytics.listRecentEvents, { limit: 10 });
  const createContact = useMutation(api.contacts.createContact);

  const [form, setForm] = useState({ name: "", email: "", company: "", stage: "Lead" });
  const [submitting, setSubmitting] = useState(false);

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
