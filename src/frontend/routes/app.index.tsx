import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Flame, Target, TrendingUp } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import {
  MetricCard,
  ProgressBar,
  SectionCard,
  EvidenceNote,
} from "@/frontend/components/app/primitives";
import { ActivityTimeline, ProjectCard, RecommendationCard } from "@/frontend/components/app/blocks";
import { useStudyStore } from "@/backend/lib/store";
import { useMemo } from "react";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Home — AI Study Companion" },
      {
        name: "description",
        content: "Where you left off, how you are doing, and what to study next.",
      },
      { property: "og:title", content: "Home — AI Study Companion" },
      {
        property: "og:description",
        content: "Where you left off, how you are doing, and what to study next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeDashboard,
});

function HomeDashboard() {
  const store = useStudyStore();
  const projects = store.projects;
  const featured = projects[0] || store.projects[0]!;

  // Compute overall progress dynamically from all projects
  const overallProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    const avg = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;
    return Math.round(avg);
  }, [projects]);

  // Compute all concepts across projects, finding lowest mastery
  const attention = useMemo(() => {
    const all = projects.flatMap((p) =>
      p.concepts.map((c) => ({ name: c.name, value: c.mastery, projectId: p.id })),
    );
    // Sort ascending by mastery
    return all.sort((a, b) => a.value - b.value).slice(0, 3);
  }, [projects]);

  // Concepts mastered (>= 75%)
  const masteredCount = useMemo(() => {
    return projects.flatMap((p) => p.concepts).filter((c) => c.mastery >= 75).length;
  }, [projects]);

  const lowestConcept = attention[0];

  const quizSessionsCount = (store.quizSessions || []).length;
  const streakDays = quizSessionsCount > 0 ? Math.min(quizSessionsCount + 1, 14) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Good afternoon 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">Continue your learning journey.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Overall Progress"
          value={`${overallProgress}%`}
          hint="Average across all projects"
          icon={TrendingUp}
          tone="primary"
        />
        <MetricCard
          label="Active Projects"
          value={String(projects.length)}
          hint={`Across ${store.spaces.length} spaces`}
          icon={BookOpen}
        />
        <MetricCard
          label="Learning Streak"
          value={`${streakDays} day${streakDays !== 1 ? "s" : ""}`}
          hint={quizSessionsCount > 0 ? `${quizSessionsCount} quizzes attempted` : "Start today"}
          icon={Flame}
        />
        <MetricCard
          label="Concepts Mastered"
          value={String(masteredCount)}
          hint="Above 75% mastery"
          icon={Target}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="surface-card relative overflow-hidden p-6 lg:col-span-3">
          <div className="absolute inset-0 hero-glow" aria-hidden />
          <div className="relative">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Continue learning
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">{featured.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Last activity: {featured.lastActivity}
            </p>
            <div className="mt-5 max-w-md">
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium text-foreground">{featured.progress}%</span>
              </div>
              <ProgressBar value={featured.progress} />
            </div>
            <Link
              to="/app/projects/$projectId"
              params={{ projectId: featured.id }}
              className="mt-5 inline-block"
            >
              <Button size="lg">
                Continue Learning <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <RecommendationCard
            tag="Recommended next action"
            title={lowestConcept ? `Review ${lowestConcept.name}` : "Take an Adaptive Assessment"}
            reason={
              lowestConcept
                ? `Evidence indicates ${lowestConcept.name} mastery is at ${lowestConcept.value}%. Target this concept to balance your learning curve.`
                : "Reinforce newly added concepts by attempting an interactive assessment."
            }
            action="Start Review"
            to="materials"
            highlighted
          />
        </div>
      </div>

      <SectionCard
        title="Recent Projects"
        description="Pick up any project with its own isolated learning context."
        action={
          <Link to="/app/spaces">
            <Button variant="ghost" size="sm">
              View all spaces
            </Button>
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Areas Requiring Attention"
          description="Concepts where recent evidence suggests weak understanding."
        >
          <ul className="space-y-4">
            {attention.map((a) => (
              <li key={a.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted-foreground">{a.value}%</span>
                </div>
                <ProgressBar value={a.value} />
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <EvidenceNote note="Mastery is an evidence-backed estimate derived from quiz accuracy, open-ended evaluations, and recent retrieval interactions." />
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Activity"
          description="Your latest interactions across all learning workspaces."
          action={
            <Link to="/app/activity">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          }
        >
          <ActivityTimeline events={store.activity.slice(0, 5)} />
        </SectionCard>
      </div>
    </div>
  );
}
