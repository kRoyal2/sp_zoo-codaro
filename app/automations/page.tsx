"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Zap, Pencil, Trash2, Play, Globe, Clock } from "lucide-react";

const TRIGGER_TYPES = ["New Contact", "Deal Stage Change", "Task Overdue", "Onboarding Completed"];

const emptyForm = { name: "", trigger: "New Contact", webhookUrl: "" };

export default function AutomationsPage() {
  const automations = useQuery(api.automations.listAutomations);
  const createAutomation = useMutation(api.automations.createAutomation);
  const updateAutomation = useMutation(api.automations.updateAutomation);
  const deleteAutomation = useMutation(api.automations.deleteAutomation);

  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const openEdit = (a: { _id: Id<"automations">; name: string; trigger: string; webhookUrl: string }) => {
    setEditId(a._id);
    setForm({ name: a.name, trigger: a.trigger, webhookUrl: a.webhookUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.webhookUrl) { toast.error("Name and webhook URL required"); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await updateAutomation({ id: editId as Id<"automations">, name: form.name, trigger: form.trigger, webhookUrl: form.webhookUrl });
        toast.success("Automation updated");
        setEditId(null);
      } else {
        await createAutomation({ name: form.name, trigger: form.trigger, webhookUrl: form.webhookUrl, enabled: false });
        toast.success("Automation created");
        setAddOpen(false);
      }
      setForm(emptyForm);
    } catch { toast.error("Failed to save automation"); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (id: Id<"automations">, enabled: boolean) => {
    await updateAutomation({ id, enabled });
    toast.success(enabled ? "Automation enabled" : "Automation disabled");
  };

  const handleTestRun = async (automation: { _id: Id<"automations">; name: string; trigger: string; webhookUrl: string }) => {
    setTestingId(automation._id);
    try {
      const res = await fetch(automation.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: automation.trigger,
          automation: automation.name,
          testRun: true,
          timestamp: new Date().toISOString(),
          payload: { message: "Test run from FlowDesk" },
        }),
      });
      await updateAutomation({ id: automation._id, lastRun: Date.now() });
      if (res.ok) { toast.success(`Test run successful for "${automation.name}"`); }
      else { toast.warning(`Webhook responded with status ${res.status}`); }
    } catch {
      await updateAutomation({ id: automation._id, lastRun: Date.now() });
      toast.info(`Test payload sent to "${automation.name}" (webhook may not be live)`);
    } finally {
      setTestingId(null);
    }
  };

  const FORM = (
    <Dialog open={addOpen || !!editId} onOpenChange={(o) => { if (!o) { setAddOpen(false); setEditId(null); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Automation</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. New Contact Welcome" />
          </div>
          <div className="space-y-1">
            <Label>Trigger</Label>
            <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TRIGGER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Webhook URL *</Label>
            <Input value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} placeholder="https://n8n.example.com/webhook/..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setEditId(null); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automations</h1>
          <p className="text-slate-500 text-sm mt-1">Manage n8n webhook integrations</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Automation</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {automations === undefined ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : automations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Zap className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No automations yet</p>
              <p className="text-slate-400 text-sm mt-1">Connect n8n webhooks to automate your workflow</p>
              <Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add First Automation</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Trigger</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Webhook URL</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Last Run</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {automations.map((auto) => (
                    <tr key={auto._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${auto.enabled ? "bg-green-500" : "bg-slate-300"}`} />
                          <span className="font-medium text-slate-900">{auto.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">{auto.trigger}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-500 text-xs max-w-60 truncate">
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{auto.webhookUrl}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={auto.enabled}
                          onCheckedChange={(checked) => handleToggle(auto._id, checked)}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {auto.lastRun ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(auto.lastRun)}
                          </div>
                        ) : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestRun(auto as any)}
                            disabled={testingId === auto._id}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {testingId === auto._id ? "Testing..." : "Test"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(auto as any)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => { await deleteAutomation({ id: auto._id }); toast.success("Deleted"); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {FORM}
    </div>
  );
}
