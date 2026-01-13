/**
 * Wix Chat Project Demo Data
 * Evaluates Wix Chat AI assistant with Wix MCP integration
 * No skills or coding agents - only prompt agents
 */

import type {
  TestScenario,
  TestSuite,
  TargetGroup,
  PromptAgent,
  ImprovementRun,
} from "@lib/types";
import { WIX_CHAT_PROJECT_ID } from "./shared";

// ==========================================
// Wix Chat Prompt Agent
// ==========================================

export const WIX_CHAT_PROMPT_AGENT: PromptAgent = {
  id: "pa-wix-chat",
  projectId: WIX_CHAT_PROJECT_ID,
  name: "Wix Chat",
  description: "AI-powered Wix development assistant with access to Wix platform insights via MCP",
  systemPrompt: `You are Wix Chat, an AI assistant specialized in helping developers build Wix applications. You have access to Wix platform insights through the Wix MCP (Model Context Protocol) server.

Your capabilities include:
1. Understanding Wix platform architecture and APIs
2. Providing code examples for Wix CLI, Dashboard pages, and Backend functions
3. Answering questions about Wix Design System components
4. Helping with Wix Data collections, HTTP Functions, and Velo backend
5. Providing best practices for Wix app development

When helping users:
- Use Wix MCP to fetch real-time platform information when needed
- Provide accurate, up-to-date code examples
- Reference official Wix documentation
- Suggest the most appropriate Wix APIs and patterns
- Explain Wix-specific concepts clearly

Guidelines:
- Always verify information through Wix MCP when possible
- Use @wix/design-system components in UI examples
- Follow Wix security and performance best practices
- Include proper error handling in code examples`,
  mcpServers: [
    {
      name: "wix-mcp",
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-wix"],
      envVars: { WIX_ENV: "development" },
    },
  ],
  modelConfig: {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.3,
    maxTokens: 8192,
  },
  tags: ["wix", "chat", "mcp", "assistant"],
  createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};

export const WIX_CHAT_PROMPT_AGENTS: PromptAgent[] = [WIX_CHAT_PROMPT_AGENT];

// ==========================================
// Wix Chat Test Scenarios
// ==========================================

export const WIX_CHAT_SCENARIOS: TestScenario[] = [
  {
    id: "scenario-wix-chat-dashboard-help",
    projectId: WIX_CHAT_PROJECT_ID,
    suiteIds: ["suite-wix-chat-general"],
    name: "Dashboard Page Creation Help",
    description: "Test Wix Chat's ability to help create a dashboard page",
    triggerPrompt: "Help me create a dashboard page in Wix CLI. Generate the complete code file with stats widgets using @wix/design-system.",
    expectedFiles: [
      { path: "src/dashboard/pages/stats/page.tsx" },
    ],
    assertions: [
      {
        id: "a-chat-1",
        type: "file_presence",
        name: "Dashboard page file exists",
        paths: ["src/dashboard/pages/stats/page.tsx"],
        shouldExist: true,
      },
      {
        id: "a-chat-2",
        type: "file_content",
        name: "Uses Design System",
        path: "src/dashboard/pages/stats/page.tsx",
        checks: {
          contains: ["@wix/design-system", "Page", "import"],
        },
      },
      {
        id: "a-chat-3",
        type: "file_content",
        name: "Includes proper structure",
        path: "src/dashboard/pages/stats/page.tsx",
        checks: {
          contains: ["Page.Header", "Page.Content"],
        },
      },
    ],
    tags: ["wix", "chat", "dashboard", "help"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-wix-chat-http-functions",
    projectId: WIX_CHAT_PROJECT_ID,
    suiteIds: ["suite-wix-chat-backend"],
    name: "HTTP Functions Guidance",
    description: "Test Wix Chat's knowledge of HTTP Functions",
    triggerPrompt: "Help me create an HTTP Function in Wix that handles POST requests with validation. Generate the complete code file.",
    expectedFiles: [
      { path: "backend/http-functions.ts" },
    ],
    assertions: [
      {
        id: "a-chat-4",
        type: "file_presence",
        name: "HTTP Functions file exists",
        paths: ["backend/http-functions.ts"],
        shouldExist: true,
      },
      {
        id: "a-chat-5",
        type: "file_content",
        name: "Includes validation",
        path: "backend/http-functions.ts",
        checks: {
          contains: ["validate", "validation", "POST", "post"],
        },
      },
      {
        id: "a-chat-6",
        type: "file_content",
        name: "Shows proper error handling",
        path: "backend/http-functions.ts",
        checks: {
          contains: ["error", "catch", "try", "Error"],
        },
      },
    ],
    tags: ["wix", "chat", "backend", "http"],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-wix-chat-data-collections",
    projectId: WIX_CHAT_PROJECT_ID,
    suiteIds: ["suite-wix-chat-backend"],
    name: "Wix Data Collections Query",
    description: "Test Wix Chat's ability to explain Wix Data queries",
    triggerPrompt: "Help me create a function that queries a Wix Data collection with filters and sorting. Generate the complete code file.",
    expectedFiles: [
      { path: "backend/data-queries.ts" },
    ],
    assertions: [
      {
        id: "a-chat-7",
        type: "file_presence",
        name: "Data queries file exists",
        paths: ["backend/data-queries.ts"],
        shouldExist: true,
      },
      {
        id: "a-chat-8",
        type: "file_content",
        name: "Shows filter example",
        path: "backend/data-queries.ts",
        checks: {
          contains: ["filter", "eq", "gt", "lt", "ne", "wix-data"],
        },
      },
      {
        id: "a-chat-9",
        type: "file_content",
        name: "Includes sorting",
        path: "backend/data-queries.ts",
        checks: {
          contains: ["sort", "ascending", "descending", "order"],
        },
      },
    ],
    tags: ["wix", "chat", "data", "collections"],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-wix-chat-design-system",
    projectId: WIX_CHAT_PROJECT_ID,
    suiteIds: ["suite-wix-chat-general"],
    name: "Design System Component Usage",
    description: "Test Wix Chat's knowledge of Design System components",
    triggerPrompt: "Help me create a form component with validation using Wix Design System. Generate the complete code file.",
    expectedFiles: [
      { path: "src/components/Form.tsx" },
    ],
    assertions: [
      {
        id: "a-chat-10",
        type: "file_presence",
        name: "Form component exists",
        paths: ["src/components/Form.tsx"],
        shouldExist: true,
      },
      {
        id: "a-chat-11",
        type: "file_content",
        name: "Uses Design System components",
        path: "src/components/Form.tsx",
        checks: {
          contains: ["@wix/design-system", "TextField", "Button"],
        },
      },
      {
        id: "a-chat-12",
        type: "file_content",
        name: "Includes validation",
        path: "src/components/Form.tsx",
        checks: {
          contains: ["validate", "error", "required"],
        },
      },
    ],
    tags: ["wix", "chat", "design-system", "forms"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-wix-chat-mcp-usage",
    projectId: WIX_CHAT_PROJECT_ID,
    suiteIds: ["suite-wix-chat-general"],
    name: "MCP Server Integration",
    description: "Test if Wix Chat uses MCP to fetch platform information",
    triggerPrompt: "Help me set up a new Wix app project. Generate a setup script with the latest Wix CLI commands.",
    expectedFiles: [
      { path: "setup.sh" },
    ],
    assertions: [
      {
        id: "a-chat-13",
        type: "file_presence",
        name: "Setup script exists",
        paths: ["setup.sh"],
        shouldExist: true,
      },
      {
        id: "a-chat-14",
        type: "file_content",
        name: "Contains CLI commands",
        path: "setup.sh",
        checks: {
          contains: ["wix", "cli", "create", "npx", "@wix/cli"],
        },
      },
    ],
    tags: ["wix", "chat", "mcp", "cli"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Chat Test Suites
// ==========================================

export const WIX_CHAT_SUITES: TestSuite[] = [
  {
    id: "suite-wix-chat-general",
    projectId: WIX_CHAT_PROJECT_ID,
    name: "Wix Chat General Assistance",
    description: "Test suite for general Wix development questions and guidance",
    scenarioIds: [
      "scenario-wix-chat-dashboard-help",
      "scenario-wix-chat-design-system",
      "scenario-wix-chat-mcp-usage",
    ],
    tags: ["wix", "chat", "general", "help"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suite-wix-chat-backend",
    projectId: WIX_CHAT_PROJECT_ID,
    name: "Wix Chat Backend Guidance",
    description: "Test suite for backend development questions",
    scenarioIds: [
      "scenario-wix-chat-http-functions",
      "scenario-wix-chat-data-collections",
    ],
    tags: ["wix", "chat", "backend", "api"],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Chat Target Groups
// ==========================================

export const WIX_CHAT_TARGET_GROUPS: TargetGroup[] = [
  {
    id: "tg-wix-chat",
    projectId: WIX_CHAT_PROJECT_ID,
    name: "Wix Chat",
    description: "Wix Chat AI assistant with Wix MCP integration",
    targets: [
      {
        id: "target-wix-chat-agent",
        type: "prompt_agent",
        promptAgentId: "pa-wix-chat",
      },
    ],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Chat Improvement Runs
// ==========================================

export const WIX_CHAT_IMPROVEMENT_RUNS: ImprovementRun[] = [
  {
    id: "improve-wix-chat-1",
    projectId: WIX_CHAT_PROJECT_ID,
    targetType: "prompt_agent",
    targetId: "pa-wix-chat",
    targetName: "Wix Chat",
    testSuiteId: "suite-wix-chat-general",
    testSuiteName: "Wix Chat General Assistance",
    status: "completed",
    maxIterations: 3,
    iterations: [
      {
        id: "iter-chat-1-1",
        iterationNumber: 1,
        passRate: 65,
        passed: 8,
        failed: 4,
        changes: [],
        feedback: "Initial evaluation shows Wix Chat provides good general guidance but sometimes misses specific Design System component details. The system prompt could be more explicit about always referencing the latest Design System documentation.",
        targetSnapshot: {
          systemPrompt: "You are Wix Chat, an AI assistant...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-chat-1-2",
        iterationNumber: 2,
        passRate: 82,
        passed: 10,
        failed: 2,
        changes: [
          {
            field: "systemPrompt",
            before: "When helping users:\n- Use Wix MCP to fetch real-time platform information when needed",
            after: "When helping users:\n- Use Wix MCP to fetch real-time platform information when needed\n- Always reference specific Design System component names and import paths\n- Include complete import statements in code examples",
            reason: "Added explicit guidance to always reference Design System components with proper imports",
          },
        ],
        feedback: "Improved Design System references. Still seeing some issues with MCP usage - the assistant sometimes doesn't use MCP when it should.",
        targetSnapshot: {
          systemPrompt: "You are Wix Chat, an AI assistant... (updated)",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-chat-1-3",
        iterationNumber: 3,
        passRate: 92,
        passed: 11,
        failed: 1,
        changes: [
          {
            field: "systemPrompt",
            before: "- Use Wix MCP to fetch real-time platform information when needed",
            after: "- Use Wix MCP to fetch real-time platform information when needed\n- For questions about current APIs, CLI commands, or platform features, always use MCP first before providing answers\n- If MCP is unavailable, clearly state that information may be outdated",
            reason: "Added explicit MCP usage requirements to ensure up-to-date information",
          },
        ],
        feedback: "Excellent improvement. Wix Chat now consistently uses MCP for platform information and provides accurate, up-to-date guidance.",
        targetSnapshot: {
          systemPrompt: "You are Wix Chat, an AI assistant... (final)",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    initialPassRate: 65,
    finalPassRate: 92,
    improvement: 27,
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
