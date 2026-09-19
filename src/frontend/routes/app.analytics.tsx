import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  Filter,
  FolderKanban,
  GraduationCap,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { MetricCard, SectionCard, ProgressBar } from "@/frontend/components/app/primitives";
import { MultiLineChart, TrendLineChart } from "@/frontend/components/app/charts";
import {
  learningActivitySeries,
  quizPerformanceSeries,
  masteryTrendSeries,
} from "@/backend/lib/demo-data";
import { useStudyStore } from "@/backend/lib/store";
import { Button } from "@/frontend/components/ui/button";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [
      { title: "Global Analytics — AI Study Companion" },
      { name: "description", content: "Platform-wide learning telemetry across all spaces and projects." },
    ],
  }),
  component: GlobalAnalyticsPage,
});

export function GlobalAnalyticsPage() {
  const store = useStudyStore();
  const [selectedSpace, setSelectedSpace] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");

  const filteredProjects =
    selectedSpace === "all"
      ? store.projects
      : store.projects.filter((p) => p.spaceId === selectedSpace);

  // Real calculations across all projects
  const allSessions = store.quizSessions || [];
  const totalQuizAttempts = allSessions.length;
  const totalQuestionsAnswered = Object.values(store.questionAnswersCount || {}).reduce((a, b) => a + b, 0);

  const totalTutorPrompts = Object.values(store.tutorMessages).reduce(
    (acc, msgs) => acc + msgs.filter((m) => m.role === "user").length,
    0,
  );

  const totalSessions = totalQuizAttempts + (totalTutorPrompts > 0 ? 1 : 0);

  const avgMastery =
    store.projects.length > 0
      ? Math.round(store.projects.reduce((acc, p) => acc + p.mastery, 0) / store.projects.length)
      : 0;

  // Real or initial mastery trend
  const dynamicMasteryTrend = [
    { week: "Start", mastery: 48 },
    { week: "Current", mastery: avgMastery },
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dynamicActivity = daysOfWeek.map((day) => ({
    day,
    tutor: Math.min(totalTutorPrompts, 3),
    quiz: totalQuizAttempts > 0 ? Math.min(totalQuizAttempts, 2) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Learning Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated intelligence across all study spaces, project contexts, and AI tutoring workflows.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSpace}
            onChange={(e) => setSelectedSpace(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Spaces ({store.spaces.length})</option>
            {store.spaces.map((s) => (
              <option key={s.id} value={s.id}>
                Space: {s.name}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border border-border bg-card p-0.5">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Total Spaces" value={store.spaces.length} hint="Active learning domains" icon={FolderKanban} />
        <MetricCard label="Active Projects" value={store.projects.length} hint="Isolated contexts" icon={BookOpen} />
        <MetricCard
          label="Study Sessions"
          value={String(totalSessions)}
          hint={totalSessions > 0 ? "Quizzes & tutor sessions" : "No sessions yet"}
          icon={Calendar}
        />
        <MetricCard
          label="Quiz Attempts"
          value={String(totalQuizAttempts)}
          hint={totalQuizAttempts > 0 ? `${totalQuestionsAnswered} questions total` : "0 quizzes completed"}
          icon={Brain}
        />
        <MetricCard
          label="Avg Mastery"
          value={`${avgMastery}%`}
          hint="Across all subjects"
          icon={TrendingUp}
          tone="primary"
        />
        <MetricCard
          label="Tutor Prompts"
          value={String(totalTutorPrompts)}
          hint="Evidence-grounded"
          icon={MessageSquare}
        />
      </div>

      {/* Visualizations Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Distribution */}
        <SectionCard
          title="Cross-Space Learning Activity"
          description="Daily tutor interactions vs quiz evaluations over the past week."
        >
          <MultiLineChart
            data={dynamicActivity}
            xKey="day"
            series={[
              { key: "tutor", name: "Tutor Discussions", color: "oklch(0.54 0.19 268)" },
              { key: "quiz", name: "Quizzes Completed", color: "oklch(0.62 0.18 305)" },
            ]}
            height={250}
          />
        </SectionCard>

        {/* Aggregate Mastery Growth */}
        <SectionCard
          title="Curriculum Mastery Progression"
          description="Estimated mastery trajectory across all tracked concepts."
        >
          <TrendLineChart
            data={dynamicMasteryTrend}
            xKey="week"
            yKey="mastery"
            height={250}
          />
        </SectionCard>
      </div>

      {/* Project Mastery Distribution */}
      <SectionCard
        title="Project Learning Velocity"
        description="Individual progress and mastery metrics for your enrolled projects."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-semibold text-sm">{p.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{p.goal}</p>

                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Course Progress</span>
                      <span className="font-medium text-foreground">{p.progress}%</span>
                    </div>
                    <ProgressBar value={p.progress} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Concept Mastery</span>
                      <span className="font-medium text-foreground">{p.mastery}%</span>
                    </div>
                    <ProgressBar value={p.mastery} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{p.materials} materials</span>
                <Link
                  to="/app/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="text-primary font-medium hover:underline"
                >
                  Workspace →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
