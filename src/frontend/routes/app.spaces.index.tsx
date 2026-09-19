import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { PageHeader, ProgressBar } from "@/frontend/components/app/primitives";
import { studyStore, useStudyStore } from "@/backend/lib/store";
import { toast } from "sonner";
import { cn } from "@/backend/lib/utils";

export const Route = createFileRoute("/app/spaces/")({
  head: () => ({
    meta: [
      { title: "Spaces — AI Study Companion" },
      {
        name: "description",
        content: "Organise broad learning areas into spaces, each holding focused projects.",
      },
      { property: "og:title", content: "Spaces — AI Study Companion" },
      {
        property: "og:description",
        content: "Organise broad learning areas into spaces, each holding focused projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SpacesPage,
});

const palette = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-cyan-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
];

function SpacesPage() {
  const store = useStudyStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(palette[0]!);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSpace = studyStore.createSpace(name.trim(), desc.trim(), color);
    setOpen(false);
    setName("");
    setDesc("");
    toast.success(`Space "${newSpace.name}" created!`);
    navigate({ to: "/app/spaces/$spaceId", params: { spaceId: newSpace.id } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spaces"
        subtitle="A space is a broad learning area that holds focused projects."
        breadcrumb="Workspace"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Create Space
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Space</DialogTitle>
                <DialogDescription>
                  Group related projects, materials and mastery under one learning area.
                </DialogDescription>
              </DialogHeader>
              <form id="create-space" className="space-y-4" onSubmit={handleCreateSpace}>
                <div className="space-y-1.5">
                  <Label htmlFor="space-name">Space Name</Label>
                  <Input
                    id="space-name"
                    required
                    placeholder="e.g. Machine Learning"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="space-desc">Description</Label>
                  <Textarea
                    id="space-desc"
                    placeholder="What will you study in this space?"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Colour</Label>
                  <div className="flex gap-2">
                    {palette.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Select colour ${c}`}
                        onClick={() => setColor(c)}
                        className={cn(
                          "size-8 rounded-lg bg-gradient-to-br ring-offset-2",
                          c,
                          color === c ? "ring-2 ring-primary" : "opacity-75 hover:opacity-100",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" form="create-space">
                  Create Space
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {store.spaces.map((s) => (
          <Link
            key={s.id}
            to="/app/spaces/$spaceId"
            params={{ spaceId: s.id }}
            className="surface-card group flex flex-col p-5 transition-shadow hover:shadow-md"
          >
            <span className={cn("h-1.5 w-12 rounded-full bg-gradient-to-r", s.color)} />
            <h3 className="mt-4 font-display text-base font-semibold group-hover:text-primary">
              {s.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>{s.projects} projects</span>
                <span>{s.progress}%</span>
              </div>
              <ProgressBar value={s.progress} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Recent activity: {s.lastActivity}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
