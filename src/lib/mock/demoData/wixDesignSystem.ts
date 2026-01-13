/**
 * Wix Design System Project Demo Data
 * Evaluates LLM understanding of Wix Design System documentation
 * No skills - only built-in coding agents
 */

import type {
  TestScenario,
  TestSuite,
  TargetGroup,
} from "@lib/types";
import { WIX_DESIGN_SYSTEM_PROJECT_ID } from "./shared";

// ==========================================
// Wix Design System Test Scenarios
// ==========================================

export const WIX_DESIGN_SYSTEM_SCENARIOS: TestScenario[] = [
  // Simple component scenarios
  {
    id: "scenario-ds-button",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    suiteIds: ["suite-ds-components"],
    name: "Create Button Component",
    description: "Test creating a simple button using Design System",
    triggerPrompt: "Create a Button component using @wix/design-system with primary, secondary, and ghost variants.",
    expectedFiles: [
      { path: "src/components/Button.tsx" },
    ],
    assertions: [
      {
        id: "a-ds-1",
        type: "file_presence",
        name: "Button file exists",
        paths: ["src/components/Button.tsx"],
        shouldExist: true,
      },
      {
        id: "a-ds-2",
        type: "file_content",
        name: "Uses Design System Button",
        path: "src/components/Button.tsx",
        checks: {
          contains: ["@wix/design-system", "Button", "import"],
        },
      },
      {
        id: "a-ds-3",
        type: "build_check",
        name: "TypeScript compiles",
        command: "npx tsc --noEmit",
        expectSuccess: true,
      },
    ],
    tags: ["design-system", "button", "simple"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-ds-input",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    suiteIds: ["suite-ds-components"],
    name: "Create Input Field",
    description: "Test creating an input field with validation using Design System",
    triggerPrompt: "Create an Input component using @wix/design-system with label, placeholder, and error state support.",
    expectedFiles: [
      { path: "src/components/Input.tsx" },
    ],
    assertions: [
      {
        id: "a-ds-4",
        type: "file_presence",
        name: "Input file exists",
        paths: ["src/components/Input.tsx"],
        shouldExist: true,
      },
      {
        id: "a-ds-5",
        type: "file_content",
        name: "Uses Design System Input",
        path: "src/components/Input.tsx",
        checks: {
          contains: ["@wix/design-system", "TextField", "Input", "import"],
        },
      },
      {
        id: "a-ds-6",
        type: "file_content",
        name: "Includes error handling",
        path: "src/components/Input.tsx",
        checks: {
          contains: ["error", "Error", "invalid"],
        },
      },
    ],
    tags: ["design-system", "input", "form", "simple"],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-ds-card",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    suiteIds: ["suite-ds-components"],
    name: "Create Card Component",
    description: "Test creating a card component with Design System",
    triggerPrompt: "Create a Card component using @wix/design-system that displays title, content, and optional actions.",
    expectedFiles: [
      { path: "src/components/Card.tsx" },
    ],
    assertions: [
      {
        id: "a-ds-7",
        type: "file_presence",
        name: "Card file exists",
        paths: ["src/components/Card.tsx"],
        shouldExist: true,
      },
      {
        id: "a-ds-8",
        type: "file_content",
        name: "Uses Design System Card",
        path: "src/components/Card.tsx",
        checks: {
          contains: ["@wix/design-system", "Card", "import"],
        },
      },
    ],
    tags: ["design-system", "card", "simple"],
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Complex page scenarios
  {
    id: "scenario-ds-dashboard-page",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    suiteIds: ["suite-ds-pages"],
    name: "Create Dashboard Page",
    description: "Test creating a complete dashboard page with multiple Design System components",
    triggerPrompt: "Create a dashboard page using @wix/design-system with Page layout, Stats widgets, DataTable, and Action buttons. Include proper loading and error states.",
    expectedFiles: [
      { path: "src/pages/Dashboard.tsx" },
    ],
    assertions: [
      {
        id: "a-ds-9",
        type: "file_presence",
        name: "Dashboard page exists",
        paths: ["src/pages/Dashboard.tsx"],
        shouldExist: true,
      },
      {
        id: "a-ds-10",
        type: "file_content",
        name: "Uses Page component",
        path: "src/pages/Dashboard.tsx",
        checks: {
          contains: ["Page", "Page.Header", "Page.Content", "@wix/design-system"],
        },
      },
      {
        id: "a-ds-11",
        type: "file_content",
        name: "Includes multiple components",
        path: "src/pages/Dashboard.tsx",
        checks: {
          contains: ["Table", "Card", "Button", "Loader"],
        },
      },
      {
        id: "a-ds-12",
        type: "file_content",
        name: "Has loading state",
        path: "src/pages/Dashboard.tsx",
        checks: {
          contains: ["loading", "Loader", "isLoading"],
        },
      },
      {
        id: "a-ds-13",
        type: "build_check",
        name: "TypeScript compiles",
        command: "npx tsc --noEmit",
        expectSuccess: true,
      },
    ],
    tags: ["design-system", "dashboard", "page", "complex"],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-ds-settings-page",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    suiteIds: ["suite-ds-pages"],
    name: "Create Settings Page",
    description: "Test creating a settings page with forms and validation",
    triggerPrompt: "Create a settings page using @wix/design-system with a form containing TextField inputs, Checkbox, Select dropdown, and Save/Cancel buttons. Include form validation.",
    expectedFiles: [
      { path: "src/pages/Settings.tsx" },
    ],
    assertions: [
      {
        id: "a-ds-14",
        type: "file_presence",
        name: "Settings page exists",
        paths: ["src/pages/Settings.tsx"],
        shouldExist: true,
      },
      {
        id: "a-ds-15",
        type: "file_content",
        name: "Uses form components",
        path: "src/pages/Settings.tsx",
        checks: {
          contains: ["TextField", "Checkbox", "Select", "Button"],
        },
      },
      {
        id: "a-ds-16",
        type: "file_content",
        name: "Includes validation",
        path: "src/pages/Settings.tsx",
        checks: {
          contains: ["validate", "error", "required", "validation"],
        },
      },
      {
        id: "a-ds-17",
        type: "file_content",
        name: "Uses Page layout",
        path: "src/pages/Settings.tsx",
        checks: {
          contains: ["Page", "Page.Header", "Page.Content"],
        },
      },
    ],
    tags: ["design-system", "settings", "form", "page", "complex"],
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-ds-modal-workflow",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    suiteIds: ["suite-ds-pages"],
    name: "Create Modal Workflow",
    description: "Test creating a modal with form workflow using Design System",
    triggerPrompt: "Create a modal component using @wix/design-system with a multi-step form. Include progress indicator, form fields, and navigation buttons.",
    expectedFiles: [
      { path: "src/components/ModalWorkflow.tsx" },
    ],
    assertions: [
      {
        id: "a-ds-18",
        type: "file_presence",
        name: "Modal workflow exists",
        paths: ["src/components/ModalWorkflow.tsx"],
        shouldExist: true,
      },
      {
        id: "a-ds-19",
        type: "file_content",
        name: "Uses Modal component",
        path: "src/components/ModalWorkflow.tsx",
        checks: {
          contains: ["Modal", "@wix/design-system"],
        },
      },
      {
        id: "a-ds-20",
        type: "file_content",
        name: "Has multi-step logic",
        path: "src/components/ModalWorkflow.tsx",
        checks: {
          contains: ["step", "currentStep", "next", "previous"],
        },
      },
      {
        id: "a-ds-21",
        type: "file_content",
        name: "Includes progress indicator",
        path: "src/components/ModalWorkflow.tsx",
        checks: {
          contains: ["progress", "Progress", "indicator"],
        },
      },
    ],
    tags: ["design-system", "modal", "workflow", "complex"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Design System Test Suites
// ==========================================

export const WIX_DESIGN_SYSTEM_SUITES: TestSuite[] = [
  {
    id: "suite-ds-components",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    name: "Design System Components",
    description: "Test suite for creating simple components using Wix Design System",
    scenarioIds: [
      "scenario-ds-button",
      "scenario-ds-input",
      "scenario-ds-card",
    ],
    tags: ["design-system", "components", "simple"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suite-ds-pages",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    name: "Design System Pages",
    description: "Test suite for creating complex pages and workflows using Wix Design System",
    scenarioIds: [
      "scenario-ds-dashboard-page",
      "scenario-ds-settings-page",
      "scenario-ds-modal-workflow",
    ],
    tags: ["design-system", "pages", "complex"],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Design System Target Groups
// ==========================================

export const WIX_DESIGN_SYSTEM_TARGET_GROUPS: TargetGroup[] = [
  {
    id: "tg-ds-coding-agents",
    projectId: WIX_DESIGN_SYSTEM_PROJECT_ID,
    name: "Design System Coding Agents",
    description: "Built-in coding agents for Design System evaluation",
    targets: [
      {
        id: "target-ds-claude",
        type: "coding_agent",
        agentId: "agent-claude-code",
      },
      {
        id: "target-ds-codex",
        type: "coding_agent",
        agentId: "agent-codex",
      },
      {
        id: "target-ds-cursor",
        type: "coding_agent",
        agentId: "agent-cursor-cli",
      },
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
