"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const contactsPerDay = useQuery(api.analytics.getContactsPerDay, { days: 30 });
  const dealsByStage = useQuery(api.analytics.getDealsByStageStats);
  const tasksByStatus = useQuery(api.analytics.getTasksByStatus);
  const onboardingByTemplate = useQuery(api.analytics.getOnboardingByTemplate);
  const recentEvents = useQuery(api.analytics.listRecentEvents, { limit: 50 });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time business insights</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Line Chart: Contacts per day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contacts Added (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {contactsPerDay === undefined ? (
              <Skeleton className="h-64 w-full" />
            ) : contactsPerDay.length === 0 ? (
              <EmptyChart message="No contact data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={contactsPerDay} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} dot={{ fill: "#4f46e5", r: 3 }} activeDot={{ r: 5 }} name="Contacts" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Deals by stage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {dealsByStage === undefined ? (
              <Skeleton className="h-64 w-full" />
            ) : dealsByStage.length === 0 ? (
              <EmptyChart message="No deals data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dealsByStage} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="count" name="Deals" radius={[4, 4, 0, 0]}>
                    {dealsByStage.map((_entry: unknown, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Donut Chart: Tasks by status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksByStatus === undefined ? (
              <Skeleton className="h-64 w-full" />
            ) : tasksByStatus.length === 0 ? (
              <EmptyChart message="No task data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                    paddingAngle={3}
                  >
                    {tasksByStatus.map((_entry: unknown, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v, n, p) => [v, p.payload.status]} />
                  <Legend formatter={(value, entry: any) => entry.payload.status} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Onboarding completion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Onboarding Completion by Template</CardTitle>
          </CardHeader>
          <CardContent>
            {onboardingByTemplate === undefined ? (
              <Skeleton className="h-64 w-full" />
            ) : onboardingByTemplate.length === 0 ? (
              <EmptyChart message="No onboarding data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={onboardingByTemplate} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`${v}%`, "Completion Rate"]} />
                  <Bar dataKey="rate" name="Completion %" radius={[4, 4, 0, 0]}>
                    {onboardingByTemplate.map((_entry: unknown, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raw Events Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600" /> Recent Events (last 50)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentEvents === undefined ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : recentEvents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No events recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Event Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Entity</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Value</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((e: Doc<"analytics_events">) => (
                    <tr key={e._id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary" className="text-xs capitalize">{e.type.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 capitalize">{e.entityType}</td>
                      <td className="px-4 py-2.5 text-slate-600">{e.value ?? "—"}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{formatRelativeTime(e.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
      <BarChart3 className="h-10 w-10 mb-2 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
