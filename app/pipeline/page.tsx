"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { WORKSPACE_CONTEXT as WC } from "@/lib/config";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Calendar, TrendingUp, User, DollarSign, Percent, FileText, MessageSquare, Send } from "lucide-react";

type Deal = {
  _id: Id<"deals">;
  title: string;
  contactId: Id<"contacts">;
  contactName?: string;
  value: number;
  stage: string;
  probability: number;
  expectedClose: number;
  notes?: string;
};

const STAGE_COLORS: Record<string, string> = {
  Lead: "bg-slate-100",
  Qualified: "bg-blue-50",
  Proposal: "bg-amber-50",
  Negotiation: "bg-orange-50",
  "Closed Won": "bg-green-50",
};
const STAGE_BORDER: Record<string, string> = {
  Lead: "border-slate-200",
  Qualified: "border-blue-200",
  Proposal: "border-amber-200",
  Negotiation: "border-orange-200",
  "Closed Won": "border-green-200",
};
const STAGE_HEADER: Record<string, string> = {
  Lead: "bg-slate-600",
  Qualified: "bg-blue-600",
  Proposal: "bg-amber-500",
  Negotiation: "bg-orange-500",
  "Closed Won": "bg-green-600",
};

function DealCard({ deal, isDragging = false, onClick }: { deal: Deal; isDragging?: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg border border-slate-200 p-3 shadow-sm space-y-2 hover:shadow-md transition-shadow cursor-pointer ${isDragging ? "opacity-80 rotate-1 shadow-lg" : ""}`}
    >
      <p className="font-medium text-slate-900 text-sm leading-tight">{deal.title}</p>
      <p className="text-xs text-slate-500">{deal.contactName}</p>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-800 text-sm">{formatCurrency(deal.value, WC.currency)}</span>
        <Badge variant="secondary" className="text-xs">{deal.probability}%</Badge>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Calendar className="h-3 w-3" />
        {formatDate(deal.expectedClose)}
      </div>
    </div>
  );
}

function DroppableColumn({ stage, deals, onAddDeal, onViewDeal }: { stage: string; deals: Deal[]; onAddDeal: (stage: string) => void; onViewDeal: (deal: Deal) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col flex-1 min-w-[240px] max-w-[300px]">
      <div className={`${STAGE_HEADER[stage] ?? "bg-slate-600"} rounded-t-xl px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{stage}</span>
            <span className="bg-white/20 text-white text-xs rounded-full px-2 py-0.5">{deals.length}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => onAddDeal(stage)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 ${STAGE_COLORS[stage] ?? "bg-slate-50"} ${STAGE_BORDER[stage] ?? "border-slate-200"} border border-t-0 rounded-b-xl p-3 space-y-3 min-h-[400px] transition-colors ${isOver ? "ring-2 ring-indigo-400 ring-inset" : ""}`}
      >
        {deals.map((deal) => (
          <DraggableCard key={deal._id} deal={deal} onViewDeal={onViewDeal} />
        ))}
        {deals.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-xs text-slate-400">Drop deals here</p>
          </div>
        )}
      </div>
      <div className={`${STAGE_COLORS[stage] ?? "bg-slate-50"} border ${STAGE_BORDER[stage] ?? "border-slate-200"} border-t-0 rounded-b-none -mt-2 px-3 py-2`}>
        <p className="text-xs font-medium text-slate-600">Total: {formatCurrency(total, WC.currency)}</p>
      </div>
    </div>
  );
}

function DraggableCard({ deal, onViewDeal }: { deal: Deal; onViewDeal: (deal: Deal) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal._id });
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDeal(deal);
  };
  
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <DealCard deal={deal} isDragging={isDragging} onClick={handleClick} />
    </div>
  );
}

const emptyForm = { title: "", contactId: "", value: "", probability: "50", expectedClose: "", notes: "" };

export default function PipelinePage() {
  const deals = useQuery(api.deals.listDeals);
  const contacts = useQuery(api.contacts.listContacts);
  const updateDeal = useMutation(api.deals.updateDeal);
  const createDeal = useMutation(api.deals.createDeal);
  const addComment = useMutation(api.pipelineComments.addComment);

  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [addStage, setAddStage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");

  const comments = useQuery(
    api.pipelineComments.getCommentsByDeal,
    selectedDeal ? { dealId: selectedDeal._id } : "skip"
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const dealsByStage = WC.pipelineStages.reduce<Record<string, Deal[]>>((acc, stage) => {
    acc[stage] = (deals ?? []).filter((d) => d.stage === stage) as Deal[];
    return acc;
  }, {});

  const handleDragStart = (event: DragStartEvent) => {
    const deal = (deals ?? []).find((d) => d._id === event.active.id);
    if (deal) setActiveDeal(deal as Deal);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const deal = (deals ?? []).find((d) => d._id === active.id);
    const newStage = over.id as string;
    if (deal && WC.pipelineStages.includes(newStage) && deal.stage !== newStage) {
      await updateDeal({ id: deal._id as Id<"deals">, stage: newStage });
      toast.success(`Moved to ${newStage}`);
    }
  };

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.contactId || !form.value || !form.expectedClose) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await createDeal({
        title: form.title,
        contactId: form.contactId as Id<"contacts">,
        value: parseFloat(form.value),
        stage: addStage ?? "Lead",
        probability: parseInt(form.probability),
        expectedClose: new Date(form.expectedClose).getTime(),
        notes: form.notes,
      });
      toast.success(`${WC.dealLabel} created`);
      setAddStage(null);
      setForm(emptyForm);
    } catch { toast.error("Failed to create deal"); }
    finally { setSubmitting(false); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedDeal) return;
    try {
      await addComment({
        dealId: selectedDeal._id,
        comment: newComment,
        addedBy: "Current User", // TODO: Get from auth context
      });
      setNewComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">Drag and drop to move {WC.dealLabel.toLowerCase()}s between stages</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          Total: {formatCurrency((deals ?? []).reduce((s, d) => s + d.value, 0), WC.currency)}
        </div>
      </div>

      {deals === undefined ? (
        <div className="flex gap-4">
          {WC.pipelineStages.map((s) => <Skeleton key={s} className="flex-1 h-96 min-w-[240px]" />)}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {WC.pipelineStages.map((stage) => (
              <DroppableColumn
                key={stage}
                stage={stage}
                deals={dealsByStage[stage] ?? []}
                onAddDeal={(s) => { setAddStage(s); setForm(emptyForm); }}
                onViewDeal={setSelectedDeal}
              />
            ))}
          </div>
          <DragOverlay>
            {activeDeal && <DealCard deal={activeDeal} isDragging />}
          </DragOverlay>
        </DndContext>
      )}

      {/* View Deal Details Modal */}
      <Dialog open={!!selectedDeal} onOpenChange={(o) => !o && setSelectedDeal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedDeal?.title}</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-6 mt-2">
              {/* Stage Badge */}
              <div>
                <Badge className={`${STAGE_HEADER[selectedDeal.stage] ?? "bg-slate-600"} text-white`}>
                  {selectedDeal.stage}
                </Badge>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Contact</span>
                  </div>
                  <p className="text-slate-900 font-medium">{selectedDeal.contactName}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">Value</span>
                  </div>
                  <p className="text-slate-900 font-bold text-lg">{formatCurrency(selectedDeal.value, WC.currency)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Percent className="h-4 w-4" />
                    <span className="font-medium">Probability</span>
                  </div>
                  <p className="text-slate-900 font-medium">{selectedDeal.probability}%</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Expected Close</span>
                  </div>
                  <p className="text-slate-900 font-medium">{formatDate(selectedDeal.expectedClose)}</p>
                </div>
              </div>

              {/* Expected Value */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">Expected Value</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">
                    {formatCurrency(selectedDeal.value * (selectedDeal.probability / 100), WC.currency)}
                  </span>
                </div>
                <p className="text-xs text-indigo-700 mt-1">
                  Based on {selectedDeal.probability}% probability
                </p>
              </div>

              {/* Notes */}
              {selectedDeal.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Notes</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{selectedDeal.notes}</p>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments ({comments?.length ?? 0})</span>
                </div>

                {/* Comments List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments?.map((comment) => (
                    <div key={comment._id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">{comment.addedBy}</span>
                        <span className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  ))}
                  {comments?.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No comments yet</p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleAddComment();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim()}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400">Press Cmd/Ctrl + Enter to submit</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDeal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Deal Modal */}
      <Dialog open={!!addStage} onOpenChange={(o) => !o && setAddStage(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add {WC.dealLabel} to {addStage}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddDeal} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Deal name" />
            </div>
            <div className="space-y-1">
              <Label>Contact *</Label>
              <Select value={form.contactId} onValueChange={(v) => setForm({ ...form, contactId: v })}>
                <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                <SelectContent>
                  {(contacts ?? []).map((c) => <SelectItem key={c._id} value={c._id}>{c.name} — {c.company}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Value ({WC.currency}) *</Label>
                <Input type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="10000" />
              </div>
              <div className="space-y-1">
                <Label>Probability (%)</Label>
                <Input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Expected Close *</Label>
              <Input type="date" value={form.expectedClose} onChange={(e) => setForm({ ...form, expectedClose: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddStage(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}