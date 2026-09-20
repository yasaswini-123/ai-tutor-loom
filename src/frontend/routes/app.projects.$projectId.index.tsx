import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Flame,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import {
  EvidenceNote,
  MetricCard,
  ProgressBar,
  ProgressRing,
  SectionCard,
  TrendPill,
} from "@/frontend/components/app/primitives";
import { ActivityTimeline, RecommendationCard } from "@/frontend/components/app/blocks";
import { TrendLineChart } from "@/frontend/components/app/charts";
import {
  quizPerformanceSeries,
  recommendations,
} from "@/backend/lib/demo-data";
import { useStudyStore } from "@/backend/lib/store";

export const Route = createFileRoute("/app/projects/$projectId/")({
  component: ProjectOverviewTab,
});

function ProjectOverviewTab() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/" });
  const store = useStudyStore();
  const project = store.projects.find((p) => p.id === projectId) ?? store.projects[0]!;

  const projectActivity = store.activity.filter(
    (a) =>
      a.project.toLowerCase().includes(project.name.toLowerCase()) ||
      project.name.toLowerCase().includes(a.project.toLowerCase()),
  );

  const topConcepts = project.concepts.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top row: Progress & Recommendation */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Overall Progress Card */}
        <div className="surface-card flex flex-col items-center justify-center p-6 text-center lg:col-span-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Overall Project Progress
          </p>
          <div className="my-5">
            <ProgressRing value={project.progress} size={150} label="Curriculum Completed" />
          </div>
          <div className="flex w-full justify-around border-t border-border pt-4 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">
                {store.materials.filter((m) => m.projectId === project.id).length}
              </p>
              <span>Uploaded PDFs</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <p className="font-semibold text-foreground">{project.concepts.length}</p>
              <span>Extracted Concepts</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <p className="font-semibold text-foreground">{project.mastery}%</p>
              <span>Est. Mastery</span>
            </div>
          </div>
        </div>

        {/* Primary Recommended Next Step */}
        {(() => {
          const attentionConcepts = project.concepts.filter((c) => c.trend === "attention" || c.mastery < 65);
          const targetConcept = attentionConcepts[0] || project.concepts[0];
          const hasMistake = targetConcept?.mistakes && targetConcept.mistakes.length > 0;

          return (
            <div className="lg:col-span-8 flex flex-col justify-between surface-card p-6 border-primary/30 bg-primary/5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="size-3.5" /> Recommended Next Action
                  </span>
                  <span className="text-xs text-muted-foreground">Evidence-Based</span>
                </div>

                <h2 className="mt-3 font-display text-xl font-bold">
                  {targetConcept ? `Practice ${targetConcept.name}` : "Explore Project Materials"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {targetConcept
                    ? `Current estimated mastery for ${targetConcept.name} is ${targetConcept.mastery}%. Attempting an adaptive quiz or discussing this concept with the AI Tutor will reinforce your understanding.`
                    : "Upload study materials or take an adaptive quiz to start generating personalised concept recommendations."}
                </p>

                {targetConcept && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                      Focus Concept: {targetConcept.name} ({targetConcept.mastery}% mastery)
                    </span>
                    {hasMistake && (
                      <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                        Recent Mistake: {targetConcept.mistakes[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/app/projects/$projectId/materials"
                  params={{ projectId: project.id }}
                >
                  <Button variant="outline">
                    View Materials <ArrowRight className="size-4 ml-1" />
                  </Button>
                </Link>
                <Link
                  to="/app/projects/$projectId/quiz"
                  params={{ projectId: project.id }}
                >
                  <Button>
                    Take Adaptive Quiz
                  </Button>
                </Link>
                <Link
                  to="/app/projects/$projectId/tutor"
                  params={{ projectId: project.id }}
                >
                  <Button variant="ghost">
                    Ask AI Tutor
                  </Button>
                </Link>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Second row: Key Concepts & Learning Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Important Concepts */}
        <SectionCard
          title="Important Concepts"
          description="Live estimated mastery based on quiz answers, mistakes, and tutor interactions."
          action={
            <Link
              to="/app/projects/$projectId/mastery"
              params={{ projectId: project.id }}
            >
              <Button variant="ghost" size="sm">
                View all ({project.concepts.length})
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {topConcepts.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-card/60 p-3.5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{c.name}</span>
                    <TrendPill trend={c.trend} />
                  </div>
                  <span className="font-mono text-sm font-semibold">{c.mastery}%</span>
                </div>
                <ProgressBar value={c.mastery} />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last practiced: {c.lastPracticed}</span>
                  <span>{c.materialRefs[0]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <EvidenceNote>
              Mastery evolves continuously as you test understanding with quizzes and the AI Tutor.
            </EvidenceNote>
          </div>
        </SectionCard>

        {/* Learning Performance Chart */}
        <SectionCard
          title="Quiz Performance Over Time"
          description="Scores across consecutive adaptive assessment sessions."
          action={
            <Link
              to="/app/projects/$projectId/analytics"
              params={{ projectId: project.id }}
            >
              <Button variant="ghost" size="sm">
                Detailed Analytics
              </Button>
            </Link>
          }
        >
          {(() => {
            const projectSessions = (store.quizSessions || []).filter((s) => s.projectId === project.id);
            if (projectSessions.length === 0) {
              return (
                <div className="h-[220px] flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-center p-6 text-muted-foreground">
                  <Brain className="size-8 text-primary/40 mb-2" />
                  <p className="font-semibold text-sm text-foreground">No Quiz Scores Recorded Yet</p>
                  <p className="text-xs max-w-xs mt-1">
                    Take an adaptive quiz to start tracking your performance trajectory.
                  </p>
                  <Link to="/app/projects/$projectId/quiz" params={{ projectId: project.id }} className="mt-3">
                    <Button size="sm">Take Adaptive Quiz</Button>
                  </Link>
                </div>
              );
            }
            const chartData = [...projectSessions].reverse().map((s, idx) => ({
              attempt: `A${idx + 1}`,
              score: s.scorePercent,
            }));
            const firstScore = chartData[0]!.score;
            const latestScore = chartData[chartData.length - 1]!.score;
            const gain = latestScore - firstScore;

            return (
              <>
                <TrendLineChart
                  data={chartData}
                  xKey="attempt"
                  yKey="score"
                  height={220}
                />
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>Starting Score: {firstScore}%</span>
                  <span className={`font-medium ${gain >= 0 ? "text-success" : "text-destructive"}`}>
                    Latest Score: {latestScore}% ({gain >= 0 ? `+${gain}% gain` : `${gain}%`})
                  </span>
                </div>
              </>
            );
          })()}
        </SectionCard>
      </div>

      {/* Third row: Quick Navigation Loop & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Core Learning Loop Shortcuts */}
        <div className="surface-card p-5 lg:col-span-1 space-y-3">
          <h3 className="font-display text-base font-semibold">Primary Learning Loop</h3>
          <p className="text-xs text-muted-foreground">
            Move sequentially through the evidence-based study workflow:
          </p>

          <div className="space-y-2 pt-2">
            <Link
              to="/app/projects/$projectId/materials"
              params={{ projectId: project.id }}
              className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">1. Study Materials</p>
                  <p className="text-xs text-muted-foreground">Upload PDFs & extract knowledge</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              to="/app/projects/$projectId/tutor"
              params={{ projectId: project.id }}
              className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">2. AI Tutor</p>
                  <p className="text-xs text-muted-foreground">Grounded Q&A with citations</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              to="/app/projects/$projectId/quiz"
              params={{ projectId: project.id }}
              className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Brain className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">3. Adaptive Quiz</p>
                  <p className="text-xs text-muted-foreground">Test understanding & evaluate</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              to="/app/projects/$projectId/growth"
              params={{ projectId: project.id }}
              className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">4. Growth Analysis</p>
                  <p className="text-xs text-muted-foreground">Track mastery over time</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Project Activity Timeline */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Project Activity"
            description="All interactions isolated to this project"
            action={
              <Link to="/app/activity">
                <Button variant="ghost" size="sm">
                  Full Log
                </Button>
              </Link>
            }
          >
            <ActivityTimeline
              events={
                projectActivity.length > 0
                  ? projectActivity.slice(0, 5)
                  : store.activity.slice(0, 5)
              }
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
