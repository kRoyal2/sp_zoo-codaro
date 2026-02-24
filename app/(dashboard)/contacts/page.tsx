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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { WORKSPACE_CONTEXT as WC } from "@/lib/config";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search, Plus, Pencil, Trash2, ExternalLink, Bot,
  Mail, Phone, Building2, Tag, Calendar, FileText
} from "lucide-react";

type Contact = {
  _id: Id<"contacts">;
  name: string;
  email: string;
  phone?: string;
  company: string;
  stage: string;
  score: number;
  tags: string[];
  lastContact?: number;
  notes?: string;
  createdAt: number;
};

const STAGE_COLORS: Record<string, string> = {
  Lead: "secondary",
  Qualified: "default",
  Proposal: "warning",
  Negotiation: "destructive",
  "Closed Won": "success",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score < 30 ? "bg-red-100 text-red-700" : score < 70 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
  return <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{score}</span>;
}

const emptyForm = { name: "", email: "", phone: "", company: "", stage: "Lead", score: 50, tags: "", notes: "" };

export default function ContactsPage() {
  const contacts = useQuery(api.contacts.listContacts);
  const createContact = useMutation(api.contacts.createContact);
  const updateContact = useMutation(api.contacts.updateContact);
  const deleteContact = useMutation(api.contacts.deleteContact);
  const appendNote = useMutation(api.contacts.appendContactNote);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<Id<"contacts"> | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const filtered = (contacts ?? []).filter((c) => {
    const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || c.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const openAdd = () => { setForm(emptyForm); setAddOpen(true); };
  const openEdit = (c: Contact) => { setForm({ name: c.name, email: c.email, phone: c.phone ?? "", company: c.company, stage: c.stage, score: c.score, tags: c.tags.join(", "), notes: c.notes ?? "" }); setEditContact(c); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) { toast.error("Name, email, and company are required"); return; }
    setSubmitting(true);
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (editContact) {
        await updateContact({ id: editContact._id, name: form.name, email: form.email, phone: form.phone, company: form.company, stage: form.stage, score: form.score, tags, notes: form.notes });
        toast.success("Contact updated");
        setEditContact(null);
        if (detailContact?._id === editContact._id) setDetailContact({ ...editContact, ...form, tags });
      } else {
        await createContact({ name: form.name, email: form.email, phone: form.phone, company: form.company, stage: form.stage, score: form.score, tags, notes: form.notes });
        toast.success("Contact created");
        setAddOpen(false);
      }
    } catch { toast.error("Failed to save contact"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteContact({ id: deleteId });
    toast.success("Contact deleted");
    setDeleteId(null);
    if (detailContact?._id === deleteId) setDetailContact(null);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !detailContact) return;
    await appendNote({ id: detailContact._id, note: newNote.trim() });
    toast.success("Note added");
    setNewNote("");
  };

  const handleAiSummary = async () => {
    if (!detailContact) return;
    setAiLoading(true);
    try {
      const res = await fetch("https://n8n.example.com/webhook/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailContact),
      });
      if (res.ok) { toast.success("AI summary triggered successfully"); }
      else { toast.info("AI summary request sent (webhook pending)"); }
    } catch { toast.info("AI summary sent (webhook not live)"); }
    finally { setAiLoading(false); }
  };

  const FormModal = addOpen || !!editContact;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{WC.contactLabel}s</h1>
          <p className="text-slate-500 text-sm mt-1">{contacts?.length ?? 0} total records</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add {WC.contactLabel}</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-9" placeholder={`Search ${WC.contactLabel.toLowerCase()}s...`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All stages" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {WC.stageLabels.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {contacts === undefined ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No {WC.contactLabel.toLowerCase()}s found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
              <Button className="mt-4" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add First {WC.contactLabel}</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Stage</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Score</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Last Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Tags</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((contact) => (
                    <tr key={contact._id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setDetailContact(contact as Contact)}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{contact.name}</div>
                        <div className="text-xs text-slate-400">{contact.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{contact.company}</td>
                      <td className="px-4 py-3">
                        <Badge variant={(STAGE_COLORS[contact.stage] as any) ?? "secondary"}>{contact.stage}</Badge>
                      </td>
                      <td className="px-4 py-3"><ScoreBadge score={contact.score} /></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{contact.lastContact ? formatRelativeTime(contact.lastContact) : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(contact as Contact)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(contact._id)}><Trash2 className="h-4 w-4" /></Button>
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

      {/* Add/Edit Modal */}
      <Dialog open={FormModal} onOpenChange={(o) => { if (!o) { setAddOpen(false); setEditContact(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editContact ? "Edit" : "Add"} {WC.contactLabel}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@co.com" />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" />
              </div>
              <div className="space-y-1">
                <Label>Company *</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
              </div>
              <div className="space-y-1">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WC.stageLabels.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Score (0–100)</Label>
                <Input type="number" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. hot, enterprise" />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Initial notes..." className="h-24" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setEditContact(null); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {WC.contactLabel}?</DialogTitle></DialogHeader>
          <p className="text-slate-500 text-sm">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Panel */}
      <Sheet open={!!detailContact} onOpenChange={(o) => !o && setDetailContact(null)}>
        <SheetContent side="right" className="w-full max-w-2xl">
          {detailContact && (
            <ContactDetail
              contact={detailContact}
              onEdit={() => openEdit(detailContact)}
              onAiSummary={handleAiSummary}
              aiLoading={aiLoading}
              newNote={newNote}
              onNoteChange={setNewNote}
              onAddNote={handleAddNote}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ContactDetail({ contact, onEdit, onAiSummary, aiLoading, newNote, onNoteChange, onAddNote }: {
  contact: Contact;
  onEdit: () => void;
  onAiSummary: () => void;
  aiLoading: boolean;
  newNote: string;
  onNoteChange: (v: string) => void;
  onAddNote: () => void;
}) {
  const deals = useQuery(api.contacts.getContactDeals, { contactId: contact._id });
  const tasks = useQuery(api.contacts.getContactTasks, { contactId: contact._id });
  const notes = contact.notes?.split("\n").filter(Boolean) ?? [];

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle className="text-xl">{contact.name}</SheetTitle>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant={(STAGE_COLORS[contact.stage] as any) ?? "secondary"}>{contact.stage}</Badge>
          <ScoreBadge score={contact.score} />
          {contact.tags.map((t) => <span key={t} className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-0.5">{t}</span>)}
        </div>
      </SheetHeader>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{contact.email}</div>
        <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{contact.phone ?? "—"}</div>
        <div className="flex items-center gap-2 text-slate-600"><Building2 className="h-4 w-4 text-slate-400" />{contact.company}</div>
        <div className="flex items-center gap-2 text-slate-600"><Calendar className="h-4 w-4 text-slate-400" />Last: {contact.lastContact ? formatDate(contact.lastContact) : "—"}</div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
        <Button size="sm" variant="secondary" onClick={onAiSummary} disabled={aiLoading}>
          <Bot className="h-3 w-3 mr-1" />{aiLoading ? "Loading..." : "AI Summary"}
        </Button>
      </div>

      <Separator />

      {/* Linked Deals */}
      <div>
        <h3 className="font-semibold text-sm text-slate-700 mb-2">Linked Deals</h3>
        {deals === undefined ? <Skeleton className="h-10 w-full" /> : deals.length === 0 ? (
          <p className="text-xs text-slate-400">No deals linked</p>
        ) : (
          <div className="space-y-2">
            {deals.map((d) => (
              <div key={d._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                <span className="font-medium">{d.title}</span>
                <Badge variant={(STAGE_COLORS[d.stage] as any) ?? "secondary"} className="text-xs">{d.stage}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Tasks */}
      <div>
        <h3 className="font-semibold text-sm text-slate-700 mb-2">Linked Tasks</h3>
        {tasks === undefined ? <Skeleton className="h-10 w-full" /> : tasks.length === 0 ? (
          <p className="text-xs text-slate-400">No tasks linked</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                <span className="font-medium">{t.title}</span>
                <span className="text-slate-500">{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Notes Timeline */}
      <div>
        <h3 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-1"><FileText className="h-4 w-4" />Notes Timeline</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
          {notes.length === 0 ? <p className="text-xs text-slate-400">No notes yet</p> : notes.map((note, i) => (
            <div key={i} className="text-xs text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">{note}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add a note..." value={newNote} onChange={(e) => onNoteChange(e.target.value)} className="text-sm" onKeyDown={(e) => e.key === "Enter" && onAddNote()} />
          <Button size="sm" onClick={onAddNote}>Add</Button>
        </div>
      </div>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
