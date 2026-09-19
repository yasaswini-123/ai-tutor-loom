import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  MessageSquare,
  Send,
  Share2,
  ShieldAlert,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Upload,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { studyStore, useStudyStore, type TutorMessage } from "@/backend/lib/store";
import { toast } from "sonner";
import { cn } from "@/backend/lib/utils";

export const Route = createFileRoute("/app/projects/$projectId/tutor")({
  component: ProjectTutorTab,
});

const enhancedPrompts = [
  "Summarize uploaded material",
  "Explain key takeaways",
  "What is overfitting?",
  "Explain CNN in simple words",
  "Give me an example",
  "Explain step-by-step",
  "Quiz me on this topic",
];

export function ProjectTutorTab() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/tutor" });
  const store = useStudyStore();

  const project = store.projects.find((p) => p.id === projectId) ?? store.projects[0]!;
  const projectMaterials = store.materials.filter(
    (m) => m.projectId === project.id || (m.projectId === "ml-fundamentals" && project.id === "ml-fundamentals"),
  );

  const rawMessages = store.tutorMessages[project.id] || [];
  const messages: TutorMessage[] =
    rawMessages.length > 0
      ? rawMessages
      : [
          {
            id: "init-1",
            projectId: project.id,
            role: "tutor",
            content: `Hello! I am your AI Study Companion for **${project.name}**.\n\nI have indexed your ${projectMaterials.length} uploaded study materials. Ask me to summarize your readings, explain complex concepts with citations, or quiz you on any topic!`,
            timestamp: "Just now",
          },
        ];

  const imageMaterials = projectMaterials.filter(
    (m) => m.isImage || /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(m.name),
  );

  const dynamicPrompts = [
    ...(imageMaterials.length > 0
      ? [
          `Explain the diagram in "${imageMaterials[0]!.name}"`,
          "What mathematical formulas are shown in this diagram?",
          "Walk me step-by-step through the visual architecture",
        ]
      : []),
    ...enhancedPrompts,
  ];

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<{
    material: string;
    page?: number | undefined;
    excerpt?: string | undefined;
    imageUrl?: string | undefined;
    isImage?: boolean | undefined;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle asking a question
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    if (!textToSend) setInput("");
    setIsGenerating(true);
    studyStore.sendTutorMessage(project.id, query);
    // Simulate AI response delay
    setTimeout(() => setIsGenerating(false), 1500);
  };


  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Answer copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <div className="surface-card p-4 bg-card/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          <div>
            <span className="font-semibold text-foreground">Grounded AI Active</span>
            <span className="text-muted-foreground ml-2">
              Context: Current Conversation + {project.materials} Uploaded PDFs + Learner Weaknesses
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border px-2 py-0.5 text-muted-foreground">
            Known Weakness: Optimization & GD
          </span>
          <span className="rounded-md border border-border px-2 py-0.5 text-muted-foreground">
            Goal: Understand ML Algorithms
          </span>
        </div>
      </div>

      {/* Active Visual Diagram Grounding Card */}
      {imageMaterials.length > 0 && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 rounded-lg border border-sky-500/30 overflow-hidden bg-background flex items-center justify-center">
                {imageMaterials[0]!.imageUrl ? (
                  <img
                    src={imageMaterials[0]!.imageUrl}
                    alt={imageMaterials[0]!.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-6 text-sky-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="size-3.5" /> Visual Diagram Active Grounding
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  {imageMaterials[0]!.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  The AI Tutor can visually inspect nodes, formulas, and layer flows in this diagram.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-sky-500/30 text-sky-600 hover:bg-sky-500/10"
                onClick={() =>
                  handleSendMessage(
                    `Can you explain the visual flow and components depicted in "${imageMaterials[0]!.name}"?`,
                  )
                }
              >
                <Sparkles className="size-3.5" /> Explain Diagram
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 text-xs"
                onClick={() =>
                  setSelectedCitation({
                    material: imageMaterials[0]!.name,
                    isImage: true,
                    imageUrl: imageMaterials[0]!.imageUrl,
                    page: 1,
                    excerpt: "Visual inspection of uploaded diagram architecture and formulas.",
                  })
                }
              >
                View Diagram
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="surface-card flex flex-col h-[650px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
            >
              <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {msg.role === "user" ? "You" : "AI Tutor"}
                </span>
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={cn(
                  "max-w-2xl rounded-2xl p-4 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "border border-border bg-card text-foreground rounded-bl-none shadow-sm",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Grounded Citation Badge */}
                {msg.source && (
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <button
                      onClick={() => setSelectedCitation(msg.source!)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary transition-colors cursor-pointer"
                    >
                      {msg.source.isImage ? (
                        <ImageIcon className="size-3.5 text-sky-500" />
                      ) : (
                        <BookOpen className="size-3.5" />
                      )}
                      <span>
                        {msg.source.isImage
                          ? `Visual Diagram: ${msg.source.material}`
                          : `Source: ${msg.source.material} — Page ${msg.source.page}`}
                      </span>
                      <ExternalLink className="size-3 ml-0.5" />
                    </button>
                  </div>
                )}

                {/* Explicit Unsupported Question / Insufficient Evidence Warning Card */}
                {msg.isUnsupported && (
                  <div className="mt-3 rounded-xl border border-warning/40 bg-warning/10 p-3.5 text-xs text-foreground">
                    <div className="flex items-center gap-2 text-warning-foreground font-semibold mb-1">
                      <ShieldAlert className="size-4 text-warning" />
                      <span>Available evidence is insufficient</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mb-3">
                      To prevent hallucinations, the Tutor communicates uncertainty when your uploaded materials do not contain reliable evidence.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendMessage("How does gradient descent work?")}
                        className="text-xs h-7"
                      >
                        Ask about Gradient Descent
                      </Button>
                      <Link
                        to="/app/projects/$projectId/materials"
                        params={{ projectId: project.id }}
                      >
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          <Upload className="size-3 mr-1" /> Upload Relevant Material
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Answer Feedback & Actions (for Tutor messages) */}
                {msg.role === "tutor" && (
                  <div className="mt-3 flex items-center gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    <button
                      onClick={() => handleCopy(msg.content)}
                      className="hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="size-3" /> Copy
                    </button>
                    <button
                      onClick={() => toast.success("Marked as helpful!")}
                      className="hover:text-foreground flex items-center gap-1"
                    >
                      <ThumbsUp className="size-3" /> Helpful
                    </button>
                    <button
                      onClick={() => toast.info("Feedback noted for evaluation.")}
                      className="hover:text-foreground flex items-center gap-1"
                    >
                      <ThumbsDown className="size-3" /> Not helpful
                    </button>
                    <button
                      onClick={() => handleSendMessage(`Can you explain that more simply with an analogy?`)}
                      className="hover:text-primary ml-auto font-medium"
                    >
                      Ask follow-up →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">AI Tutor</span>
                <span>• Searching Project Materials...</span>
              </div>
              <div className="rounded-2xl rounded-bl-none border border-border bg-card p-4 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Retrieving passages & synthesizing evidence-grounded response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="border-t border-border bg-muted/20 px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-medium text-muted-foreground shrink-0">
            Quick prompts:
          </span>
          {dynamicPrompts.map((qp) => (
            <button
              key={qp}
              onClick={() => handleSendMessage(qp)}
              className="rounded-full border border-border bg-card hover:bg-accent px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
          <button
            onClick={() => handleSendMessage("What is the latest stock price of Tesla?")}
            className="rounded-full border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition-colors shrink-0"
            title="Test out-of-scope question handling"
          >
            ⚠️ Test Unsupported Question
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about this project's materials..."
              disabled={isGenerating}
              className="flex-1"
            />
            <Button type="submit" disabled={isGenerating || !input.trim()}>
              <Send className="size-4 mr-1" /> Send
            </Button>
          </form>
        </div>
      </div>

      {/* Citation Inspector Modal */}
      <Dialog open={!!selectedCitation} onOpenChange={() => setSelectedCitation(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCitation?.isImage ? (
                <ImageIcon className="size-5 text-sky-500" />
              ) : (
                <BookOpen className="size-5 text-primary" />
              )}
              {selectedCitation?.isImage
                ? "Visual Diagram Source Verification"
                : "Source Citation Verification"}
            </DialogTitle>
            <DialogDescription>
              Original material retrieved from your uploaded project context.
            </DialogDescription>
          </DialogHeader>

          {selectedCitation && (
            <div className="space-y-4 py-2">
              {/* Diagram / Image Preview if citation has image */}
              {selectedCitation.imageUrl && (
                <div className="rounded-xl border border-border overflow-hidden bg-black/5 dark:bg-black/40 p-2 flex justify-center">
                  <img
                    src={selectedCitation.imageUrl}
                    alt={selectedCitation.material}
                    className="max-h-72 w-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs space-y-1">
                <p>
                  <strong className="text-foreground">
                    {selectedCitation.isImage ? "Visual Diagram:" : "Document:"}
                  </strong>{" "}
                  {selectedCitation.material}
                </p>
                {!selectedCitation.isImage && selectedCitation.page && (
                  <p>
                    <strong className="text-foreground">Location:</strong> Page {selectedCitation.page}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {selectedCitation.isImage
                    ? "Visual Extraction Context:"
                    : "Extracted Context Chunk:"}
                </p>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed italic">
                  “{selectedCitation.excerpt || "Visual diagram knowledge parsed from uploaded study material."}”
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedCitation(null)}>
                  Close
                </Button>
                <Link
                  to="/app/projects/$projectId/knowledge"
                  params={{ projectId: project.id }}
                >
                  <Button onClick={() => setSelectedCitation(null)}>
                    Explore in Knowledge Base
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
