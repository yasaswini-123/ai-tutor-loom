import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Database,
  FileText,
  Filter,
  GraduationCap,
  HardDrive,
  HelpCircle,
  Info,
  Layers,
  LineChart,
  Loader2,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import {
  MetricCard,
  ProgressBar,
  SectionCard,
  StatusBadge,
} from "@/frontend/components/app/primitives";
import { MultiLineChart, TrendLineChart } from "@/frontend/components/app/charts";
import {
  adminActivitySeries,
  adminMetrics,
  adminUsers,
  aiLatencySeries,
  aiRequests,
  backgroundJobs as initialJobs,
  evaluationGroups,
  evaluationTrend,
  systemComponents,
} from "@/backend/lib/demo-data";
import { toast } from "sonner";
import { cn } from "@/backend/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console & Observability — AI Study Companion" },
      { name: "description", content: "Platform monitoring, AI telemetry, evaluation, and system health." },
    ],
  }),
  component: AdminPage,
});

type AdminTab =
  | "overview"
  | "users"
  | "ai-usage"
  | "ai-eval"
  | "jobs"
  | "system";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedUser, setSelectedUser] = useState<(typeof adminUsers)[0] | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [diagnosingReq, setDiagnosingReq] = useState<(typeof aiRequests)[0] | null>(null);

  const handleRetryJob = (jobId: string) => {
    toast.info(`Retrying job ${jobId}...`);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, status: "Running", attempts: j.attempts + 1 }
          : j,
      ),
    );

    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, status: "Completed", duration: "1m 15s" }
            : j,
        ),
      );
      toast.success(`Job ${jobId} completed successfully on retry!`);
    }, 2000);
  };

  const filteredUsers = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mr-2"
            >
              <ArrowLeft className="size-4" /> Back to App
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                <Shield className="size-4" />
              </span>
              <div>
                <h1 className="text-sm font-bold leading-none">Admin Observability Console</h1>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Platform Telemetry & AI Systems Engineering
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
              <span className="size-2 rounded-full bg-success animate-pulse" /> All Systems Nominal
            </span>
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-border bg-card px-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {[
            { id: "overview" as const, label: "Platform Overview", icon: BarChart3 },
            { id: "users" as const, label: "Users & Learning Journeys", icon: Users },
            { id: "ai-usage" as const, label: "AI Observability & Costs", icon: Zap },
            { id: "ai-eval" as const, label: "AI Quality & Evaluation", icon: Sparkles },
            { id: "jobs" as const, label: "Background Jobs", icon: Layers },
            { id: "system" as const, label: "System Health", icon: Server },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Body */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {adminMetrics.map((m) => (
                <div key={m.label} className="surface-card p-4">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-xl font-bold font-display text-foreground mt-1.5">{m.value}</p>
                  <p className="text-[11px] text-success font-medium mt-1">{m.delta} vs last week</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard
                title="Platform User & Request Traffic"
                description="Daily active users and AI inference requests."
              >
                <MultiLineChart
                  data={adminActivitySeries}
                  xKey="date"
                  series={[
                    { key: "users", name: "Active Users", color: "oklch(0.54 0.19 268)" },
                    { key: "projects", name: "Projects Created", color: "oklch(0.62 0.15 152)" },
                  ]}
                  height={240}
                />
              </SectionCard>

              <SectionCard
                title="AI Latency Distribution Across Clusters"
                description="End-to-end response times in seconds."
              >
                <TrendLineChart
                  data={aiLatencySeries}
                  xKey="t"
                  yKey="latency"
                  height={240}
                />
              </SectionCard>
            </div>
          </div>
        )}

        {/* 2. USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter users by name or email..."
                  className="pl-9"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                Showing {filteredUsers.length} of {adminUsers.length} enrolled learners
              </span>
            </div>

            <SectionCard title="Registered Learners" description="Inspect individual learning journeys, progress, and AI usage.">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted-foreground font-semibold">
                    <tr>
                      <th className="pb-3">Learner</th>
                      <th className="pb-3">Spaces</th>
                      <th className="pb-3">Projects</th>
                      <th className="pb-3">Last Active</th>
                      <th className="pb-3">AI Consumption</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5">
                          <p className="font-semibold text-foreground">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="py-3.5 font-medium">{u.spaces}</td>
                        <td className="py-3.5 font-medium">{u.projects}</td>
                        <td className="py-3.5 text-muted-foreground">{u.lastActive}</td>
                        <td className="py-3.5 font-mono">{u.usage}</td>
                        <td className="py-3.5">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(u)}
                            className="h-7 text-xs"
                          >
                            Inspect Journey
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}

        {/* 3. AI OBSERVABILITY TAB */}
        {activeTab === "ai-usage" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Total Inferences" value="18,492" hint="30-day window" icon={Zap} />
              <MetricCard label="Avg Total Latency" value="1.82s" hint="Retrieval: 0.4s · Gen: 1.4s" icon={Clock} />
              <MetricCard label="Token Volume" value="1.42M" hint="Context + Generation" icon={Cpu} />
              <MetricCard label="Estimated Cost" value="$38.42" hint="Current billing cycle" icon={Coins} tone="primary" />
            </div>

            <SectionCard
              title="AI Request Audit & Latency Telemetry"
              description="Full breakdown of retrieval latency vs generation latency, token expenditure, and slow request diagnostics."
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted-foreground font-semibold">
                    <tr>
                      <th className="pb-3">Request ID</th>
                      <th className="pb-3">Feature</th>
                      <th className="pb-3">Model</th>
                      <th className="pb-3">Retrieval</th>
                      <th className="pb-3">Generation</th>
                      <th className="pb-3">Total Latency</th>
                      <th className="pb-3">Tokens</th>
                      <th className="pb-3">Est. Cost</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Diagnose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {aiRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 font-mono font-semibold text-primary">{req.id}</td>
                        <td className="py-3 font-medium">{req.feature}</td>
                        <td className="py-3 text-muted-foreground">{req.model}</td>
                        <td className="py-3 font-mono">{req.retrieval}</td>
                        <td className="py-3 font-mono">{req.generation}</td>
                        <td className="py-3 font-mono font-semibold">{req.latency}</td>
                        <td className="py-3 font-mono">{req.tokens}</td>
                        <td className="py-3 font-mono">{req.cost}</td>
                        <td className="py-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDiagnosingReq(req)}
                            className="h-7 text-xs text-primary"
                          >
                            Explain
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}

        {/* 4. AI QUALITY & EVALUATION TAB */}
        {activeTab === "ai-eval" && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {evaluationGroups.map((group) => (
                <div key={group.title} className="surface-card p-5 space-y-4">
                  <h3 className="font-semibold text-sm border-b border-border pb-2 flex items-center gap-1.5">
                    <Sparkles className="size-4 text-primary" /> {group.title}
                  </h3>
                  <div className="space-y-3">
                    {group.metrics.map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{m.label}</span>
                          <span className="font-mono font-bold text-foreground">{m.value}%</span>
                        </div>
                        <ProgressBar value={m.value} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <SectionCard
              title="Evaluation Quality Trends Over Time"
              description="Continuous evaluation against test benches to prevent prompt/model regressions."
            >
              <MultiLineChart
                data={evaluationTrend}
                xKey="week"
                series={[
                  { key: "groundedness", name: "Groundedness", color: "oklch(0.54 0.19 268)" },
                  { key: "grading", name: "Grading Reliability", color: "oklch(0.62 0.18 305)" },
                  { key: "recommendation", name: "Recommendation Fit", color: "oklch(0.62 0.15 152)" },
                ]}
                height={240}
              />
            </SectionCard>
          </div>
        )}

        {/* 5. BACKGROUND JOBS TAB */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            <SectionCard
              title={`Asynchronous Worker Queue (${jobs.length})`}
              description="Idempotent processing queue for OCR, vector embeddings, evaluations, and concept updates."
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted-foreground font-semibold">
                    <tr>
                      <th className="pb-3">Job ID</th>
                      <th className="pb-3">Task Type</th>
                      <th className="pb-3">Target Project</th>
                      <th className="pb-3">Started</th>
                      <th className="pb-3">Duration</th>
                      <th className="pb-3">Attempts</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 font-mono text-primary font-medium">{job.id}</td>
                        <td className="py-3.5 font-medium">{job.type}</td>
                        <td className="py-3.5 text-muted-foreground">{job.project}</td>
                        <td className="py-3.5 text-muted-foreground">{job.started}</td>
                        <td className="py-3.5 font-mono">{job.duration}</td>
                        <td className="py-3.5 font-mono">{job.attempts}</td>
                        <td className="py-3.5">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          {job.status === "Failed" || job.status === "Retrying" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetryJob(job.id)}
                              className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                              <RefreshCw className="size-3 mr-1" /> Retry
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}

        {/* 6. SYSTEM HEALTH TAB */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {systemComponents.map((comp) => (
                <div key={comp.name} className="surface-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{comp.name}</h4>
                    <StatusBadge status={comp.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <span>Latency: <strong className="text-foreground">{comp.latency}</strong></span>
                    <span>Errors: {comp.errors}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* User Journey Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Learner Journey: {selectedUser?.name}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <div>
                  <span className="text-muted-foreground">Spaces</span>
                  <p className="font-bold text-sm text-foreground mt-0.5">{selectedUser.spaces}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Projects</span>
                  <p className="font-bold text-sm text-foreground mt-0.5">{selectedUser.projects}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">AI Requests</span>
                  <p className="font-bold text-sm text-foreground mt-0.5">{selectedUser.usage}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-2">Recent Journey Milestones:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-success" /> Mastered Decision Trees in Machine Learning (82%)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-success" /> Uploaded Optimization Cheatsheet.pdf (6 pages)
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="size-3.5 text-primary" /> Active session: Asked Tutor about Gradient Descent
                  </li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Slow Request Diagnosis Modal */}
      <Dialog open={!!diagnosingReq} onOpenChange={() => setDiagnosingReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Latency Diagnostics ({diagnosingReq?.id})
            </DialogTitle>
            <DialogDescription>
              Telemetry breakdown investigating response time and potential bottlenecks.
            </DialogDescription>
          </DialogHeader>
          {diagnosingReq && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Feature:</span>
                  <strong className="text-foreground">{diagnosingReq.feature}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model Used:</span>
                  <strong className="text-foreground">{diagnosingReq.model}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vector Retrieval Latency:</span>
                  <span className="font-mono">{diagnosingReq.retrieval}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generation / Inference Latency:</span>
                  <span className="font-mono">{diagnosingReq.generation}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-semibold text-foreground">Total Roundtrip:</span>
                  <span className="font-mono font-bold text-foreground">{diagnosingReq.latency}</span>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-foreground">
                <p className="font-semibold mb-1">Diagnosis Insight:</p>
                <p className="text-muted-foreground">
                  {diagnosingReq.status === "Slow"
                    ? "Retrieval step experienced higher latency (3.9s) due to vector re-ranking over 42 document chunks."
                    : diagnosingReq.status === "Failed"
                    ? "Upstream AI provider encountered an HTTP 504 gateway timeout during generation."
                    : "Optimal latency profile. Cache hit on project context embeddings."}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setDiagnosingReq(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
