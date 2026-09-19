import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity as ActivityIcon, Filter } from "lucide-react";
import { PageHeader, SectionCard } from "@/frontend/components/app/primitives";
import { ActivityTimeline } from "@/frontend/components/app/blocks";
import { type ActivityEvent } from "@/backend/lib/demo-data";
import { useStudyStore } from "@/backend/lib/store";
import { Button } from "@/frontend/components/ui/button";

export const Route = createFileRoute("/app/activity")({
  head: () => ({
    meta: [
      { title: "Activity Timeline — AI Study Companion" },
      { name: "description", content: "Platform and project learning activity logs." },
    ],
  }),
  component: ActivityPage,
});

const eventTypes: { label: string; value: ActivityEvent["type"] | "all" }[] = [
  { label: "All Events", value: "all" },
  { label: "Tutor", value: "tutor" },
  { label: "Quiz & Assessment", value: "assessment_completed" },
  { label: "Materials", value: "material_processed" },
  { label: "Mastery", value: "mastery_updated" },
  { label: "Recommendations", value: "recommendation" },
];

function ActivityPage() {
  const store = useStudyStore();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const filteredEvents = store.activity.filter((event) => {
    const matchesType =
      selectedType === "all" ||
      (selectedType === "assessment_completed"
        ? event.type === "assessment_completed" || event.type === "quiz_started" || event.type === "question_answered"
        : selectedType === "material_processed"
        ? event.type === "material_processed" || event.type === "material_uploaded"
        : event.type === selectedType);

    const matchesProject =
      selectedProject === "all" || event.project.toLowerCase().includes(selectedProject.toLowerCase());

    return matchesType && matchesProject;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Activity"
        subtitle="A full audit log of your study sessions, document processing, tutor discussions, and assessments."
        breadcrumb="Workspace / Activity"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-1">
          <Filter className="size-3.5" />
          <span>Filter by:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {eventTypes.map((t) => (
            <Button
              key={t.value}
              variant={selectedType === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(t.value)}
              className="text-xs h-8"
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Projects</option>
            {store.projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SectionCard
        title="Event History"
        description={`Showing ${filteredEvents.length} recorded learning interactions`}
      >
        {filteredEvents.length > 0 ? (
          <ActivityTimeline events={filteredEvents} />
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity found for the selected filters.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
