import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Brain,
  Check,
  Cpu,
  Database,
  Key,
  Lock,
  Save,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { PageHeader, SectionCard } from "@/frontend/components/app/primitives";
import { currentUser } from "@/backend/lib/demo-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Study Companion" },
      { name: "description", content: "Manage learner preferences, AI models, and persistent context." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [model, setModel] = useState("gemini-1.5-pro");
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••");
  const [temperature, setTemperature] = useState("0.2");
  const [persistentContext, setPersistentContext] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your learning preferences, persistent AI context, and model parameters."
        breadcrumb="Workspace / Settings"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Learner Profile */}
        <SectionCard
          title="Learner Profile"
          description="Your identity across spaces and projects."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full Name</Label>
              <Input id="user-name" defaultValue={currentUser.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email Address</Label>
              <Input id="user-email" defaultValue={currentUser.email} readOnly className="bg-muted" />
            </div>
          </div>
        </SectionCard>

        {/* AI & Observability Configuration */}
        <SectionCard
          title="AI Model & Inference Configuration"
          description="Select preferred LLM backend and grounded retrieval parameters."
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ai-model">Primary AI Tutor Model</Label>
                <select
                  id="ai-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended for citations)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-low latency)</option>
                  <option value="gpt-4o">GPT-4o (High-fidelity evaluations)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="temperature">Sampling Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
                <span className="text-[11px] text-muted-foreground">
                  Lower temperature (0.0–0.3) enforces strict adherence to citations.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="api-key">Custom API Key (Optional Override)</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <span className="text-[11px] text-muted-foreground">
                Leave default to use the managed workspace sandbox key.
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Persistent Learning Context Controls */}
        <SectionCard
          title="Persistent Learning Context"
          description="Control what memory and history the AI Tutor retains across sessions."
        >
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={persistentContext}
                onChange={(e) => setPersistentContext(e.target.checked)}
                className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-semibold">Enable Persistent Learner Memory</p>
                <p className="text-xs text-muted-foreground">
                  Retains known strengths, repeated misconceptions, and assessment scores across sessions to tailor question difficulty and explanations.
                </p>
              </div>
            </label>
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            <Save className="size-4" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
