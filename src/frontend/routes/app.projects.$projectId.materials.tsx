import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  FileUp,
  FolderKanban,
  HelpCircle,
  Info,
  Layers,
  ListChecks,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Zap,
  GraduationCap,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { StatusBadge, SectionCard, ProgressBar } from "@/frontend/components/app/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { processingStages } from "@/backend/lib/demo-data";
import { studyStore, useStudyStore, type DocumentSummary } from "@/backend/lib/store";
import { SAMPLE_DIAGRAMS } from "@/backend/lib/diagram-generator";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/$projectId/materials")({
  component: ProjectMaterialsTab,
});

export function ProjectMaterialsTab() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/materials" });
  const navigate = useNavigate();
  const store = useStudyStore();

  const project = store.projects.find((p) => p.id === projectId) ?? store.projects[0]!;

  // Allow uploading to any subject/project
  const [uploadTargetProjectId, setUploadTargetProjectId] = useState(project.id);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const uploadTargetProject = store.projects.find((p) => p.id === uploadTargetProjectId) ?? project;

  const projectMaterials = store.materials.filter(
    (m) => m.projectId === project.id || (m.projectId === "ml-fundamentals" && project.id === "ml-fundamentals"),
  );

  const [isUploading, setIsUploading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<string>("Ready");
  const [dragActive, setDragActive] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<DocumentSummary | null>(null);
  // Use a ref to avoid closure stale-value bug when setting readyMaterialId
  const readyMatIdRef = useRef<string | null>(null);
  const [readyMaterialId, setReadyMaterialId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback((fileOrName: File | string, customDataUrl?: string) => {
    setIsUploading(true);
    const name = typeof fileOrName === "string" ? fileOrName : fileOrName.name;
    const isImg =
      /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(name) ||
      (typeof fileOrName !== "string" && fileOrName.type.startsWith("image/"));

    const targetProjectId = uploadTargetProjectId;
    const targetProject = store.projects.find((p) => p.id === targetProjectId) ?? project;

    const startProcessing = (resolvedName: string, resolvedUrl?: string) => {
      setPipelineStage(
        isImg ? "Visual OCR & Layout Parsing" : "Queued for OCR & Content Extraction",
      );
      toast.info(
        isImg
          ? `Visual Diagram "${resolvedName}" queued for AI analysis → ${targetProject.name}`
          : `"${resolvedName}" queued for processing → ${targetProject.name}`,
      );

      // Fix closure bug: store matId in ref immediately, then use ref in callback
      const matId = studyStore.uploadMaterial(
        targetProjectId,
        resolvedName,
        (stage, progress) => {
          setPipelineStage(stage);
          if (progress >= 100) {
            setIsUploading(false);
            // Use the ref to guarantee the correct matId even across re-renders
            setReadyMaterialId(matId);
            readyMatIdRef.current = matId;
            toast.success(`✅ Quiz & AI Tutor ready for "${resolvedName}"! Go to the Quiz tab.`);
          }
        },
        resolvedUrl,
      );
    };

    if (typeof fileOrName !== "string" && fileOrName.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        startProcessing(name, e.target?.result as string);
      };
      reader.readAsDataURL(fileOrName);
    } else {
      startProcessing(name, customDataUrl);
    }
  }, [uploadTargetProjectId, store.projects, project]);

  const handleRetry = (materialId: string) => {
    toast.info("Retrying OCR and extraction pipeline...");
    studyStore.retryMaterial(materialId);
  };

  return (
    <div className="space-y-6">
      {/* Materials Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold">Learning Materials &amp; Visual Diagrams</h2>
          <p className="text-sm text-muted-foreground">
            Upload PDFs, architectural flowcharts, formula sheets, or study diagrams to generate adaptive quizzes and ground the AI Tutor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.svg"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
            <Button className="gap-2" disabled={isUploading} onClick={() => fileInputRef.current?.click()} type="button">
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating Quiz & Tutor...
                </>
              ) : (
                <>
                  <Upload className="size-4" /> Upload Material / PDF / Image
                </>
              )}
            </Button>
          </label>
        </div>
      </div>

      {/* Subject / Project Selector for Upload */}
      <div className="rounded-xl border border-border bg-card/70 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <FolderKanban className="size-4 text-primary" />
            <span className="text-sm font-semibold">Upload to subject:</span>
          </div>
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setShowProjectPicker((v) => !v)}
              className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:border-primary/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                {uploadTargetProject.name}
                {uploadTargetProject.id !== project.id && (
                  <span className="text-[10px] rounded bg-primary/10 text-primary px-1.5 py-0.5 font-semibold border border-primary/20">
                    Different subject
                  </span>
                )}
              </span>
              <ChevronDown className={`size-4 text-muted-foreground transition-transform ${showProjectPicker ? "rotate-180" : ""}`} />
            </button>
            {showProjectPicker && (
              <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                {store.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setUploadTargetProjectId(p.id);
                      setShowProjectPicker(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-accent transition-colors ${
                      uploadTargetProjectId === p.id ? "bg-primary/5 font-semibold" : ""
                    }`}
                  >
                    <span className={`size-2 rounded-full ${uploadTargetProjectId === p.id ? "bg-primary" : "bg-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{p.materials} materials uploaded</span>
                    </div>
                    {uploadTargetProjectId === p.id && <CheckCircle2 className="size-4 text-primary ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {uploadTargetProject.id !== project.id && (
            <Link
              to="/app/projects/$projectId/quiz"
              params={{ projectId: uploadTargetProject.id }}
              className="shrink-0 text-xs text-primary hover:underline flex items-center gap-1"
            >
              Go to {uploadTargetProject.name} Quiz <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
        {isUploading && (
          <div className="mt-3 flex items-center gap-2 text-xs text-primary font-medium">
            <Loader2 className="size-3.5 animate-spin" />
            <span>{pipelineStage} — Generating quiz from your material...</span>
          </div>
        )}
      </div>

      {/* Upload Dropzone */}
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.svg"
        className="hidden"
        ref={dropzoneInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files[0];
          if (file) handleUpload(file);
        }}
        className={`surface-card border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onClick={() => dropzoneInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileUp className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              Drop your PDF, Diagram, or Study Image here, or <span className="text-primary underline">click to browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDFs, PNG, JPG, WEBP diagrams, formulas, slides, and architectural flowcharts (up to 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Sample Diagrams Bar */}
      <div className="rounded-xl border border-border bg-card/60 p-3.5">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span>Quick Sample Study Diagrams (1-Click Test):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isUploading}
            onClick={() =>
              handleUpload(
                SAMPLE_DIAGRAMS.neuralNetwork.fileName,
                SAMPLE_DIAGRAMS.neuralNetwork.dataUrl,
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-accent px-3 py-1.5 text-xs font-medium text-foreground transition-colors disabled:opacity-50"
          >
            <ImageIcon className="size-3.5 text-sky-500" />
            <span>Neural Network Architecture Flowchart</span>
          </button>

          <button
            type="button"
            disabled={isUploading}
            onClick={() =>
              handleUpload(
                SAMPLE_DIAGRAMS.gradientDescent.fileName,
                SAMPLE_DIAGRAMS.gradientDescent.dataUrl,
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-accent px-3 py-1.5 text-xs font-medium text-foreground transition-colors disabled:opacity-50"
          >
            <ImageIcon className="size-3.5 text-amber-500" />
            <span>Gradient Descent Loss Surface &amp; Contour</span>
          </button>

          <button
            type="button"
            disabled={isUploading}
            onClick={() =>
              handleUpload(
                SAMPLE_DIAGRAMS.transformerAttention.fileName,
                SAMPLE_DIAGRAMS.transformerAttention.dataUrl,
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-accent px-3 py-1.5 text-xs font-medium text-foreground transition-colors disabled:opacity-50"
          >
            <ImageIcon className="size-3.5 text-pink-500" />
            <span>Transformer Scaled Dot-Product Attention</span>
          </button>
        </div>
      </div>

      {/* Asynchronous Processing Visualizer */}
      <div className="surface-card p-5 bg-card/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Asynchronous Ingestion Pipeline</h3>
          </div>
          <span className="text-xs text-muted-foreground">Background Worker Active</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {processingStages.map((stage, idx) => (
            <div
              key={stage}
              className="flex flex-col items-center text-center p-2.5 rounded-lg border border-border bg-background/80"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary mb-1.5">
                {idx + 1}
              </span>
              <span className="text-xs font-medium text-foreground">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Materials Table / List */}
      <SectionCard
        title={`Uploaded Documents (${projectMaterials.length})`}
        description="All documents are processed and indexed into vector embeddings for citation tracing."
      >
        <div className="space-y-4">
          {projectMaterials.map((mat) => (
            <div
              key={mat.id}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground overflow-hidden border border-border">
                    {mat.isImage && mat.imageUrl ? (
                      <img src={mat.imageUrl} alt={mat.name} className="size-full object-cover" />
                    ) : mat.isImage ? (
                      <ImageIcon className="size-5 text-sky-500" />
                    ) : (
                      <FileText className="size-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold">{mat.name}</h4>
                      {mat.isImage && (
                        <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                          <ImageIcon className="size-3" /> Visual Diagram
                        </span>
                      )}
                      <StatusBadge status={mat.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Uploaded {mat.uploadedAt} · {mat.isImage ? "1 visual diagram" : `${mat.pages} pages`}
                      {mat.concepts.length > 0 && ` · ${mat.concepts.length} concepts extracted`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {mat.status === "failed" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetry(mat.id)}
                      className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <RefreshCw className="size-3.5" /> Retry Processing
                    </Button>
                  ) : mat.status === "ready" ? (
                    <>
                      {store.summaries[mat.id] && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedSummary(store.summaries[mat.id]!)}
                          className="gap-1.5 text-xs"
                        >
                          <Sparkles className="size-3.5 text-primary" /> View Summary
                        </Button>
                      )}

                      <Link
                        to="/app/projects/$projectId/quiz"
                        params={{ projectId: project.id }}
                      >
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10">
                          <ListChecks className="size-3.5" /> Take Quiz
                        </Button>
                      </Link>

                      <Link
                        to="/app/projects/$projectId/tutor"
                        params={{ projectId: project.id }}
                      >
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                          <MessageSquare className="size-3.5" /> Ask Tutor
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                      <Loader2 className="size-3 animate-spin" /> {pipelineStage}
                    </span>
                  )}
                </div>
              </div>

              {/* In-progress progress bar */}
              {mat.status === "processing" && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{pipelineStage}</span>
                    <span>{mat.progress}%</span>
                  </div>
                  <ProgressBar value={mat.progress} />
                </div>
              )}

              {/* Error Notice */}
              {mat.status === "failed" && mat.error && (
                <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs text-destructive flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>{mat.error}</span>
                  </div>
                </div>
              )}

              {/* Concept tags if ready */}
              {mat.status === "ready" && mat.concepts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground py-0.5">
                    Indexed concepts:
                  </span>
                  {mat.concepts.map((c) => (
                    <span
                      key={c}
                      className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Document Summary & AI Tutor Bridge Modal */}
      {selectedSummary && (
        <Dialog open={!!selectedSummary} onOpenChange={(open) => !open && setSelectedSummary(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="size-4" /> AI Document Synthesis
              </div>
              <DialogTitle className="text-lg font-bold">{selectedSummary.title}</DialogTitle>
              <DialogDescription>
                Structured knowledge representation and extraction synopsis synthesized by AI.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm leading-relaxed">
              {/* Image Preview if material is an image */}
              {selectedSummary.imageUrl && (
                <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
                  <div className="bg-muted/60 px-3.5 py-1.5 text-xs font-semibold text-foreground flex items-center justify-between border-b border-border">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-primary" /> Visual Diagram Preview
                    </span>
                    <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      OCR Verified
                    </span>
                  </div>
                  <div className="p-3 flex justify-center bg-black/5 dark:bg-black/40">
                    <img
                      src={selectedSummary.imageUrl}
                      alt={selectedSummary.title}
                      className="max-h-60 rounded-lg object-contain shadow-sm border border-border/40"
                    />
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" /> Executive Summary
                </h4>
                <p className="text-muted-foreground">{selectedSummary.executiveSummary}</p>
              </div>

              {/* Key Takeaways */}
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2">
                  Key Takeaways
                </h4>
                <ul className="space-y-2">
                  {selectedSummary.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground text-xs">
                      <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extracted Core Concepts */}
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2">
                  Extracted Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSummary.coreConcepts.map((concept) => (
                    <span
                      key={concept}
                      className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested Quiz Topics */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ListChecks className="size-3.5 text-primary" /> Generated Adaptive Quiz Topics
                </h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {selectedSummary.suggestedQuizTopics.map((topic, idx) => (
                    <li key={idx}>• {topic}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSummary(null);
                    navigate({ to: "/app/projects/$projectId/tutor", params: { projectId: project.id } });
                  }}
                  className="gap-1.5 text-xs"
                >
                  <MessageSquare className="size-4" /> Discuss with AI Tutor
                </Button>

                <Button
                  onClick={() => {
                    setSelectedSummary(null);
                    navigate({ to: "/app/projects/$projectId/quiz", params: { projectId: project.id } });
                  }}
                  className="gap-1.5 text-xs"
                >
                  <ListChecks className="size-4" /> Take Quiz on this Material
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 🎉 Auto-opening Material Ready Dialog -- fires automatically after upload finishes */}
      {readyMaterialId && store.summaries[readyMaterialId] && (
        <Dialog
          open={!!readyMaterialId}
          onOpenChange={(open) => {
            if (!open) setReadyMaterialId(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-3.5" />{" "}
                  {store.summaries[readyMaterialId]!.isImage
                    ? "Visual Diagram Processed & Ready"
                    : "Material Processed & Ready"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="size-4" />{" "}
                {store.summaries[readyMaterialId]!.isImage
                  ? "Visual OCR & Diagram AI Synthesis Complete"
                  : "AI Analysis Complete"}
              </div>
              <DialogTitle className="text-xl font-bold leading-snug">
                {store.summaries[readyMaterialId]!.title}
              </DialogTitle>
              <DialogDescription>
                {store.summaries[readyMaterialId]!.isImage
                  ? "Your diagram image has been visually parsed. The AI has extracted components, identified formulas, and built a dedicated adaptive quiz and tutor context."
                  : "Your PDF has been fully indexed. The AI has extracted concepts, generated a summary, and built a personalised adaptive quiz just for this material."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2 text-sm leading-relaxed">
              {/* Image / Diagram Preview if available */}
              {store.summaries[readyMaterialId]!.imageUrl && (
                <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
                  <div className="bg-muted/60 px-3.5 py-1.5 text-xs font-semibold text-foreground flex items-center justify-between border-b border-border">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-primary" /> Uploaded Visual Diagram
                    </span>
                    <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      OCR &amp; Layout Verified
                    </span>
                  </div>
                  <div className="p-3 flex justify-center bg-black/5 dark:bg-black/40">
                    <img
                      src={store.summaries[readyMaterialId]!.imageUrl}
                      alt={store.summaries[readyMaterialId]!.title}
                      className="max-h-64 rounded-lg object-contain shadow-sm border border-border/40"
                    />
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-muted/30 p-4">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" /> Executive Summary
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {store.summaries[readyMaterialId]!.executiveSummary}
                </p>
              </div>

              {/* Key Takeaways */}
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-primary" /> Key Takeaways
                </h4>
                <ul className="space-y-2.5">
                  {store.summaries[readyMaterialId]!.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extracted Concepts */}
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Brain className="size-3.5 text-primary" /> Extracted Concepts ({store.summaries[readyMaterialId]!.coreConcepts.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {store.summaries[readyMaterialId]!.coreConcepts.map((concept) => (
                    <span
                      key={concept}
                      className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Adaptive Quiz Topics */}
              <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  Adaptive Quiz Ready
                </h4>
                <ul className="space-y-2">
                  {store.summaries[readyMaterialId]!.suggestedQuizTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ListChecks className="size-3.5 text-primary shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  What would you like to do next?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    onClick={() => {
                      const targetId = uploadTargetProjectId;
                      setReadyMaterialId(null);
                      navigate({ to: "/app/projects/$projectId/quiz", params: { projectId: targetId } });
                    }}
                    className="gap-2 flex-col text-sm font-semibold h-16"
                  >
                    <ListChecks className="size-5" />
                    {store.summaries[readyMaterialId]!.isImage
                      ? "Take Quiz on this Diagram"
                      : "Take Adaptive Quiz"}
                    <span className="text-[10px] font-normal opacity-80">Test your understanding now</span>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      const targetId = uploadTargetProjectId;
                      setReadyMaterialId(null);
                      navigate({ to: "/app/projects/$projectId/tutor", params: { projectId: targetId } });
                    }}
                    className="gap-2 flex-col text-sm font-semibold h-16 border-primary/30 hover:bg-primary/5"
                  >
                    <GraduationCap className="size-5 text-primary" />
                    <span>
                      {store.summaries[readyMaterialId]!.isImage
                        ? "Discuss Diagram with AI Tutor"
                        : "Ask AI Tutor"}
                    </span>
                    <span className="text-[10px] font-normal text-muted-foreground">Ask about components &amp; formulas</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setReadyMaterialId(null)}
                >
                  I'll explore later
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
