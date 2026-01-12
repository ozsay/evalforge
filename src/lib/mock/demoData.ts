/**
 * Demo Data Generator
 * Creates realistic demo data showing insights from the evaluation system
 */

import { generateId } from "@lib/utils";
import type {
  Skill,
  SkillVersion,
  SkillSyncSource,
  TestScenario,
  TestSuite,
  TargetGroup,
  PromptAgent,
  EvalRun,
  EvalRunResult,
  AssertionResult,
  Agent,
  ModelConfig,
  FailureAnalysis,
  CodingTool,
  ImprovementRun,
} from "@lib/types";
import { BUILTIN_AGENTS, BUILTIN_TOOLS } from "@lib/types";

// ==========================================
// Demo Skills
// ==========================================

function createSkill(
  id: string,
  name: string,
  description: string,
  skillMd: string,
  versions: Omit<SkillVersion, "skillId">[],
  syncSource?: SkillSyncSource
): Skill {
  const now = new Date();
  return {
    id,
    name,
    description,
    skillMd,
    metadata: {
      name,
      description,
    },
    versions: versions.map((v) => ({ ...v, skillId: id })),
    testScenarios: [],
    syncSource,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

const DEMO_SKILLS: Skill[] = [
  createSkill(
    "skill-react-component",
    "React Component Generator",
    "Creates React components with TypeScript, tests, and Storybook stories",
    `---
name: react-component-generator
version: 2.1.0
author: EvalForge Team
tags:
  - react
  - typescript
  - frontend
---

# React Component Generator

Generate production-ready React components with full TypeScript support.

## Capabilities

- Create functional components with proper TypeScript interfaces
- Generate accompanying test files with React Testing Library
- Create Storybook stories for visual documentation
- Support for various styling solutions

## Output Structure

\`\`\`
src/components/{ComponentName}/
├── {ComponentName}.tsx
├── {ComponentName}.test.tsx
├── {ComponentName}.stories.tsx
└── index.ts
\`\`\`
`,
    [
      {
        id: "skill-react-v1",
        version: 1,
        skillMd: "# React Component Generator v1",
        metadata: { name: "React Generator", description: "v1" },
        model: { provider: "anthropic", model: "claude-3-sonnet", temperature: 0.3, maxTokens: 4096 },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial version",
      },
      {
        id: "skill-react-v2",
        version: 2,
        skillMd: "# React Component Generator v2 - TypeScript",
        metadata: { name: "React Generator", description: "v2 with TS" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Added TypeScript support",
      },
    ],
    {
      type: "github",
      repository: "evalforge/skills-library",
      branch: "main",
      path: "skills/react-component/SKILL.md",
      lastSyncCommit: "a1b2c3d4e5f6",
      lastSyncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    }
  ),
  createSkill(
    "skill-api-endpoint",
    "REST API Endpoint Builder",
    "Creates Express/Fastify API endpoints with validation and error handling",
    `---
name: api-endpoint-builder
version: 1.5.0
---

# REST API Endpoint Builder

Generate robust API endpoints with built-in validation, error handling, and documentation.
`,
    [
      {
        id: "skill-api-v1",
        version: 1,
        skillMd: "# API Endpoint Builder v1",
        metadata: { name: "API Builder", description: "v1" },
        model: { provider: "openai", model: "gpt-4-turbo", temperature: 0.5, maxTokens: 4096 },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  ),
  createSkill(
    "skill-database-schema",
    "Database Schema Designer",
    "Designs and generates database schemas with migrations",
    `---
name: database-schema-designer
version: 3.0.0
---

# Database Schema Designer

Design comprehensive database schemas with automatic migration generation.
`,
    [
      {
        id: "skill-db-v1",
        version: 1,
        skillMd: "# Database Schema Designer v1",
        metadata: { name: "DB Designer", description: "v1" },
        model: { provider: "anthropic", model: "claude-3-sonnet", temperature: 0.3, maxTokens: 4096 },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  ),
  createSkill(
    "skill-unit-tests",
    "Unit Test Generator",
    "Generates comprehensive unit tests for existing code",
    `---
name: unit-test-generator
version: 2.3.0
---

# Unit Test Generator

Automatically generate comprehensive unit tests for your codebase.
`,
    [
      {
        id: "skill-tests-v1",
        version: 1,
        skillMd: "# Unit Test Generator v1",
        metadata: { name: "Test Generator", description: "v1" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  ),
  createSkill(
    "skill-auth-flow",
    "Authentication Flow Builder",
    "Creates complete authentication systems with OAuth and JWT",
    `---
name: auth-flow-builder
version: 1.2.0
---

# Authentication Flow Builder

Build secure authentication systems with multiple provider support.
`,
    [
      {
        id: "skill-auth-v1",
        version: 1,
        skillMd: "# Auth Flow Builder v1",
        metadata: { name: "Auth Builder", description: "v1" },
        model: { provider: "openai", model: "gpt-4", temperature: 0.3, maxTokens: 4096 },
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  ),

  // ==========================================
  // Wix Dashboard Page Coding Skills
  // ==========================================
  createSkill(
    "skill-wix-dashboard-basic",
    "Wix Dashboard Page - Basic",
    "Creates basic Wix CLI dashboard pages with standard layouts and widgets",
    `---
name: wix-dashboard-page-basic
version: 1.0.0
author: Wix Team
tags:
  - wix
  - dashboard
  - cli
allowed-tools: Read, Write, Bash
---

# Wix Dashboard Page - Basic

Create basic dashboard pages for Wix applications using the Wix CLI.

## Capabilities

- Create dashboard pages with standard layouts
- Add basic widgets (stats, tables, cards)
- Implement simple navigation patterns
- Use Wix Design System components

## Output Structure

\`\`\`
src/dashboard/pages/{PageName}/
├── page.tsx
├── page.module.css
└── index.ts
\`\`\`
`,
    [
      {
        id: "skill-wix-dash-basic-v1",
        version: 1,
        skillMd: "# Wix Dashboard Basic v1",
        metadata: { name: "Wix Dashboard Basic", description: "v1 - Standard layouts" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial basic dashboard skill",
      },
      {
        id: "skill-wix-dash-basic-v2",
        version: 2,
        skillMd: "# Wix Dashboard Basic v2 - Improved widgets",
        metadata: { name: "Wix Dashboard Basic", description: "v2 - Better widget support" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Added more widget types",
      },
    ],
    {
      type: "prompthub",
      promptHubId: "wix-dashboard-basic-v2",
      version: "2.1.0",
      lastSyncedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ),
  createSkill(
    "skill-wix-dashboard-advanced",
    "Wix Dashboard Page - Advanced",
    "Creates Wix CLI dashboard pages with with direct instructions how to handle data fetching, state management, and complex interactions",
    `---
name: wix-dashboard-page-advanced
version: 2.0.0
author: Wix Team
tags:
  - wix
  - dashboard
  - cli
  - advanced
allowed-tools: Read, Write, Bash, WixSDK
---

# Wix Dashboard Page - Advanced

Create advanced dashboard pages with real-time data, complex state management, and rich interactions.

## Capabilities

- Real-time data fetching with Wix SDK
- Complex state management patterns
- Advanced table features (sorting, filtering, pagination)
- Modal workflows and multi-step forms
- Dark/light theme support

## Output Structure

\`\`\`
src/dashboard/pages/{PageName}/
├── page.tsx
├── page.module.css
├── components/
│   ├── DataTable.tsx
│   └── StatsWidget.tsx
├── hooks/
│   └── usePageData.ts
└── index.ts
\`\`\`
`,
    [
      {
        id: "skill-wix-dash-adv-v1",
        version: 1,
        skillMd: "# Wix Dashboard Advanced v1",
        metadata: { name: "Wix Dashboard Advanced", description: "v1 - Complex pages" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.4, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial advanced dashboard skill",
      },
    ],
    {
      type: "github",
      repository: "wix-private/dashboard-skills",
      branch: "main",
      path: "advanced/SKILL.md",
      lastSyncCommit: "f8e7d6c5b4a3",
      lastSyncedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    }
  ),

  // ==========================================
  // Wix Backend Coding Skills
  // ==========================================
  createSkill(
    "skill-wix-backend-http",
    "Wix Backend - HTTP Functions",
    "Creates Wix HTTP Functions for backend API endpoints",
    `---
name: wix-backend-http-functions
version: 1.0.0
author: Wix Team
tags:
  - wix
  - backend
  - http
  - api
allowed-tools: Read, Write, Bash
---

# Wix Backend - HTTP Functions

Create HTTP function endpoints for Wix applications.

## Capabilities

- Create GET/POST/PUT/DELETE endpoints
- Input validation and error handling
- Authentication and authorization
- CORS configuration
- Response formatting

## Output Structure

\`\`\`
backend/
├── http-functions.ts
└── helpers/
    ├── validation.ts
    └── auth.ts
\`\`\`
`,
    [
      {
        id: "skill-wix-http-v1",
        version: 1,
        skillMd: "# Wix HTTP Functions v1",
        metadata: { name: "Wix HTTP", description: "v1 - Basic endpoints" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial HTTP functions skill",
      },
      {
        id: "skill-wix-http-v2",
        version: 2,
        skillMd: "# Wix HTTP Functions v2 - With middleware",
        metadata: { name: "Wix HTTP", description: "v2 - Added middleware support" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Added middleware and better error handling",
      },
    ],
    {
      type: "prompthub",
      promptHubId: "wix-http-functions",
      version: "2.0.0",
      lastSyncedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ),
  createSkill(
    "skill-wix-backend-velo",
    "Wix Backend - Velo Backend",
    "Creates Velo backend modules with data collections and scheduled jobs",
    `---
name: wix-backend-velo
version: 2.0.0
author: Wix Team
tags:
  - wix
  - velo
  - backend
  - database
allowed-tools: Read, Write, Bash, WixData
---

# Wix Backend - Velo Backend

Create comprehensive Velo backend solutions with data management and automation.

## Capabilities

- Wix Data collections and queries
- Scheduled jobs and triggers
- Backend event handlers
- Data hooks and validations
- External API integrations

## Output Structure

\`\`\`
backend/
├── data.ts
├── jobs/
│   └── scheduled-tasks.ts
├── events/
│   └── data-hooks.ts
└── services/
    └── external-api.ts
\`\`\`
`,
    [
      {
        id: "skill-wix-velo-v1",
        version: 1,
        skillMd: "# Wix Velo Backend v1",
        metadata: { name: "Wix Velo", description: "v1 - Data and jobs" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial Velo backend skill",
      },
    ]
  ),
];

// ==========================================
// Demo Test Scenarios
// ==========================================

const DEMO_SCENARIOS: TestScenario[] = [
  // Target Group-linked scenarios
  {
    id: "scenario-react-button",
    targetGroupId: "tg-react-development",
    suiteIds: ["suite-ui-components"],
    name: "Create Button Component",
    description: "Test creating a basic button with multiple variants",
    triggerPrompt: "Create a Button component with primary, secondary, and ghost variants.",
    expectedFiles: [
      { path: "src/components/Button/Button.tsx" },
      { path: "src/components/Button/Button.test.tsx" },
    ],
    assertions: [
      { id: "a1", type: "file_presence", name: "Button file exists", paths: ["src/components/Button/Button.tsx"], shouldExist: true },
      { id: "a2", type: "file_presence", name: "Test file exists", paths: ["src/components/Button/Button.test.tsx"], shouldExist: true },
      { id: "a3", type: "build_check", name: "TypeScript compiles", command: "npx tsc --noEmit", expectSuccess: true },
    ],
    tags: ["react", "ui", "button"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-react-modal",
    targetGroupId: "tg-react-development",
    suiteIds: ["suite-ui-components"],
    name: "Create Modal Component",
    description: "Test creating an accessible modal",
    triggerPrompt: "Create a Modal component with focus trapping and keyboard navigation.",
    expectedFiles: [{ path: "src/components/Modal/Modal.tsx" }],
    assertions: [
      { id: "a4", type: "file_presence", name: "Modal file exists", paths: ["src/components/Modal/Modal.tsx"], shouldExist: true },
      { id: "a5", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["react", "ui", "modal", "a11y"],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-api-crud",
    targetGroupId: "tg-api-testing",
    suiteIds: ["suite-api-patterns"],
    name: "Create CRUD Endpoints",
    description: "Test generating full CRUD endpoints",
    triggerPrompt: "Create CRUD endpoints for a Product resource.",
    expectedFiles: [
      { path: "src/api/products/products.controller.ts" },
      { path: "src/api/products/products.service.ts" },
    ],
    assertions: [
      { id: "a6", type: "file_presence", name: "Controller exists", paths: ["src/api/products/products.controller.ts"], shouldExist: true },
      { id: "a7", type: "file_presence", name: "Service exists", paths: ["src/api/products/products.service.ts"], shouldExist: true },
    ],
    tags: ["api", "crud", "rest"],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-db-ecommerce",
    targetGroupId: "tg-full-stack",
    name: "E-commerce Schema",
    description: "Test creating a complete e-commerce schema",
    triggerPrompt: "Design a Prisma schema for an e-commerce platform.",
    expectedFiles: [{ path: "prisma/schema.prisma" }],
    assertions: [
      { id: "a8", type: "file_presence", name: "Schema exists", paths: ["prisma/schema.prisma"], shouldExist: true },
      { id: "a9", type: "build_check", name: "Prisma validates", command: "npx prisma validate", expectSuccess: true },
    ],
    tags: ["database", "prisma", "ecommerce"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-test-utils",
    // Standalone scenario (no target group)
    name: "Generate Utility Tests",
    description: "Test generating unit tests for utility functions",
    triggerPrompt: "Generate tests for date formatting utilities.",
    expectedFiles: [{ path: "src/utils/date.test.ts" }],
    assertions: [
      { id: "a10", type: "file_presence", name: "Test file exists", paths: ["src/utils/date.test.ts"], shouldExist: true },
      { id: "a11", type: "vitest", name: "Tests pass", testFile: "src/utils/date.test.ts", testFileName: "date.test.ts", minPassRate: 90 },
    ],
    tags: ["testing", "utils", "vitest"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-auth-oauth",
    targetGroupId: "tg-full-stack",
    suiteIds: ["suite-auth-patterns"],
    name: "OAuth Google Integration",
    description: "Test implementing Google OAuth",
    triggerPrompt: "Implement Google OAuth 2.0 authentication flow.",
    expectedFiles: [{ path: "src/auth/google.ts" }],
    assertions: [
      { id: "a12", type: "file_presence", name: "OAuth file exists", paths: ["src/auth/google.ts"], shouldExist: true },
      { id: "a13", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["auth", "oauth", "google"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Suite-only scenarios (no target group assigned)
  {
    id: "scenario-wix-dashboard-stats",
    targetGroupId: "tg-wix-dashboard",
    suiteIds: ["suite-wix-dashboard"],
    name: "Wix Dashboard Stats Widget",
    description: "Create a stats widget for Wix CLI dashboard with real-time data",
    triggerPrompt: "Create a Wix CLI dashboard page with a stats widget showing site visits, conversions, and revenue.",
    expectedFiles: [
      { path: "src/dashboard/pages/stats/page.tsx" },
      { path: "src/dashboard/pages/stats/stats.module.css" },
    ],
    assertions: [
      { id: "a14", type: "file_presence", name: "Page exists", paths: ["src/dashboard/pages/stats/page.tsx"], shouldExist: true },
      { id: "a15", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["wix", "dashboard", "stats"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-wix-dashboard-settings",
    suiteIds: ["suite-wix-dashboard"],
    name: "Wix Dashboard Settings Page",
    description: "Create a settings configuration page for Wix app",
    triggerPrompt: "Create a Wix CLI dashboard settings page with form inputs for API keys and notification preferences.",
    expectedFiles: [
      { path: "src/dashboard/pages/settings/page.tsx" },
    ],
    assertions: [
      { id: "a16", type: "file_presence", name: "Settings page exists", paths: ["src/dashboard/pages/settings/page.tsx"], shouldExist: true },
      { id: "a17", type: "build_check", name: "TypeScript compiles", command: "npx tsc --noEmit", expectSuccess: true },
    ],
    tags: ["wix", "dashboard", "settings"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-wix-dashboard-table",
    suiteIds: ["suite-wix-dashboard"],
    name: "Wix Dashboard Data Table",
    description: "Create a paginated data table for Wix dashboard",
    triggerPrompt: "Create a Wix CLI dashboard page with a data table showing orders, with sorting and pagination.",
    expectedFiles: [
      { path: "src/dashboard/pages/orders/page.tsx" },
    ],
    assertions: [
      { id: "a18", type: "file_presence", name: "Orders page exists", paths: ["src/dashboard/pages/orders/page.tsx"], shouldExist: true },
      { id: "a19", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["wix", "dashboard", "table", "pagination"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Standalone scenarios (no skill or suite)
  {
    id: "scenario-standalone-dockerfile",
    name: "Generate Dockerfile",
    description: "Create optimized Dockerfile for Node.js app",
    triggerPrompt: "Create a multi-stage Dockerfile for a Node.js application with production optimizations.",
    expectedFiles: [{ path: "Dockerfile" }],
    assertions: [
      { id: "a20", type: "file_presence", name: "Dockerfile exists", paths: ["Dockerfile"], shouldExist: true },
      { id: "a21", type: "file_content", name: "Uses multi-stage", path: "Dockerfile", checks: { contains: ["FROM node", "AS builder"] } },
    ],
    tags: ["docker", "devops", "nodejs"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-standalone-cicd",
    name: "GitHub Actions Workflow",
    description: "Create CI/CD pipeline with GitHub Actions",
    triggerPrompt: "Create a GitHub Actions workflow for testing, building, and deploying a Node.js app.",
    expectedFiles: [{ path: ".github/workflows/ci.yml" }],
    assertions: [
      { id: "a22", type: "file_presence", name: "Workflow file exists", paths: [".github/workflows/ci.yml"], shouldExist: true },
    ],
    tags: ["ci-cd", "github-actions", "devops"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-standalone-readme",
    name: "Generate README",
    description: "Create comprehensive project README",
    triggerPrompt: "Generate a comprehensive README.md with installation, usage, API docs, and contribution guidelines.",
    expectedFiles: [{ path: "README.md" }],
    assertions: [
      { id: "a23", type: "file_presence", name: "README exists", paths: ["README.md"], shouldExist: true },
      { id: "a24", type: "file_content", name: "Has sections", path: "README.md", checks: { contains: ["## Installation", "## Usage"] } },
    ],
    tags: ["documentation", "readme"],
    createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Demo Test Suites
// ==========================================

const DEMO_SUITES: TestSuite[] = [
  {
    id: "suite-wix-dashboard",
    name: "Wix CLI Dashboard Pages",
    description: "Test suite for creating Wix CLI dashboard pages with various widgets and layouts",
    scenarioIds: ["scenario-wix-dashboard-stats", "scenario-wix-dashboard-settings", "scenario-wix-dashboard-table"],
    tags: ["wix", "dashboard", "cli"],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suite-ui-components",
    name: "UI Component Generation",
    description: "Test suite for generating reusable UI components with proper accessibility and testing",
    scenarioIds: ["scenario-react-button", "scenario-react-modal"],
    tags: ["ui", "components", "react"],
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suite-api-patterns",
    name: "API Design Patterns",
    description: "Test suite for validating common API design patterns and best practices",
    scenarioIds: ["scenario-api-crud"],
    tags: ["api", "rest", "patterns"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suite-auth-patterns",
    name: "Authentication Patterns",
    description: "Test suite for implementing secure authentication flows",
    scenarioIds: ["scenario-auth-oauth"],
    tags: ["auth", "security", "oauth"],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suite-full-stack",
    name: "Full Stack Application",
    description: "End-to-end test suite covering frontend, API, database, and auth components",
    scenarioIds: ["scenario-react-button", "scenario-api-crud", "scenario-db-ecommerce", "scenario-auth-oauth"],
    tags: ["full-stack", "e2e", "integration"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Failure Analysis Generator
// ==========================================

function generateFailureAnalysis(
  assertionName: string,
  assertionType: string,
  model: string,
  agentName?: string
): FailureAnalysis {
  const agentContext = agentName ? ` using ${agentName}` : "";
  
  const analyses: Record<string, FailureAnalysis> = {
    file_presence: {
      category: "missing_file",
      severity: "critical",
      summary: `Expected file not generated${agentContext}`,
      details: `The skill was expected to create a file but it was not found in the output. This typically indicates the skill misunderstood the file structure requirements.${agentName ? ` ${agentName} may have placed files in a different location.` : ""}`,
      rootCause: `The ${model} model${agentContext} may have:
1. Used a different file naming convention
2. Placed the file in an unexpected directory
3. Failed to generate the file due to context limitations${agentName === "OpenAI Codex CLI" ? "\n4. Codex tends to be more minimal - may have skipped optional files" : ""}`,
      suggestedFix: `1. Check if the file exists under a different name
2. Review the skill's output structure documentation
3. Add explicit path requirements to the skill prompt${agentName === "Claude Code" ? "\n4. Claude Code usually provides detailed explanations - check the output log" : ""}`,
      relatedAssertions: [],
      similarIssues: [`Previous runs with ${agentName || model} had similar path issues`],
    },
    build_check: {
      category: "build_error",
      severity: "critical",
      summary: `Build/compile check failed${agentContext}`,
      details: `The generated code failed to compile or build. This indicates syntax errors, type mismatches, or missing dependencies.${agentName === "OpenAI Codex CLI" ? " Codex may have generated incomplete code." : ""}`,
      rootCause: `Build failures are commonly caused by:
1. TypeScript type errors in generated code
2. Missing import statements
3. Incompatible dependency versions${agentName === "Cursor CLI" ? "\n4. Cursor may have made partial edits assuming existing context" : ""}`,
      suggestedFix: `1. Review TypeScript errors in build output
2. Ensure skill specifies dependency versions
3. Add import validation to assertions`,
      relatedAssertions: [],
      codeSnippet: `// Common fix:\nimport { useState } from 'react';`,
    },
    vitest: {
      category: "test_failure",
      severity: "high",
      summary: `Test suite failed to meet pass threshold${agentContext}`,
      details: `Generated tests are failing or not meeting the minimum pass rate. This could indicate issues with the implementation or test setup.${agentName === "Claude Code" ? " Claude Code usually generates thorough tests - failures may indicate implementation issues." : ""}`,
      rootCause: `Test failures often indicate:
1. Implementation doesn't match test expectations
2. Test setup/teardown issues
3. Async timing problems${agentName === "OpenAI Codex CLI" ? "\n4. Codex may have generated incomplete test coverage" : ""}`,
      suggestedFix: `1. Review specific failing test cases
2. Check for race conditions
3. Verify mock implementations`,
      relatedAssertions: [],
    },
  };

  return analyses[assertionType] || {
    category: "runtime_error",
    severity: "medium",
    summary: `Assertion "${assertionName}" failed${agentContext}`,
    details: `The assertion did not pass validation.`,
    rootCause: "Unable to determine specific cause",
    suggestedFix: "Review assertion configuration and expected output",
    relatedAssertions: [],
  };
}

// ==========================================
// Demo Eval Runs Generator
// ==========================================

// Agent-specific pass rate modifiers
const AGENT_PASS_RATE_MODIFIERS: Record<string, number> = {
  "agent-claude-code": 0.12, // Claude Code is more thorough, higher success
  "agent-codex": -0.08, // Codex is faster but less thorough
  "agent-cursor-cli": 0.05, // Cursor is good with context
};

function generateEvalRuns(): EvalRun[] {
  const runs: EvalRun[] = [];
  const models: ModelConfig[] = [
    { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
    { provider: "openai", model: "gpt-4-turbo", temperature: 0.5, maxTokens: 4096 },
    { provider: "google", model: "gemini-pro", temperature: 0.7, maxTokens: 4096 },
    { provider: "openai", model: "gpt-3.5-turbo", temperature: 0.5, maxTokens: 4096 },
  ];

  const passRates = [0.88, 0.75, 0.68, 0.52]; // Different pass rates per model
  const now = new Date();

  // Generate runs over past 30 days
  for (let dayOffset = 28; dayOffset >= 0; dayOffset -= 2) {
    const runsPerDay = Math.floor(Math.random() * 2) + 1;

    for (let r = 0; r < runsPerDay; r++) {
      const modelIndex = Math.floor(Math.random() * models.length);
      const model = models[modelIndex];
      const basePassRate = passRates[modelIndex];
      
      // Randomly select an agent for some runs (about 70% of runs will have agents)
      const useAgent = Math.random() > 0.3;
      const agent: Agent | undefined = useAgent 
        ? BUILTIN_AGENTS[Math.floor(Math.random() * BUILTIN_AGENTS.length)]
        : undefined;
      
      // Apply agent modifier to pass rate
      const agentModifier = agent ? (AGENT_PASS_RATE_MODIFIERS[agent.id] || 0) : 0;
      const targetPassRate = Math.max(0.3, Math.min(0.98, basePassRate + agentModifier));
      
      const skill = DEMO_SKILLS[Math.floor(Math.random() * DEMO_SKILLS.length)];
      const scenarios = DEMO_SCENARIOS.filter((s) => s.skillId === skill.id);
      if (scenarios.length === 0) continue;

      const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      const skillVersion = skill.versions[Math.floor(Math.random() * skill.versions.length)];

      const results: EvalRunResult[] = [];
      const failureAnalyses: FailureAnalysis[] = [];
      let totalPassed = 0;
      let totalFailed = 0;

      // Generate assertion results
      const assertionResults: AssertionResult[] = selectedScenario.assertions.map((assertion) => {
        const shouldPass = Math.random() < targetPassRate;
        const duration = Math.floor(Math.random() * 2000) + 100;

        if (shouldPass) {
          totalPassed++;
          return {
            id: generateId(),
            assertionId: assertion.id,
            assertionType: assertion.type,
            assertionName: assertion.name,
            status: "passed" as const,
            duration,
          };
        } else {
          totalFailed++;
          const analysis = generateFailureAnalysis(assertion.name, assertion.type, model.model, agent?.name);
          failureAnalyses.push(analysis);
          return {
            id: generateId(),
            assertionId: assertion.id,
            assertionType: assertion.type,
            assertionName: assertion.name,
            status: "failed" as const,
            message: `Assertion failed: ${assertion.name}`,
            duration,
          };
        }
      });

      const totalDuration = assertionResults.reduce((sum, ar) => sum + (ar.duration || 0), 0);
      const passRate = totalPassed + totalFailed > 0 ? (totalPassed / (totalPassed + totalFailed)) * 100 : 0;

      results.push({
        id: generateId(),
        skillVersionId: skillVersion.id,
        modelConfig: model,
        agentId: agent?.id,
        agentName: agent?.name,
        scenarioId: selectedScenario.id,
        scenarioName: selectedScenario.name,
        assertionResults,
        passed: totalPassed,
        failed: totalFailed,
        passRate,
        duration: totalDuration,
        metrics: {
          totalAssertions: totalPassed + totalFailed,
          passed: totalPassed,
          failed: totalFailed,
          skipped: 0,
          errors: 0,
          passRate,
          avgDuration: totalDuration / Math.max(assertionResults.length, 1),
          totalDuration,
        },
      });

      const runDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      runDate.setHours(Math.floor(Math.random() * 12) + 8);

      // Build run name including agent if used
      const agentSuffix = agent ? ` via ${agent.name}` : "";
      const runName = `${skill.name} - ${model.model.split("-").slice(0, 2).join(" ")}${agentSuffix}`;

      runs.push({
        id: generateId(),
        name: runName,
        skillId: skill.id,
        skillName: skill.name,
        config: {
          skillVersionIds: [skillVersion.id],
          scenarioIds: [selectedScenario.id],
          models: [model],
          systemPrompts: ["Default system prompt"],
          agentIds: agent ? [agent.id] : [],
          parallelism: 1,
          timeout: 60000,
        },
        status: "completed",
        progress: 100,
        results,
        aggregateMetrics: {
          totalAssertions: totalPassed + totalFailed,
          passed: totalPassed,
          failed: totalFailed,
          skipped: 0,
          errors: 0,
          passRate,
          avgDuration: totalDuration / Math.max(results.length, 1),
          totalDuration,
        },
        failureAnalyses: failureAnalyses.length > 0 ? failureAnalyses : undefined,
        startedAt: runDate.toISOString(),
        completedAt: new Date(runDate.getTime() + totalDuration + 5000).toISOString(),
      });
    }
  }

  // Also add some agent comparison runs (same skill/scenario, multiple agents)
  runs.push(...generateAgentComparisonRuns());

  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

// Generate runs specifically for comparing agents
function generateAgentComparisonRuns(): EvalRun[] {
  const runs: EvalRun[] = [];
  const now = new Date();
  const model: ModelConfig = { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 };
  
  // Create comparison runs for the React component skill
  const skill = DEMO_SKILLS[0]; // React Component Generator
  const scenario = DEMO_SCENARIOS[0]; // Create Button Component
  const skillVersion = skill.versions[skill.versions.length - 1];

  BUILTIN_AGENTS.forEach((agent, agentIndex) => {
    const agentPassRate = 0.7 + (AGENT_PASS_RATE_MODIFIERS[agent.id] || 0) + (Math.random() * 0.15);
    
    const assertionResults: AssertionResult[] = scenario.assertions.map((assertion) => {
      const shouldPass = Math.random() < agentPassRate;
      const duration = Math.floor(Math.random() * 1500) + 200;
      
      return {
        id: generateId(),
        assertionId: assertion.id,
        assertionType: assertion.type,
        assertionName: assertion.name,
        status: shouldPass ? "passed" as const : "failed" as const,
        message: shouldPass ? undefined : `Failed using ${agent.name}`,
        duration,
      };
    });

    const passed = assertionResults.filter((r) => r.status === "passed").length;
    const failed = assertionResults.filter((r) => r.status === "failed").length;
    const passRate = assertionResults.length > 0 ? (passed / assertionResults.length) * 100 : 0;
    const totalDuration = assertionResults.reduce((sum, r) => sum + (r.duration || 0), 0);

    const results: EvalRunResult[] = [{
      id: generateId(),
      skillVersionId: skillVersion.id,
      modelConfig: model,
      agentId: agent.id,
      agentName: agent.name,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      assertionResults,
      passed,
      failed,
      passRate,
      duration: totalDuration,
      metrics: {
        totalAssertions: passed + failed,
        passed,
        failed,
        skipped: 0,
        errors: 0,
        passRate,
        avgDuration: totalDuration / Math.max(assertionResults.length, 1),
        totalDuration,
      },
    }];

    const runDate = new Date(now.getTime() - (1 + agentIndex) * 60 * 60 * 1000); // 1-3 hours ago

    runs.push({
      id: generateId(),
      name: `Agent Comparison: ${agent.name}`,
      skillId: skill.id,
      skillName: skill.name,
      config: {
        skillVersionIds: [skillVersion.id],
        scenarioIds: [scenario.id],
        models: [model],
        systemPrompts: [],
        agentIds: [agent.id],
        parallelism: 1,
        timeout: 60000,
      },
      status: "completed",
      progress: 100,
      results,
      aggregateMetrics: {
        totalAssertions: passed + failed,
        passed,
        failed,
        skipped: 0,
        errors: 0,
        passRate,
        avgDuration: totalDuration / Math.max(results.length, 1),
        totalDuration,
      },
      startedAt: runDate.toISOString(),
      completedAt: new Date(runDate.getTime() + totalDuration + 3000).toISOString(),
    });
  });

  return runs;
}

// ==========================================
// Demo Agents (CLI-based)
// ==========================================

const DEMO_AGENTS: Agent[] = [
  // Include built-in agents
  ...BUILTIN_AGENTS,
  // Add some custom demo agents
  {
    id: "agent-custom-react",
    type: "custom",
    name: "React Specialist",
    description: "Custom agent optimized for React component generation with template files",
    icon: "component",
    runCommand: "npx",
    runArgs: ["@anthropic-ai/claude-code", "run", "--react-mode"],
    workingDirectory: "./react-workspace",
    templateFiles: [
      { targetPath: "tsconfig.json", content: '{"compilerOptions": {"jsx": "react-jsx"}}' },
      { targetPath: ".eslintrc", content: '{"extends": ["react-app"]}' },
    ],
    envVars: {
      NODE_ENV: "development",
      REACT_STRICT_MODE: "true",
    },
    modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
    capabilities: [
      "React component generation",
      "TypeScript support",
      "Storybook integration",
      "Testing Library setup",
    ],
    isBuiltIn: false,
    isDefault: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "agent-custom-api",
    type: "custom",
    name: "API Builder",
    description: "Custom agent for building REST APIs with Express/Fastify",
    icon: "server",
    runCommand: "npx",
    runArgs: ["@openai/codex", "run", "--api-mode"],
    workingDirectory: "./api-workspace",
    envVars: {
      NODE_ENV: "development",
    },
    modelConfig: { provider: "openai", model: "gpt-4-turbo", temperature: 0.5, maxTokens: 4096 },
    capabilities: [
      "REST API generation",
      "OpenAPI documentation",
      "Input validation",
      "Error handling",
    ],
    isBuiltIn: false,
    isDefault: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ==========================================
  // Wix Vibe Agents (Site Building with AI)
  // ==========================================
  {
    id: "agent-wix-vibe-site",
    type: "custom",
    name: "Wix Vibe - Site Builder",
    description: "AI-powered site building agent that creates complete Wix websites from natural language descriptions",
    icon: "globe",
    runCommand: "npx",
    runArgs: ["@wix/vibe-cli", "build", "--mode=site"],
    workingDirectory: "./wix-site",
    templateFiles: [
      { targetPath: "wix.config.json", content: '{"type": "site", "framework": "vibe"}' },
    ],
    envVars: {
      WIX_ENV: "development",
      VIBE_MODE: "interactive",
    },
    modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.4, maxTokens: 8192 },
    capabilities: [
      "Full site generation from prompts",
      "Page layout creation",
      "Section and widget placement",
      "Theme and styling application",
      "Responsive design",
    ],
    isBuiltIn: false,
    isDefault: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "agent-wix-vibe-component",
    type: "custom",
    name: "Wix Vibe - Component Builder",
    description: "AI-powered component building agent that creates reusable Wix components and widgets",
    icon: "component",
    runCommand: "npx",
    runArgs: ["@wix/vibe-cli", "build", "--mode=component"],
    workingDirectory: "./wix-components",
    templateFiles: [
      { targetPath: "wix.config.json", content: '{"type": "component", "framework": "vibe"}' },
    ],
    envVars: {
      WIX_ENV: "development",
      VIBE_MODE: "component",
    },
    modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
    capabilities: [
      "Custom component generation",
      "Widget creation",
      "Props and state management",
      "Animation support",
      "Accessibility compliance",
    ],
    isBuiltIn: false,
    isDefault: false,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ==========================================
  // Wix App Builder Agents
  // ==========================================
  {
    id: "agent-wix-app-dashboard",
    type: "custom",
    name: "Wix App Builder - Dashboard App",
    description: "AI agent for building Wix dashboard applications with full CRUD functionality",
    icon: "layout-dashboard",
    runCommand: "npx",
    runArgs: ["@wix/app-builder", "create", "--type=dashboard"],
    workingDirectory: "./wix-app",
    templateFiles: [
      { targetPath: "wix.config.json", content: '{"type": "app", "appType": "dashboard"}' },
      { targetPath: "tsconfig.json", content: '{"compilerOptions": {"jsx": "react-jsx", "strict": true}}' },
    ],
    envVars: {
      WIX_ENV: "development",
      APP_TYPE: "dashboard",
    },
    modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
    capabilities: [
      "Dashboard page generation",
      "Wix Design System integration",
      "Data management with Wix SDK",
      "Settings pages",
      "Multi-page navigation",
    ],
    isBuiltIn: false,
    isDefault: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "agent-wix-app-widget",
    type: "custom",
    name: "Wix App Builder - Widget App",
    description: "AI agent for building Wix widget applications that can be embedded in sites",
    icon: "puzzle",
    runCommand: "npx",
    runArgs: ["@wix/app-builder", "create", "--type=widget"],
    workingDirectory: "./wix-widget-app",
    templateFiles: [
      { targetPath: "wix.config.json", content: '{"type": "app", "appType": "widget"}' },
    ],
    envVars: {
      WIX_ENV: "development",
      APP_TYPE: "widget",
    },
    modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.4, maxTokens: 8192 },
    capabilities: [
      "Embeddable widget creation",
      "Settings panel integration",
      "Responsive widget layouts",
      "Site interaction APIs",
      "Widget SDK usage",
    ],
    isBuiltIn: false,
    isDefault: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "agent-wix-app-blocks",
    type: "custom",
    name: "Wix App Builder - Blocks App",
    description: "AI agent for building Wix Blocks applications with visual components",
    icon: "blocks",
    runCommand: "npx",
    runArgs: ["@wix/app-builder", "create", "--type=blocks"],
    workingDirectory: "./wix-blocks-app",
    templateFiles: [
      { targetPath: "wix.config.json", content: '{"type": "app", "appType": "blocks"}' },
    ],
    envVars: {
      WIX_ENV: "development",
      APP_TYPE: "blocks",
    },
    modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.4, maxTokens: 8192 },
    capabilities: [
      "Blocks component creation",
      "Visual panel design",
      "Props API definition",
      "Preset configurations",
      "Documentation generation",
    ],
    isBuiltIn: false,
    isDefault: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Demo Target Groups
// ==========================================

const DEMO_TARGET_GROUPS: TargetGroup[] = [
  {
    id: "tg-react-development",
    name: "React Development",
    description: "Targets for React component development and testing",
    targets: [
      {
        id: "target-react-skill",
        type: "agent_skill",
        skillId: "skill-react-component",
      },
      {
        id: "target-claude-code",
        type: "coding_agent",
        agentId: "agent-claude-code",
      },
      {
        id: "target-codex",
        type: "coding_agent",
        agentId: "agent-codex",
      },
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tg-api-testing",
    name: "API Testing Suite",
    description: "Targets for API endpoint testing with custom prompt agents",
    targets: [
      {
        id: "target-api-skill",
        type: "agent_skill",
        skillId: "skill-api-endpoint",
      },
      {
        id: "target-api-validator",
        type: "prompt_agent",
        promptAgentConfig: {
          name: "API Validator Agent",
          description: "A prompt agent specialized in validating REST API responses",
          systemPrompt: `You are an API validation specialist. Your job is to:
1. Analyze API endpoint implementations
2. Check for proper error handling
3. Validate request/response schemas
4. Ensure RESTful best practices are followed

When reviewing code, focus on:
- HTTP status codes
- Request validation
- Response consistency
- Error messages`,
          mcpServers: [
            {
              name: "api-tools",
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-api-tools"],
              envVars: { API_BASE_URL: "http://localhost:3000" },
            },
          ],
          modelConfig: {
            provider: "anthropic",
            model: "claude-3-5-sonnet-20241022",
            temperature: 0.3,
            maxTokens: 4096,
          },
        },
      },
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tg-full-stack",
    name: "Full Stack Evaluation",
    description: "Comprehensive targets for full-stack application testing",
    targets: [
      {
        id: "target-react-fs",
        type: "agent_skill",
        skillId: "skill-react-component",
      },
      {
        id: "target-api-fs",
        type: "agent_skill",
        skillId: "skill-api-endpoint",
      },
      {
        id: "target-db-fs",
        type: "agent_skill",
        skillId: "skill-database-schema",
      },
      {
        id: "target-claude-fs",
        type: "coding_agent",
        agentId: "agent-claude-code",
      },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tg-wix-dashboard",
    name: "Wix Dashboard Components",
    description: "Targets for Wix CLI dashboard page development",
    targets: [
      {
        id: "target-wix-prompt",
        type: "prompt_agent",
        promptAgentConfig: {
          name: "Wix Dashboard Expert",
          description: "Specialized agent for Wix CLI dashboard development",
          systemPrompt: `You are a Wix CLI dashboard development expert. You specialize in:
1. Creating dashboard pages with Wix Design System
2. Implementing stats widgets and data tables
3. Building settings and configuration pages
4. Using Wix SDK for data fetching

Follow Wix CLI best practices:
- Use @wix/design-system components
- Implement proper loading states
- Handle errors gracefully
- Support dark/light themes`,
          mcpServers: [
            {
              name: "wix-sdk",
              command: "npx",
              args: ["-y", "@wix/mcp-server"],
            },
            {
              name: "filesystem",
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"],
            },
          ],
          modelConfig: {
            provider: "anthropic",
            model: "claude-3-5-sonnet-20241022",
            temperature: 0.4,
            maxTokens: 8192,
          },
        },
      },
      {
        id: "target-cursor-wix",
        type: "coding_agent",
        agentId: "agent-cursor-cli",
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ==========================================
  // Wix Dashboard Page Target Group
  // ==========================================
  {
    id: "tg-wix-dashboard-page",
    name: "Wix Dashboard Page Development",
    description: "All variants of Dashboard page coding skills for comprehensive evaluation",
    targets: [
      {
        id: "target-dash-basic",
        type: "agent_skill",
        skillId: "skill-wix-dashboard-basic",
      },
      {
        id: "target-dash-advanced",
        type: "agent_skill",
        skillId: "skill-wix-dashboard-advanced",
      },
      
    ],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ==========================================
  // Wix Backend Target Group
  // ==========================================
  {
    id: "tg-wix-backend",
    name: "Wix Backend Development",
    description: "All variants of Backend coding skills for HTTP Functions and Velo development",
    targets: [
      {
        id: "target-backend-http",
        type: "agent_skill",
        skillId: "skill-wix-backend-http",
      },
      {
        id: "target-backend-velo",
        type: "agent_skill",
        skillId: "skill-wix-backend-velo",
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ==========================================
  // Wix App Builder Target Group
  // ==========================================
  {
    id: "tg-wix-app-builder",
    name: "Wix App Builder",
    description: "All App Builder coding agents for building Wix applications",
    targets: [
      {
        id: "target-app-dashboard",
        type: "coding_agent",
        agentId: "agent-wix-app-dashboard",
      },
      {
        id: "target-app-widget",
        type: "coding_agent",
        agentId: "agent-wix-app-widget",
      },
      {
        id: "target-app-blocks",
        type: "coding_agent",
        agentId: "agent-wix-app-blocks",
      },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ==========================================
  // Wix Vibe Target Group
  // ==========================================
  {
    id: "tg-wix-vibe",
    name: "Wix Vibe",
    description: "Wix Vibe AI agents for site and component building",
    targets: [
      {
        id: "target-vibe-site",
        type: "coding_agent",
        agentId: "agent-wix-vibe-site",
      },
      {
        id: "target-vibe-component",
        type: "coding_agent",
        agentId: "agent-wix-vibe-component",
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ==========================================
  // Wix Chat Target Group
  // ==========================================
  {
    id: "tg-wix-chat",
    name: "Wix Chat",
    description: "All Wix Chat prompt agent variants with MCP integration",
    targets: [
      {
        id: "target-chat-general",
        type: "prompt_agent",
        promptAgentId: "pa-wix-chat-general",
      },
      {
        id: "target-chat-dashboard",
        type: "prompt_agent",
        promptAgentId: "pa-wix-chat-dashboard",
      },
      {
        id: "target-chat-backend",
        type: "prompt_agent",
        promptAgentId: "pa-wix-chat-backend",
      },
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Demo Prompt Agents
// ==========================================

const DEMO_PROMPT_AGENTS: PromptAgent[] = [
  {
    id: "pa-react-specialist",
    name: "React Specialist",
    description: "An expert React developer specialized in modern React patterns, hooks, and TypeScript.",
    systemPrompt: `You are an expert React developer. Your specialties include:
1. Modern React patterns (hooks, context, suspense)
2. TypeScript with strict mode
3. Component composition and reusability
4. Performance optimization with React.memo, useMemo, useCallback
5. Testing with React Testing Library

When generating code:
- Always use functional components with TypeScript
- Include proper type definitions
- Add JSDoc comments for complex logic
- Follow accessibility best practices`,
    mcpServers: [
      {
        name: "filesystem",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"],
      },
    ],
    modelConfig: {
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.3,
      maxTokens: 8192,
    },
    tags: ["react", "typescript", "frontend"],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pa-api-architect",
    name: "API Architect",
    description: "Designs and implements RESTful APIs with best practices for security and performance.",
    systemPrompt: `You are an API architecture expert. You specialize in:
1. RESTful API design
2. OpenAPI/Swagger specifications
3. Authentication and authorization patterns
4. Rate limiting and caching strategies
5. Error handling and status codes

When designing APIs:
- Follow REST conventions strictly
- Use proper HTTP methods and status codes
- Include comprehensive error responses
- Document all endpoints with OpenAPI`,
    mcpServers: [
      {
        name: "api-tools",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-api-tools"],
        envVars: { API_BASE_URL: "http://localhost:3000" },
      },
    ],
    modelConfig: {
      provider: "openai",
      model: "gpt-4-turbo-preview",
      temperature: 0.2,
      maxTokens: 4096,
    },
    tags: ["api", "backend", "rest"],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pa-code-reviewer",
    name: "Code Reviewer",
    description: "Performs thorough code reviews focusing on quality, security, and best practices.",
    systemPrompt: `You are a senior code reviewer. Your reviews focus on:
1. Code quality and maintainability
2. Security vulnerabilities
3. Performance issues
4. Best practices adherence
5. Testing coverage

When reviewing:
- Provide specific, actionable feedback
- Explain why changes are recommended
- Prioritize issues by severity
- Suggest concrete improvements`,
    mcpServers: [],
    modelConfig: {
      provider: "anthropic",
      model: "claude-3-opus-20240229",
      temperature: 0.1,
      maxTokens: 4096,
    },
    tags: ["review", "quality", "security"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ==========================================
  // Wix Chat Prompt Agents
  // ==========================================
  {
    id: "pa-wix-chat-general",
    name: "Wix Chat - General",
    description: "General-purpose Wix development assistant with access to Wix MCP for all development tasks.",
    systemPrompt: `You are a Wix development expert assistant. You help developers with all aspects of Wix application development.

Your expertise includes:
1. Wix CLI and project setup
2. Dashboard page development
3. Backend development (HTTP Functions, Velo)
4. Wix SDK and APIs
5. Wix Design System components
6. App deployment and publishing

Guidelines:
- Always use @wix/design-system for UI components
- Follow Wix best practices for performance
- Include proper error handling
- Support both TypeScript and JavaScript
- Provide complete, working code examples

When helping users:
- Ask clarifying questions when requirements are unclear
- Suggest the most appropriate Wix APIs for the task
- Explain trade-offs between different approaches
- Include relevant documentation links`,
    mcpServers: [
      {
        name: "wix-mcp",
        command: "npx",
        args: ["-y", "@anthropic-ai/mcp-wix"],
        envVars: { WIX_ENV: "development" },
      },
      {
        name: "filesystem",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"],
      },
    ],
    modelConfig: {
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.3,
      maxTokens: 8192,
    },
    tags: ["wix", "chat", "general", "mcp"],
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pa-wix-chat-dashboard",
    name: "Wix Chat - Dashboard Expert",
    description: "Specialized Wix assistant focused on dashboard page development with deep Design System knowledge.",
    systemPrompt: `You are a Wix Dashboard development expert. You specialize exclusively in creating beautiful, functional dashboard pages for Wix applications.

Your deep expertise includes:
1. Wix Dashboard page architecture
2. @wix/design-system component library mastery
3. Dashboard widgets (Stats, Tables, Cards, Charts)
4. Settings pages and configuration UIs
5. Modal workflows and form patterns
6. Dark/light theme implementation

Best Practices:
- Always use proper loading states with <Loader />
- Implement error boundaries and fallback UIs
- Use <Page.Header />, <Page.Content /> for structure
- Apply consistent spacing with design tokens
- Support keyboard navigation
- Test with screen readers

Code Patterns:
- Use React Query or SWR for data fetching
- Implement optimistic updates
- Cache appropriately
- Handle offline states

When generating code:
- Include all necessary imports from @wix/design-system
- Use TypeScript with proper type annotations
- Add accessibility attributes (aria-*, role)
- Include loading, error, and empty states`,
    mcpServers: [
      {
        name: "wix-mcp",
        command: "npx",
        args: ["-y", "@anthropic-ai/mcp-wix"],
        envVars: { WIX_ENV: "development" },
      },
      {
        name: "wix-design-docs",
        command: "npx",
        args: ["-y", "@wix/design-system-mcp"],
      },
    ],
    modelConfig: {
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.2,
      maxTokens: 8192,
    },
    tags: ["wix", "chat", "dashboard", "design-system", "mcp"],
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pa-wix-chat-backend",
    name: "Wix Chat - Backend Expert",
    description: "Specialized Wix assistant focused on backend development including HTTP Functions, Velo, and data management.",
    systemPrompt: `You are a Wix Backend development expert. You specialize exclusively in server-side development for Wix applications.

Your deep expertise includes:
1. Wix HTTP Functions
2. Velo backend modules
3. Wix Data collections and queries
4. Scheduled jobs and triggers
5. Authentication and permissions
6. External API integrations
7. Secrets management

HTTP Functions Best Practices:
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Validate all input parameters
- Return appropriate status codes
- Handle errors gracefully
- Use consistent response formats

Wix Data Best Practices:
- Create efficient queries with proper indexes
- Use bulk operations for large datasets
- Implement proper permissions
- Handle concurrent updates
- Use references for related data

Security Guidelines:
- Never expose sensitive data in responses
- Validate and sanitize all inputs
- Use wix-secrets-backend for API keys
- Implement rate limiting when needed
- Log security-relevant events

When generating code:
- Include comprehensive error handling
- Add proper TypeScript types
- Document API contracts
- Include example requests/responses`,
    mcpServers: [
      {
        name: "wix-mcp",
        command: "npx",
        args: ["-y", "@anthropic-ai/mcp-wix"],
        envVars: { WIX_ENV: "development" },
      },
      {
        name: "wix-data-mcp",
        command: "npx",
        args: ["-y", "@wix/data-mcp"],
      },
    ],
    modelConfig: {
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.2,
      maxTokens: 8192,
    },
    tags: ["wix", "chat", "backend", "http", "velo", "mcp"],
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Demo Improvement Runs
// ==========================================

const DEMO_IMPROVEMENT_RUNS: ImprovementRun[] = [
  {
    id: "improve-run-1",
    targetType: "prompt_agent",
    targetId: "pa-wix-chat-dashboard",
    targetName: "Wix Chat - Dashboard Expert",
    status: "completed",
    maxIterations: 3,
    iterations: [
      {
        id: "iter-1-1",
        iterationNumber: 1,
        passRate: 62,
        passed: 5,
        failed: 3,
        changes: [],
        feedback: "Initial evaluation shows issues with loading state handling and accessibility. The system prompt lacks specific guidance on error boundaries and ARIA attributes.",
        targetSnapshot: {
          systemPrompt: "You are a Wix Dashboard development expert...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-1-2",
        iterationNumber: 2,
        passRate: 78,
        passed: 7,
        failed: 2,
        changes: [
          {
            field: "systemPrompt",
            before: "...Follow Wix CLI best practices",
            after: "...Follow Wix CLI best practices\n\nAccessibility Requirements:\n- Always include ARIA labels on interactive elements\n- Implement focus management in modals\n- Use semantic HTML elements",
            reason: "Added explicit accessibility guidelines to improve a11y test pass rate",
          },
          {
            field: "temperature",
            before: "0.4",
            after: "0.2",
            reason: "Reduced temperature for more consistent output format",
          },
        ],
        feedback: "Improved accessibility handling. Still failing on complex state management scenarios. Adding more specific guidance on React Query patterns.",
        targetSnapshot: {
          systemPrompt: "You are a Wix Dashboard development expert... (updated with a11y)",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-1-3",
        iterationNumber: 3,
        passRate: 91,
        passed: 8,
        failed: 1,
        changes: [
          {
            field: "systemPrompt",
            before: "...Use React Query or SWR for data fetching",
            after: "...Use React Query or SWR for data fetching\n\nState Management Patterns:\n- Use useQuery with proper staleTime and cacheTime\n- Implement optimistic updates with useMutation\n- Handle loading/error/success states explicitly",
            reason: "Added detailed React Query guidance to fix state management failures",
          },
        ],
        feedback: "Significant improvement achieved. The remaining failure is an edge case with very large datasets. Consider this acceptable for now.",
        targetSnapshot: {
          systemPrompt: "You are a Wix Dashboard development expert... (final version)",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    initialPassRate: 62,
    finalPassRate: 91,
    improvement: 29,
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "improve-run-2",
    targetType: "skill",
    targetId: "skill-wix-dashboard-basic",
    targetName: "Wix Dashboard Page - Basic",
    status: "completed",
    maxIterations: 3,
    iterations: [
      {
        id: "iter-2-1",
        iterationNumber: 1,
        passRate: 55,
        passed: 4,
        failed: 4,
        changes: [],
        feedback: "Initial evaluation shows the skill generates inconsistent file structures. Missing proper index.ts exports and CSS module patterns.",
        targetSnapshot: {
          skillMd: "# Wix Dashboard Page - Basic\n\nCreate basic dashboard pages...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-2-2",
        iterationNumber: 2,
        passRate: 72,
        passed: 6,
        failed: 2,
        changes: [
          {
            field: "skillMd",
            before: "## Output Structure\n\n```\nsrc/dashboard/pages/{PageName}/\n├── page.tsx\n├── page.module.css\n└── index.ts\n```",
            after: "## Output Structure\n\n```\nsrc/dashboard/pages/{PageName}/\n├── page.tsx        // Main page component\n├── page.module.css // Scoped styles using CSS modules\n└── index.ts        // Re-exports: export { default } from './page'\n```\n\n**IMPORTANT**: Always create the index.ts file with proper exports.",
            reason: "Added explicit file structure requirements with detailed comments",
          },
        ],
        feedback: "File structure is now consistent. Still seeing issues with Design System component usage. Some generated code uses custom components instead of @wix/design-system.",
        targetSnapshot: {
          skillMd: "# Wix Dashboard Page - Basic (v2)\n\nCreate basic dashboard pages...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-2-3",
        iterationNumber: 3,
        passRate: 88,
        passed: 7,
        failed: 1,
        changes: [
          {
            field: "skillMd",
            before: "## Capabilities\n\n- Create dashboard pages with standard layouts",
            after: "## Capabilities\n\n- Create dashboard pages with standard layouts\n\n## Required Components\n\nYou MUST use these @wix/design-system components:\n- `Page`, `Page.Header`, `Page.Content` for layout\n- `Card` for content sections\n- `Table` for data display\n- `Button`, `IconButton` for actions\n- `Loader` for loading states\n\nDo NOT create custom components for these patterns.",
            reason: "Added explicit component requirements to enforce Design System usage",
          },
        ],
        feedback: "Excellent improvement. The skill now consistently uses Design System components and proper file structure.",
        targetSnapshot: {
          skillMd: "# Wix Dashboard Page - Basic (final)\n\nCreate basic dashboard pages...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    initialPassRate: 55,
    finalPassRate: 88,
    improvement: 33,
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "improve-run-3",
    targetType: "prompt_agent",
    targetId: "pa-wix-chat-backend",
    targetName: "Wix Chat - Backend Expert",
    status: "running",
    maxIterations: 3,
    iterations: [
      {
        id: "iter-3-1",
        iterationNumber: 1,
        passRate: 68,
        passed: 6,
        failed: 3,
        changes: [],
        feedback: "Initial evaluation reveals issues with error handling patterns and input validation. The agent sometimes forgets to validate required parameters.",
        targetSnapshot: {
          systemPrompt: "You are a Wix Backend development expert...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
    initialPassRate: 68,
    finalPassRate: 68,
    improvement: 0,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Export Demo Data Generator
// ==========================================

export function generateDemoData(): {
  skills: Skill[];
  testScenarios: TestScenario[];
  testSuites: TestSuite[];
  targetGroups: TargetGroup[];
  promptAgents: PromptAgent[];
  evalRuns: EvalRun[];
  agents: Agent[];
  codingTools: CodingTool[];
  improvementRuns: ImprovementRun[];
} {
  return {
    skills: DEMO_SKILLS,
    testScenarios: DEMO_SCENARIOS,
    testSuites: DEMO_SUITES,
    targetGroups: DEMO_TARGET_GROUPS,
    promptAgents: DEMO_PROMPT_AGENTS,
    evalRuns: generateEvalRuns(),
    agents: DEMO_AGENTS,
    codingTools: [...BUILTIN_TOOLS],
    improvementRuns: DEMO_IMPROVEMENT_RUNS,
  };
}
