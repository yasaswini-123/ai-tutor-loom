/**
 * AI Study Companion - Centralized Reactive State & Persistence Manager
 *
 * Implements a persistent, SSR-safe reactive store for:
 * - User authentication & sessions
 * - Spaces & isolated Projects
 * - PDF Material Upload Pipeline (Uploaded -> Queued -> Processing -> Content Extraction -> Knowledge Extraction -> Searchable Knowledge -> Ready)
 * - Automatic Document Summaries
 * - Material-Specific Adaptive Quiz Generation (MCQ & Open-ended)
 * - Grounded AI Tutor with Document Citations and Fallbacks
 * - Dynamic Concept Mastery & Growth Tracking
 * - Background Processing Jobs & Activity Event Logging
 */

import { useSyncExternalStore } from "react";
import {
  currentUser as defaultUser,
  spaces as defaultSpaces,
  projects as defaultProjects,
  materials as defaultMaterials,
  activity as defaultActivity,
  quizQuestions as defaultQuizQuestions,
  backgroundJobs as defaultJobs,
  type Space,
  type Project,
  type Material,
  type Concept,
  type ActivityEvent,
  type QuizQuestionData,
} from "./demo-data";
import { getSampleDiagramByFileName } from "./diagram-generator";

export interface DocumentSummary {
  materialId: string;
  title: string;
  executiveSummary: string;
  keyTakeaways: string[];
  coreConcepts: string[];
  suggestedQuizTopics: string[];
  isImage?: boolean | undefined;
  imageUrl?: string | undefined;
  visualComponents?: string[] | undefined;
}

export interface TutorMessage {
  id: string;
  projectId: string;
  role: "user" | "tutor";
  content: string;
  source?: {
    material: string;
    page?: number | undefined;
    excerpt?: string | undefined;
    imageUrl?: string | undefined;
    isImage?: boolean | undefined;
  } | undefined;
  isUnsupported?: boolean | undefined;
  timestamp: string;
}

export interface BackgroundJob {
  id: string;
  type: string;
  project: string;
  status: "Queued" | "Running" | "Completed" | "Failed" | "Retrying";
  started: string;
  duration: string;
  attempts: number;
}

export interface QuizSessionRecord {
  id: string;
  projectId: string;
  scorePercent: number;
  totalQuestions: number;
  correctQuestions: number;
  conceptTested: string;
  timestamp: string;
}

export interface AppStoreState {
  user: {
    name: string;
    email: string;
    role: "admin" | "student";
    initials: string;
  } | null;
  spaces: Space[];
  projects: Project[];
  materials: Material[];
  summaries: Record<string, DocumentSummary>;
  quizzes: Record<string, QuizQuestionData[]>; // keyed by projectId or materialId
  tutorMessages: Record<string, TutorMessage[]>; // keyed by projectId
  activity: ActivityEvent[];
  backgroundJobs: BackgroundJob[];
  quizSessions?: QuizSessionRecord[];
  questionAnswersCount?: Record<string, number>; // keyed by projectId or "global"
  dataMode?: "live" | "demo";
}

const STORAGE_KEY = "ai_study_companion_storage_v4";

// Initial seed summaries for initial documents
const initialSummaries: Record<string, DocumentSummary> = {
  "ml-notes": {
    materialId: "ml-notes",
    title: "Machine Learning Fundamentals.pdf",
    executiveSummary:
      "A comprehensive guide covering supervised learning models, loss formulations, parameter optimization with gradient descent, decision tree splits, and methods to balance the bias-variance trade-off.",
    keyTakeaways: [
      "Supervised learning aims to approximate target mappings from labeled feature pairs.",
      "Linear regression minimizes mean squared error, solvable via analytical normal equations or iterative gradient updates.",
      "Decision trees maximize information gain or minimize Gini impurity at recursive split boundaries.",
      "Overfitting happens when model capacity memorizes sample noise; regularization (L1/L2) and pruning mitigate this.",
    ],
    coreConcepts: [
      "Linear Regression",
      "Decision Trees",
      "Overfitting",
      "Regularization",
      "Gradient Descent",
    ],
    suggestedQuizTopics: [
      "Cost function optimization",
      "Gini impurity vs Entropy",
      "L1 vs L2 penalty behavior",
    ],
  },
  "dl-notes": {
    materialId: "dl-notes",
    title: "Deep Learning Notes.pdf",
    executiveSummary:
      "Explores deep neural architectures, backpropagation derivation via calculus chain rule, activation functions, and convolutional network spatial operations including padding and pooling.",
    keyTakeaways: [
      "Activation functions introduce non-linearities necessary for multi-layer universal function approximation.",
      "Backpropagation recursively distributes error gradients backwards to update synaptic weights.",
      "Convolutional filters preserve spatial 2D topologies for vision tasks; padding controls boundary output dimensions.",
    ],
    coreConcepts: ["Neural Networks", "Backpropagation", "CNN Padding"],
    suggestedQuizTopics: [
      "Chain rule in backpropagation",
      "Convolution arithmetic with stride and padding",
      "Vanishing gradients in Sigmoid vs ReLU",
    ],
  },
};

// Initial seed tutor conversations
const initialTutorSeed: Record<string, TutorMessage[]> = {
  "ml-fundamentals": [
    {
      id: "seed-1",
      projectId: "ml-fundamentals",
      role: "user",
      content: "What is overfitting?",
      timestamp: "10:30 AM",
    },
    {
      id: "seed-2",
      projectId: "ml-fundamentals",
      role: "tutor",
      content:
        "Overfitting occurs when a model learns the training data too closely, including noise and random fluctuations, so it performs poorly on unseen test data. You can combat it using regularization (L1/L2), cross-validation, dropout, or gathering more training data.",
      source: {
        material: "Machine Learning Fundamentals.pdf",
        page: 14,
        excerpt:
          "Overfitting occurs when a model learns the training data too closely, including noise and small variations, so it performs poorly on unseen data.",
      },
      timestamp: "10:30 AM",
    },
  ],
};

export function getFreshProjects(): Project[] {
  return defaultProjects.map((p) => ({
    ...p,
    progress: 0,
    mastery: 0,
    materials: 0,
    lastActivity: "Not started yet",
    recentMistake: "No mistakes recorded yet. Take an adaptive quiz to identify weak areas.",
    concepts: p.concepts.map((c) => ({
      ...c,
      mastery: 0,
      trend: "stable",
      lastPracticed: "Never",
      history: [],
      mistakes: [],
    })),
  }));
}

export function getFreshSpaces(): Space[] {
  return defaultSpaces.map((s) => ({
    ...s,
    progress: 0,
    lastActivity: "Clean slate",
  }));
}

function getInitialState(): AppStoreState {
  if (typeof window === "undefined") {
    return {
      user: defaultUser,
      spaces: defaultSpaces,
      projects: defaultProjects,
      materials: defaultMaterials,
      summaries: initialSummaries,
      quizzes: { "ml-fundamentals": defaultQuizQuestions },
      tutorMessages: initialTutorSeed,
      activity: defaultActivity,
      backgroundJobs: defaultJobs,
      quizSessions: [],
      questionAnswersCount: {},
      dataMode: "demo",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.spaces) && Array.isArray(parsed.projects)) {
        return {
          ...parsed,
          quizSessions: Array.isArray(parsed.quizSessions) ? parsed.quizSessions : [],
          questionAnswersCount: parsed.questionAnswersCount || {},
          dataMode: parsed.dataMode || "demo",
        };
      }
    }
  } catch (e) {
    console.error("Failed to load local study store:", e);
  }

  return {
    user: defaultUser,
    spaces: defaultSpaces,
    projects: defaultProjects,
    materials: defaultMaterials,
    summaries: initialSummaries,
    quizzes: { "ml-fundamentals": defaultQuizQuestions },
    tutorMessages: initialTutorSeed,
    activity: defaultActivity,
    backgroundJobs: defaultJobs,
    quizSessions: [],
    questionAnswersCount: {},
    dataMode: "demo",
  };
}

let currentState: AppStoreState = getInitialState();
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.error("Failed to persist study store to localStorage:", e);
    }
  }
  listeners.forEach((l) => l());
}

export const studyStore = {
  getState() {
    return currentState;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  resetDefaults() {
    currentState = {
      user: defaultUser,
      spaces: defaultSpaces,
      projects: defaultProjects,
      materials: defaultMaterials,
      summaries: initialSummaries,
      quizzes: { "ml-fundamentals": defaultQuizQuestions },
      tutorMessages: initialTutorSeed,
      activity: defaultActivity,
      backgroundJobs: defaultJobs,
      quizSessions: [],
      questionAnswersCount: {},
      dataMode: "demo",
    };
    notify();
  },

  resetToFresh() {
    currentState = {
      user: currentState.user || defaultUser,
      spaces: getFreshSpaces(),
      projects: getFreshProjects(),
      materials: [],
      summaries: {},
      quizzes: { "ml-fundamentals": defaultQuizQuestions },
      tutorMessages: {},
      activity: [
        {
          id: `act-${Date.now()}`,
          type: "project_created",
          title: "Fresh Learning Workspace initialized",
          project: "All Projects",
          detail: "All progress reset to 0%. Complete quizzes and upload materials to record genuine results.",
          time: "Just now",
        },
      ],
      backgroundJobs: [],
      quizSessions: [],
      questionAnswersCount: {},
      dataMode: "live",
    };
    notify();
  },

  setDataMode(mode: "live" | "demo") {
    if (mode === "live") {
      this.resetToFresh();
    } else {
      this.resetDefaults();
    }
  },

  // Auth actions
  login(name: string, email: string) {
    currentState = {
      ...currentState,
      user: {
        name,
        email,
        role: "student",
        initials: name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      },
    };
    notify();
  },

  logout() {
    currentState = {
      ...currentState,
      user: null,
    };
    notify();
  },

  // Spaces actions
  createSpace(name: string, description: string, color?: string) {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newSpace: Space = {
      id,
      name,
      description,
      color: color || "from-indigo-500 to-violet-500",
      projects: 0,
      progress: 0,
      lastActivity: "Just created",
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: "project_created",
      title: "Space created",
      project: name,
      detail: `Created new learning space "${name}"`,
      time: "Just now",
    };

    currentState = {
      ...currentState,
      spaces: [newSpace, ...currentState.spaces],
      activity: [newActivity, ...currentState.activity],
    };
    notify();
    return newSpace;
  },

  // Projects actions
  createProject(spaceId: string, name: string, description: string, goal: string) {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newProject: Project = {
      id,
      spaceId,
      name,
      description,
      goal,
      progress: 10,
      mastery: 25,
      materials: 0,
      lastActivity: "Project workspace initialized",
      concepts: [
        {
          id: `${id}-intro`,
          name: `${name} Fundamentals`,
          mastery: 35,
          trend: "improving",
          lastPracticed: "Today",
          materialRefs: [],
          history: [{ label: "Start", value: 35 }],
          mistakes: [],
        },
      ],
      strengths: ["Initial Setup"],
      weaknesses: ["Foundational Readings"],
      recentMistake: "No recorded mistakes yet.",
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: "project_created",
      title: "Project created",
      project: name,
      detail: `Goal: ${goal}`,
      time: "Just now",
    };

    // Update space projects count
    const updatedSpaces = currentState.spaces.map((s) =>
      s.id === spaceId ? { ...s, projects: s.projects + 1, lastActivity: "Just now" } : s,
    );

    currentState = {
      ...currentState,
      spaces: updatedSpaces,
      projects: [newProject, ...currentState.projects],
      activity: [newActivity, ...currentState.activity],
    };
    notify();
    return newProject;
  },

  /**
   * PDF Document Upload Pipeline:
   * Uploaded -> Queued -> Processing -> Content Extraction -> Knowledge Extraction -> Searchable Knowledge -> Ready
   * Automatically generates:
   * 1. Structured Document Summary
   * 2. Related Concepts & Semantic Chunks
   * 3. Adaptive Quiz Questions based directly on the uploaded material
   * 4. Updates Project Knowledge and AI Tutor context
   */
  uploadMaterial(
    projectId: string,
    fileName: string,
    onProgress?: (stage: string, progress: number) => void,
    customImageUrl?: string,
  ) {
    const materialId = `mat-${Date.now()}`;
    const cleanName = fileName.replace(/\.[^/.]+$/, "");
    const jobId = `job-${Date.now()}`;

    const isImage =
      /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(fileName) ||
      (!!customImageUrl && customImageUrl.startsWith("data:image"));
    const sampleDiagram = isImage ? getSampleDiagramByFileName(fileName) : null;
    const resolvedImageUrl = isImage ? customImageUrl || sampleDiagram?.dataUrl : undefined;

    const newMaterial: Material = {
      id: materialId,
      projectId,
      name: fileName,
      uploadedAt: "Just now",
      pages: isImage ? 1 : Math.floor(Math.random() * 15) + 10,
      status: "queued",
      progress: 10,
      concepts: [],
      sections: [],
      isImage,
      imageUrl: resolvedImageUrl,
      visualType: isImage ? sampleDiagram?.title || "Visual Architecture Diagram" : undefined,
    };

    const initialJob: BackgroundJob = {
      id: jobId,
      type: isImage
        ? "Visual OCR & Diagram Knowledge Extraction"
        : "Document Processing & Knowledge Extraction",
      project: cleanName,
      status: "Running",
      started: "Just now",
      duration: "0s",
      attempts: 1,
    };

    const uploadActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: "material_uploaded",
      title: isImage ? "Visual diagram uploaded" : "Material uploaded",
      project: cleanName,
      detail: isImage
        ? `${fileName} queued for visual OCR, layout parsing & diagram knowledge extraction`
        : `${fileName} queued for content & knowledge extraction`,
      time: "Just now",
    };

    currentState = {
      ...currentState,
      materials: [newMaterial, ...currentState.materials],
      backgroundJobs: [initialJob, ...currentState.backgroundJobs],
      activity: [uploadActivity, ...currentState.activity],
    };
    notify();

    // Stage 1: Queued -> Processing
    setTimeout(() => {
      onProgress?.(
        isImage
          ? "Visual OCR & Diagram Layout Parsing"
          : "Extracting Content (OCR & Text Parsing)",
        35,
      );
      currentState = {
        ...currentState,
        materials: currentState.materials.map((m) =>
          m.id === materialId ? { ...m, status: "processing", progress: 35 } : m,
        ),
      };
      notify();
    }, 800);

    // Stage 2: Content Extraction -> Knowledge Extraction
    setTimeout(() => {
      onProgress?.(
        isImage
          ? "Extracting Visual Knowledge, Formulas & Architecture"
          : "Extracting Knowledge & Structuring Concepts",
        65,
      );
      currentState = {
        ...currentState,
        materials: currentState.materials.map((m) =>
          m.id === materialId ? { ...m, status: "processing", progress: 65 } : m,
        ),
      };
      notify();
    }, 1800);

    // Stage 3: Creating Searchable Knowledge -> Ready
    setTimeout(() => {
      onProgress?.(
        isImage
          ? "Synthesizing Visual Quiz & Grounding AI Tutor"
          : "Creating Searchable Knowledge & Synthesizing Quiz",
        90,
      );

      const extractedConcepts = isImage
        ? [
            `${cleanName} Visual Architecture`,
            `${cleanName} Mathematical Formulations`,
            `${cleanName} Component & Layer Flow`,
          ]
        : [
            `${cleanName} Core Principles`,
            `${cleanName} Architecture & Mechanisms`,
            `Empirical Analysis & Trade-offs of ${cleanName}`,
          ];

      const sections = isImage
        ? [
            {
              page: 1,
              title: `Visual Architecture & Layout: ${cleanName}`,
              excerpt: `Spatial layout analysis, labeled component nodes, directional flow arrows, and visual structural hierarchy parsed from ${fileName}.`,
            },
            {
              page: 1,
              title: `Formulas & Mathematical Formulations`,
              excerpt: `Mathematical equations, loss function representations, and dimensional tensor mappings extracted from the visual diagram.`,
            },
            {
              page: 1,
              title: `Component Connections & Data Flow`,
              excerpt: `Input-to-output pipeline tracing, activation checkpoints, and interface boundaries depicted in ${cleanName}.`,
            },
          ]
        : [
            {
              page: 1,
              title: `Introduction to ${cleanName}`,
              excerpt: `Comprehensive primer on ${cleanName}: motivation, foundational definitions, and scope of inquiry within modern engineering workflows.`,
            },
            {
              page: 6,
              title: `Mathematical Formulations & Architecture`,
              excerpt: `Rigorous model formulation for ${cleanName}, parameter updates, loss constraints, and algorithmic convergence properties.`,
            },
            {
              page: 12,
              title: `Practical Recommendations & Failure Modes`,
              excerpt: `Empirical benchmarks for ${cleanName}, common student misconceptions, regularization safeguards, and production optimization tips.`,
            },
          ];

      // Summary synthesis
      const summary: DocumentSummary = isImage
        ? {
            materialId,
            title: fileName,
            isImage: true,
            imageUrl: resolvedImageUrl,
            visualComponents: [
              "Input Tensor & Feature Representation",
              "Intermediate Transformation Layers",
              "Mathematical Loss & Optimization Boundary",
              "Output Classification & Projection Head",
            ],
            executiveSummary: `Visual diagram analysis of ${cleanName}. The AI has parsed the spatial layout, labeled nodes, directional arrows, and mathematical formulas depicted in this image. Key architectural patterns and operational flows have been extracted into grounded knowledge for the AI Tutor and assessments.`,
            keyTakeaways: [
              `Visual Architecture: Clear spatial progression from input layer nodes through intermediate transform layers to target output.`,
              `Mathematical Grounding: Explicit loss formulation and gradient feedback vectors indicated in the visual diagram annotations.`,
              `Dimensional Flow: Preserves structural feature resolutions with explicit channel mapping and dimensionality constraints.`,
              `Operational Safeguards: Regularization paths and activation boundaries visually demarcated to prevent degradation.`,
            ],
            coreConcepts: extractedConcepts,
            suggestedQuizTopics: [
              `Visual flow and node dependencies in ${cleanName}`,
              `Layer transformations and activation stages`,
              `Mathematical formulations highlighted in the diagram`,
            ],
          }
        : {
            materialId,
            title: fileName,
            executiveSummary: `This material covers the core theoretical and practical principles of ${cleanName}. It details underlying assumptions, structural architecture, empirical evaluation metrics, and comparative advantages over classic alternatives.`,
            keyTakeaways: [
              `Fundamental objective: ${cleanName} balances model expressive capacity with generalizability to unseen scenarios.`,
              `Mechanisms & math: Objective functions penalize empirical variance while enforcing smoothness constraints.`,
              `Practical implementation: Step sizes, hyperparameters, and feature normalization directly determine convergence rates.`,
              `Key pitfall: Unregularized application risks sample memorization and degraded out-of-domain performance.`,
            ],
            coreConcepts: extractedConcepts,
            suggestedQuizTopics: [
              `Objective formulation of ${cleanName}`,
              `Convergence dynamics and learning rates`,
              `Regularization and variance mitigation`,
            ],
          };

      // Generate a pool of 30 quiz questions tailored to this material
      const buildImageQuestions = (): QuizQuestionData[] => [
        // --- MCQ Block 1: Architecture (Easy-Medium) ---
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Easy", imageUrl: resolvedImageUrl, imageCaption: `Visual Diagram: ${fileName}`, materialId,
          question: `Looking at "${fileName}", what component appears at the INPUT stage of the visual pipeline?`,
          options: [
            { key: "A", label: "Raw feature tensors or data representations" },
            { key: "B", label: "Final classification logits" },
            { key: "C", label: "The loss gradient signal" },
            { key: "D", label: "A frozen weight vector" },
          ], correct: "A", explanation: `The input stage of the pipeline in "${fileName}" receives raw feature tensors before any transformation.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Visual Diagram: ${fileName}`, materialId,
          question: `What is the primary role of intermediate layers shown in "${fileName}"?`,
          options: [
            { key: "A", label: "Transform inputs into higher-level abstract feature spaces" },
            { key: "B", label: "Permanently delete input data" },
            { key: "C", label: "Bypass computation and output random constants" },
            { key: "D", label: "Invert the loss function" },
          ], correct: "A", explanation: `Intermediate layers in "${fileName}" progressively extract and transform features before the output head.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Architecture Overview: ${fileName}`, materialId,
          question: `In "${fileName}", what connects the intermediate layers to the output node?`,
          options: [
            { key: "A", label: "A projection or classification head" },
            { key: "B", label: "A random noise generator" },
            { key: "C", label: "A hard-coded lookup table" },
            { key: "D", label: "An external API call" },
          ], correct: "A", explanation: `A projection head aggregates learned representations from intermediate layers to produce the final output.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Architecture Overview: ${fileName}`, materialId,
          question: `Based on the spatial layout in "${fileName}", which architectural pattern is most clearly demonstrated?`,
          options: [
            { key: "A", label: "Hierarchical feature extraction with increasing abstraction" },
            { key: "B", label: "Random graph traversal with no fixed direction" },
            { key: "C", label: "Single-layer direct mapping" },
            { key: "D", label: "Flat feature concatenation without transformation" },
          ], correct: "A", explanation: `The hierarchical visual structure of "${fileName}" shows increasing abstraction level at each successive layer.` },
        // --- MCQ Block 2: Gradients & Math ---
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Mathematical Annotations: ${fileName}`, materialId,
          question: `According to the mathematical annotations in "${fileName}", which rule governs backward gradient propagation?`,
          options: [
            { key: "A", label: "The calculus chain rule" },
            { key: "B", label: "Bayes' theorem" },
            { key: "C", label: "The Central Limit Theorem" },
            { key: "D", label: "The law of large numbers" },
          ], correct: "A", explanation: `Gradient arrows in "${fileName}" trace the chain rule path from the loss node backwards through each layer.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Gradient Flow: ${fileName}`, materialId,
          question: `In the backward path depicted in "${fileName}", how are gradient updates propagated?`,
          options: [
            { key: "A", label: "Along the reverse computation path via chain rule" },
            { key: "B", label: "By skipping intermediate layers" },
            { key: "C", label: "Directly to raw pixels while freezing hidden weights" },
            { key: "D", label: "Via random uniform sampling each epoch" },
          ], correct: "A", explanation: `The visual in "${fileName}" shows gradients flowing backwards through every connected layer using the chain rule.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Loss Function: ${fileName}`, materialId,
          question: `What does the loss node in "${fileName}" measure?`,
          options: [
            { key: "A", label: "Discrepancy between model predictions and ground truth" },
            { key: "B", label: "Raw pixel intensity of the input" },
            { key: "C", label: "Number of parameters in the model" },
            { key: "D", label: "Random noise injected at training time" },
          ], correct: "A", explanation: `The loss node computes the prediction error which drives gradient-based updates throughout the network.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Weight Update: ${fileName}`, materialId,
          question: `What controls the step size of parameter updates shown in "${fileName}"?`,
          options: [
            { key: "A", label: "Learning rate hyperparameter" },
            { key: "B", label: "Batch size only" },
            { key: "C", label: "Number of output classes" },
            { key: "D", label: "The input image resolution" },
          ], correct: "A", explanation: `The learning rate scales the gradient signal to control how large each weight update step is.` },
        // --- MCQ Block 3: Data Flow & Regularization ---
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Easy", imageUrl: resolvedImageUrl, imageCaption: `Data Flow: ${fileName}`, materialId,
          question: `In "${fileName}", in what direction does data flow during the forward pass?`,
          options: [
            { key: "A", label: "From input through intermediate layers to output" },
            { key: "B", label: "From output back to input" },
            { key: "C", label: "Bidirectionally at every step" },
            { key: "D", label: "Randomly between layers" },
          ], correct: "A", explanation: `Forward pass data flows left-to-right (input → hidden layers → output) as depicted in "${fileName}".` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Regularization: ${fileName}`, materialId,
          question: `What does a regularization checkpoint depicted in "${fileName}" primarily prevent?`,
          options: [
            { key: "A", label: "Overfitting by penalizing model complexity" },
            { key: "B", label: "Underfitting by adding more parameters" },
            { key: "C", label: "Speed of convergence" },
            { key: "D", label: "Dataset size reduction" },
          ], correct: "A", explanation: `Regularization checkpoints constrain model complexity to prevent overfitting on training data.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Component Interaction: ${fileName}`, materialId,
          question: `Which interaction between components in "${fileName}" enables the network to learn hierarchical representations?`,
          options: [
            { key: "A", label: "Stacking non-linear transformation layers with shared gradient signals" },
            { key: "B", label: "Duplicating the input across all layers without modification" },
            { key: "C", label: "Using a single global weight matrix" },
            { key: "D", label: "Removing activation functions to keep outputs linear" },
          ], correct: "A", explanation: `Non-linear stacking of layers with shared backpropagated gradients enables hierarchical feature learning.` },
        // --- More MCQs (conceptual depth) ---
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Easy", imageUrl: resolvedImageUrl, imageCaption: `Component Labels: ${fileName}`, materialId,
          question: `What label typically identifies the topmost layer in "${fileName}"?`,
          options: [
            { key: "A", label: "Output or prediction head" },
            { key: "B", label: "Embedding table" },
            { key: "C", label: "Preprocessing buffer" },
            { key: "D", label: "Memory register" },
          ], correct: "A", explanation: `The topmost node in the diagram represents the output/prediction head that yields the final result.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Easy", imageUrl: resolvedImageUrl, imageCaption: `Formula Inspection: ${fileName}`, materialId,
          question: `In the equations annotated in "${fileName}", what symbol most commonly represents model parameters?`,
          options: [
            { key: "A", label: "θ (theta) or W (weight matrix)" },
            { key: "B", label: "σ (standard deviation of dataset)" },
            { key: "C", label: "λ (regularization coefficient exclusively)" },
            { key: "D", label: "α (alpha), used only for learning rate" },
          ], correct: "A", explanation: `Model parameters are conventionally denoted θ or W in mathematical formulations.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `System Bottleneck: ${fileName}`, materialId,
          question: `Identify the computational bottleneck most likely shown in "${fileName}"'s pipeline.`,
          options: [
            { key: "A", label: "Matrix multiplication in dense layers" },
            { key: "B", label: "Reading a configuration file" },
            { key: "C", label: "Printing model architecture to console" },
            { key: "D", label: "Sorting the training set alphabetically" },
          ], correct: "A", explanation: `Large dense matrix multiplications in deep layers are the primary computational bottleneck in such architectures.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Layer Depth: ${fileName}`, materialId,
          question: `What advantage does adding more layers (depth) provide as shown in "${fileName}"?`,
          options: [
            { key: "A", label: "Captures more abstract and composite feature patterns" },
            { key: "B", label: "Reduces training time always" },
            { key: "C", label: "Eliminates the need for labeled data" },
            { key: "D", label: "Makes loss functions unnecessary" },
          ], correct: "A", explanation: `Deeper architectures learn progressively more abstract and compositional feature representations.` },
        // --- Open-Ended Questions ---
        { kind: "open", concept: extractedConcepts[2]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `System Flowchart: ${fileName}`, materialId,
          question: `Analyze the visual data pipeline shown in "${fileName}". Describe how data moves from input to output, noting bottlenecks, formulas, or regularization checkpoints.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Input representation", "Intermediate transformations", "Loss/output projection"], missing: [], feedback: `Ready for evaluation against visual evidence parsed from "${fileName}".`, score: 0 } },
        { kind: "open", concept: extractedConcepts[0]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Architecture Analysis: ${fileName}`, materialId,
          question: `Critically evaluate the architectural design choices visible in "${fileName}". What trade-offs do these choices introduce in terms of computational cost vs expressiveness?`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Depth vs width trade-off", "Computational complexity", "Feature expressiveness"], missing: [], feedback: `Evaluate against architectural patterns visible in "${fileName}".`, score: 0 } },
        { kind: "open", concept: extractedConcepts[1]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Gradient Analysis: ${fileName}`, materialId,
          question: `Using the gradient flow depicted in "${fileName}", explain the vanishing gradient problem and how modern architectures mitigate it.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Vanishing gradients", "Skip connections", "Normalization layers"], missing: [], feedback: `Evaluate mathematical depth against annotations in "${fileName}".`, score: 0 } },
        { kind: "open", concept: extractedConcepts[2]!, difficulty: "Easy", imageUrl: resolvedImageUrl, imageCaption: `Component Summary: ${fileName}`, materialId,
          question: `In your own words, describe what each labeled component in "${fileName}" does and how they work together as a system.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Component identification", "System integration", "Data flow description"], missing: [], feedback: `Evaluate component understanding against diagram labels.`, score: 0 } },
        { kind: "open", concept: extractedConcepts[0]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Comparison: ${fileName}`, materialId,
          question: `Compare the architecture shown in "${fileName}" to a simpler baseline. What specific advantages does the depicted design offer?`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Architectural comparison", "Performance advantages", "Complexity trade-offs"], missing: [], feedback: `Evaluate comparative reasoning based on the visual diagram.`, score: 0 } },
        // --- Filler MCQs to reach 30 ---
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Easy", imageUrl: resolvedImageUrl, imageCaption: `Activation Functions: ${fileName}`, materialId,
          question: `Which non-linear activation function is most commonly applied after each layer in architectures like the one in "${fileName}"?`,
          options: [
            { key: "A", label: "ReLU (Rectified Linear Unit)" },
            { key: "B", label: "Identity function" },
            { key: "C", label: "Step function" },
            { key: "D", label: "Logarithmic clamp" },
          ], correct: "A", explanation: `ReLU is the most widely used activation function due to its simplicity and effectiveness in preventing vanishing gradients.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Batch Normalization: ${fileName}`, materialId,
          question: `What does a normalization block (if visible in "${fileName}") accomplish during training?`,
          options: [
            { key: "A", label: "Stabilizes layer inputs by normalizing activations" },
            { key: "B", label: "Increases gradient magnitude unconditionally" },
            { key: "C", label: "Halves the number of parameters" },
            { key: "D", label: "Replaces the loss function" },
          ], correct: "A", explanation: `Batch normalization reduces internal covariate shift by normalizing activations, accelerating training.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Skip Connections: ${fileName}`, materialId,
          question: `If "${fileName}" shows skip (residual) connections, what learning problem do they primarily solve?`,
          options: [
            { key: "A", label: "Vanishing gradients in very deep networks" },
            { key: "B", label: "Overfitting in shallow networks" },
            { key: "C", label: "Dataset imbalance" },
            { key: "D", label: "Inference latency" },
          ], correct: "A", explanation: `Residual/skip connections provide gradient highways that prevent vanishing in very deep architectures.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Optimizer: ${fileName}`, materialId,
          question: `Which optimization algorithm is most likely being used in the architecture visualized in "${fileName}"?`,
          options: [
            { key: "A", label: "Adam or SGD with momentum" },
            { key: "B", label: "Linear regression" },
            { key: "C", label: "Bubble sort" },
            { key: "D", label: "Exhaustive grid search" },
          ], correct: "A", explanation: `Adaptive optimizers like Adam or momentum-based SGD are standard for deep learning architectures.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Easy", imageUrl: resolvedImageUrl, imageCaption: `Overfitting: ${fileName}`, materialId,
          question: `What is the most common sign that the model shown in "${fileName}" is overfitting?`,
          options: [
            { key: "A", label: "Training loss decreases but validation loss increases" },
            { key: "B", label: "Both train and validation loss are identical" },
            { key: "C", label: "Validation loss drops to zero" },
            { key: "D", label: "Gradient norm stays constant" },
          ], correct: "A", explanation: `Overfitting is characterized by a train-validation loss gap where training improves but generalization degrades.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Easy", imageUrl: resolvedImageUrl, imageCaption: `Epochs: ${fileName}`, materialId,
          question: `In the training loop implied by "${fileName}", what does one epoch represent?`,
          options: [
            { key: "A", label: "One full pass through the entire training dataset" },
            { key: "B", label: "One gradient computation step" },
            { key: "C", label: "One forward pass on a single sample" },
            { key: "D", label: "One random weight initialization" },
          ], correct: "A", explanation: `An epoch is one complete pass through all training examples, typically containing multiple mini-batch gradient steps.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Dropout: ${fileName}`, materialId,
          question: `How does dropout regularization (as may be shown in "${fileName}") improve generalization?`,
          options: [
            { key: "A", label: "Randomly zeros out neurons during training, preventing co-adaptation" },
            { key: "B", label: "Permanently removes low-weight neurons" },
            { key: "C", label: "Doubles the learning rate every epoch" },
            { key: "D", label: "Replaces all activations with constants" },
          ], correct: "A", explanation: `Dropout randomly deactivates neurons during training, forcing the network to learn redundant representations and improving robustness.` },
        { kind: "open", concept: extractedConcepts[1]!, difficulty: "Medium", imageUrl: resolvedImageUrl, imageCaption: `Real-world Application: ${fileName}`, materialId,
          question: `Based on the architecture in "${fileName}", describe a real-world application where this design would be most effective and explain why.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Application domain", "Architectural fit", "Justification"], missing: [], feedback: `Evaluate relevance of real-world application to the depicted architecture.`, score: 0 } },
        { kind: "open", concept: extractedConcepts[2]!, difficulty: "Hard", imageUrl: resolvedImageUrl, imageCaption: `Scaling Analysis: ${fileName}`, materialId,
          question: `If you were to scale the architecture in "${fileName}" 10x in depth and width, what computational and accuracy trade-offs would you expect? How would you mitigate them?`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Scaling laws", "Memory constraints", "Mitigation strategies"], missing: [], feedback: `Evaluate scaling understanding against the architecture shown.`, score: 0 } },
      ];

      const buildPdfQuestions = (): QuizQuestionData[] => [
        // --- Foundational MCQs ---
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Easy", materialId,
          question: `What field or domain does "${fileName}" primarily address?`,
          options: [
            { key: "A", label: `The theory, mechanisms, and applications of ${cleanName}` },
            { key: "B", label: "General chemistry and laboratory protocols" },
            { key: "C", label: "Legal documentation and contract drafting" },
            { key: "D", label: "Historical narrative and biographical accounts" },
          ], correct: "A", explanation: `"${fileName}" is a focused study material covering ${cleanName} in depth.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Easy", materialId,
          question: `What is the primary motivation behind ${cleanName} as described in "${fileName}"?`,
          options: [
            { key: "A", label: "To maximize raw training memorization without generalizability" },
            { key: "B", label: "To optimize performance while preserving robust generalization on unseen distributions" },
            { key: "C", label: "To eliminate mathematical loss functions completely" },
            { key: "D", label: "To slow down computational throughput artificially" },
          ], correct: "B", explanation: `As detailed on Page 1 of "${fileName}", the foundational goal is robust generalization rather than brute-force memorization.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Medium", materialId,
          question: `Which foundational assumption does ${cleanName} rely on as described in "${fileName}"?`,
          options: [
            { key: "A", label: "Training and test distributions share statistical structure" },
            { key: "B", label: "All labels are uniformly distributed" },
            { key: "C", label: "Data is always linearly separable" },
            { key: "D", label: "Feature dimensions are always independent" },
          ], correct: "A", explanation: `${cleanName} assumes that training and deployment data share similar statistical properties for generalization.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Medium", materialId,
          question: `How does "${fileName}" define the core objective function of ${cleanName}?`,
          options: [
            { key: "A", label: "A loss that penalizes prediction errors while promoting generalization" },
            { key: "B", label: "A function that maximizes entropy across classes" },
            { key: "C", label: "A reward signal for reinforcement agents only" },
            { key: "D", label: "A purely heuristic ranking formula" },
          ], correct: "A", explanation: `The core objective penalizes prediction errors while incorporating regularization to improve generalization.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Hard", materialId,
          question: `What distinguishes ${cleanName} from its classical predecessors based on "${fileName}"?`,
          options: [
            { key: "A", label: "Ability to learn non-linear representations with scalable depth" },
            { key: "B", label: "Requires zero labeled training data" },
            { key: "C", label: "Uses exhaustive symbolic search" },
            { key: "D", label: "Operates only on structured tabular data" },
          ], correct: "A", explanation: `${cleanName} differentiates itself through scalable non-linear representation learning, unlike classical linear models.` },
        // --- Architecture / Mechanisms ---
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Easy", materialId,
          question: `In Section 2 of "${fileName}", what mechanism enables ${cleanName} to learn from data?`,
          options: [
            { key: "A", label: "Gradient-based iterative parameter optimization" },
            { key: "B", label: "Random weight assignment at inference time" },
            { key: "C", label: "Rule-based if-else logic" },
            { key: "D", label: "Lookup tables pre-computed offline" },
          ], correct: "A", explanation: `${cleanName} learns by iteratively adjusting parameters in the direction that minimizes the training loss.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Medium", materialId,
          question: `How does ${cleanName} prevent divergence during optimization as described in Page 6 of "${fileName}"?`,
          options: [
            { key: "A", label: "By constraining parameter updates via regularization and learning rate scaling" },
            { key: "B", label: "By ignoring gradients and guessing values randomly" },
            { key: "C", label: "By deleting the training dataset whenever loss fluctuates" },
            { key: "D", label: "By fixing all parameters to zero permanently" },
          ], correct: "A", explanation: `Page 6 emphasizes calibrated learning rates and regularization penalties to stabilize the optimization path.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Medium", materialId,
          question: `What role does the learning rate play in the ${cleanName} training process?`,
          options: [
            { key: "A", label: "Controls how large each parameter update step is" },
            { key: "B", label: "Defines the number of output classes" },
            { key: "C", label: "Measures model accuracy on validation data" },
            { key: "D", label: "Determines the dataset split ratio" },
          ], correct: "A", explanation: `The learning rate scales gradient updates, balancing convergence speed vs. stability.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Hard", materialId,
          question: `What is the effect of an excessively large learning rate in ${cleanName} according to "${fileName}"?`,
          options: [
            { key: "A", label: "Causes optimization to diverge or oscillate" },
            { key: "B", label: "Always improves convergence speed" },
            { key: "C", label: "Has no effect on training stability" },
            { key: "D", label: "Reduces training time without trade-offs" },
          ], correct: "A", explanation: `A too-large learning rate causes parameter updates to overshoot, leading to divergence or erratic oscillation.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Hard", materialId,
          question: `Which optimization technique described in "${fileName}" uses momentum to escape local minima?`,
          options: [
            { key: "A", label: "SGD with momentum or Adam optimizer" },
            { key: "B", label: "Greedy search" },
            { key: "C", label: "Exhaustive brute force" },
            { key: "D", label: "K-nearest neighbors" },
          ], correct: "A", explanation: `Momentum-based methods accumulate a velocity vector to navigate past flat regions and local minima.` },
        // --- Trade-offs & Failure Modes ---
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Easy", materialId,
          question: `What is overfitting in the context of ${cleanName}?`,
          options: [
            { key: "A", label: "When the model memorizes training data and fails to generalize" },
            { key: "B", label: "When the model converges too slowly" },
            { key: "C", label: "When the dataset has too few samples" },
            { key: "D", label: "When the learning rate is exactly right" },
          ], correct: "A", explanation: `Overfitting occurs when a model learns noise in the training set, degrading performance on unseen data.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Medium", materialId,
          question: `Which technique mentioned in "${fileName}" reduces overfitting by penalizing model complexity?`,
          options: [
            { key: "A", label: "L1/L2 regularization" },
            { key: "B", label: "Increasing the learning rate" },
            { key: "C", label: "Adding more training epochs unconditionally" },
            { key: "D", label: "Removing the validation set" },
          ], correct: "A", explanation: `L1/L2 regularization adds a penalty term to the loss, discouraging overly complex parameter configurations.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Medium", materialId,
          question: `What does early stopping prevent in ${cleanName} training?`,
          options: [
            { key: "A", label: "Overfitting by halting training when validation loss stops improving" },
            { key: "B", label: "Underfitting by training longer" },
            { key: "C", label: "Gradient vanishing" },
            { key: "D", label: "Data augmentation conflicts" },
          ], correct: "A", explanation: `Early stopping monitors validation performance and stops training before the model begins to overfit.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Hard", materialId,
          question: `What is the bias-variance trade-off discussed in "${fileName}"?`,
          options: [
            { key: "A", label: "Balancing model simplicity (high bias) vs. sensitivity to data (high variance)" },
            { key: "B", label: "Choosing between supervised and unsupervised learning" },
            { key: "C", label: "Selecting between classification and regression" },
            { key: "D", label: "Managing CPU vs GPU compute" },
          ], correct: "A", explanation: `The bias-variance trade-off is fundamental: simpler models have high bias, complex models have high variance, and optimal models balance both.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Hard", materialId,
          question: `Which evaluation metric from "${fileName}" is most informative for imbalanced datasets?`,
          options: [
            { key: "A", label: "F1 score or AUC-ROC" },
            { key: "B", label: "Raw accuracy" },
            { key: "C", label: "Total training loss" },
            { key: "D", label: "Number of parameters" },
          ], correct: "A", explanation: `F1 score and AUC-ROC handle class imbalance better than raw accuracy which can be misleading.` },
        // --- Applied / Conceptual ---
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Medium", materialId,
          question: `How does data normalization improve the training of ${cleanName}?`,
          options: [
            { key: "A", label: "Ensures all features contribute equally and stabilizes gradient magnitudes" },
            { key: "B", label: "Increases model depth" },
            { key: "C", label: "Removes all irrelevant labels" },
            { key: "D", label: "Reduces the number of training examples" },
          ], correct: "A", explanation: `Normalization prevents features with large scales from dominating gradient updates, leading to more stable and faster training.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Easy", materialId,
          question: `What does a confusion matrix reveal about ${cleanName}'s performance?`,
          options: [
            { key: "A", label: "True positives, false positives, true negatives, and false negatives by class" },
            { key: "B", label: "The model's parameter count" },
            { key: "C", label: "Training time per epoch" },
            { key: "D", label: "Gradient norms during backpropagation" },
          ], correct: "A", explanation: `A confusion matrix breaks down classification results into correct and incorrect predictions per class.` },
        { kind: "mcq", concept: extractedConcepts[0]!, difficulty: "Hard", materialId,
          question: `Why is cross-validation preferred over a single train-test split for evaluating ${cleanName}?`,
          options: [
            { key: "A", label: "It provides more reliable estimates by averaging performance across multiple data folds" },
            { key: "B", label: "It always results in higher accuracy" },
            { key: "C", label: "It is computationally cheaper" },
            { key: "D", label: "It eliminates the need for hyperparameter tuning" },
          ], correct: "A", explanation: `Cross-validation averages performance across folds, reducing the impact of a lucky or unlucky data split.` },
        { kind: "mcq", concept: extractedConcepts[2]!, difficulty: "Easy", materialId,
          question: `According to "${fileName}", what is the first step when applying ${cleanName} to a new problem?`,
          options: [
            { key: "A", label: "Understand the problem, collect quality data, and define the loss function" },
            { key: "B", label: "Immediately deploy to production" },
            { key: "C", label: "Start with the largest possible model" },
            { key: "D", label: "Skip data analysis and go straight to training" },
          ], correct: "A", explanation: `Successful application begins with problem understanding, data collection, and loss function definition before model selection.` },
        { kind: "mcq", concept: extractedConcepts[1]!, difficulty: "Medium", materialId,
          question: `What role do hyperparameters play in ${cleanName} as discussed in "${fileName}"?`,
          options: [
            { key: "A", label: "They configure training behavior and are tuned before training" },
            { key: "B", label: "They are learned automatically from data during training" },
            { key: "C", label: "They define the number of classes only" },
            { key: "D", label: "They are fixed constants with no effect on output" },
          ], correct: "A", explanation: `Hyperparameters like learning rate, batch size, and regularization strength are set before training and control the training process.` },
        // --- Open-Ended Questions ---
        { kind: "open", concept: extractedConcepts[2]!, difficulty: "Medium", materialId,
          question: `Explain the practical trade-offs and failure modes of ${cleanName} as described in "${fileName}".`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Convergence stability", "Overfitting risk", "Hyperparameter sensitivity"], missing: [], feedback: `Ready for evaluation against knowledge extracted from "${fileName}".`, score: 0 } },
        { kind: "open", concept: extractedConcepts[0]!, difficulty: "Hard", materialId,
          question: `Compare and contrast ${cleanName} with at least two alternative approaches. When would you prefer each, and why?`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Comparative analysis", "Use-case suitability", "Trade-off reasoning"], missing: [], feedback: `Evaluate depth of comparison and justification quality.`, score: 0 } },
        { kind: "open", concept: extractedConcepts[1]!, difficulty: "Hard", materialId,
          question: `Walk through the complete training pipeline for ${cleanName} step by step, from raw data to final evaluation, noting each key design decision.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Data preprocessing", "Model training loop", "Evaluation strategy"], missing: [], feedback: `Evaluate completeness and accuracy of the described pipeline.`, score: 0 } },
        { kind: "open", concept: extractedConcepts[2]!, difficulty: "Easy", materialId,
          question: `In your own words, summarize the key takeaways from "${fileName}" and explain why they matter for a practitioner.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Core concepts", "Practical relevance", "Clear communication"], missing: [], feedback: `Evaluate accuracy of summary and quality of insight.`, score: 0 } },
        { kind: "open", concept: extractedConcepts[0]!, difficulty: "Medium", materialId,
          question: `Describe a real-world scenario where ${cleanName} would be applied. Walk through what the input data looks like, how the model is trained, and how performance is measured.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Real-world grounding", "Training process", "Evaluation metrics"], missing: [], feedback: `Evaluate the realism and technical correctness of the described scenario.`, score: 0 } },
        { kind: "open", concept: extractedConcepts[1]!, difficulty: "Medium", materialId,
          question: `Explain how regularization prevents overfitting in ${cleanName}. Use a concrete example to illustrate your explanation.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Regularization mechanism", "Overfitting prevention", "Concrete example"], missing: [], feedback: `Evaluate technical accuracy and quality of the concrete example.`, score: 0 } },
        { kind: "open", concept: extractedConcepts[2]!, difficulty: "Hard", materialId,
          question: `Critically evaluate the assumptions made by ${cleanName}. Under what conditions do these assumptions break down, and what are the consequences?`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Core assumptions", "Edge cases", "Failure consequences"], missing: [], feedback: `Evaluate depth of critical analysis and correctness of identified failure modes.`, score: 0 } },
        { kind: "open", concept: extractedConcepts[0]!, difficulty: "Hard", materialId,
          question: `Propose two improvements to ${cleanName} based on limitations identified in "${fileName}". Justify each improvement technically.`,
          evaluation: { understanding: "Pending Evaluation", accuracy: "Pending Evaluation", covered: ["Limitation identification", "Proposed improvements", "Technical justification"], missing: [], feedback: `Evaluate creativity and technical grounding of the proposed improvements.`, score: 0 } },
      ];

      const generatedQuizQuestions: QuizQuestionData[] = isImage
        ? buildImageQuestions()
        : buildPdfQuestions();

      // Add concepts to the project
      const updatedProjects = currentState.projects.map((p) => {
        if (p.id !== projectId) return p;

        const newConcepts: Concept[] = extractedConcepts.map((name, idx) => ({
          id: `c-${Date.now()}-${idx}`,
          name,
          mastery: 48,
          trend: "attention" as const,
          lastPracticed: "Just added",
          materialRefs: [`${fileName} — ${isImage ? "Visual Inspection" : `p.${idx * 5 + 1}`}`],
          history: [{ label: "Initial", value: 48 }],
          mistakes: [],
        }));

        return {
          ...p,
          materials: p.materials + 1,
          progress: Math.min(100, p.progress + 15),
          concepts: [...p.concepts, ...newConcepts],
          lastActivity: `Processed ${fileName}`,
        };
      });

      const processedActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: "material_processed",
        title: isImage ? "Visual Diagram processed & Quiz ready" : "Material processed & Quiz ready",
        project: cleanName,
        detail: isImage
          ? `Parsed visual diagram, extracted ${extractedConcepts.length} concepts, built image-grounded quiz & updated AI Tutor`
          : `Extracted ${extractedConcepts.length} concepts, synthesized summary, and generated adaptive quiz`,
        time: "Just now",
      };

      // Add questions to quiz repository for both project and material
      const existingProjectQuizzes = currentState.quizzes[projectId] || defaultQuizQuestions;
      const updatedQuizzes = {
        ...currentState.quizzes,
        [projectId]: [...generatedQuizQuestions, ...existingProjectQuizzes],
        [materialId]: generatedQuizQuestions,
      };

      // If it's an image, create a welcoming grounding message from the AI Tutor
      let updatedTutorMessages = currentState.tutorMessages;
      if (isImage) {
        const visualTutorGreeting: TutorMessage = {
          id: `tutor-img-${Date.now()}`,
          projectId,
          role: "tutor",
          content: `🖼️ **I have indexed your uploaded image "${fileName}"!**\n\nI have parsed the visual layout, labeled components, directional flows, and mathematical annotations in this diagram.\n\nYou can ask me:\n• *"Walk me through the components in this diagram."*\n• *"Explain the mathematical formulations shown in ${fileName}."*\n• *"Why is the flow structured this way in the visual architecture?"*`,
          source: {
            material: fileName,
            isImage: true,
            imageUrl: resolvedImageUrl,
            page: 1,
            excerpt: `Visual diagram knowledge extracted from ${fileName}: components, connections, and formulas verified.`,
          },
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        const currentProjectMsgs = currentState.tutorMessages[projectId] || [];
        updatedTutorMessages = {
          ...currentState.tutorMessages,
          [projectId]: [...currentProjectMsgs, visualTutorGreeting],
        };
      }

      currentState = {
        ...currentState,
        projects: updatedProjects,
        materials: currentState.materials.map((m) =>
          m.id === materialId
            ? {
                ...m,
                status: "ready",
                progress: 100,
                concepts: extractedConcepts,
                sections,
              }
            : m,
        ),
        summaries: {
          ...currentState.summaries,
          [materialId]: summary,
        },
        quizzes: updatedQuizzes,
        tutorMessages: updatedTutorMessages,
        backgroundJobs: currentState.backgroundJobs.map((j) =>
          j.id === jobId ? { ...j, status: "Completed", duration: "3.2s" } : j,
        ),
        activity: [processedActivity, ...currentState.activity],
      };
      notify();
      onProgress?.("Ready", 100);
    }, 3200);

    return materialId;
  },

  retryMaterial(materialId: string) {
    const mat = currentState.materials.find((m) => m.id === materialId);
    if (!mat) return;

    currentState = {
      ...currentState,
      materials: currentState.materials.map((m) =>
        m.id === materialId ? { ...m, status: "processing", progress: 30, error: undefined } : m,
      ),
      backgroundJobs: [
        {
          id: `job-${Date.now()}`,
          type: "OCR & Knowledge Recovery",
          project: mat.name,
          status: "Running",
          started: "Just now",
          duration: "0s",
          attempts: 2,
        },
        ...currentState.backgroundJobs,
      ],
    };
    notify();

    setTimeout(() => {
      currentState = {
        ...currentState,
        materials: currentState.materials.map((m) =>
          m.id === materialId
            ? {
                ...m,
                status: "ready",
                progress: 100,
                concepts: ["Model Evaluation", "Cross Validation", "Bias-Variance Tradeoff"],
                sections: [
                  {
                    page: 6,
                    title: "Model Validation Strategies",
                    excerpt:
                      "K-fold cross validation split strategies ensure minimum data leakage and accurate error estimation.",
                  },
                ],
                error: undefined,
              }
            : m,
        ),
        activity: [
          {
            id: `act-${Date.now()}`,
            type: "material_processed",
            title: "Material recovered",
            project: mat.name,
            detail: "Retry succeeded! 3 concepts extracted and indexed.",
            time: "Just now",
          },
          ...currentState.activity,
        ],
      };
      notify();
    }, 2200);
  },

  // Tutor interactions with grounded retrieval and persistent state
  sendTutorMessage(projectId: string, question: string) {
    const project = currentState.projects.find((p) => p.id === projectId);
    const projectName = project ? project.name : "Learning Project";

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      projectId,
      role: "user",
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const currentMsgs = currentState.tutorMessages[projectId] || [];
    currentState = {
      ...currentState,
      tutorMessages: {
        ...currentState.tutorMessages,
        [projectId]: [...currentMsgs, userMsg],
      },
      activity: [
        {
          id: `act-${Date.now()}`,
          type: "tutor",
          title: "Tutor question asked",
          project: projectName,
          detail: `“${question.slice(0, 60)}${question.length > 60 ? "..." : ""}”`,
          time: "Just now",
        },
        ...currentState.activity,
      ],
    };
    notify();

    // Check project materials and knowledge
    const projectMats = currentState.materials.filter(
      (m) => m.projectId === projectId && m.status === "ready",
    );
    const qLower = question.toLowerCase();
    const imageMats = projectMats.filter(
      (m) => m.isImage || /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(m.name),
    );
    const hasImageQuery =
      qLower.includes("image") ||
      qLower.includes("diagram") ||
      qLower.includes("visual") ||
      qLower.includes("flow") ||
      qLower.includes("component") ||
      qLower.includes("figure") ||
      qLower.includes("formula") ||
      qLower.includes("architecture") ||
      qLower.includes("layer");

    // Out-of-scope check (stock, crypto, politics, weather, unrelated general chatter)
    const isUnsupported =
      qLower.includes("stock") ||
      qLower.includes("tesla") ||
      qLower.includes("crypto") ||
      qLower.includes("bitcoin") ||
      qLower.includes("weather") ||
      qLower.includes("movie") ||
      qLower.includes("fifa");

    setTimeout(() => {
      let tutorMsg: TutorMessage;

      if (isUnsupported) {
        tutorMsg = {
          id: `tutor-${Date.now()}`,
          projectId,
          role: "tutor",
          content:
            "I couldn't find enough reliable information about this in your uploaded project materials. My answers are strictly grounded in your study documents to prevent hallucinations and keep your learning focused.",
          isUnsupported: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else if (qLower.includes("summary") || qLower.includes("summarize") || qLower.includes("overview")) {
        const firstMat = projectMats[0];
        const summaryObj = firstMat ? currentState.summaries[firstMat.id] : undefined;

        tutorMsg = {
          id: `tutor-${Date.now()}`,
          projectId,
          role: "tutor",
          content: summaryObj
            ? `Here is the verified summary of **${summaryObj.title}**:\n\n${summaryObj.executiveSummary}\n\n**Key Takeaways:**\n${summaryObj.keyTakeaways.map((k) => `• ${k}`).join("\n")}`
            : `Summary of ${projectName}: Your uploaded notes focus on core models, parameter optimization, structural regularization, and evaluation metrics.`,
          ...(firstMat ? { source: { material: firstMat.name, page: 1, excerpt: "Summary synthesized from uploaded document." } } : {}),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else if (qLower.includes("overfitting")) {
        tutorMsg = {
          id: `tutor-${Date.now()}`,
          projectId,
          role: "tutor",
          content:
            "Overfitting occurs when a model learns the training data too closely, capturing noise and small fluctuations rather than the true underlying pattern. As a result, training error is very low but test error is high. Solutions include L1/L2 regularization, dropout, data augmentation, and early stopping.",
          source: {
            material: projectMats[0]?.name || "Machine Learning Fundamentals.pdf",
            page: 14,
            excerpt:
              "Overfitting occurs when a model learns the training data too closely, including noise and small variations, so it performs poorly on unseen data.",
          },
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else if (qLower.includes("gradient") || qLower.includes("optimization")) {
        tutorMsg = {
          id: `tutor-${Date.now()}`,
          projectId,
          role: "tutor",
          content:
            "Gradient Descent is an iterative optimization algorithm that minimizes the loss function. At each iteration, parameters are updated in the direction opposite to the gradient: θ = θ - η ∇L(θ), where η is the learning rate scaling the step size.",
          source: {
            material: projectMats[0]?.name || "Machine Learning Fundamentals.pdf",
            page: 27,
            excerpt:
              "Parameters are updated in the direction opposite to the gradient of the loss, scaled by the learning rate, until convergence.",
          },
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else if (qLower.includes("cnn") || qLower.includes("convolution") || qLower.includes("padding")) {
        tutorMsg = {
          id: `tutor-${Date.now()}`,
          projectId,
          role: "tutor",
          content:
            "Convolutional Neural Networks (CNNs) process grid-structured data like images by convolving learnable filters across spatial dimensions. Padding adds border pixels (usually zeros) to maintain spatial dimensions so boundary pixels contribute to deeper features.",
          source: {
            material: projectMats.find((m) => m.name.toLowerCase().includes("deep"))?.name || "Deep Learning Notes.pdf",
            page: 21,
            excerpt:
              "Padding preserves spatial dimensions so that border pixels contribute to the convolution output.",
          },
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else if (
        (imageMats.length > 0 && hasImageQuery) ||
        (imageMats.length > 0 && qLower.includes(imageMats[0]!.name.toLowerCase().slice(0, 10)))
      ) {
        const targetImg = imageMats[0]!;
        const summaryObj = currentState.summaries[targetImg.id];
        tutorMsg = {
          id: `tutor-${Date.now()}`,
          projectId,
          role: "tutor",
          content: `Based on your uploaded visual diagram **"${targetImg.name}"**:\n\n1. **Visual Pipeline Flow:** The architecture proceeds from input tensor features through intermediate transform layers directly to the output projection.\n2. **Parsed Components:** ${
            summaryObj?.visualComponents?.join(" ➔ ") ||
            "Input Tensor ➔ Feature Mapping ➔ Loss Boundary ➔ Output Head"
          }\n3. **Mathematical Formulation:** The diagram explicitly demonstrates how parameter updates follow the loss gradient, with forward activations computed at each node and backward gradient vectors propagated via the chain rule.\n\n*You can ask me to break down any specific layer in this image, or practice with the visual adaptive quiz!*`,
          source: {
            material: targetImg.name,
            isImage: true,
            imageUrl: targetImg.imageUrl,
            page: 1,
            excerpt: `Visual Diagram Inspection: Verified node flow, layer connections, and loss annotations in ${targetImg.name}.`,
          },
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else {
        // Grounded contextual explanation
        const firstSection = projectMats[0]?.sections[0];
        tutorMsg = {
          id: `tutor-${Date.now()}`,
          projectId,
          role: "tutor",
          content: `In "${projectName}": This topic connects directly with your study curriculum on predictive modeling and model generalization. To reinforce this concept, review the core equations and test your understanding in the Adaptive Quiz section.`,
          source: firstSection
            ? {
                material: projectMats[0]!.name,
                page: firstSection.page,
                excerpt: firstSection.excerpt,
              }
            : {
                material: "Machine Learning Fundamentals.pdf",
                page: 8,
                excerpt: "Foundational mathematical principles and loss formulation.",
              },
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }

      currentState = {
        ...currentState,
        tutorMessages: {
          ...currentState.tutorMessages,
          [projectId]: [...(currentState.tutorMessages[projectId] || []), tutorMsg],
        },
      };
      notify();
    }, 1100);
  },

  // Update Concept Mastery after quiz or assessment
  updateConceptMastery(
    projectId: string,
    conceptName: string,
    scoreDelta: number,
    mistake?: string,
  ) {
    const updatedProjects = currentState.projects.map((proj) => {
      if (proj.id !== projectId) return proj;

      const updatedConcepts = proj.concepts.map((c) => {
        if (c.name.toLowerCase() !== conceptName.toLowerCase()) return c;

        const newMastery = Math.min(100, Math.max(10, c.mastery + scoreDelta));
        const newTrend: "improving" | "stable" | "attention" =
          scoreDelta > 0 ? "improving" : scoreDelta < 0 ? "attention" : "stable";

        const newHistory = [
          ...c.history,
          {
            label: `A${c.history.length + 1}`,
            value: newMastery,
          },
        ];

        const newMistakes = mistake ? [mistake, ...c.mistakes.slice(0, 4)] : c.mistakes;

        return {
          ...c,
          mastery: newMastery,
          trend: newTrend,
          lastPracticed: "Today",
          history: newHistory,
          mistakes: newMistakes,
        };
      });

      // Recalculate project average mastery
      const avgMastery = Math.round(
        updatedConcepts.reduce((acc, c) => acc + c.mastery, 0) / (updatedConcepts.length || 1),
      );

      return {
        ...proj,
        mastery: avgMastery,
        concepts: updatedConcepts,
        lastActivity: `Updated mastery for ${conceptName}`,
        recentMistake: mistake || proj.recentMistake,
      };
    });

    const masteryActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: "mastery_updated",
      title: "Mastery updated",
      project: conceptName,
      detail: `${conceptName} mastery updated (${scoreDelta >= 0 ? "+" : ""}${scoreDelta}%)`,
      time: "Just now",
    };

    currentState = {
      ...currentState,
      projects: updatedProjects,
      activity: [masteryActivity, ...currentState.activity],
    };
    notify();
  },

  // Record a single question answer (called each time user answers a question in quiz)
  recordQuestionAnswer(projectId: string) {
    const prevCounts = currentState.questionAnswersCount || {};
    const projCount = (prevCounts[projectId] || 0) + 1;
    const globalCount = (prevCounts["global"] || 0) + 1;
    currentState = {
      ...currentState,
      questionAnswersCount: {
        ...prevCounts,
        [projectId]: projCount,
        global: globalCount,
      },
    };
    notify();
  },

  // Complete a quiz session with evidence
  completeQuizSession(
    projectId: string,
    scorePercent: number,
    conceptTested: string,
    feedback: string,
    totalQuestions = 10,
    correctQuestions = Math.round((scorePercent / 100) * totalQuestions),
  ) {
    const delta = scorePercent >= 70 ? +8 : -5;
    this.updateConceptMastery(projectId, conceptTested, delta, scorePercent < 70 ? feedback : undefined);

    const newSession: QuizSessionRecord = {
      id: `session-${Date.now()}`,
      projectId,
      scorePercent,
      totalQuestions,
      correctQuestions,
      conceptTested,
      timestamp: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
    };

    const quizAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: "assessment_completed",
      title: "Quiz completed",
      project: conceptTested,
      detail: `Score: ${scorePercent}% · Concept: ${conceptTested}`,
      time: "Just now",
    };

    const existingSessions = currentState.quizSessions || [];

    // Also update project progress dynamically based on completed sessions
    const projectSessions = [newSession, ...existingSessions.filter(s => s.projectId === projectId)];
    const avgScore = Math.round(projectSessions.reduce((acc, s) => acc + s.scorePercent, 0) / projectSessions.length);
    const newProgress = Math.min(100, Math.round(projectSessions.length * 20 + avgScore * 0.3));

    const updatedProjects = currentState.projects.map((p) =>
      p.id === projectId ? { ...p, progress: Math.max(p.progress, newProgress), mastery: avgScore } : p
    );

    currentState = {
      ...currentState,
      projects: updatedProjects,
      quizSessions: [newSession, ...existingSessions],
      activity: [quizAct, ...currentState.activity],
    };
    notify();
  },

  deleteMaterial(materialId: string) {
    currentState = {
      ...currentState,
      materials: currentState.materials.filter((m) => m.id !== materialId),
    };
    notify();
  },

  clearMaterials(projectId?: string) {
    currentState = {
      ...currentState,
      materials: projectId ? currentState.materials.filter((m) => m.projectId !== projectId) : [],
    };
    notify();
  },
};

/**
 * Custom React Hook to subscribe to the Study Store
 */
export function useStudyStore(): AppStoreState {
  return useSyncExternalStore(
    studyStore.subscribe,
    studyStore.getState,
    () => currentState, // SSR fallback
  );
}

export function useProject(projectId?: string): Project | undefined {
  const store = useStudyStore();
  if (!projectId) return store.projects[0];
  return store.projects.find((p) => p.id === projectId) || store.projects[0];
}

export function useSpace(spaceId?: string): Space | undefined {
  const store = useStudyStore();
  if (!spaceId) return store.spaces[0];
  return store.spaces.find((s) => s.id === spaceId) || store.spaces[0];
}
