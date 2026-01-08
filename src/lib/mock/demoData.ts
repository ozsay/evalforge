/**
 * Demo Data Generator
 * Creates realistic demo data showing insights from the evaluation system
 */

import { generateId } from "@lib/utils";
import type {
  Skill,
  SkillVersion,
  TestScenario,
  TestSuite,
  EvalRun,
  EvalRunResult,
  AssertionResult,
  Agent,
  ModelConfig,
  FailureAnalysis,
  CodingTool,
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
  versions: Omit<SkillVersion, "skillId">[]
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
    ]
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
];

// ==========================================
// Demo Test Scenarios
// ==========================================

const DEMO_SCENARIOS: TestScenario[] = [
  // Skill-linked scenarios
  {
    id: "scenario-react-button",
    skillId: "skill-react-component",
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
    skillId: "skill-react-component",
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
    skillId: "skill-api-endpoint",
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
    skillId: "skill-database-schema",
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
    skillId: "skill-unit-tests",
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
    skillId: "skill-auth-flow",
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
  // Suite-only scenarios (no skill assigned)
  {
    id: "scenario-wix-dashboard-stats",
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
];

// ==========================================
// Export Demo Data Generator
// ==========================================

export function generateDemoData(): {
  skills: Skill[];
  testScenarios: TestScenario[];
  testSuites: TestSuite[];
  evalRuns: EvalRun[];
  agents: Agent[];
  codingTools: CodingTool[];
} {
  return {
    skills: DEMO_SKILLS,
    testScenarios: DEMO_SCENARIOS,
    testSuites: DEMO_SUITES,
    evalRuns: generateEvalRuns(),
    agents: DEMO_AGENTS,
    codingTools: [...BUILTIN_TOOLS],
  };
}
