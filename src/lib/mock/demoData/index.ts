/**
 * Demo Data - Main Export
 * Combines all project-specific demo data into a single export
 */

import type {
  Project,
  Skill,
  TestScenario,
  TestSuite,
  TargetGroup,
  PromptAgent,
  EvalRun,
  Agent,
  CodingTool,
  ImprovementRun,
} from "@lib/types";

// Import shared data
import {
  DEMO_PROJECTS,
  DEMO_AGENTS,
  DEMO_CODING_TOOLS,
  WIX_APP_BUILDER_PROJECT_ID,
  WIX_CHAT_PROJECT_ID,
  WIX_DESIGN_SYSTEM_PROJECT_ID,
} from "./shared";

// Import Wix App Builder project data
import {
  WIX_SKILLS,
  WIX_SCENARIOS,
  WIX_SUITES,
  WIX_TARGET_GROUPS,
  WIX_IMPROVEMENT_RUNS,
  WIX_APP_BUILDER_AGENT,
  WIX_EVAL_RUNS,
} from "./wixDashboard";

// Import Wix Chat project data
import {
  WIX_CHAT_PROMPT_AGENTS,
  WIX_CHAT_SCENARIOS,
  WIX_CHAT_SUITES,
  WIX_CHAT_TARGET_GROUPS,
  WIX_CHAT_IMPROVEMENT_RUNS,
} from "./wixChat";

// Import Wix Design System project data
import {
  WIX_DESIGN_SYSTEM_SCENARIOS,
  WIX_DESIGN_SYSTEM_SUITES,
  WIX_DESIGN_SYSTEM_TARGET_GROUPS,
} from "./wixDesignSystem";

// Import generators
import { generateEvalRuns } from "./generators";

// ==========================================
// Combined Data
// ==========================================

const ALL_SKILLS: Skill[] = [...WIX_SKILLS]; // Only Wix App Builder has skills
const ALL_SCENARIOS: TestScenario[] = [
  ...WIX_SCENARIOS,
  ...WIX_CHAT_SCENARIOS,
  ...WIX_DESIGN_SYSTEM_SCENARIOS,
];
const ALL_SUITES: TestSuite[] = [
  ...WIX_SUITES,
  ...WIX_CHAT_SUITES,
  ...WIX_DESIGN_SYSTEM_SUITES,
];
const ALL_TARGET_GROUPS: TargetGroup[] = [
  ...WIX_TARGET_GROUPS,
  ...WIX_CHAT_TARGET_GROUPS,
  ...WIX_DESIGN_SYSTEM_TARGET_GROUPS,
];
const ALL_PROMPT_AGENTS: PromptAgent[] = [
  ...WIX_CHAT_PROMPT_AGENTS,
];
const ALL_IMPROVEMENT_RUNS: ImprovementRun[] = [
  ...WIX_IMPROVEMENT_RUNS,
  ...WIX_CHAT_IMPROVEMENT_RUNS,
];

// Combine agents: built-in agents + Wix App Builder (project-specific)
const ALL_AGENTS: Agent[] = [
  ...DEMO_AGENTS, // Built-in agents only
  WIX_APP_BUILDER_AGENT, // Wix App Builder agent
];

// Helper to filter agents by project
export function getAgentsForProject(projectId: string | undefined): Agent[] {
  if (!projectId) return ALL_AGENTS;
  
  switch (projectId) {
    case WIX_APP_BUILDER_PROJECT_ID:
      return [WIX_APP_BUILDER_AGENT];
    case WIX_CHAT_PROJECT_ID:
      return [];
      case WIX_DESIGN_SYSTEM_PROJECT_ID:
        return [...DEMO_AGENTS];
    default:
      return ALL_AGENTS;
  }
}

const evalRuns = generateEvalRuns(ALL_SKILLS, ALL_SCENARIOS);

export function getEvalRunsForProject(projectId: string | undefined): EvalRun[] {
  switch (projectId) {
    case WIX_APP_BUILDER_PROJECT_ID:
      return WIX_EVAL_RUNS;
    case WIX_CHAT_PROJECT_ID:
      return evalRuns.filter((r) => r.projectId === WIX_CHAT_PROJECT_ID);
    case WIX_DESIGN_SYSTEM_PROJECT_ID:
      return evalRuns.filter((r) => r.projectId === WIX_DESIGN_SYSTEM_PROJECT_ID);
    default:
      return evalRuns;
  }
}

// ==========================================
// Export Demo Data Generator
// ==========================================

export function generateDemoData(): {
  projects: Project[];
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
    projects: DEMO_PROJECTS,
    skills: ALL_SKILLS,
    testScenarios: ALL_SCENARIOS,
    testSuites: ALL_SUITES,
    targetGroups: ALL_TARGET_GROUPS,
    promptAgents: ALL_PROMPT_AGENTS,
    evalRuns: evalRuns,
    agents: ALL_AGENTS,
    codingTools: DEMO_CODING_TOOLS,
    improvementRuns: ALL_IMPROVEMENT_RUNS,
  };
}

// Re-export project IDs for convenience
export {
  WIX_APP_BUILDER_PROJECT_ID,
  WIX_CHAT_PROJECT_ID,
  WIX_DESIGN_SYSTEM_PROJECT_ID,
} from "./shared";
