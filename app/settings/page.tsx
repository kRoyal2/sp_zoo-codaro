"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { WORKSPACE_CONTEXT as WC } from "@/lib/config";
import { toast } from "sonner";
import { Save, Globe, Cpu, Users, Zap, Check } from "lucide-react";

const CURRENCIES = ["PLN", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
const TIMEZONES = ["Europe/Warsaw", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Tokyo", "Australia/Sydney"];

const MOCK_TEAM = [
  { name: "Alice Smith", email: "alice@flowdesk.io", role: "Admin", avatar: "A" },
  { name: "Bob Johnson", email: "bob@flowdesk.io", role: "Member", avatar: "B" },
  { name: "Charlie Brown", email: "charlie@flowdesk.io", role: "Member", avatar: "C" },
];

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your workspace</p>
      </div>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="team"><TeamTab /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralTab() {
  const settings = useQuery(api.settings.getAllSettings);
  const setSetting = useMutation(api.settings.setSetting);

  const [appName, setAppName] = useState("");
  const [currency, setCurrency] = useState("PLN");
  const [timezone, setTimezone] = useState("Europe/Warsaw");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setAppName(settings.appName ?? WC.appName);
      setCurrency(settings.currency ?? WC.currency);
      setTimezone(settings.timezone ?? "Europe/Warsaw");
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        setSetting({ key: "appName", value: appName }),
        setSetting({ key: "currency", value: currency }),
        setSetting({ key: "timezone", value: timezone }),
      ]);
      toast.success("Settings saved");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  if (settings === undefined) return <div className="mt-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="mt-4 max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Settings</CardTitle>
          <CardDescription>Basic configuration for your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>App Name</Label>
            <Input value={appName} onChange={(e) => setAppName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Default Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamTab() {
  return (
    <div className="mt-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Team Members</CardTitle>
          <CardDescription>Manage access and roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_TEAM.map((member) => (
            <div key={member.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">{member.avatar}</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.email}</p>
                </div>
              </div>
              <Badge variant={member.role === "Admin" ? "default" : "secondary"}>{member.role}</Badge>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => toast.info("Team management coming soon")}>
            <Users className="h-4 w-4 mr-2" />Invite Team Member
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationsTab() {
  const settings = useQuery(api.settings.getAllSettings);
  const setSetting = useMutation(api.settings.setSetting);

  const [n8nUrl, setN8nUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setN8nUrl(settings.n8nBaseUrl ?? "https://n8n.example.com");
      setAiPrompt(settings.aiSystemPrompt ?? "");
    }
  }, [settings]);

  if (settings === undefined) return <div className="mt-4 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;

  return (
    <div className="mt-4 max-w-2xl space-y-4">
      {/* n8n Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Zap className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-base">n8n Automation</CardTitle>
              <CardDescription>Configure your n8n webhook base URL</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Webhook Base URL</Label>
            <Input value={n8nUrl} onChange={(e) => setN8nUrl(e.target.value)} placeholder="https://n8n.example.com" />
          </div>
          <Button
            size="sm"
            disabled={saving === "n8n"}
            onClick={async () => {
              setSaving("n8n");
              await setSetting({ key: "n8nBaseUrl", value: n8nUrl });
              toast.success("n8n URL saved");
              setSaving(null);
            }}
          >
            <Save className="h-3 w-3 mr-1" />{saving === "n8n" ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* Convex Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base">Convex Backend</CardTitle>
              <CardDescription>Real-time backend deployment info</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Deployment URL</Label>
            <Input value={process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://your-deployment.convex.cloud"} readOnly className="bg-slate-50 text-slate-500" />
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Connected and syncing
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base">AI Assistant</CardTitle>
              <CardDescription>Configure the system prompt for AI contact summaries</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>System Prompt</Label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="You are a helpful CRM assistant..."
              className="h-28"
            />
          </div>
          <Button
            size="sm"
            disabled={saving === "ai"}
            onClick={async () => {
              setSaving("ai");
              await setSetting({ key: "aiSystemPrompt", value: aiPrompt });
              toast.success("AI system prompt saved");
              setSaving(null);
            }}
          >
            <Save className="h-3 w-3 mr-1" />{saving === "ai" ? "Saving..." : "Save Prompt"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
