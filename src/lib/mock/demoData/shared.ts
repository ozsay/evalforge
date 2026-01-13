/**
 * Shared Demo Data - Utilities, Projects, Built-in Agents
 */

import { generateId } from "@lib/utils";
import type {
  Project,
  Skill,
  SkillVersion,
  SkillSyncSource,
  Agent,
  FailureAnalysis,
  CodingTool,
} from "@lib/types";
import { BUILTIN_AGENTS, BUILTIN_TOOLS } from "@lib/types";

// ==========================================
// Project IDs (exported for use in other files)
// ==========================================

export const WIX_APP_BUILDER_PROJECT_ID = "proj-wix-app-builder";
export const WIX_CHAT_PROJECT_ID = "proj-wix-chat";
export const WIX_DESIGN_SYSTEM_PROJECT_ID = "proj-wix-design-system";

// ==========================================
// Demo Projects (Tenants)
// ==========================================

export const DEMO_PROJECTS: Project[] = [
  {
    id: WIX_APP_BUILDER_PROJECT_ID,
    name: "Wix App Builder",
    description: "Evaluation project for Wix App Builder development agents and skills",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: WIX_CHAT_PROJECT_ID,
    name: "Wix Chat",
    description: "Evaluation project for Wix Chat AI assistant with Wix MCP integration",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: WIX_DESIGN_SYSTEM_PROJECT_ID,
    name: "Wix Design System",
    description: "Evaluation project for testing LLM understanding of Wix Design System documentation",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Helper Functions
// ==========================================

export function createSkill(
  id: string,
  projectId: string,
  name: string,
  description: string,
  skillMd: string,
  versions: Omit<SkillVersion, "skillId">[],
  syncSource?: SkillSyncSource
): Skill {
  const now = new Date();
  return {
    id,
    projectId,
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

// ==========================================
// Failure Analysis Generator
// ==========================================

export function generateFailureAnalysis(
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
// Built-in Agents Only
// ==========================================

export const DEMO_AGENTS: Agent[] = [
  // Include built-in agents only
  ...BUILTIN_AGENTS,
];

// ==========================================
// Built-in Tools
// ==========================================

export const DEMO_CODING_TOOLS: CodingTool[] = [...BUILTIN_TOOLS];

// Re-export utilities
export { generateId };
