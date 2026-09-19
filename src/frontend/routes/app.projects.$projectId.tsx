import { createFileRoute, Link, Outlet, useLocation, notFound } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  ListChecks,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { getProject, getSpace, projects } from "@/backend/lib/demo-data";
import { ProgressBar } from "@/frontend/components/app/primitives";
import { cn } from "@/backend/lib/utils";

export const Route = createFileRoute("/app/projects/$projectId")({
  loader: ({ params }) => {
    const project = getProject(params.projectId) ?? projects[0]!;
    const space = getSpace(project.spaceId);
    return { project, space };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.name} — Project · AI Study Companion` },
          { name: "description", content: loaderData.project.goal },
        ]
      : [{ title: "Project — AI Study Companion" }],
  }),
  component: ProjectLayout,
});

const projectNav = [
  { slug: "", label: "Overview", icon: LayoutDashboard },
  { slug: "materials", label: "Materials", icon: FileText },
  { slug: "knowledge", label: "Knowledge", icon: BookOpen },
  { slug: "tutor", label: "AI Tutor", icon: MessageSquare },
  { slug: "quiz", label: "Quiz", icon: ListChecks },
  { slug: "mastery", label: "Mastery", icon: Brain },
  { slug: "growth", label: "Growth", icon: LineChart },
  { slug: "analytics", label: "Analytics", icon: BarChart3 },
];

function ProjectLayout() {
  const { project, space } = Route.useLoaderData();
  const { pathname } = useLocation();

  // Determine active tab from URL: /app/projects/:id(/<slug>)?
  const match = pathname.match(/\/app\/projects\/[^/]+(?:\/([^/]+))?/);
  const currentTab = match?.[1] ?? "";

  return (
    <div className="space-y-6">
      {/* Project Workspace Header */}
      <div className="surface-card border-b border-border p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link to="/app/spaces" className="hover:text-foreground">
                Spaces
              </Link>
              <span>/</span>
              {space ? (
                <Link
                  to="/app/spaces/$spaceId"
                  params={{ spaceId: space.id }}
                  className="hover:text-foreground"
                >
                  {space.name}
                </Link>
              ) : (
                <span>Workspace</span>
              )}
              <span>/</span>
              <span className="text-foreground">{project.name}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight">{project.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <Sparkles className="size-3" /> Isolated Context
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">Goal:</strong> {project.goal}
            </p>
          </div>

          <div className="flex items-center gap-6 rounded-xl border border-border bg-card/60 p-4 shrink-0">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span className="font-semibold text-foreground">{project.progress}%</span>
              </div>
              <div className="w-32">
                <ProgressBar value={project.progress} />
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Est. Mastery</p>
              <p className="font-display text-lg font-bold text-foreground">{project.mastery}%</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Materials</p>
              <p className="font-display text-lg font-bold text-foreground">{project.materials}</p>
            </div>
          </div>
        </div>

        {/* Project Navigation Tabs */}
        <div className="mt-6 -mb-6 flex overflow-x-auto border-t border-border no-scrollbar">
          {projectNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.slug;
            const to = `/app/projects/${project.id}${item.slug ? `/${item.slug}` : ""}`;

            return (
              <Link
                key={item.label}
                to={to}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab Page Content */}
      <Outlet />
    </div>
  );
}
