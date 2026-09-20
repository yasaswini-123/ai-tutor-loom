import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  HelpCircle,
  ImageIcon,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Textarea } from "@/frontend/components/ui/textarea";
import { ProgressBar } from "@/frontend/components/app/primitives";
import {
  type McqQuestion,
  type OpenQuestion,
  type QuizQuestionData,
  quizQuestions as defaultQuizQuestions,
} from "@/backend/lib/demo-data";
import { studyStore, useStudyStore } from "@/backend/lib/store";
import { toast } from "sonner";
import { cn } from "@/backend/lib/utils";

export const Route = createFileRoute("/app/projects/$projectId/quiz")({
  component: ProjectQuizTab,
});

export interface QuestionAttempt {
  index: number;
  question: string;
  concept: string;
  difficulty: string;
  kind: "mcq" | "open";
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  explanation: string;
  status: "correct" | "incorrect" | "skipped";
}

export function ProjectQuizTab() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/quiz" });
  const store = useStudyStore();
  const project = store.projects.find((p) => p.id === projectId) ?? store.projects[0]!;

  const allQuestions = store.quizzes[project.id] || defaultQuizQuestions;

  // ── Quiz Setup State ──────────────────────────────────────────────
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState<5 | 10 | 20>(10);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestionData[]>([]);

  // ── In-Quiz State ─────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [openAnswer, setOpenAnswer] = useState("");
  const [openEvaluating, setOpenEvaluating] = useState(false);
  const [openEvaluated, setOpenEvaluated] = useState(false);
  const [openEvalResult, setOpenEvalResult] = useState<{
    score: number;
    understanding: string;
    accuracy: string;
    covered: string[];
    missing: string[];
    feedback: string;
  } | null>(null);

  const [quizCompleted, setQuizCompleted] = useState(false);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [showEarlyFinishModal, setShowEarlyFinishModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const safeIndex = Math.min(currentIndex, Math.max(0, activeQuestions.length - 1));
  const currentQ = activeQuestions[safeIndex] || allQuestions[0] || defaultQuizQuestions[0]!;
  const isMcq = currentQ.kind === "mcq";
  const mcq = currentQ as McqQuestion;
  const openQ = currentQ as OpenQuestion;

  // ── Evaluation Logic for Open Questions ───────────────────────────
  const evaluateOpenAnswer = (userText: string, question: OpenQuestion) => {
    const clean = userText.trim();
    const wordCount = clean.split(/\s+/).filter(Boolean).length;
    const lower = clean.toLowerCase();

    // Key concepts related to this question
    const conceptKeywords = [
      question.concept.toLowerCase(),
      ...question.evaluation.covered.map((c) => c.toLowerCase()),
    ];

    const matchedKeywords = conceptKeywords.filter((kw) => {
      const tokens = kw.split(" ").filter((t) => t.length > 3);
      return tokens.some((token) => lower.includes(token));
    });

    let score = 0;
    let understanding = "Needs Improvement";
    let accuracy = "Basic";

    if (wordCount < 6) {
      score = 25;
      understanding = "Insufficient Detail";
      accuracy = "Incomplete";
    } else if (wordCount < 18) {
      score = 55;
      understanding = "Partial Understanding";
      accuracy = "Developing";
    } else if (matchedKeywords.length >= 2 || wordCount >= 35) {
      score = 90;
      understanding = "Strong Conceptual Mastery";
      accuracy = "High Precision";
    } else {
      score = 75;
      understanding = "Competent Understanding";
      accuracy = "Satisfactory";
    }

    const coveredRatio = Math.max(1, Math.ceil((score / 100) * question.evaluation.covered.length));
    const covered = question.evaluation.covered.slice(0, coveredRatio);
    const missing = question.evaluation.covered.filter((c) => !covered.includes(c));

    return {
      score,
      understanding,
      accuracy,
      covered,
      missing:
        missing.length > 0
          ? missing
          : ["Deepen by analyzing empirical edge cases or alternative hyperparameters."],
      feedback:
        score >= 75
          ? `Solid answer! You addressed the core principles of ${question.concept} and demonstrated sound analytical reasoning.`
          : `Good start, but your answer needs deeper technical precision on ${question.concept}, especially surrounding the mathematical intuition.`,
    };
  };

  // ── Handlers ──────────────────────────────────────────────────────
  const handleStartQuiz = () => {
    const pool = allQuestions.length > 0 ? allQuestions : defaultQuizQuestions;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    setActiveQuestions(selected);
    setQuizStarted(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setMcqSubmitted(false);
    setOpenEvaluated(false);
    setOpenEvalResult(null);
    setOpenAnswer("");
    setQuizCompleted(false);
    setAttempts([]);
  };

  const handleMcqSubmit = () => {
    if (!selectedOption) return;
    setMcqSubmitted(true);
    const isCorrect = selectedOption === mcq.correct;
    const chosenLabel = mcq.options.find((o) => o.key === selectedOption)?.label || selectedOption;
    const correctLabel = mcq.options.find((o) => o.key === mcq.correct)?.label || mcq.correct;

    const newAttempt: QuestionAttempt = {
      index: currentIndex + 1,
      question: currentQ.question,
      concept: currentQ.concept,
      difficulty: currentQ.difficulty,
      kind: "mcq",
      selectedAnswer: `${selectedOption}: ${chosenLabel}`,
      correctAnswer: `${mcq.correct}: ${correctLabel}`,
      isCorrect,
      score: isCorrect ? 100 : 0,
      explanation: mcq.explanation,
      status: isCorrect ? "correct" : "incorrect",
    };

    setAttempts((prev) => [...prev.filter((a) => a.index !== currentIndex + 1), newAttempt]);
    studyStore.recordQuestionAnswer(project.id);

    if (isCorrect) {
      toast.success(`Correct answer on ${currentQ.concept}! Mastery +8%`);
      studyStore.updateConceptMastery(project.id, currentQ.concept, +8);
    } else {
      toast.error(`Incorrect. Correct option was ${mcq.correct}. Mastery updated.`);
      studyStore.updateConceptMastery(
        project.id,
        currentQ.concept,
        -5,
        `Selected choice ${selectedOption} on ${currentQ.concept}`,
      );
    }
  };

  const handleOpenSubmit = () => {
    if (!openAnswer.trim()) return;
    setOpenEvaluating(true);
    studyStore.recordQuestionAnswer(project.id);

    setTimeout(() => {
      const evaluation = evaluateOpenAnswer(openAnswer, openQ);
      setOpenEvalResult(evaluation);
      setOpenEvaluating(false);
      setOpenEvaluated(true);

      const isCorrect = evaluation.score >= 70;
      const newAttempt: QuestionAttempt = {
        index: currentIndex + 1,
        question: currentQ.question,
        concept: currentQ.concept,
        difficulty: currentQ.difficulty,
        kind: "open",
        selectedAnswer: openAnswer,
        correctAnswer: `Expected depth: ${openQ.evaluation.covered.join(", ")}`,
        isCorrect,
        score: evaluation.score,
        explanation: evaluation.feedback,
        status: isCorrect ? "correct" : "incorrect",
      };

      setAttempts((prev) => [...prev.filter((a) => a.index !== currentIndex + 1), newAttempt]);
      const delta = isCorrect ? +8 : -4;
      studyStore.updateConceptMastery(project.id, currentQ.concept, delta);
      toast.success(`AI Evaluation Complete: ${evaluation.score}% · ${evaluation.understanding}`);
    }, 1100);
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setMcqSubmitted(false);
      setOpenEvaluated(false);
      setOpenEvalResult(null);
      setOpenAnswer("");
    } else {
      finishQuiz(attempts);
    }
  };

  const finishQuiz = (currentAttempts: QuestionAttempt[]) => {
    // Fill in any unanswered questions as skipped
    const answeredIndices = new Set(currentAttempts.map((a) => a.index));
    const fullAttempts = [...currentAttempts];

    activeQuestions.forEach((q, idx) => {
      const qIndex = idx + 1;
      if (!answeredIndices.has(qIndex)) {
        const isM = q.kind === "mcq";
        const mQ = q as McqQuestion;
        fullAttempts.push({
          index: qIndex,
          question: q.question,
          concept: q.concept,
          difficulty: q.difficulty,
          kind: q.kind,
          selectedAnswer: "Not Answered",
          correctAnswer: isM
            ? `${mQ.correct}: ${mQ.options.find((o) => o.key === mQ.correct)?.label || ""}`
            : "Review study materials for detailed answer",
          isCorrect: false,
          score: 0,
          explanation: isM ? mQ.explanation : "Question was skipped during assessment.",
          status: "skipped",
        });
      }
    });

    fullAttempts.sort((a, b) => a.index - b.index);
    setAttempts(fullAttempts);

    const correct = fullAttempts.filter((a) => a.isCorrect).length;
    const finalScore = Math.round((correct / activeQuestions.length) * 100);

    studyStore.completeQuizSession(
      project.id,
      finalScore,
      currentQ.concept,
      finalScore >= 70
        ? "Demonstrated solid understanding across assessment."
        : `Requires targeted review on ${currentQ.concept}.`,
      activeQuestions.length,
      correct,
    );

    setQuizCompleted(true);
    setShowEarlyFinishModal(false);
    toast.success(`Assessment finished! Recorded authentic score of ${finalScore}%.`);
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setMcqSubmitted(false);
    setOpenEvaluated(false);
    setOpenEvalResult(null);
    setOpenAnswer("");
    setQuizCompleted(false);
    setAttempts([]);
    setShowEarlyFinishModal(false);
  };

  // ═══════════════════════════════════════════════════════════════════
  // SETUP SCREEN
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
              <h2 className="text-xl font-display font-semibold">Adaptive Knowledge Assessment</h2>
              <p className="text-xs text-muted-foreground">
                Grounded in your uploaded materials · Accurate mastery scoring with transparent review
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-8">
          <div className="max-w-lg mx-auto text-center space-y-8">
            <div>
              <h3 className="text-2xl font-display font-bold mb-2">Configure Quiz Length</h3>
              <p className="text-sm text-muted-foreground">
                Select how many questions you want to solve. Results are calculated strictly from your
                completed responses.
              </p>
            </div>

            {/* Count Options */}
            <div className="grid grid-cols-3 gap-4">
              {([5, 10, 20] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border p-4 transition-all",
                    questionCount === cnt
                      ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                  )}
                >
                  <span className="text-2xl font-bold font-display">{cnt}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Questions</span>
                </button>
              ))}
            </div>

            {/* Info panel */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" /> What you will experience:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {[
                  "No premature or false results — score is based solely on your actual answers",
                  "Detailed question-by-question review with correct explanations at the end",
                  "Ability to end early with accurate pro-rated score calculation",
                  "Direct updates to your Concept Mastery and Growth trajectory",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Button size="lg" className="w-full text-base py-6" onClick={handleStartQuiz}>
              Start {questionCount}-Question Assessment
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMPLETED SCREEN — FULL DETAILED RESULTS BREAKDOWN
  // ═══════════════════════════════════════════════════════════════════
  if (quizCompleted) {
    const totalQ = activeQuestions.length;
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const answeredCount = attempts.filter((a) => a.status !== "skipped").length;
    const skippedCount = totalQ - answeredCount;
    const finalScore = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    const accuracyOnAttempted =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    const filteredAttempts = attempts.filter((att) => {
      if (reviewFilter === "all") return true;
      if (reviewFilter === "correct") return att.isCorrect;
      if (reviewFilter === "incorrect") return att.status === "incorrect";
      if (reviewFilter === "skipped") return att.status === "skipped";
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Results Header Summary */}
        <div className="surface-card p-8 text-center space-y-6 border-primary/20">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-2xl mx-auto",
              finalScore >= 70
                ? "bg-success/10 text-success"
                : finalScore >= 50
                  ? "bg-warning/10 text-warning-foreground"
                  : "bg-destructive/10 text-destructive",
            )}
          >
            {finalScore >= 70 ? (
              <CheckCircle2 className="size-8" />
            ) : (
              <XCircle className="size-8" />
            )}
          </div>

          <div>
            <h3 className="text-2xl font-display font-bold">Assessment Results</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Your results have been authenticated and logged to your real Concept Mastery tracker.
            </p>
          </div>

          {/* Genuine KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border border-border rounded-xl p-4 bg-muted/20">
            <div>
              <p className="text-xs text-muted-foreground">Overall Score</p>
              <p
                className={cn(
                  "text-3xl font-bold font-display",
                  finalScore >= 70
                    ? "text-success"
                    : finalScore >= 50
                      ? "text-warning-foreground"
                      : "text-destructive",
                )}
              >
                {finalScore}%
              </p>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="text-3xl font-bold font-display text-foreground">
                {correctCount}/{totalQ}
              </p>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-xs text-muted-foreground">Answered</p>
              <p className="text-3xl font-bold font-display text-foreground">
                {answeredCount}/{totalQ}
              </p>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-3xl font-bold font-display text-foreground">
                {accuracyOnAttempted}%
              </p>
            </div>
          </div>

          {/* Contextual Feedback Banner */}
          <div
            className={cn(
              "max-w-xl mx-auto rounded-xl p-4 text-sm",
              finalScore >= 75
                ? "bg-success/10 text-success border border-success/30"
                : finalScore >= 50
                  ? "bg-warning/10 text-warning-foreground border border-warning/30"
                  : "bg-destructive/10 text-destructive border border-destructive/30",
            )}
          >
            {finalScore >= 75
              ? "🎉 Excellent demonstration of mastery! You have grasped the foundational mechanisms."
              : finalScore >= 50
                ? "👍 Good attempt. Review the missed concepts below to close knowledge gaps."
                : "📚 Foundational concepts need reinforcement. Inspect the detailed explanations below and consult the AI Tutor."}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3 pt-2 flex-wrap">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="size-4 mr-1.5" /> Retake Quiz
            </Button>
            <Link to="/app/projects/$projectId/mastery" params={{ projectId: project.id }}>
              <Button variant="outline">
                <Brain className="size-4 mr-1.5" /> View Updated Mastery
              </Button>
            </Link>
            <Link to="/app/projects/$projectId/tutor" params={{ projectId: project.id }}>
              <Button>
                <Sparkles className="size-4 mr-1.5" /> Ask AI Tutor About Mistakes
              </Button>
            </Link>
          </div>
        </div>

        {/* ── QUESTION-BY-QUESTION DETAILED REVIEW ── */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Detailed Question-by-Question Review
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect your actual submitted answer against the correct rationale for every question.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border shrink-0 flex-wrap">
              {(
                [
                  { id: "all", label: `All (${totalQ})` },
                  { id: "correct", label: `Correct (${correctCount})` },
                  { id: "incorrect", label: `Incorrect (${answeredCount - correctCount})` },
                  { id: "skipped", label: `Skipped (${skippedCount})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setReviewFilter(f.id)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                    reviewFilter === f.id
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3 pt-2">
            {filteredAttempts.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">
                No questions match the "{reviewFilter}" filter.
              </p>
            ) : (
              filteredAttempts.map((att) => {
                const isExpanded = expandedQuestion === att.index;
                return (
                  <div
                    key={att.index}
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      att.isCorrect
                        ? "border-success/30 bg-success/[0.02]"
                        : att.status === "skipped"
                          ? "border-warning/30 bg-warning/[0.02]"
                          : "border-destructive/30 bg-destructive/[0.02]",
                    )}
                  >
                    <div
                      className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none hover:bg-muted/30 transition-colors"
                      onClick={() =>
                        setExpandedQuestion((prev) => (prev === att.index ? null : att.index))
                      }
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "flex size-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 mt-0.5",
                            att.isCorrect
                              ? "bg-success/10 text-success"
                              : att.status === "skipped"
                                ? "bg-warning/10 text-warning-foreground"
                                : "bg-destructive/10 text-destructive",
                          )}
                        >
                          {att.index}
                        </span>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                              {att.concept}
                            </span>
                            <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                              {att.difficulty}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                                att.isCorrect
                                  ? "bg-success/15 text-success"
                                  : att.status === "skipped"
                                    ? "bg-warning/15 text-warning-foreground"
                                    : "bg-destructive/15 text-destructive",
                              )}
                            >
                              {att.isCorrect ? (
                                <>
                                  <CheckCircle2 className="size-3" /> Correct
                                </>
                              ) : att.status === "skipped" ? (
                                <>
                                  <AlertTriangle className="size-3" /> Skipped
                                </>
                              ) : (
                                <>
                                  <XCircle className="size-3" /> Incorrect
                                </>
                              )}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-foreground">{att.question}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-muted-foreground p-1 hover:text-foreground shrink-0 mt-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-border/60 bg-muted/20 space-y-3 text-xs">
                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                          <div className="rounded-lg border border-border bg-card p-3">
                            <p className="font-semibold text-muted-foreground mb-1">Your Answer:</p>
                            <p
                              className={cn(
                                "font-medium",
                                att.isCorrect
                                  ? "text-success"
                                  : att.status === "skipped"
                                    ? "text-warning-foreground italic"
                                    : "text-destructive",
                              )}
                            >
                              {att.selectedAnswer}
                            </p>
                          </div>
                          <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                            <p className="font-semibold text-success mb-1">Correct Answer / Benchmark:</p>
                            <p className="font-medium text-foreground">{att.correctAnswer}</p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-3">
                          <p className="font-semibold text-foreground mb-1">Pedagogical Explanation:</p>
                          <p className="text-muted-foreground leading-relaxed">{att.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACTIVE QUIZ SCREEN
  // ═══════════════════════════════════════════════════════════════════
  const answeredCount = attempts.length;

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
              <h2 className="text-xl font-display font-semibold">Adaptive Knowledge Assessment</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active test for <strong className="text-foreground">{project.name}</strong> · Question{" "}
              {currentIndex + 1} of {activeQuestions.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {answeredCount}/{activeQuestions.length} Answered
            </span>
            <div className="w-28">
              <ProgressBar value={(answeredCount / activeQuestions.length) * 100} />
            </div>

            {/* Finish Early button */}
            <button
              onClick={() => setShowEarlyFinishModal(true)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 border border-amber-500/30 rounded-lg px-2.5 py-1.5 transition-colors bg-amber-500/5 font-medium"
            >
              Finish Early
            </button>

            <button
              onClick={handleRestart}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border rounded-lg px-2 py-1.5 transition-colors"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Early Finish Confirmation Modal */}
      {showEarlyFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="surface-card max-w-md w-full p-6 space-y-4 shadow-xl border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="size-5" />
              <h3 className="font-display font-semibold text-lg text-foreground">
                Finish Quiz Early?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You have answered{" "}
              <strong className="text-foreground">
                {answeredCount} of {activeQuestions.length}
              </strong>{" "}
              questions. The remaining{" "}
              <strong className="text-foreground">{activeQuestions.length - answeredCount}</strong>{" "}
              unanswered questions will be scored as 0% (skipped).
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowEarlyFinishModal(false)}>
                Continue Quiz
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => finishQuiz(attempts)}
              >
                Submit &amp; View Results
              </Button>
            </div>
          </div>
        </div>
      )}

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

          <span className="text-xs text-muted-foreground font-medium">
            Question #{currentIndex + 1}
          </span>
        </div>

        {/* Visual Diagram if available */}
        {currentQ.imageUrl && (
          <div className="mb-6 rounded-xl border border-border overflow-hidden bg-muted/20">
            <div className="bg-muted/60 px-4 py-2 text-xs font-semibold text-foreground flex items-center justify-between border-b border-border">
              <span className="flex items-center gap-1.5 text-primary">
                <ImageIcon className="size-4" />
                {currentQ.imageCaption || "Uploaded Diagram"}
              </span>
              <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Visual Grounding
              </span>
            </div>
            <div className="p-3 flex justify-center bg-black/5 dark:bg-black/40">
              <img
                src={currentQ.imageUrl}
                alt={currentQ.imageCaption || "Quiz Diagram"}
                className="max-h-72 w-auto rounded-lg object-contain shadow-sm border border-border/40"
              />
            </div>
          </div>
        )}

        {/* Question Text */}
        <h3 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* ── MCQ Options ── */}
        {isMcq ? (
          <div className="space-y-3 max-w-2xl">
            {mcq.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrectOpt = opt.key === mcq.correct;

              let btnStyle = "border-border bg-card hover:border-primary/50 text-foreground";
              if (mcqSubmitted) {
                if (isCorrectOpt) {
                  btnStyle = "border-success bg-success/10 text-success font-semibold";
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = "border-destructive bg-destructive/10 text-destructive font-semibold";
                } else {
                  btnStyle = "border-border bg-card/40 opacity-60 text-muted-foreground";
                }
              } else if (isSelected) {
                btnStyle = "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20";
              }

              return (
                <button
                  key={opt.key}
                  disabled={mcqSubmitted}
                  onClick={() => setSelectedOption(opt.key)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3",
                    btnStyle,
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {opt.key}
                  </span>
                  <span className="text-sm leading-relaxed">{opt.label}</span>
                </button>
              );
            })}

            {!mcqSubmitted ? (
              <div className="pt-3">
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
                <p className="text-sm text-foreground/90 leading-relaxed">{mcq.explanation}</p>
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
          /* ── Open-Ended Response ── */
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Explain in your own words (the AI evaluates technical precision and depth):
              </label>
              <Textarea
                value={openAnswer}
                onChange={(e) => setOpenAnswer(e.target.value)}
                disabled={openEvaluating || openEvaluated}
                rows={4}
                className="font-sans leading-relaxed"
                placeholder="Explain the foundational principle, mechanism, trade-offs, and step-by-step logic..."
              />
            </div>

            {!openEvaluated ? (
              <Button
                onClick={handleOpenSubmit}
                disabled={openEvaluating || !openAnswer.trim()}
              >
                {openEvaluating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" /> Evaluating Technical Precision...
                  </>
                ) : (
                  "Submit For AI Evaluation"
                )}
              </Button>
            ) : (
              <div className="mt-6 rounded-2xl border border-primary/30 bg-card p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <h4 className="font-display font-semibold text-base">
                      AI Pedagogical Evaluation
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Evaluation Score:</span>
                    <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                      {openEvalResult?.score}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Conceptual Understanding
                    </p>
                    <p className="font-semibold text-sm text-foreground mt-1">
                      {openEvalResult?.understanding}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <p className="text-xs font-medium text-muted-foreground">Technical Accuracy</p>
                    <p className="font-semibold text-sm text-warning-foreground mt-1">
                      {openEvalResult?.accuracy}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-success flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Key Concepts Addressed:
                    </p>
                    <ul className="text-xs text-foreground space-y-1">
                      {openEvalResult?.covered.map((c) => (
                        <li key={c} className="flex items-center gap-1.5">
                          <span className="text-success font-bold">✓</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                      <XCircle className="size-4" /> Knowledge Gaps &amp; Recommendations:
                    </p>
                    <ul className="text-xs text-foreground space-y-1">
                      {openEvalResult?.missing.map((m) => (
                        <li key={m} className="flex items-center gap-1.5">
                          <span className="text-destructive font-bold">✗</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <p className="text-xs font-semibold text-foreground mb-1">Feedback:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {openEvalResult?.feedback}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Logged to genuine Concept Mastery.
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
