import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  History,
  Info,
  LineChart,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import {
  EvidenceNote,
  ProgressBar,
  SectionCard,
  TrendPill,
} from "@/frontend/components/app/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { type Concept } from "@/backend/lib/demo-data";
import { useStudyStore } from "@/backend/lib/store";
import { TrendLineChart } from "@/frontend/components/app/charts";

export const Route = createFileRoute("/app/projects/$projectId/mastery")({
  component: ProjectMasteryTab,
});

export function ProjectMasteryTab() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/mastery" });
  const store = useStudyStore();
  const project = store.projects.find((p) => p.id === projectId) ?? store.projects[0]!;

  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  return (
    <div className="space-y-6">
      {/* Header with Project Mastery summary */}
      <div className="surface-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Brain className="size-4" />
            </span>
            <h2 className="text-xl font-display font-semibold">Concept Mastery</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Bayesian skill estimation based on quiz responses, open-ended evaluations, and recurring errors.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-muted/40 rounded-xl border border-border p-3 shrink-0">
          <div>
            <p className="text-xs text-muted-foreground">Estimated Overall Mastery</p>
            <p className="font-display text-2xl font-bold text-foreground">{project.mastery}%</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Mastered Concepts</p>
            <p className="font-display text-2xl font-bold text-success">
              {project.concepts.filter((c) => c.mastery >= 75).length} / {project.concepts.length}
            </p>
          </div>
        </div>
      </div>

      {/* Concept Cards Grid */}
      <SectionCard
        title={`All Tracked Concepts (${project.concepts.length})`}
        description="Click any concept card to inspect historical evolution, recorded mistakes, and targeted drills."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.concepts.map((concept) => (
            <div
              key={concept.id}
              onClick={() => setSelectedConcept(concept)}
              className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    {concept.name}
                  </h4>
                  <TrendPill trend={concept.trend} />
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Estimated Mastery</span>
                    <span className="font-mono font-semibold text-foreground">{concept.mastery}%</span>
                  </div>
                  <ProgressBar value={concept.mastery} />
                </div>

                {concept.mistakes.length > 0 && (
                  <p className="mt-3 text-xs text-warning-foreground bg-warning/10 rounded-md p-2 flex items-start gap-1.5">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{concept.mistakes[0]}</span>
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {concept.lastPracticed}
                </span>
                <span className="text-primary font-medium flex items-center gap-0.5">
                  Inspect <ChevronRight className="size-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <EvidenceNote>
            Mastery is an estimate, not a claim of perfect measurement. It evolves as new evidence becomes available through quizzes, assessments, and tutor interactions.
          </EvidenceNote>
        </div>
      </SectionCard>

      {/* Concept Deep Dive Modal */}
      <Dialog open={!!selectedConcept} onOpenChange={() => setSelectedConcept(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-display text-xl">
                <Brain className="size-5 text-primary" />
                {selectedConcept?.name}
              </span>
              {selectedConcept && <TrendPill trend={selectedConcept.trend} />}
            </DialogTitle>
            <DialogDescription>
              Detailed mastery telemetry, logged misconception patterns, and source materials.
            </DialogDescription>
          </DialogHeader>

          {selectedConcept && (
            <div className="space-y-5 py-2">
              {/* Mastery Trajectory Chart */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <LineChart className="size-4 text-primary" /> Mastery Trajectory Over Recent Weeks
                  </span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    Current: {selectedConcept.mastery}%
                  </span>
                </div>
                <TrendLineChart
                  data={selectedConcept.history}
                  xKey="label"
                  yKey="value"
                  height={180}
                />
              </div>

              {/* Logged Mistakes */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-warning" /> Recorded Error Patterns & Misconceptions:
                </p>
                {selectedConcept.mistakes.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedConcept.mistakes.map((mistake, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-warning/20 bg-warning/5 p-2.5 text-xs text-foreground"
                      >
                        {mistake}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic rounded-lg border border-border bg-muted/20 p-2.5">
                    No repeated misconceptions logged for this concept. Steady accuracy observed.
                  </p>
                )}
              </div>

              {/* Related Project Notes */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="size-4 text-primary" /> Source References:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedConcept.materialRefs.map((ref) => (
                    <span
                      key={ref}
                      className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                <Link
                  to="/app/projects/$projectId/tutor"
                  params={{ projectId: project.id }}
                >
                  <Button variant="outline" size="sm">
                    <MessageSquare className="size-3.5 mr-1.5" /> Ask Tutor about {selectedConcept.name}
                  </Button>
                </Link>
                <Link
                  to="/app/projects/$projectId/quiz"
                  params={{ projectId: project.id }}
                >
                  <Button size="sm">
                    Practice This Concept <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
