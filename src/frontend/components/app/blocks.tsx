import { Link } from "@tanstack/react-router";
import {
  Activity as ActivityIcon,
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  FileText,
  FolderPlus,
  MessageSquare,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { ProgressBar } from "@/frontend/components/app/primitives";
import type { ActivityEvent, Project } from "@/backend/lib/demo-data";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="surface-card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        </div>
        <span className="shrink-0 rounded-lg bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
          {project.progress}%
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={project.progress} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div>
          <dt>Materials</dt>
          <dd className="mt-0.5 font-medium text-foreground">{project.materials}</dd>
        </div>
        <div>
          <dt>Mastery</dt>
          <dd className="mt-0.5 font-medium text-foreground">{project.mastery}%</dd>
        </div>
      </dl>
      <p className="mt-3 truncate text-xs text-muted-foreground">Last: {project.lastActivity}</p>
      <Link
        to="/app/projects/$projectId"
        params={{ projectId: project.id }}
        className="mt-4 block"
      >
        <Button variant="outline" className="w-full">
          Continue <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}

const activityIcons: Record<ActivityEvent["type"], React.ComponentType<{ className?: string }>> = {
  project_created: FolderPlus,
  material_uploaded: Upload,
  material_processed: FileText,
  tutor: MessageSquare,
  quiz_started: ActivityIcon,
  question_answered: CheckCircle2,
  assessment_completed: CheckCircle2,
  mastery_updated: Brain,
  recommendation: Compass,
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="relative space-y-4 pl-6">
      <span className="absolute top-2 bottom-2 left-[9px] w-px bg-border" aria-hidden />
      {events.map((e) => {
        const Icon = activityIcons[e.type];
        return (
          <li key={e.id} className="relative">
            <span className="absolute top-0.5 -left-6 flex size-5 items-center justify-center rounded-full border border-border bg-card text-primary">
              <Icon className="size-3" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-medium">{e.title}</p>
              <span className="text-xs text-muted-foreground">{e.time}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {e.project}
              {e.detail ? ` · ${e.detail}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function RecommendationCard({
  tag,
  title,
  reason,
  action,
  to,
  projectId = "ml-fundamentals",
  highlighted = false,
}: {
  tag: string;
  title: string;
  reason: string;
  action: string;
  to: "materials" | "quiz" | "tutor";
  projectId?: string;
  highlighted?: boolean;
}) {
  const body = (
    <>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        <Sparkles className="size-3" /> {tag}
      </span>
      <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{reason}</p>
    </>
  );

  const link =
    to === "materials"
      ? { to: "/app/projects/$projectId/materials" as const }
      : to === "quiz"
        ? { to: "/app/projects/$projectId/quiz" as const }
        : { to: "/app/projects/$projectId/tutor" as const };

  return (
    <div
      className={
        highlighted
          ? "surface-card border-primary/30 bg-accent/40 p-5"
          : "surface-card flex flex-col p-5"
      }
    >
      {body}
      <Link {...link} params={{ projectId }} className="mt-4 block">
        <Button variant={highlighted ? "default" : "outline"} className="w-full sm:w-auto">
          {action} <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}
