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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { WORKSPACE_CONTEXT as WC } from "@/lib/config";
import { toast } from "sonner";
import { Plus, BookOpen, Pencil, Trash2, GripVertical, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { title: string; description: string; done: boolean };

export default function OnboardingPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Onboarding</h1>
        <p className="text-slate-500 text-sm mt-1">Manage client onboarding and reusable templates</p>
      </div>
      <Tabs defaultValue="clients">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="clients"><ClientsTab /></TabsContent>
        <TabsContent value="templates"><TemplatesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ClientsTab() {
  const clients = useQuery(api.onboarding.listOnboardingClients);
  const templates = useQuery(api.onboarding.listTemplates);
  const createClient = useMutation(api.onboarding.createOnboardingClient);
  const updateStep = useMutation(api.onboarding.updateOnboardingClientStep);
  const assignTemplate = useMutation(api.onboarding.assignTemplate);
  const deleteClient = useMutation(api.onboarding.deleteOnboardingClient);

  const [addOpen, setAddOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [form, setForm] = useState({ name: "", email: "", templateId: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    setSubmitting(true);
    try {
      await createClient({ name: form.name, email: form.email, templateId: form.templateId as Id<"onboarding_templates"> || undefined });
      toast.success("Client added");
      setAddOpen(false);
      setForm({ name: "", email: "", templateId: "" });
    } catch { toast.error("Failed to add client"); }
    finally { setSubmitting(false); }
  };

  const handleStepToggle = async (clientId: Id<"onboarding_clients">, stepIndex: number, done: boolean) => {
    await updateStep({ id: clientId, stepIndex, done });
    const action = done ? "completed" : "unchecked";
    toast.success(`Step ${action}`);
  };

  const handleAssignTemplate = async () => {
    if (!assignOpen || !selectedTemplate) return;
    await assignTemplate({ clientId: assignOpen as Id<"onboarding_clients">, templateId: selectedTemplate as Id<"onboarding_templates"> });
    toast.success("Template assigned");
    setAssignOpen(null);
    setSelectedTemplate("");
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Client</Button>
      </div>

      {clients === undefined ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookOpen className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No onboarding clients yet</p>
            <Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add First Client</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Card key={client._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{client.name}</p>
                        <p className="text-xs text-slate-400">{client.email}</p>
                      </div>
                      {client.templateName && <Badge variant="secondary" className="text-xs">{client.templateName}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Progress value={client.progress} className="flex-1 h-2" />
                      <span className="text-sm font-semibold text-slate-700 w-12 text-right">{client.progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => { setAssignOpen(client._id); setSelectedTemplate(client.templateId ?? ""); }}>
                      <Layers className="h-3 w-3 mr-1" />Template
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === client._id ? null : client._id)}>
                      {expanded === client._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => { await deleteClient({ id: client._id }); toast.success("Client deleted"); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expanded === client._id && client.steps.length > 0 && (
                  <div className="mt-4 border-t pt-4 space-y-2">
                    {client.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <Checkbox
                          checked={step.done}
                          onCheckedChange={(checked) => handleStepToggle(client._id, idx, !!checked)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className={cn("text-sm font-medium", step.done && "line-through text-slate-400")}>{step.title}</p>
                          <p className="text-xs text-slate-400">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Onboarding Client</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Client name" /></div>
            <div className="space-y-1"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@email.com" /></div>
            <div className="space-y-1">
              <Label>Template (optional)</Label>
              <Select value={form.templateId} onValueChange={(v) => setForm({ ...form, templateId: v })}>
                <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>
                  {(templates ?? []).map((t) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Client"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Template Modal */}
      <Dialog open={!!assignOpen} onOpenChange={(o) => !o && setAssignOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Template</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Select Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger><SelectValue placeholder="Choose template" /></SelectTrigger>
                <SelectContent>
                  {(templates ?? []).map((t) => <SelectItem key={t._id} value={t._id}>{t.name} ({t.industry})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(null)}>Cancel</Button>
              <Button onClick={handleAssignTemplate} disabled={!selectedTemplate}>Assign</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplatesTab() {
  const templates = useQuery(api.onboarding.listTemplates);
  const createTemplate = useMutation(api.onboarding.createTemplate);
  const updateTemplate = useMutation(api.onboarding.updateTemplate);
  const deleteTemplate = useMutation(api.onboarding.deleteTemplate);

  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", industry: "Sales", steps: [{ title: "", description: "" }] });
  const [submitting, setSubmitting] = useState(false);

  const openEdit = (t: { _id: Id<"onboarding_templates">; name: string; industry: string; steps: Step[] }) => {
    setEditId(t._id);
    setForm({ name: t.name, industry: t.industry, steps: t.steps.map((s) => ({ title: s.title, description: s.description })) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Template name required"); return; }
    setSubmitting(true);
    const steps = form.steps.filter((s) => s.title).map((s) => ({ ...s, done: false }));
    try {
      if (editId) {
        await updateTemplate({ id: editId as Id<"onboarding_templates">, name: form.name, industry: form.industry, steps });
        toast.success("Template updated");
        setEditId(null);
      } else {
        await createTemplate({ name: form.name, industry: form.industry, steps });
        toast.success("Template created");
        setAddOpen(false);
      }
      setForm({ name: "", industry: "Sales", steps: [{ title: "", description: "" }] });
    } catch { toast.error("Failed to save template"); }
    finally { setSubmitting(false); }
  };

  const addStep = () => setForm({ ...form, steps: [...form.steps, { title: "", description: "" }] });
  const removeStep = (i: number) => setForm({ ...form, steps: form.steps.filter((_, idx) => idx !== i) });
  const updateStep = (i: number, field: string, value: string) => {
    const steps = [...form.steps];
    steps[i] = { ...steps[i], [field]: value };
    setForm({ ...form, steps });
  };

  const FormDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Template</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Template Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sales Onboarding" />
            </div>
            <div className="space-y-1">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WC.industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Steps</Label>
              <Button type="button" size="sm" variant="outline" onClick={addStep}><Plus className="h-3 w-3 mr-1" />Add Step</Button>
            </div>
            {form.steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} placeholder={`Step ${i + 1} title`} className="h-8" />
                  <Input value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} placeholder="Description" className="h-8" />
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => removeStep(i)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Template"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />New Template</Button>
      </div>

      {templates === undefined ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Layers className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No templates yet</p>
            <Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Create First Template</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(template as any)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => { await deleteTemplate({ id: template._id }); toast.success("Template deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit">{template.industry}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {template.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                      {step.title}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">{template.steps.length} steps</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FormDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <FormDialog open={!!editId} onClose={() => setEditId(null)} />
    </div>
  );
}
