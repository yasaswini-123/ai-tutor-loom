import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Filter,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { SectionCard } from "@/frontend/components/app/primitives";
import { useStudyStore } from "@/backend/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/$projectId/knowledge")({
  component: ProjectKnowledgeTab,
});

export function ProjectKnowledgeTab() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/knowledge" });
  const store = useStudyStore();
  const project = store.projects.find((p) => p.id === projectId) ?? store.projects[0]!;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  // Collect all ready materials for this project from store
  const projectMaterials = store.materials.filter(
    (m) => (m.projectId === project.id || (m.projectId === "ml-fundamentals" && project.id === "ml-fundamentals")) && m.status === "ready",
  );

  // Extract all unique concepts
  const allConcepts = Array.from(
    new Set(projectMaterials.flatMap((m) => m.concepts)),
  );

  // All extracted chunks/sections
  const allSections = projectMaterials.flatMap((m) =>
    m.sections.map((s) => ({
      ...s,
      materialName: m.name,
      materialId: m.id,
    })),
  );

  const filteredSections = allSections.filter((section) => {
    const matchesSearch =
      searchQuery === "" ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesConcept =
      !selectedConcept ||
      section.title.toLowerCase().includes(selectedConcept.toLowerCase()) ||
      section.excerpt.toLowerCase().includes(selectedConcept.toLowerCase());

    return matchesSearch && matchesConcept;
  });

  return (
    <div className="space-y-6">
      {/* Knowledge Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold">Knowledge Base & Retrieval</h2>
          <p className="text-sm text-muted-foreground">
            Structured representations, semantic chunks, and concept mappings extracted from your materials.
          </p>
        </div>

        <Link
          to="/app/projects/$projectId/tutor"
          params={{ projectId: project.id }}
        >
          <Button className="gap-2">
            <MessageSquare className="size-4" /> Ask Tutor With Context
          </Button>
        </Link>
      </div>

      {/* Search & Concept Filters */}
      <div className="surface-card p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extracted knowledge passages, mathematical definitions, or theorems..."
            className="pl-9"
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <Filter className="size-3.5" />
            <span>Filter by Extracted Concept:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={selectedConcept === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedConcept(null)}
              className="text-xs h-7"
            >
              All ({allSections.length} passages)
            </Button>
            {allConcepts.map((concept) => (
              <Button
                key={concept}
                variant={selectedConcept === concept ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedConcept(selectedConcept === concept ? null : concept)}
                className="text-xs h-7"
              >
                {concept}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Extracted Passages & Chunks */}
      <SectionCard
        title={`Extracted Knowledge Chunks (${filteredSections.length})`}
        description="Every citation provided by the AI Tutor maps directly back to these verified passages."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSections.map((section, idx) => (
            <div
              key={`${section.materialId}-${section.page}-${idx}`}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <Sparkles className="size-3" /> {section.title}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Page {section.page}
                  </span>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed italic border-l-2 border-primary/40 pl-3 my-3">
                  “{section.excerpt}”
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate max-w-[200px] flex items-center gap-1">
                  <FileText className="size-3 text-muted-foreground shrink-0" />
                  {section.materialName}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    to="/app/projects/$projectId/tutor"
                    params={{ projectId: project.id }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary hover:text-primary"
                    >
                      <MessageSquare className="size-3 mr-1" /> Ask Tutor
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="col-span-2 py-12 text-center text-sm text-muted-foreground">
              No matching knowledge chunks found. Try another search query or clear your filter.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
