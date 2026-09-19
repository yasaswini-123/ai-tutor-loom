import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  HelpCircle,
  Layers,
  LineChart,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { PageHeader, SectionCard } from "@/frontend/components/app/primitives";

export const Route = createFileRoute("/app/help")({
  head: () => ({
    meta: [
      { title: "Help & Learning Guide — AI Study Companion" },
      { name: "description", content: "Understanding the primary learning loop and evidence-based AI architecture." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const loopSteps = [
    {
      num: 1,
      title: "Create Space & Project",
      desc: "Spaces isolate broad domains. Projects isolate focused learning curricula with their own materials, concepts, and tutor history.",
      icon: Layers,
    },
    {
      num: 2,
      title: "Upload Learning Material",
      desc: "Upload PDFs (lecture notes, papers, textbooks). Background workers parse OCR, extract semantic chunks, and compute vector embeddings.",
      icon: FileText,
    },
    {
      num: 3,
      title: "Study with AI Tutor",
      desc: "Ask questions and receive strictly grounded answers with verifiable page citations. When evidence is insufficient, the Tutor warns rather than hallucinating.",
      icon: MessageSquare,
    },
    {
      num: 4,
      title: "Adaptive Quizzes & Assessments",
      desc: "Answer dynamic MCQs and open-ended questions evaluated by AI on conceptual understanding, technical accuracy, and missing concepts.",
      icon: Brain,
    },
    {
      num: 5,
      title: "Mastery & Growth",
      desc: "Review Bayesian mastery scores per concept. Categorized into Improving, Stable, and Needs Attention.",
      icon: LineChart,
    },
    {
      num: 6,
      title: "Targeted Recommendations",
      desc: "Receive actionable next steps ('What should I do next?') tailored directly to past mistakes and plateauing concepts.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Help & Architecture Guide"
        subtitle="Learn how the AI Study Companion functions as an evidence-based learning partner."
        breadcrumb="Workspace / Help"
      />

      {/* Primary Loop Breakdown */}
      <SectionCard
        title="The Primary Learning Loop"
        description="The 6-step cycle ensuring zero context-loss and continuous concept mastery."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loopSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="rounded-xl border border-border bg-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {step.num}
                  </span>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-sm pt-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Core Principles */}
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Context First & Isolation">
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI interactions strictly respect the current project. Notes, misconceptions, and quiz history from unrelated projects never leak into your active tutor session.
          </p>
        </SectionCard>

        <SectionCard title="Evidence Over Guessing">
          <p className="text-xs text-muted-foreground leading-relaxed">
            When reliable evidence is unavailable in your uploaded materials, the Tutor explicitly communicates uncertainty and suggests uploading relevant materials rather than inventing answers.
          </p>
        </SectionCard>
      </div>

      <div className="flex justify-center pt-4">
        <Link to="/app">
          <Button size="lg" className="gap-2">
            Return to Dashboard <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
