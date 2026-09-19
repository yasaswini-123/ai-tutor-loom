/**
 * Demo dataset for AI Study Companion.
 * All values are clearly-labelled sample data used to demonstrate the full
 * learning loop: Space → Project → Material → Knowledge → Tutor → Quiz →
 * Mastery → Growth → Analytics → Recommendation.
 */

export type MaterialStatus = "queued" | "processing" | "ready" | "failed";
export type MasteryTrend = "improving" | "stable" | "attention";

export interface Concept {
  id: string;
  name: string;
  mastery: number;
  trend: MasteryTrend;
  lastPracticed: string;
  materialRefs: string[];
  history: { label: string; value: number }[];
  mistakes: string[];
}

export interface Material {
  id: string;
  projectId: string;
  name: string;
  uploadedAt: string;
  pages: number;
  status: MaterialStatus;
  progress: number;
  concepts: string[];
  sections: { page: number; title: string; excerpt: string }[];
  error?: string | undefined;
  isImage?: boolean | undefined;
  imageUrl?: string | undefined;
  visualType?: string | undefined;
}

export interface Project {
  id: string;
  spaceId: string;
  name: string;
  description: string;
  goal: string;
  progress: number;
  mastery: number;
  materials: number;
  lastActivity: string;
  concepts: Concept[];
  strengths: string[];
  weaknesses: string[];
  recentMistake: string;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  color: string;
  projects: number;
  progress: number;
  lastActivity: string;
}

export interface ActivityEvent {
  id: string;
  type:
    | "project_created"
    | "material_uploaded"
    | "material_processed"
    | "tutor"
    | "quiz_started"
    | "question_answered"
    | "assessment_completed"
    | "mastery_updated"
    | "recommendation";
  title: string;
  project: string;
  detail?: string;
  time: string;
}

export const currentUser = {
  name: "Yash Sharma",
  email: "yash@studycompanion.ai",
  role: "admin" as const,
  initials: "YS",
};

export const spaces: Space[] = [
  {
    id: "machine-learning",
    name: "Machine Learning",
    description: "Core ML theory, algorithms and practical modelling work.",
    color: "from-indigo-500 to-violet-500",
    projects: 2,
    progress: 68,
    lastActivity: "2 hours ago",
  },
  {
    id: "gate-prep",
    name: "GATE Preparation",
    description: "Structured revision across core computer science subjects.",
    color: "from-sky-500 to-cyan-500",
    projects: 1,
    progress: 54,
    lastActivity: "Yesterday",
  },
  {
    id: "placement",
    name: "Placement Preparation",
    description: "Interview readiness: DSA, systems and behavioural rounds.",
    color: "from-fuchsia-500 to-pink-500",
    projects: 1,
    progress: 41,
    lastActivity: "3 days ago",
  },
  {
    id: "research",
    name: "Research",
    description: "Paper reading notes and experiment write-ups.",
    color: "from-emerald-500 to-teal-500",
    projects: 0,
    progress: 12,
    lastActivity: "Last week",
  },
];

const mlConcepts: Concept[] = [
  {
    id: "linear-regression",
    name: "Linear Regression",
    mastery: 88,
    trend: "improving",
    lastPracticed: "2 days ago",
    materialRefs: ["Machine Learning Fundamentals.pdf — p.8"],
    history: [
      { label: "W1", value: 58 },
      { label: "W2", value: 68 },
      { label: "W3", value: 80 },
      { label: "W4", value: 88 },
    ],
    mistakes: [],
  },
  {
    id: "classification",
    name: "Classification",
    mastery: 81,
    trend: "improving",
    lastPracticed: "3 days ago",
    materialRefs: ["Machine Learning Fundamentals.pdf — p.11"],
    history: [
      { label: "W1", value: 52 },
      { label: "W2", value: 61 },
      { label: "W3", value: 74 },
      { label: "W4", value: 81 },
    ],
    mistakes: ["Confused precision with recall in one attempt."],
  },
  {
    id: "decision-trees",
    name: "Decision Trees",
    mastery: 76,
    trend: "stable",
    lastPracticed: "Today",
    materialRefs: ["Machine Learning Fundamentals.pdf — p.14"],
    history: [
      { label: "W1", value: 70 },
      { label: "W2", value: 73 },
      { label: "W3", value: 75 },
      { label: "W4", value: 76 },
    ],
    mistakes: ["Mixed up information gain and Gini impurity."],
  },
  {
    id: "random-forest",
    name: "Random Forest",
    mastery: 69,
    trend: "stable",
    lastPracticed: "4 days ago",
    materialRefs: ["Machine Learning Fundamentals.pdf — p.19"],
    history: [
      { label: "W1", value: 60 },
      { label: "W2", value: 64 },
      { label: "W3", value: 67 },
      { label: "W4", value: 69 },
    ],
    mistakes: [],
  },
  {
    id: "overfitting",
    name: "Overfitting",
    mastery: 74,
    trend: "improving",
    lastPracticed: "Yesterday",
    materialRefs: ["Machine Learning Fundamentals.pdf — p.14"],
    history: [
      { label: "W1", value: 49 },
      { label: "W2", value: 58 },
      { label: "W3", value: 66 },
      { label: "W4", value: 74 },
    ],
    mistakes: [],
  },
  {
    id: "regularization",
    name: "Regularization",
    mastery: 63,
    trend: "stable",
    lastPracticed: "5 days ago",
    materialRefs: ["Machine Learning Fundamentals.pdf — p.22"],
    history: [
      { label: "W1", value: 55 },
      { label: "W2", value: 58 },
      { label: "W3", value: 61 },
      { label: "W4", value: 63 },
    ],
    mistakes: ["Described L1 as a smooth penalty."],
  },
  {
    id: "backpropagation",
    name: "Backpropagation",
    mastery: 61,
    trend: "attention",
    lastPracticed: "Yesterday",
    materialRefs: ["Deep Learning Notes.pdf — p.7"],
    history: [
      { label: "W1", value: 64 },
      { label: "W2", value: 62 },
      { label: "W3", value: 60 },
      { label: "W4", value: 61 },
    ],
    mistakes: ["Skipped the chain rule step in an open-ended answer."],
  },
  {
    id: "cnn-padding",
    name: "CNN Padding",
    mastery: 54,
    trend: "attention",
    lastPracticed: "Today",
    materialRefs: ["Deep Learning Notes.pdf — p.21"],
    history: [
      { label: "W1", value: 40 },
      { label: "W2", value: 45 },
      { label: "W3", value: 50 },
      { label: "W4", value: 54 },
    ],
    mistakes: ["Computed output size without accounting for padding."],
  },
  {
    id: "gradient-descent",
    name: "Gradient Descent",
    mastery: 51,
    trend: "attention",
    lastPracticed: "Today",
    materialRefs: ["Machine Learning Fundamentals.pdf — p.27"],
    history: [
      { label: "W1", value: 38 },
      { label: "W2", value: 42 },
      { label: "W3", value: 42 },
      { label: "W4", value: 51 },
    ],
    mistakes: [
      "Confused gradient descent with stochastic gradient descent.",
      "Answered 3 optimization questions incorrectly this week.",
    ],
  },
  {
    id: "neural-networks",
    name: "Neural Networks",
    mastery: 42,
    trend: "attention",
    lastPracticed: "2 days ago",
    materialRefs: ["Deep Learning Notes.pdf — p.4"],
    history: [
      { label: "W1", value: 30 },
      { label: "W2", value: 33 },
      { label: "W3", value: 38 },
      { label: "W4", value: 42 },
    ],
    mistakes: ["Described activation functions as data storage."],
  },
];

export const projects: Project[] = [
  {
    id: "ml-fundamentals",
    spaceId: "machine-learning",
    name: "Machine Learning Fundamentals",
    description: "Learn the core concepts and practical applications of machine learning.",
    goal: "Understand ML algorithms, evaluate models, and solve practical ML problems.",
    progress: 72,
    mastery: 72,
    materials: 3,
    lastActivity: "Completed Decision Trees quiz",
    concepts: mlConcepts,
    strengths: ["Classification", "Regression"],
    weaknesses: ["Optimization", "Neural networks"],
    recentMistake: "Confused gradient descent with stochastic gradient descent.",
  },
  {
    id: "deep-learning",
    spaceId: "machine-learning",
    name: "Deep Learning",
    description: "Neural architectures, training dynamics and modern vision models.",
    goal: "Build and reason about deep networks from first principles.",
    progress: 58,
    mastery: 55,
    materials: 2,
    lastActivity: "Asked Tutor about CNN padding",
    concepts: mlConcepts.slice(6),
    strengths: ["Model intuition"],
    weaknesses: ["Convolution arithmetic", "Backpropagation"],
    recentMistake: "Miscalculated a convolution output shape.",
  },
  {
    id: "computer-networks",
    spaceId: "gate-prep",
    name: "Computer Networks",
    description: "Layered network models, routing and transport protocols.",
    goal: "Answer GATE-level networking questions with confidence.",
    progress: 46,
    mastery: 44,
    materials: 2,
    lastActivity: "Uploaded Networks Notes.pdf",
    concepts: mlConcepts.slice(0, 3),
    strengths: ["OSI model"],
    weaknesses: ["Congestion control"],
    recentMistake: "Mixed up TCP slow start and congestion avoidance.",
  },
  {
    id: "dbms",
    spaceId: "placement",
    name: "Database Management Systems",
    description: "Relational design, normalization, transactions and indexing.",
    goal: "Handle DBMS interview questions and query design tasks.",
    progress: 41,
    mastery: 39,
    materials: 1,
    lastActivity: "Assessment evaluated — 68%",
    concepts: mlConcepts.slice(2, 5),
    strengths: ["SQL joins"],
    weaknesses: ["Normalization proofs"],
    recentMistake: "Applied BCNF rule to a non-key dependency incorrectly.",
  },
];

export const materials: Material[] = [
  {
    id: "ml-notes",
    projectId: "ml-fundamentals",
    name: "Machine Learning Fundamentals.pdf",
    uploadedAt: "12 Sep 2026",
    pages: 42,
    status: "ready",
    progress: 100,
    concepts: [
      "Supervised Learning",
      "Regression",
      "Classification",
      "Decision Trees",
      "Random Forest",
      "Gradient Descent",
      "Overfitting",
      "Regularization",
    ],
    sections: [
      {
        page: 8,
        title: "Linear Regression",
        excerpt:
          "Linear regression fits a straight line by minimising the squared error between predictions and observed targets.",
      },
      {
        page: 14,
        title: "Decision Trees",
        excerpt:
          "A decision tree splits the feature space recursively, choosing the split that maximises information gain.",
      },
      {
        page: 14,
        title: "Overfitting",
        excerpt:
          "Overfitting occurs when a model learns the training data too closely, including noise and small variations, so it performs poorly on unseen data.",
      },
      {
        page: 27,
        title: "Gradient Descent",
        excerpt:
          "Parameters are updated in the direction opposite to the gradient of the loss, scaled by the learning rate, until convergence.",
      },
    ],
  },
  {
    id: "dl-notes",
    projectId: "ml-fundamentals",
    name: "Deep Learning Notes.pdf",
    uploadedAt: "16 Sep 2026",
    pages: 31,
    status: "processing",
    progress: 62,
    concepts: ["Neural Networks", "Backpropagation", "CNN"],
    sections: [
      {
        page: 4,
        title: "Neural Networks",
        excerpt:
          "A neural network stacks linear transformations with non-linear activations to approximate complex functions.",
      },
      {
        page: 21,
        title: "CNN Padding",
        excerpt:
          "Padding preserves spatial dimensions so that border pixels contribute to the convolution output.",
      },
    ],
  },
  {
    id: "interview-prep",
    projectId: "ml-fundamentals",
    name: "ML Interview Preparation.pdf",
    uploadedAt: "18 Sep 2026",
    pages: 18,
    status: "failed",
    progress: 0,
    concepts: [],
    sections: [],
    error: "OCR stage timed out while reading scanned pages 6–12.",
  },
  {
    id: "queued-notes",
    projectId: "ml-fundamentals",
    name: "Optimization Cheatsheet.pdf",
    uploadedAt: "19 Sep 2026",
    pages: 6,
    status: "queued",
    progress: 0,
    concepts: [],
    sections: [],
  },
];

export const processingStages = [
  "Upload",
  "Queued",
  "Processing / OCR",
  "Content Extraction",
  "Knowledge Extraction",
  "Searchable Knowledge",
  "Ready",
];

export const activity: ActivityEvent[] = [
  {
    id: "a1",
    type: "assessment_completed",
    title: "Quiz completed",
    project: "Machine Learning Fundamentals",
    detail: "Score: 82% · Decision Trees",
    time: "2 hours ago",
  },
  {
    id: "a2",
    type: "material_uploaded",
    title: "Material uploaded",
    project: "Machine Learning Fundamentals",
    detail: "Optimization Cheatsheet.pdf",
    time: "4 hours ago",
  },
  {
    id: "a3",
    type: "tutor",
    title: "Tutor interaction",
    project: "Machine Learning Fundamentals",
    detail: "“What is overfitting?”",
    time: "5 hours ago",
  },
  {
    id: "a4",
    type: "mastery_updated",
    title: "Mastery updated",
    project: "Machine Learning Fundamentals",
    detail: "Gradient Descent 42% → 51%",
    time: "Yesterday",
  },
  {
    id: "a5",
    type: "recommendation",
    title: "Recommendation generated",
    project: "Machine Learning Fundamentals",
    detail: "Review Gradient Descent",
    time: "Yesterday",
  },
  {
    id: "a6",
    type: "material_processed",
    title: "Material processed",
    project: "Deep Learning",
    detail: "Deep Learning Notes.pdf — 12 concepts extracted",
    time: "2 days ago",
  },
  {
    id: "a7",
    type: "quiz_started",
    title: "Adaptive quiz started",
    project: "Deep Learning",
    detail: "Concept: CNN Padding",
    time: "2 days ago",
  },
  {
    id: "a8",
    type: "project_created",
    title: "Project created",
    project: "Database Management Systems",
    time: "5 days ago",
  },
];

export const recommendations = [
  {
    id: "r1",
    tag: "Recommended",
    title: "Review Gradient Descent",
    reason:
      "You have made repeated mistakes in gradient-based optimization questions across your last two assessments.",
    action: "Review Material",
    to: "materials" as const,
  },
  {
    id: "r2",
    tag: "Recommended",
    title: "Take a short CNN assessment",
    reason:
      "Your recent open-ended answer was missing concepts related to convolution and padding arithmetic.",
    action: "Start Assessment",
    to: "quiz" as const,
  },
  {
    id: "r3",
    tag: "Continue",
    title: "Ask Tutor about Backpropagation",
    reason: "Mastery has plateaued at 61% while related quiz accuracy is dropping.",
    action: "Open Tutor",
    to: "tutor" as const,
  },
];

export const learningActivitySeries = [
  { day: "Mon", tutor: 6, quiz: 3, materials: 1 },
  { day: "Tue", tutor: 9, quiz: 5, materials: 0 },
  { day: "Wed", tutor: 4, quiz: 2, materials: 2 },
  { day: "Thu", tutor: 11, quiz: 6, materials: 1 },
  { day: "Fri", tutor: 7, quiz: 4, materials: 0 },
  { day: "Sat", tutor: 13, quiz: 8, materials: 1 },
  { day: "Sun", tutor: 5, quiz: 3, materials: 0 },
];

export const quizPerformanceSeries = [
  { attempt: "A1", score: 52 },
  { attempt: "A2", score: 58 },
  { attempt: "A3", score: 61 },
  { attempt: "A4", score: 57 },
  { attempt: "A5", score: 69 },
  { attempt: "A6", score: 74 },
  { attempt: "A7", score: 82 },
];

export const masteryTrendSeries = [
  { week: "Week 1", mastery: 48 },
  { week: "Week 2", mastery: 56 },
  { week: "Week 3", mastery: 65 },
  { week: "Week 4", mastery: 72 },
];

export interface McqQuestion {
  kind: "mcq";
  concept: string;
  difficulty: string;
  question: string;
  options: { key: string; label: string }[];
  correct: string;
  explanation: string;
  imageUrl?: string | undefined;
  imageCaption?: string | undefined;
  materialId?: string | undefined;
}

export interface OpenQuestion {
  kind: "open";
  concept: string;
  difficulty: string;
  question: string;
  imageUrl?: string | undefined;
  imageCaption?: string | undefined;
  materialId?: string | undefined;
  evaluation: {
    understanding: string;
    accuracy: string;
    covered: string[];
    missing: string[];
    feedback: string;
    score: number;
  };
}

export type QuizQuestionData = McqQuestion | OpenQuestion;

export const quizQuestions: QuizQuestionData[] = [
  {
    kind: "mcq",
    concept: "Activation Functions",
    difficulty: "Medium",
    question: "What is the primary purpose of an activation function in a neural network?",
    options: [
      { key: "A", label: "Store training data" },
      { key: "B", label: "Introduce non-linearity" },
      { key: "C", label: "Increase dataset size" },
      { key: "D", label: "Remove all model parameters" },
    ],
    correct: "B",
    explanation:
      "Activation functions introduce non-linearity, allowing neural networks to learn complex relationships.",
  },
  {
    kind: "mcq",
    concept: "Gradient Descent",
    difficulty: "Medium",
    question: "Which statement best describes the role of the learning rate?",
    options: [
      { key: "A", label: "It defines how many samples are used per epoch" },
      { key: "B", label: "It scales the size of each parameter update" },
      { key: "C", label: "It sets the number of hidden layers" },
      { key: "D", label: "It removes noise from the training data" },
    ],
    correct: "B",
    explanation:
      "The learning rate scales each gradient step; too large overshoots the minimum, too small converges slowly.",
  },
  {
    kind: "open",
    concept: "Gradient Descent",
    difficulty: "Hard",
    question: "Explain how gradient descent works.",
    evaluation: {
      understanding: "Good",
      accuracy: "Needs Improvement",
      covered: ["Learning rate", "Gradient", "Parameter update"],
      missing: ["Direction of optimization", "Convergence"],
      feedback:
        "You understand the basic idea of updating parameters using the gradient, but your answer should explain that the parameters are updated in the direction that reduces the loss, and that the process repeats until the loss converges.",
      score: 72,
    },
  },
  {
    kind: "mcq",
    concept: "Overfitting",
    difficulty: "Easy",
    question: "A model with very low training error and high test error is most likely:",
    options: [
      { key: "A", label: "Underfitting" },
      { key: "B", label: "Overfitting" },
      { key: "C", label: "Perfectly regularized" },
      { key: "D", label: "Untrained" },
    ],
    correct: "B",
    explanation:
      "Low training error with high test error is the classic signature of overfitting to noise in the training set.",
  },
];

export const tutorSeed = [
  {
    id: "m1",
    role: "user" as const,
    content: "What is overfitting?",
  },
  {
    id: "m2",
    role: "tutor" as const,
    content:
      "Overfitting occurs when a model learns the training data too closely, including noise and small variations, so it performs poorly on unseen data. You reduce it with regularization, more data, or simpler models.",
    source: { material: "Machine Learning Fundamentals.pdf", page: 14 },
  },
];

export const quickPrompts = [
  "Explain simply",
  "Give an example",
  "Quiz me",
  "Explain step-by-step",
  "Help me revise",
];

export const notifications = [
  { id: "n1", title: "Your document is ready.", detail: "Machine Learning Fundamentals.pdf", time: "10m", tone: "success" as const },
  { id: "n2", title: "Quiz evaluation completed.", detail: "Decision Trees · 82%", time: "2h", tone: "info" as const },
  { id: "n3", title: "New learning recommendation available.", detail: "Review Gradient Descent", time: "5h", tone: "info" as const },
  { id: "n4", title: "Mastery updated for Gradient Descent.", detail: "42% → 51%", time: "1d", tone: "success" as const },
  { id: "n5", title: "Document processing failed. Retry available.", detail: "ML Interview Preparation.pdf", time: "1d", tone: "error" as const },
];

/* ---------------------------------- Admin --------------------------------- */

export const adminMetrics = [
  { label: "Total Users", value: "1,248", delta: "+4.2%" },
  { label: "Active Users", value: "682", delta: "+2.1%" },
  { label: "Projects", value: "2,394", delta: "+6.8%" },
  { label: "AI Requests", value: "18,492", delta: "+11.3%" },
  { label: "Average AI Latency", value: "1.8s", delta: "-0.2s" },
  { label: "Failed Jobs", value: "23", delta: "+3" },
];

export const adminActivitySeries = [
  { date: "Mon", users: 420, projects: 38, requests: 2100 },
  { date: "Tue", users: 480, projects: 44, requests: 2480 },
  { date: "Wed", users: 512, projects: 51, requests: 2760 },
  { date: "Thu", users: 498, projects: 47, requests: 2610 },
  { date: "Fri", users: 601, projects: 62, requests: 3180 },
  { date: "Sat", users: 682, projects: 71, requests: 3520 },
  { date: "Sun", users: 545, projects: 55, requests: 2840 },
];

export const adminUsers = [
  { id: "u1", name: "Aarav Mehta", email: "aarav@example.com", spaces: 4, projects: 9, lastActive: "8 min ago", usage: "2,410 req", status: "Active" },
  { id: "u2", name: "Diya Kapoor", email: "diya@example.com", spaces: 2, projects: 5, lastActive: "1 hour ago", usage: "1,180 req", status: "Active" },
  { id: "u3", name: "Rohan Iyer", email: "rohan@example.com", spaces: 3, projects: 6, lastActive: "Yesterday", usage: "940 req", status: "Idle" },
  { id: "u4", name: "Sara Khan", email: "sara@example.com", spaces: 1, projects: 2, lastActive: "3 days ago", usage: "210 req", status: "Idle" },
  { id: "u5", name: "Nikhil Rao", email: "nikhil@example.com", spaces: 5, projects: 12, lastActive: "22 min ago", usage: "3,905 req", status: "Active" },
  { id: "u6", name: "Meera Joshi", email: "meera@example.com", spaces: 2, projects: 3, lastActive: "2 weeks ago", usage: "60 req", status: "Suspended" },
];

export const aiRequests = [
  { id: "req_8f21", feature: "Tutor", model: "GPT model", retrieval: "0.4s", generation: "1.0s", latency: "1.4s", tokens: "1,245", cost: "$0.003", status: "Success" },
  { id: "req_8f22", feature: "Quiz Evaluation", model: "GPT model", retrieval: "0.2s", generation: "2.6s", latency: "2.8s", tokens: "2,010", cost: "$0.006", status: "Success" },
  { id: "req_8f23", feature: "Knowledge Extraction", model: "Embedding model", retrieval: "—", generation: "0.9s", latency: "0.9s", tokens: "8,420", cost: "$0.001", status: "Success" },
  { id: "req_8f24", feature: "Recommendation", model: "GPT model", retrieval: "0.3s", generation: "1.1s", latency: "1.4s", tokens: "760", cost: "$0.002", status: "Success" },
  { id: "req_8f25", feature: "Tutor", model: "GPT model", retrieval: "3.9s", generation: "2.2s", latency: "6.1s", tokens: "3,180", cost: "$0.009", status: "Slow" },
  { id: "req_8f26", feature: "Quiz Evaluation", model: "GPT model", retrieval: "0.3s", generation: "—", latency: "0.6s", tokens: "0", cost: "$0.000", status: "Failed" },
];

export const aiLatencySeries = [
  { t: "00:00", latency: 1.6, requests: 210, cost: 1.2 },
  { t: "04:00", latency: 1.4, requests: 180, cost: 0.9 },
  { t: "08:00", latency: 2.1, requests: 420, cost: 2.4 },
  { t: "12:00", latency: 2.6, requests: 610, cost: 3.6 },
  { t: "16:00", latency: 1.9, requests: 540, cost: 3.1 },
  { t: "20:00", latency: 1.7, requests: 380, cost: 2.2 },
];

export const evaluationGroups = [
  {
    title: "Tutor Evaluation",
    metrics: [
      { label: "Accuracy", value: 91 },
      { label: "Groundedness", value: 94 },
      { label: "Citation correctness", value: 89 },
      { label: "Unsupported question handling", value: 96 },
    ],
  },
  {
    title: "Retrieval Evaluation",
    metrics: [
      { label: "Relevance", value: 88 },
      { label: "Source quality", value: 92 },
    ],
  },
  {
    title: "Assessment Evaluation",
    metrics: [
      { label: "Question quality", value: 86 },
      { label: "Grading quality", value: 83 },
      { label: "Structured output reliability", value: 97 },
      { label: "Adaptive behaviour", value: 81 },
    ],
  },
  {
    title: "Recommendation Evaluation",
    metrics: [
      { label: "Relevance", value: 85 },
      { label: "Actionability", value: 79 },
      { label: "Alignment with learner state", value: 88 },
    ],
  },
];

export const evaluationTrend = [
  { week: "W1", groundedness: 86, grading: 74, recommendation: 70 },
  { week: "W2", groundedness: 89, grading: 78, recommendation: 76 },
  { week: "W3", groundedness: 92, grading: 81, recommendation: 82 },
  { week: "W4", groundedness: 94, grading: 83, recommendation: 85 },
];

export const backgroundJobs: Array<{ id: string; type: string; project: string; status: "Queued" | "Running" | "Completed" | "Failed" | "Retrying"; started: string; duration: string; attempts: number }> = [
  { id: "job_101", type: "Document Processing", project: "ML Fundamentals", status: "Running", started: "2 min ago", duration: "1m 48s", attempts: 1 },
  { id: "job_102", type: "OCR", project: "ML Fundamentals", status: "Failed", started: "14 min ago", duration: "3m 02s", attempts: 3 },
  { id: "job_103", type: "Knowledge Extraction", project: "Deep Learning", status: "Completed", started: "1 hour ago", duration: "46s", attempts: 1 },
  { id: "job_104", type: "Embedding Generation", project: "Deep Learning", status: "Completed", started: "1 hour ago", duration: "1m 12s", attempts: 1 },
  { id: "job_105", type: "Quiz Evaluation", project: "Computer Networks", status: "Retrying", started: "22 min ago", duration: "2m 04s", attempts: 2 },
  { id: "job_106", type: "Mastery Update", project: "ML Fundamentals", status: "Queued", started: "—", duration: "—", attempts: 0 },
  { id: "job_107", type: "Recommendation Generation", project: "DBMS", status: "Completed", started: "3 hours ago", duration: "18s", attempts: 1 },
];

export const systemComponents = [
  { name: "API", status: "Operational", latency: "128 ms", errors: "0 in last hour" },
  { name: "Database", status: "Operational", latency: "22 ms", errors: "0 in last hour" },
  { name: "AI Provider", status: "Degraded", latency: "2.9 s", errors: "6 timeouts in last hour" },
  { name: "Document Processing", status: "Operational", latency: "1.4 s", errors: "1 in last hour" },
  { name: "Search / Retrieval", status: "Operational", latency: "310 ms", errors: "0 in last hour" },
  { name: "Background Worker", status: "Degraded", latency: "4.2 s", errors: "23 failed jobs" },
];

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

export function getSpace(id: string) {
  return spaces.find((s) => s.id === id);
}

export function projectsForSpace(id: string) {
  return projects.filter((p) => p.spaceId === id);
}

export function materialsForProject(id: string) {
  return materials.filter((m) => m.projectId === id || id !== "ml-fundamentals");
}
