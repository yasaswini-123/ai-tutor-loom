import { createFileRoute, notFound, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import {
  EmptyState,
  PageHeader,
  ProgressBar,
  SectionCard,
} from "@/frontend/components/app/primitives";
import { ActivityTimeline, ProjectCard } from "@/frontend/components/app/blocks";
import { TrendLineChart } from "@/frontend/components/app/charts";
import { masteryTrendSeries } from "@/backend/lib/demo-data";
import { studyStore, useStudyStore } from "@/backend/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/spaces/$spaceId")({
  loader: ({ params }) => {
    const space = studyStore.getState().spaces.find((s) => s.id === params.spaceId);
    if (!space) throw notFound();
    return { space };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.space.name} — Space · AI Study Companion` },
          { name: "description", content: loaderData.space.description },
          { property: "og:title", content: `${loaderData.space.name} — AI Study Companion` },
          { property: "og:description", content: loaderData.space.description },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Unavailable — AI Study Companion" }, { name: "robots", content: "noindex" }],
  }),
  component: SpaceDashboard,
});

function SpaceDashboard() {
  const { spaceId } = useParams({ from: "/app/spaces/$spaceId" });
  const store = useStudyStore();
  const navigate = useNavigate();

  const space = store.spaces.find((s) => s.id === spaceId) ?? store.spaces[0]!;
  const spaceProjects = store.projects.filter((p) => p.spaceId === space.id);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject = studyStore.createProject(
      space.id,
      name.trim(),
      desc.trim() || `Learning workspace for ${name.trim()}`,
      goal.trim() || `Master core concepts of ${name.trim()}`,
    );

    setOpen(false);
    setName("");
    setDesc("");
    setGoal("");
    toast.success(`Project "${newProject.name}" created!`);
    navigate({ to: "/app/projects/$projectId", params: { projectId: newProject.id } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={space.name}
        subtitle={space.description}
        breadcrumb={`Workspace / ${space.name}`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  A project keeps its own materials, knowledge, mastery and tutor context.
                </DialogDescription>
              </DialogHeader>
              <form id="create-project" className="space-y-4" onSubmit={handleCreateProject}>
                <div className="space-y-1.5">
                  <Label htmlFor="p-name">Project Name</Label>
                  <Input
                    id="p-name"
                    required
                    placeholder="Machine Learning Fundamentals"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-desc">Description</Label>
                  <Textarea
                    id="p-desc"
                    placeholder="Learn the core concepts and practical applications of machine learning."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-goal">Learning Goal</Label>
                  <Textarea
                    id="p-goal"
                    placeholder="Understand ML algorithms, evaluate models, and solve practical ML problems."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" form="create-project">
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="surface-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Space Overview
            </p>
            <h2 className="text-lg font-display font-semibold mt-1">
              {spaceProjects.length} Active {spaceProjects.length === 1 ? "Project" : "Projects"}
            </h2>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Overall Space Progress</span>
              <span className="font-semibold text-foreground">{space.progress}%</span>
            </div>
            <ProgressBar value={space.progress} />
          </div>
        </div>
      </div>

      <SectionCard
        title="Projects in this Space"
        description="Each project isolates its learning materials, extracted knowledge, and AI partner history."
      >
        {spaceProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaceProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects yet"
            description="Create your first focused learning project in this space."
            actionLabel="Create Project"
            onAction={() => setOpen(true)}
          />
        )}
      </SectionCard>
    </div>
  );
}
