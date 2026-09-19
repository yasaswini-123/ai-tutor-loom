# Learning Path AI

Build a complete modern web application called “AI Study Companion”.

1. PRODUCT PURPOSE

AI Study Companion is an AI-powered learning workspace that acts like a persistent learning partner rather than a simple chatbot.

The application should help a learner:

Create learning spaces

Create focused learning projects

Upload and study learning materials

Automatically process and understand uploaded documents

Ask questions to an AI Tutor

Get answers grounded in uploaded materials

See citations for AI answers

Handle questions when sufficient evidence is unavailable

Take adaptive quizzes

Answer multiple-choice and open-ended questions

Receive AI-based feedback

Track concept mastery

Analyze learning growth

Identify weak concepts

Receive personalized next-action recommendations

View learning analytics

Maintain relevant learning context across sessions

Track learning activity

Provide an Admin Dashboard for platform monitoring

The application should feel like a professional AI learning workspace, not a generic chatbot.

The core learning journey is:

Create Space
→ Create Project
→ Add Learning Material
→ Process Material
→ Build Knowledge
→ Learn with AI Tutor
→ Take Adaptive Quiz
→ Evaluate Understanding
→ Update Concept Mastery
→ Analyze Growth
→ Recommend Next Action
→ Continue Learning

2. DESIGN STYLE

Create a polished, modern SaaS dashboard UI.

Design goals:

Clean

Professional

Minimal but visually rich

Modern AI product aesthetic

Easy to navigate

Responsive

Desktop-first but mobile-friendly

Suitable for a technical candidate project/demo

Strong visual hierarchy

Avoid excessive animations

Avoid overly colorful childish education-platform design

Use a consistent design system with:

White/light background

Dark text

Soft gray borders

Subtle shadows

Rounded cards

Blue/purple accent colors

Clear typography

Modern icons

Progress bars

Charts

Status badges

Empty states

Loading states

Error states

Use a left sidebar for the main application navigation.

3. APPLICATION STRUCTURE

The application hierarchy is:

Workspace
│
├── Home
│
├── Spaces
│ └── Space Dashboard
│ └── Projects
│ └── Project Dashboard
│ ├── Overview
│ ├── Materials
│ ├── Knowledge
│ ├── AI Tutor
│ ├── Quiz
│ ├── Mastery
│ ├── Growth
│ └── Analytics
│
├── Global Analytics
│
└── Admin Dashboard

Each Project must have isolated learning context.

4. LOGIN / AUTHENTICATION

Create authentication screens.

Login page

Fields:

Email

Password

Buttons:

Sign In

Continue with Google

Forgot Password

Link:

Create an account

Signup page

Fields:

Name

Email

Password

Confirm Password

Button:

Create Account

After authentication, redirect to Home Dashboard.

5. HOME DASHBOARD

Create a main dashboard that immediately answers:

“Where was I, how am I doing, and what should I do next?”

Top section:

Greeting:

“Good afternoon 👋”

Subtitle:

“Continue your learning journey.”

Show summary cards:

Overall Progress

Example:

72%

Overall learning progress

Active Projects

4

Learning Streak

12 days

Concepts Mastered

38

Then create a prominent Continue Learning card.

Example:

Machine Learning Fundamentals

Progress: 72%

Last activity:
“Completed Decision Trees quiz”

Button:

“Continue Learning”

Create a Recommended Next Action card.

Example:

“Review Gradient Descent”

Reason:

“You answered 3 recent questions incorrectly on optimization concepts.”

Button:

“Start Review”

Create:

Recent Projects

Cards showing:

Project name

Description

Progress

Last activity

Number of materials

Continue button

Example projects:

Machine Learning Fundamentals
Deep Learning
Computer Networks
Database Management Systems

Create:

Areas Requiring Attention

Example:

Gradient Descent — 48%

CNN Padding — 54%

Backpropagation — 61%

Create:

Recent Activity

Timeline:

Completed quiz

Uploaded PDF

Asked Tutor question

Mastery updated

Recommendation generated

6. SPACES PAGE

Create a page called Spaces.

A Space represents a broad learning area.

Example spaces:

GATE Preparation

Machine Learning

Placement Preparation

Research

Computer Science

Each Space card should show:

Space name

Description

Number of Projects

Overall progress

Recent activity

Button:

“Create Space”

Create Space modal:

Fields:

Space Name

Description

Optional icon/color

Button:

“Create Space”

7. SPACE DASHBOARD

When a Space is opened, show:

Header:

Space name

Description

Progress summary

Sections:

Projects

Display project cards.

Each project card:

Project name

Learning goal

Progress

Last activity

Mastery

Continue button

Space Activity

Timeline of recent activity.

Space Progress

Chart showing progress over time.

Button:

“Create Project”

8. CREATE PROJECT

Create a project creation page/modal.

Fields:

Project Name

Description

Learning Goal

Example:

Project Name:
Machine Learning Fundamentals

Description:
Learn the core concepts and practical applications of machine learning.

Learning Goal:
Understand ML algorithms, evaluate models, and solve practical ML problems.

Button:

“Create Project”

After creation redirect to Project Dashboard.

9. PROJECT DASHBOARD

This is the central workspace.

Header:

Project name

Learning goal

Progress indicator

Last activity

Top navigation tabs:

Overview
Materials
Knowledge
AI Tutor
Quiz
Mastery
Growth
Analytics

The Project Overview should contain:

Overall Progress

Large circular progress indicator.

Example:

72%

Important Concepts

Cards:

Linear Regression — 88%
Decision Trees — 76%
Gradient Descent — 51%
Neural Networks — 42%

Recent Activity

Show:

Tutor interaction

Quiz attempt

Material upload

Mastery update

Learning Performance

Chart showing quiz performance over time.

Recommended Next Step

Large highlighted recommendation card.

Example:

“Practice Gradient Descent”

Description:

“Your recent quiz results show difficulty with optimization-based questions. Review the material and complete a short assessment.”

Button:

“Start Recommended Action”

10. MATERIALS PAGE

Create a professional document management interface.

Header:

Learning Materials

Button:

“Upload PDF”

Upload area should support drag-and-drop.

Display:

“Drop your PDF here or browse files”

Each material card/table row should show:

File name

Upload date

Pages

Processing status

Concepts extracted

Actions

Processing statuses:

Queued
Processing
Ready
Failed

Use different status badges.

Example:

Machine Learning Notes.pdf

Status: Ready

Pages: 42

Concepts: 18

Create a processing workflow visualization:

Upload
↓
Queued
↓
Processing / OCR
↓
Content Extraction
↓
Knowledge Extraction
↓
Searchable Knowledge
↓
Ready

For processing state, show progress.

For failed documents show:

“Processing failed”

Button:

“Retry”

Important:

The interface should make it clear that uploaded documents become searchable knowledge for the Tutor.

11. DOCUMENT DETAIL / KNOWLEDGE PAGE

When a document is opened, show:

Document name

Pages

Processing status

Extracted concepts

Search box:

“Search this material…”

Display:

Extracted Concepts

Examples:

Supervised Learning

Regression

Classification

Decision Trees

Random Forest

Gradient Descent

Knowledge Sources

Show document sections/pages.

Example:

Machine Learning Notes
Page 14

“Decision Trees”

Button:

“Open Source”

Create a searchable knowledge interface.

12. AI TUTOR PAGE

This is the most important page.

Create a professional ChatGPT-style learning interface, but visually integrated into the Project.

Header:

AI Tutor

Subtitle:

“Ask questions about your learning materials and get evidence-based explanations.”

Show current Project context:

Project:
Machine Learning Fundamentals

Materials:
3

Concepts:
18

Mastery:
72%

Chat interface:

User:

“What is overfitting?”

Tutor:

“Overfitting occurs when a model learns the training data too closely, including noise and small variations, so it performs poorly on unseen data.”

Below the answer show:

Source:
Machine Learning Notes — Page 14

Make the source clickable.

Add response actions:

Copy

Helpful

Not helpful

Ask follow-up

Input box:

“Ask anything about this project…”

Buttons:

Send
Attach

Add quick prompts:

“Explain simply”
“Give an example”
“Quiz me”
“Explain step-by-step”
“Help me revise”

The Tutor must visually communicate that it uses:

Current Conversation
+
Project Knowledge
+
Relevant Learning Context

Do NOT design it as an unrestricted generic chatbot.

13. UNSUPPORTED QUESTION HANDLING

Create an important UI state.

If the user asks something not supported by the Project material, the Tutor should clearly communicate uncertainty.

Example:

User:

“What is the latest stock price of Tesla?”

Tutor:

“I don't have enough reliable information in this project's learning materials to answer that question.”

Then show:

“Available evidence is insufficient.”

Buttons:

Ask about Project Material

Upload Relevant Material

Do not fabricate an answer.

Create this as a polished empty/evidence-insufficient state.

14. QUIZ PAGE

Create an Adaptive Quiz interface.

Header:

Adaptive Quiz

Show:

Concept:
Neural Networks

Difficulty:
Medium

Question:

“What is the primary purpose of an activation function in a neural network?”

Multiple-choice options:

A. Store training data
B. Introduce non-linearity
C. Increase dataset size
D. Remove all model parameters

Show progress:

Question 4 of 10

Progress bar.

Buttons:

Previous
Next

After answering, show feedback.

Example:

Correct

Explanation:
“Activation functions introduce non-linearity, allowing neural networks to learn complex relationships.”

Also show:

Concept tested:
Activation Functions

Difficulty:
Medium

15. ADAPTIVE QUIZ LOGIC UI

The interface should communicate that questions are selected based on learning evidence.

Show a small information card:

“Your next question is selected using:

• Current concept mastery
• Previous mistakes
• Recent performance
• Question history
• Difficulty
• Recent learning activity”

Do not make the UI imply a simplistic:

Wrong → Easy
Correct → Hard

Instead show intelligent adaptive behavior.

16. OPEN-ENDED ASSESSMENT

Create another quiz question type.

Example:

Question:

“Explain how gradient descent works.”

Large text area.

Button:

“Submit Answer”

After submission show AI evaluation.

Sections:

Understanding

Good

Accuracy

Needs Improvement

Key Concepts Covered

✓ Learning rate
✓ Gradient
✓ Parameter update

Missing Concepts

✗ Direction of optimization
✗ Convergence

Feedback

“You understand the basic idea of updating parameters using the gradient, but your answer should explain that the parameters are updated in the direction that reduces the loss.”

Show:

Score: 72%

But make the detailed feedback more prominent than the numerical score.

17. MASTERY PAGE

Create a Concept Mastery dashboard.

Header:

Concept Mastery

Show overall mastery:

72%

Create concept cards with progress bars.

Example:

Linear Regression
█████████░
88%

Decision Trees
███████░░░
72%

Gradient Descent
█████░░░░░
51%

CNN
████░░░░░░
42%

Use status:

Improving
Stable
Needs Attention

Each concept can be clicked to see:

Mastery history

Quiz performance

Mistakes

Related materials

Tutor interactions

Recommended actions

Clearly indicate:

“Mastery is an estimate based on available learning evidence.”

18. GROWTH PAGE

Create a Growth Analysis dashboard.

Show a line chart of mastery over time.

Example:

Week 1 → 48%
Week 2 → 56%
Week 3 → 65%
Week 4 → 72%

Create sections:

Improving

Linear Regression

Classification

Stable

Decision Trees

Needs Attention

Gradient Descent

Neural Networks

Create a detailed concept trend chart.

Also show:

Recent improvement

“Gradient Descent mastery increased from 42% to 51%.”

19. RECOMMENDATIONS

Create a dedicated recommendation section.

Header:

“What should I do next?”

Cards:

Recommended

Review Gradient Descent

Reason:

“You have made repeated mistakes in gradient-based optimization questions.”

Action:

“Review Material”

Recommended

Take a short CNN assessment

Reason:

“Your recent assessment showed missing concepts related to convolution.”

Action:

“Start Assessment”

Continue

Ask Tutor about Backpropagation

Action:

“Open Tutor”

Recommendations should use:

Weak concepts

Recent mistakes

Learning goals

Recent activity

Assessment history

Available materials

20. ANALYTICS PAGE

Create Project Analytics.

Top metrics:

Learning Sessions
24

Quiz Attempts
18

Questions Answered
143

Average Assessment Score
76%

Concepts Mastered
18

Tutor Questions
52

Create charts:

Learning Activity

Line/bar chart by day.

Quiz Performance

Score over time.

Concept Mastery

Horizontal bar chart.

Activity Breakdown

Tutor
Quiz
Materials
Assessment

Learning Trend

Weekly progress.

Create a clean analytics dashboard suitable for a professional SaaS product.

21. GLOBAL ANALYTICS

Create a global analytics page across all Spaces and Projects.

Metrics:

Total Spaces
Total Projects
Total Learning Sessions
Total Quiz Attempts
Average Mastery
Total Tutor Interactions

Charts:

Activity across projects

Mastery trends

Quiz performance

Most studied concepts

Learning activity by date

Filters:

Space
Project
Activity Type
Date Range

22. ACTIVITY PAGE

Create a detailed activity timeline.

Activity types:

Project Created
Material Uploaded
Material Processed
Tutor Interaction
Quiz Started
Question Answered
Assessment Completed
Mastery Updated
Recommendation Generated

Each event should show:

Icon
Event name
Project
Timestamp

Example:

✓ Quiz Completed

Machine Learning Fundamentals

Score: 82%

2 hours ago

23. ADMIN DASHBOARD

Create a separate Admin Dashboard.

Sidebar should include:

Overview
Users
Spaces
Projects
Activity
AI Usage
AI Evaluation
Background Jobs
System Health

Admin Overview cards:

Total Users
1248

Active Users
682

Projects
2394

AI Requests
18,492

Average AI Latency
1.8s

Failed Jobs
23

Create charts for:

User activity

Project creation

AI requests

AI usage

System activity

24. ADMIN USERS PAGE

Table:

User
Email
Spaces
Projects
Last Active
AI Usage
Status

Allow filtering and searching.

Clicking a user opens a detailed learning journey:

User information

Spaces

Projects

Activity

Assessments

Progress

Mastery

AI usage

25. AI USAGE / OBSERVABILITY

Create an AI observability page.

Show:

AI Requests

Model

Feature

Latency

Tokens

Estimated Cost

Success / Failure

Example:

Tutor
GPT model
1.4 sec
1,245 tokens
$0.003
Success

Include charts:

AI requests over time

Latency over time

Token usage

Estimated cost

Failure rate

Also include an investigation table.

Example:

“Why was this response slow?”

Show:

Request ID
Feature
Model
Retrieval latency
Generation latency
Total latency
Status

26. AI EVALUATION PAGE

Create evaluation dashboard.

Sections:

Tutor Evaluation

Accuracy

Groundedness

Citation correctness

Unsupported question handling

Retrieval Evaluation

Relevance

Source quality

Assessment Evaluation

Question quality

Grading quality

Structured output reliability

Adaptive behavior

Recommendation Evaluation

Relevance

Actionability

Alignment with learner state

Show evaluation scores and trends.

27. BACKGROUND JOBS PAGE

Create a background processing dashboard.

Job types:

Document Processing
OCR
Knowledge Extraction
Embedding Generation
Quiz Evaluation
Mastery Update
Recommendation Generation

Job statuses:

Queued
Running
Completed
Failed
Retrying

Table columns:

Job
Type
Project
Status
Started
Duration
Attempts
Actions

For failed jobs:

Button:

Retry

28. SYSTEM HEALTH

Create a lightweight system health page.

Components:

API
Database
AI Provider
Document Processing
Search / Retrieval
Background Worker

Statuses:

Operational
Degraded
Unavailable

Show latency and recent errors.

29. RESPONSIVE NAVIGATION

Desktop:

Left sidebar.

Sidebar items:

Home
Spaces
Global Analytics
Activity

Current Project section when inside a project:

Overview
Materials
Knowledge
AI Tutor
Quiz
Mastery
Growth
Analytics

Bottom:

Settings
Help
Profile

Admin users should see:

Admin Dashboard

Mobile:

Use bottom navigation or collapsible sidebar.

30. IMPORTANT UI STATES

Implement polished states for:

Loading

Empty

Success

Error

Processing

Failed

Retrying

No evidence

No projects

No materials

No quiz history

No recommendations

Example empty state:

“No learning materials yet.”

“Upload your first PDF to build project knowledge.”

Button:

“Upload PDF”

31. NOTIFICATION SYSTEM

Add a small notification panel.

Examples:

“Your document is ready.”

“Quiz evaluation completed.”

“New learning recommendation available.”

“Mastery updated for Gradient Descent.”

“Document processing failed. Retry available.”

32. SEARCH

Add global search.

Search across:

Spaces
Projects
Materials
Concepts
Activity

Search results should clearly indicate the type of result.

33. PROJECT CONTEXT

Every Project page must clearly display the current Project.

For example:

Workspace / Machine Learning / ML Fundamentals

The AI Tutor, Quiz, Mastery, Growth and Analytics pages must all operate in the current Project context.

Do not mix information between unrelated Projects.

34. DATA MODEL VISUALIZATION

The UI should be designed around these core entities:

User
Space
Project
Material
Knowledge
Conversation
Concept
Assessment
Question
Mastery
Growth
Recommendation
Activity
AI Usage
Background Job

Relationships:

User
→ Spaces
→ Projects
→ Materials
→ Knowledge
→ Concepts
→ Tutor Conversations
→ Assessments
→ Mastery
→ Growth
→ Recommendations
→ Analytics

35. IMPORTANT AI BEHAVIOR

The UI must communicate that AI is evidence-driven.

Tutor flow:

User Question
↓
Understand Request
↓
Identify Project Context
↓
Retrieve Relevant Evidence
↓
Generate Answer
↓
Return Supporting Source

If sufficient evidence exists:

Answer + Citation

If insufficient evidence:

Explain that evidence is insufficient.

Do not show confident fabricated answers.

36. PERSISTENT LEARNING CONTEXT

Create a small “Learning Context” area in the Project.

Show:

Learning Goal

Known Strengths

Known Weaknesses

Recent Mistakes

Important Learning History

Assessment History

Recent Tutor Context

Example:

Learning Context

Goal:
Master machine learning fundamentals.

Strengths:
Classification, regression

Needs attention:
Optimization, neural networks

Recent mistake:
Confused gradient descent with stochastic gradient descent.

This demonstrates that the product remembers relevant learning information rather than storing every conversation.

37. RECOMMENDED PRODUCT FLOW

The demo should be easy to understand.

A new user should be able to:

Sign up

Create a Space

Create a Project

Upload PDF

See document processing

Open processed material

Ask Tutor a question

See grounded answer with citation

Ask unsupported question and see evidence-insufficient response

Start adaptive quiz

Answer MCQ

Answer open-ended question

Receive detailed evaluation

See mastery update

Open Growth

View recommendation

Open Analytics

Admin can inspect platform activity

38. DEMO DATA

Use realistic sample data so the application looks complete immediately.

Example Space:

“Machine Learning”

Example Project:

“Machine Learning Fundamentals”

Learning Goal:

“Understand fundamental machine learning algorithms and apply them to practical problems.”

Materials:

Machine Learning Fundamentals.pdf
Deep Learning Notes.pdf
ML Interview Preparation.pdf

Concepts:

Regression
Classification
Decision Trees
Random Forest
Gradient Descent
Neural Networks
CNN
Overfitting
Regularization

Use realistic sample analytics, quiz questions, mastery values, activities and recommendations.

Clearly label sample/demo data where appropriate.

39. COMPONENTS

Create reusable components:

Sidebar
Topbar
ProjectSwitcher
ProgressCard
MetricCard
ProjectCard
MaterialCard
UploadDropzone
ProcessingStatus
ChatMessage
CitationCard
QuizQuestion
AnswerFeedback
MasteryCard
GrowthChart
RecommendationCard
ActivityTimeline
AnalyticsChart
DataTable
StatusBadge
EmptyState
ErrorState
LoadingSkeleton
NotificationPanel
Modal
SearchBar

40. VISUAL HIERARCHY

The most important elements should be visually emphasized:

Continue Learning

Recommended Next Action

Current Project Progress

AI Tutor

Mastery

Growth

Analytics

Avoid overcrowding the dashboard.

Use whitespace and cards to organize information.

41. FRONTEND QUALITY

The generated frontend should feel production-ready.

Requirements:

Responsive design

Accessible buttons

Clear hover states

Keyboard-friendly forms

Loading skeletons

Error handling

Toast notifications

Modal dialogs

Smooth but subtle transitions

Consistent spacing

Consistent typography

No broken links

No placeholder-looking UI

Do not create a static landing page only.

Generate the actual application dashboard experience with multiple connected screens.

42. IMPORTANT PRODUCT POSITIONING

Do not present this product as:

“ChatGPT for students.”

Instead present it as:

“An AI-powered learning workspace that understands what you are learning, measures how well you are learning it, and recommends what to do next.”

The key differentiation is:

Context + Evidence + Assessment + Mastery + Growth + Recommendation.

43. LANDING PAGE

Create a simple landing page before login.

Hero:

AI Study Companion

“Your learning journey, powered by context-aware AI.”

Subtitle:

“Learn from your own materials, practice with adaptive assessments, track concept mastery, and always know what to do next.”

Buttons:

“Start Learning”

“Explore Demo”

Show a visual workflow:

Materials
→ AI Tutor
→ Adaptive Quiz
→ Mastery
→ Growth
→ Recommendation

Feature sections:

Learn with Context

AI Tutor understands your Project and learning materials.

Practice Adaptively

Questions adapt using your learning evidence.

Measure Mastery

Track understanding at the concept level.

Understand Growth

See how your learning changes over time.

Know What to Do Next

Receive useful personalized recommendations.

44. FINAL UX REQUIREMENT

The application should feel like one connected system.

Do not make each page look like an unrelated feature.

For example:

If a learner performs poorly on a Gradient Descent quiz:

→ Quiz records mistake
→ Mastery decreases/updates
→ Growth identifies Gradient Descent as needing attention
→ Recommendation suggests reviewing Gradient Descent
→ Tutor can explain Gradient Descent
→ Next quiz contains targeted questions

This connected learning loop is the heart of the product.

45. FINAL IMPLEMENTATION PRIORITY

Prioritize these features visually and functionally:

MUST HAVE:

Authentication

Spaces

Projects

PDF Materials

Material processing states

Knowledge

AI Tutor

Grounded citations

Unsupported-question handling

Adaptive Quiz

Open-ended assessment

Concept Mastery

Growth Analysis

Recommendations

Project Analytics

Global Analytics

Activity Tracking

Admin Dashboard

Persistent learning context

Project-level isolation

Structured AI interaction

AI observability

Error states

The interface should clearly demonstrate the complete learning loop:

SPACE
↓
PROJECT
↓
MATERIAL
↓
KNOWLEDGE
↓
AI TUTOR
↓
GROUNDED ANSWER + CITATION
↓
ADAPTIVE QUIZ
↓
ASSESSMENT
↓
MASTERY
↓
GROWTH
↓
ANALYTICS
↓
RECOMMENDATION
↓
CONTINUE LEARNING

Build the UI so that this complete journey is easy to demonstrate in a 3–4 day prototype and looks like a serious full-stack AI engineering project.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tutor-loom.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/07f2cfbe-e037-48f8-ac77-290b1073c0e8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
