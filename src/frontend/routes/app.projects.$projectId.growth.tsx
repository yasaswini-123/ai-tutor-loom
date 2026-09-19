import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  LineChart,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { SectionCard, TrendPill, ProgressBar } from "@/frontend/components/app/primitives";
import { RecommendationCard } from "@/frontend/components/app/blocks";
import { TrendLineChart } from "@/frontend/components/app/charts";
import {
  getProject,
  masteryTrendSeries,
  recommendations,
} from "@/backend/lib/demo-data";
import { useStudyStore } from "@/backend/lib/store";

export const Route = createFileRoute("/app/projects/$projectId/growth")({
  component: ProjectGrowthTab,
});

export function ProjectGrowthTab() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/growth" });
  const store = useStudyStore();
  const project = store.projects.find((p) => p.id === projectId) ?? store.projects[0]!;

  const improving = project.concepts.filter((c) => c.trend === "improving");
  const stable = project.concepts.filter((c) => c.trend === "stable");
  const attention = project.concepts.filter((c) => c.trend === "attention");

  return (
    <div className="space-y-6">
      {/* Growth Header */}
      <div className="surface-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LineChart className="size-4" />
            </span>
            <h2 className="text-xl font-display font-semibold">Growth & Velocity Analysis</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tracking knowledge retention, decay rate, and skill trajectory across practice intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-center">
            <p className="text-xs text-success font-medium">Net Monthly Gain</p>
            <p className="text-lg font-bold text-success font-display">+24%</p>
          </div>
        </div>
      </div>

      {/* Main Growth Curve */}
      <SectionCard
        title="Mastery Progression (4-Week Horizon)"
        description="Aggregate project mastery trajectory over four continuous evaluation cycles."
      >
        <TrendLineChart
          data={masteryTrendSeries}
          xKey="week"
          yKey="mastery"
          height={260}
        />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border pt-4 text-xs">
          {masteryTrendSeries.map((pt) => (
            <div key={pt.week} className="rounded-lg border border-border bg-card p-2.5 text-center">
              <span className="text-muted-foreground">{pt.week}</span>
              <p className="text-base font-bold text-foreground mt-0.5">{pt.mastery}%</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Concept Trajectory Groups */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Improving */}
        <div className="surface-card p-5 space-y-3 border-success/30 bg-success/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-success flex items-center gap-1.5">
              <TrendingUp className="size-4" /> Improving ({improving.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">High retention</span>
          </div>
          <div className="space-y-2">
            {improving.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-2.5 text-xs">
                <div className="flex justify-between font-medium mb-1">
                  <span>{c.name}</span>
                  <span className="text-success font-mono">{c.mastery}%</span>
                </div>
                <ProgressBar value={c.mastery} />
              </div>
            ))}
          </div>
        </div>

        {/* Stable */}
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Minus className="size-4 text-muted-foreground" /> Stable ({stable.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">Consistent scores</span>
          </div>
          <div className="space-y-2">
            {stable.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-2.5 text-xs">
                <div className="flex justify-between font-medium mb-1">
                  <span>{c.name}</span>
                  <span className="font-mono text-foreground">{c.mastery}%</span>
                </div>
                <ProgressBar value={c.mastery} />
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="surface-card p-5 space-y-3 border-warning/30 bg-warning/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-warning-foreground flex items-center gap-1.5">
              <TrendingDown className="size-4 text-warning" /> Needs Attention ({attention.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">Recent errors</span>
          </div>
          <div className="space-y-2">
            {attention.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-2.5 text-xs">
                <div className="flex justify-between font-medium mb-1">
                  <span>{c.name}</span>
                  <span className="text-warning-foreground font-mono">{c.mastery}%</span>
                </div>
                <ProgressBar value={c.mastery} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What should I do next? Dedicated Recommendations */}
      <SectionCard
        title="Targeted Next Actions"
        description="Synthesized recommendations answering: What should I study or practice next?"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              tag={rec.tag}
              title={rec.title}
              reason={rec.reason}
              action={rec.action}
              to={rec.to}
              projectId={project.id}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
