/**
 * Wix Dashboard Project Demo Data
 * Skills, Scenarios, Suites, Target Groups, Prompt Agents, Improvement Runs
 */

import type {
  Skill,
  TestScenario,
  TestSuite,
  TargetGroup,
  PromptAgent,
  ImprovementRun,
  Agent,
} from "@lib/types";
import { createSkill, WIX_APP_BUILDER_PROJECT_ID } from "./shared";

// ==========================================
// Wix App Builder Agent (project-specific)
// ==========================================

export const WIX_APP_BUILDER_AGENT: Agent = {
  id: "agent-wix-app-builder",
  type: "custom",
  name: "Wix App Builder",
  description: "AI agent for building Wix applications including dashboard apps, widgets, and Blocks components",
  icon: "layout-dashboard",
  runCommand: "npx",
  runArgs: ["@wix/app-builder", "create"],
  workingDirectory: "./wix-app",
  templateFiles: [
    { targetPath: "wix.config.json", content: '{"type": "app"}' },
    { targetPath: "tsconfig.json", content: '{"compilerOptions": {"jsx": "react-jsx", "strict": true}}' },
  ],
  envVars: {
    WIX_ENV: "development",
  },
  modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
  capabilities: [
    "Dashboard page generation",
    "Widget app creation",
    "Blocks component development",
    "Wix Design System integration",
    "Data management with Wix SDK",
    "Settings and configuration pages",
  ],
  isBuiltIn: false,
  isDefault: false,
  createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};

// ==========================================
// Wix Dashboard Skills
// ==========================================

export const WIX_SKILLS: Skill[] = [
  createSkill(
    "skill-wix-dashboard-basic",
    WIX_APP_BUILDER_PROJECT_ID,
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
    WIX_APP_BUILDER_PROJECT_ID,
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
  createSkill(
    "skill-wix-backend-http",
    WIX_APP_BUILDER_PROJECT_ID,
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
    WIX_APP_BUILDER_PROJECT_ID,
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
// Wix Dashboard Test Scenarios
// ==========================================

export const WIX_SCENARIOS: TestScenario[] = [
  {
    id: "scenario-wix-dashboard-stats",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
];

// ==========================================
// Wix Dashboard Test Suites
// ==========================================

export const WIX_SUITES: TestSuite[] = [
  {
    id: "suite-wix-dashboard",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Wix CLI Dashboard Pages",
    description: "Test suite for creating Wix CLI dashboard pages with various widgets and layouts",
    scenarioIds: ["scenario-wix-dashboard-stats", "scenario-wix-dashboard-settings", "scenario-wix-dashboard-table"],
    tags: ["wix", "dashboard", "cli"],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Dashboard Target Groups
// ==========================================

export const WIX_TARGET_GROUPS: TargetGroup[] = [
  {
    id: "tg-wix-dashboard",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
  {
    id: "tg-wix-dashboard-page",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
  {
    id: "tg-wix-backend",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
  {
    id: "tg-wix-app-builder",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Wix App Builder",
    description: "Wix App Builder coding agent for building Wix applications",
    targets: [
      {
        id: "target-app-builder",
        type: "coding_agent",
        agentId: "agent-wix-app-builder",
      },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Dashboard Prompt Agents
// ==========================================

export const WIX_PROMPT_AGENTS: PromptAgent[] = [
  {
    id: "pa-wix-chat-general",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
    projectId: WIX_APP_BUILDER_PROJECT_ID,
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
// Wix Dashboard Improvement Runs
// ==========================================

export const WIX_IMPROVEMENT_RUNS: ImprovementRun[] = [
  {
    id: "improve-run-1",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetType: "prompt_agent",
    targetId: "pa-wix-chat-dashboard",
    targetName: "Wix Chat - Dashboard Expert",
    testSuiteId: "suite-wix-dashboard",
    testSuiteName: "Wix CLI Dashboard Pages",
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
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetType: "skill",
    targetId: "skill-wix-dashboard-basic",
    targetName: "Wix Dashboard Page - Basic",
    testSuiteId: "suite-wix-dashboard",
    testSuiteName: "Wix CLI Dashboard Pages",
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
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetType: "prompt_agent",
    targetId: "pa-wix-chat-backend",
    targetName: "Wix Chat - Backend Expert",
    testSuiteId: "suite-api-patterns",
    testSuiteName: "API Design Patterns",
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
