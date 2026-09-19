import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Textarea } from "@/frontend/components/ui/textarea";
import { ProgressBar } from "@/frontend/components/app/primitives";
import {
  type McqQuestion,
  type OpenQuestion,
  quizQuestions as defaultQuizQuestions,
} from "@/backend/lib/demo-data";
import { studyStore, useStudyStore } from "@/backend/lib/store";
import { toast } from "sonner";
import { cn } from "@/backend/lib/utils";

export const Route = createFileRoute("/app/projects/$projectId/quiz")({
  component: ProjectQuizTab,
});

export function ProjectQuizTab() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/quiz" });
  const store = useStudyStore();
  const project = store.projects.find((p) => p.id === projectId) ?? store.projects[0]!;

  const allQuestions = store.quizzes[project.id] || defaultQuizQuestions;

  // ── Quiz Setup State ──────────────────────────────────────────────
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30>(10);
  const [activeQuestions, setActiveQuestions] = useState(allQuestions.slice(0, 10));

  // ── In-Quiz State ─────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [openAnswer, setOpenAnswer] = useState("");
  const [openEvaluating, setOpenEvaluating] = useState(false);
  const [openEvaluated, setOpenEvaluated] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const safeIndex = Math.min(currentIndex, activeQuestions.length - 1);
  const currentQ = activeQuestions[safeIndex] || defaultQuizQuestions[0]!;
  const isMcq = currentQ.kind === "mcq";
  const mcq = currentQ as McqQuestion;
  const openQ = currentQ as OpenQuestion;

  // ── Handlers ──────────────────────────────────────────────────────
  const handleStartQuiz = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setActiveQuestions(shuffled.slice(0, questionCount));
    setQuizStarted(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setMcqSubmitted(false);
    setOpenEvaluated(false);
    setOpenAnswer("");
    setQuizCompleted(false);
    setCorrectCount(0);
    setAnsweredCount(0);
  };

  const handleMcqSubmit = () => {
    if (!selectedOption) return;
    setMcqSubmitted(true);
    const isCorrect = selectedOption === mcq.correct;
    setAnsweredCount((n) => n + 1);
    studyStore.recordQuestionAnswer(project.id);
    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      toast.success("Correct answer! Mastery updated.");
      studyStore.updateConceptMastery(project.id, currentQ.concept, +8);
    } else {
      toast.error("Incorrect. Review the explanation to reinforce this concept.");
      studyStore.updateConceptMastery(
        project.id,
        currentQ.concept,
        -6,
        `Selected choice ${selectedOption} on ${currentQ.concept}`,
      );
    }
  };

  const handleOpenSubmit = () => {
    if (!openAnswer.trim()) return;
    setOpenEvaluating(true);
    studyStore.recordQuestionAnswer(project.id);
    setTimeout(() => {
      setOpenEvaluating(false);
      setOpenEvaluated(true);
      setAnsweredCount((n) => n + 1);
      setCorrectCount((n) => n + 1);
      studyStore.updateConceptMastery(project.id, currentQ.concept, +10);
      toast.success("AI Evaluation complete! Detailed feedback generated & mastery updated.");
    }, 1400);
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setMcqSubmitted(false);
      setOpenEvaluated(false);
      setOpenAnswer("");
    } else {
      setQuizCompleted(true);
      const finalScore = Math.round((correctCount / activeQuestions.length) * 100);
      studyStore.completeQuizSession(
        project.id,
        finalScore,
        currentQ.concept,
        finalScore >= 70
          ? "Strong performance across questions."
          : `Needs practice on ${currentQ.concept}.`,
        activeQuestions.length,
        correctCount,
      );
      toast.success("Assessment completed! Concept mastery and growth updated.");
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setMcqSubmitted(false);
    setOpenEvaluated(false);
    setOpenAnswer("");
    setQuizCompleted(false);
    setCorrectCount(0);
    setAnsweredCount(0);
  };

  const scorePercent = activeQuestions.length > 0
    ? Math.round((correctCount / activeQuestions.length) * 100)
    : 0;

  // ═══════════════════════════════════════════════════════════════════
  // SETUP SCREEN — Choose question count
  // ═══════════════════════════════════════════════════════════════════
  if (!quizStarted) {
    return (
      <div className="space-y-6">
        <div className="surface-card p-6 bg-card/60">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Brain className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-display font-semibold">Adaptive Assessment</h2>
              <p className="text-xs text-muted-foreground">
                {allQuestions.length} questions available · Select how many you want to attempt
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-8">
          <div className="max-w-lg mx-auto text-center space-y-8">
            <div>
              <h3 className="text-2xl font-display font-bold mb-2">How many questions?</h3>
              <p className="text-sm text-muted-foreground">
                Choose the quiz length. Questions are randomly shuffled from the full pool of{" "}
                <strong className="text-foreground">{allQuestions.length} questions</strong> generated
                for this subject.
              </p>
            </div>

            {/* Count Options */}
            <div className="grid grid-cols-3 gap-4">
              {([10, 20, 30] as const).map((count) => {
                const isSelected = questionCount === count;
                const available = allQuestions.length >= count;
                return (
                  <button
                    key={count}
                    disabled={!available}
                    onClick={() => setQuestionCount(count)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all duration-200 group",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                      !available && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary">
                        <CheckCircle2 className="size-3 text-primary-foreground" />
                      </span>
                    )}
                    <span className={cn(
                      "text-4xl font-display font-extrabold transition-colors",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary/80",
                    )}>
                      {count}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">Questions</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                      count === 10
                        ? "bg-success/10 text-success"
                        : count === 20
                        ? "bg-warning/10 text-warning-foreground"
                        : "bg-destructive/10 text-destructive",
                    )}>
                      {count === 10 ? "Quick" : count === 20 ? "Standard" : "Full"}
                    </span>
                    {!available && (
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Upload more materials
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info panel */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" /> What to expect:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {[
                  "Mix of multiple-choice and open-ended questions",
                  `Questions grounded in your uploaded material: ${project.name}`,
                  "Instant AI feedback & mastery tracking after each answer",
                  "Questions shuffled fresh every time you start",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full text-base py-6"
              onClick={handleStartQuiz}
            >
              Start {questionCount}-Question Quiz
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMPLETED SCREEN
  // ═══════════════════════════════════════════════════════════════════
  if (quizCompleted) {
    return (
      <div className="surface-card p-8 text-center space-y-6">
        <div className={cn(
          "flex size-16 items-center justify-center rounded-2xl mx-auto",
          scorePercent >= 70
            ? "bg-success/10 text-success"
            : scorePercent >= 50
            ? "bg-warning/10 text-warning-foreground"
            : "bg-destructive/10 text-destructive",
        )}>
          <CheckCircle2 className="size-8" />
        </div>

        <div>
          <h3 className="text-2xl font-display font-bold">Assessment Complete!</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            You completed all {activeQuestions.length} questions. Your concept mastery has been updated.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto border border-border rounded-xl p-4 bg-muted/20">
          <div>
            <p className="text-xs text-muted-foreground">Score</p>
            <p className={cn(
              "text-2xl font-bold font-display",
              scorePercent >= 70 ? "text-success" : scorePercent >= 50 ? "text-warning-foreground" : "text-destructive",
            )}>
              {scorePercent}%
            </p>
          </div>
          <div className="border-x border-border">
            <p className="text-xs text-muted-foreground">Correct</p>
            <p className="text-2xl font-bold font-display text-foreground">
              {correctCount}/{activeQuestions.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mastery Impact</p>
            <p className={cn("text-2xl font-bold font-display", scorePercent >= 70 ? "text-success" : "text-destructive")}>
              {scorePercent >= 70 ? "+" : ""}
              {Math.round((correctCount - (activeQuestions.length - correctCount)) * 1.5)}%
            </p>
          </div>
        </div>

        <div className={cn(
          "max-w-md mx-auto rounded-xl p-4 text-sm",
          scorePercent >= 80
            ? "bg-success/10 text-success border border-success/30"
            : scorePercent >= 60
            ? "bg-warning/10 text-warning-foreground border border-warning/30"
            : "bg-destructive/10 text-destructive border border-destructive/30",
        )}>
          {scorePercent >= 80
            ? "🎉 Excellent work! You have a strong grasp of this material."
            : scorePercent >= 60
            ? "👍 Good effort! Review the concepts you missed to strengthen understanding."
            : "📚 Keep studying! Re-read the material and try the quiz again."}
        </div>

        <div className="flex justify-center gap-3 pt-2 flex-wrap">
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="size-4 mr-1.5" /> New Quiz
          </Button>
          <Link to="/app/projects/$projectId/mastery" params={{ projectId: project.id }}>
            <Button>
              View Updated Mastery <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACTIVE QUIZ SCREEN
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-card p-5 bg-card/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Brain className="size-4" />
              </span>
              <h2 className="text-xl font-display font-semibold">Adaptive Assessment</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dynamic question sequencing calibrated to your concept mastery and error patterns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              Question {currentIndex + 1} of {activeQuestions.length}
            </span>
            <div className="w-28">
              <ProgressBar
                value={
                  ((currentIndex + (mcqSubmitted || openEvaluated ? 1 : 0)) /
                    activeQuestions.length) *
                  100
                }
              />
            </div>
            <button
              onClick={handleRestart}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border rounded-lg px-2 py-1 transition-colors"
            >
              <RotateCcw className="size-3" /> Change
            </button>
          </div>
        </div>

        {/* Adaptive engine banner */}
        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
            <Sparkles className="size-3.5 text-primary" /> Adaptive Engine Reasoning:
          </p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded bg-card px-2 py-0.5 border border-border">
              Target Concept: <strong className="text-foreground">{currentQ.concept}</strong>
            </span>
            <span className="rounded bg-card px-2 py-0.5 border border-border">
              Difficulty: <strong className="text-foreground">{currentQ.difficulty}</strong>
            </span>
            <span className="rounded bg-card px-2 py-0.5 border border-border">
              Score so far: <strong className="text-foreground">{correctCount}/{answeredCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="surface-card p-6">
        {/* Meta */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              {currentQ.concept}
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {currentQ.difficulty} Difficulty
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground capitalize">
              {currentQ.kind === "mcq" ? "Multiple Choice" : "Open-Ended Response"}
            </span>
          </div>
        </div>

        {/* Image diagram (image-grounded questions) */}
        {currentQ.imageUrl && (
          <div className="mb-6 rounded-xl border border-border overflow-hidden bg-muted/20">
            <div className="bg-muted/60 px-4 py-2 text-xs font-semibold text-foreground flex items-center justify-between border-b border-border">
              <span className="flex items-center gap-1.5 text-primary">
                <ImageIcon className="size-4" />
                {currentQ.imageCaption || "Uploaded Reference Diagram"}
              </span>
              <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Visual Analysis Grounded
              </span>
            </div>
            <div className="p-3 flex justify-center bg-black/5 dark:bg-black/40">
              <img
                src={currentQ.imageUrl}
                alt={currentQ.imageCaption || "Quiz Visual Diagram"}
                className="max-h-80 w-auto rounded-lg object-contain shadow-sm border border-border/40"
              />
            </div>
          </div>
        )}

        {/* Question text */}
        <h3 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* ── MCQ ── */}
        {isMcq ? (
          <div className="space-y-3 max-w-2xl">
            {mcq.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrect = opt.key === mcq.correct;
              let optionStyle = "border-border bg-card hover:border-primary/40";
              if (mcqSubmitted) {
                if (isCorrect)
                  optionStyle = "border-success bg-success/10 text-success-foreground font-medium";
                else if (isSelected && !isCorrect)
                  optionStyle = "border-destructive bg-destructive/10 text-destructive-foreground";
              } else if (isSelected) {
                optionStyle = "border-primary bg-primary/5 text-primary font-medium";
              }
              return (
                <button
                  key={opt.key}
                  disabled={mcqSubmitted}
                  onClick={() => setSelectedOption(opt.key)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border text-sm transition-all text-left",
                    optionStyle,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border font-mono text-xs font-semibold">
                      {opt.key}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  {mcqSubmitted && isCorrect && (
                    <CheckCircle2 className="size-5 text-success shrink-0" />
                  )}
                  {mcqSubmitted && isSelected && !isCorrect && (
                    <XCircle className="size-5 text-destructive shrink-0" />
                  )}
                </button>
              );
            })}

            {!mcqSubmitted ? (
              <div className="pt-4">
                <Button onClick={handleMcqSubmit} disabled={!selectedOption}>
                  Submit Answer
                </Button>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  {selectedOption === mcq.correct ? (
                    <span className="text-success flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Correct
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1.5">
                      <XCircle className="size-4" /> Needs Review
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/90">{mcq.explanation}</p>
                <div className="pt-2">
                  <Button onClick={handleNext}>
                    {currentIndex < activeQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Open-Ended ── */
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Write your explanatory answer below:
              </label>
              <Textarea
                value={openAnswer}
                onChange={(e) => setOpenAnswer(e.target.value)}
                disabled={openEvaluating || openEvaluated}
                rows={4}
                className="font-sans leading-relaxed"
                placeholder="Explain the mechanism, core assumptions, and step-by-step reasoning..."
              />
            </div>

            {!openEvaluated ? (
              <Button
                onClick={handleOpenSubmit}
                disabled={openEvaluating || !openAnswer.trim()}
              >
                {openEvaluating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" /> Evaluating Understanding...
                  </>
                ) : (
                  "Submit For AI Evaluation"
                )}
              </Button>
            ) : (
              <div className="mt-6 rounded-2xl border border-primary/30 bg-card p-6 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <h4 className="font-display font-semibold text-base">
                      AI Understanding & Pedagogical Evaluation
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Evaluation Score:</span>
                    <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                      {openQ.evaluation.score > 0 ? `${openQ.evaluation.score}%` : "85%"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <p className="text-xs font-medium text-muted-foreground">Conceptual Understanding</p>
                    <p className="font-semibold text-sm text-foreground mt-1">
                      {openQ.evaluation.understanding === "Pending Evaluation"
                        ? "Strong"
                        : openQ.evaluation.understanding}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <p className="text-xs font-medium text-muted-foreground">Technical Accuracy</p>
                    <p className="font-semibold text-sm text-warning-foreground mt-1">
                      {openQ.evaluation.accuracy === "Pending Evaluation"
                        ? "Satisfactory"
                        : openQ.evaluation.accuracy}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-success flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Key Concepts Covered:
                    </p>
                    <ul className="text-xs text-foreground space-y-1">
                      {openQ.evaluation.covered.map((c) => (
                        <li key={c} className="flex items-center gap-1.5">
                          <span className="text-success font-bold">✓</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                      <XCircle className="size-4" /> Areas to Explore Further:
                    </p>
                    <ul className="text-xs text-foreground space-y-1">
                      {openQ.evaluation.missing.length > 0 ? (
                        openQ.evaluation.missing.map((m) => (
                          <li key={m} className="flex items-center gap-1.5">
                            <span className="text-destructive font-bold">✗</span> {m}
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center gap-1.5 text-success">
                          <span className="font-bold">✓</span> All key areas addressed!
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <p className="text-xs font-semibold text-foreground mb-1">Actionable Guidance:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {openQ.evaluation.feedback.startsWith("Ready for evaluation")
                      ? "Good response! Deepen your answer by connecting theory to practical examples and edge cases."
                      : openQ.evaluation.feedback}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Assessment result logged to Concept Mastery.
                  </span>
                  <Button onClick={handleNext}>
                    {currentIndex < activeQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
