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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { WORKSPACE_CONTEXT as WC } from "@/lib/config";
import { formatDate, isOverdue, isDueToday } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Calendar, User, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  dueDate: number;
  priority: string;
  status: string;
  assignedTo: string;
  relatedTo?: string;
  relatedId?: string;
  createdAt: number;
};

const PRIORITY_COLORS: Record<string, string> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

const STATUS_COLORS: Record<string, string> = {
  "Todo": "secondary",
  "In Progress": "default",
  "Done": "success",
};

const emptyForm = {
  title: "", description: "", dueDate: "", priority: "Medium", status: "Todo", assignedTo: "Alice",
};

export default function TasksPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const filtered = (tasks ?? []).filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchAssigned = assignedFilter === "all" || t.assignedTo === assignedFilter;
    return matchStatus && matchPriority && matchAssigned;
  });

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "Done" ? "Todo" : "Done";
    await updateTask({ id: task._id, status: newStatus });
    toast.success(newStatus === "Done" ? "Task completed!" : "Task reopened");
    if (selectedTask?._id === task._id) setSelectedTask({ ...selectedTask, status: newStatus });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) { toast.error("Title and due date are required"); return; }
    setSubmitting(true);
    try {
      await createTask({
        title: form.title, description: form.description, dueDate: new Date(form.dueDate).getTime(),
        priority: form.priority, status: form.status, assignedTo: form.assignedTo,
      });
      toast.success("Task created");
      setAddOpen(false);
      setForm(emptyForm);
    } catch { toast.error("Failed to create task"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">{tasks?.length ?? 0} tasks total</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Task</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Task List */}
        <div className="lg:col-span-3 space-y-3">
          {/* Filters */}
          <Card>
            <CardContent className="p-4 flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {WC.taskStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="All Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {WC.taskPriorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="All Assignees" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {WC.mockUsers.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {tasks === undefined ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CheckCircle2 className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No tasks found</p>
                <Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add First Task</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => {
                const overdue = isOverdue(task.dueDate) && task.status !== "Done";
                const dueToday = isDueToday(task.dueDate) && task.status !== "Done";
                return (
                  <div
                    key={task._id}
                    className={cn(
                      "bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
                      selectedTask?._id === task._id ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200",
                      overdue ? "border-l-4 border-l-red-500" : dueToday ? "border-l-4 border-l-amber-500" : ""
                    )}
                    onClick={() => setSelectedTask(task as Task)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.status === "Done"}
                        onCheckedChange={() => handleToggleStatus(task as Task)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn("font-medium text-slate-900 text-sm", task.status === "Done" && "line-through text-slate-400")}>{task.title}</p>
                          <Badge variant={(PRIORITY_COLORS[task.priority] as any) ?? "secondary"} className="text-xs">{task.priority}</Badge>
                          <Badge variant={(STATUS_COLORS[task.status] as any) ?? "secondary"} className="text-xs">{task.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className={overdue ? "text-red-500 font-medium" : dueToday ? "text-amber-600 font-medium" : ""}>
                              {overdue ? "Overdue: " : dueToday ? "Today: " : ""}{formatDate(task.dueDate)}
                            </span>
                          </span>
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignedTo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedTask ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">{selectedTask.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant={(PRIORITY_COLORS[selectedTask.priority] as any) ?? "secondary"}>{selectedTask.priority} Priority</Badge>
                  <Badge variant={(STATUS_COLORS[selectedTask.status] as any) ?? "secondary"}>{selectedTask.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTask.description && <p className="text-sm text-slate-600">{selectedTask.description}</p>}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Due: {formatDate(selectedTask.dueDate)}</span>
                    {isOverdue(selectedTask.dueDate) && selectedTask.status !== "Done" && (
                      <Badge variant="destructive" className="text-xs ml-1">Overdue</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Assigned to: {selectedTask.assignedTo}</span>
                  </div>
                  {selectedTask.relatedTo && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                      <span>Related {selectedTask.relatedTo}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => handleToggleStatus(selectedTask)}>
                    {selectedTask.status === "Done" ? <><Clock className="h-3 w-3 mr-1" />Reopen</> : <><CheckCircle2 className="h-3 w-3 mr-1" />Complete</>}
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await deleteTask({ id: selectedTask._id }); setSelectedTask(null); toast.success("Task deleted"); }}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center h-64">
              <CheckCircle2 className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">Select a task to see details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task description..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Due Date *</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WC.taskPriorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WC.taskStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Assign To</Label>
                <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WC.mockUsers.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Task"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
