import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Brain,
  BookOpen,
  Compass,
  FileText,
  LineChart,
  ListChecks,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Logo } from "@/frontend/components/app/shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Study Companion — Your learning journey, powered by context-aware AI" },
      {
        name: "description",
        content:
          "Learn from your own materials, practice with adaptive assessments, track concept mastery, and always know what to do next.",
      },
      { property: "og:title", content: "AI Study Companion" },
      {
        property: "og:description",
        content:
          "An AI-powered learning workspace that understands what you are learning, measures how well you learn it, and recommends what to do next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const workflow = [
  { label: "Materials", icon: FileText },
  { label: "AI Tutor", icon: MessageSquare },
  { label: "Adaptive Quiz", icon: ListChecks },
  { label: "Mastery", icon: Brain },
  { label: "Growth", icon: LineChart },
  { label: "Recommendation", icon: Compass },
];

const features = [
  {
    title: "Learn with Context",
    body: "The AI Tutor understands your project and answers only from your learning materials, with page-level citations.",
    icon: BookOpen,
  },
  {
    title: "Practice Adaptively",
    body: "Questions are selected using mastery, previous mistakes, recent performance and question history.",
    icon: ListChecks,
  },
  {
    title: "Measure Mastery",
    body: "Track understanding concept by concept instead of a single meaningless completion percentage.",
    icon: Brain,
  },
  {
    title: "Understand Growth",
    body: "See how your understanding changes week over week and which concepts are slipping.",
    icon: BarChart3,
  },
  {
    title: "Know What To Do Next",
    body: "Every session ends with a specific, evidence-backed next action — not a generic study tip.",
    icon: Compass,
  },
  {
    title: "Evidence, Not Guesswork",
    body: "When the materials do not support an answer, the Tutor says so instead of fabricating one.",
    icon: ShieldCheck,
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Context + Evidence + Assessment + Mastery + Growth
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold sm:text-6xl">
            AI Study Companion
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Your learning journey, powered by context-aware AI.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Learn from your own materials, practice with adaptive assessments, track concept
            mastery, and always know what to do next.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg">
                Start Learning <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/app">
              <Button size="lg" variant="outline">
                Explore Demo
              </Button>
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
            {workflow.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="surface-card flex items-center gap-2 px-4 py-2.5">
                  <step.icon className="size-4 text-primary" />
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {i < workflow.length - 1 ? (
                  <ArrowRight className="size-4 text-muted-foreground" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-center text-2xl font-semibold">
          A learning workspace, not a chatbot
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          AI Study Companion understands what you are learning, measures how well you are learning
          it, and recommends what to do next.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="surface-card p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
          AI Study Companion · Demo build with sample learning data.
        </div>
      </footer>
    </div>
  );
}
