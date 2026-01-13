/**
 * Eval Run Generators
 * Functions to generate demo evaluation runs with realistic data
 */

import type {
  Skill,
  TestScenario,
  EvalRun,
  EvalRunResult,
  AssertionResult,
  Agent,
  ModelConfig,
  FailureAnalysis,
} from "@lib/types";
import { BUILTIN_AGENTS } from "@lib/types";
import { generateId, generateFailureAnalysis } from "./shared";

// Agent-specific pass rate modifiers
const AGENT_PASS_RATE_MODIFIERS: Record<string, number> = {
  "agent-claude-code": 0.12, // Claude Code is more thorough, higher success
  "agent-codex": -0.08, // Codex is faster but less thorough
  "agent-cursor-cli": 0.05, // Cursor is good with context
};

/**
 * Generate evaluation runs for demo data
 */
export function generateEvalRuns(
  skills: Skill[],
  scenarios: TestScenario[]
): EvalRun[] {
  const runs: EvalRun[] = [];
  const models: ModelConfig[] = [
    { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
    { provider: "openai", model: "gpt-4-turbo", temperature: 0.5, maxTokens: 4096 },
    { provider: "google", model: "gemini-pro", temperature: 0.7, maxTokens: 4096 },
    { provider: "openai", model: "gpt-3.5-turbo", temperature: 0.5, maxTokens: 4096 },
  ];

  const passRates = [0.88, 0.75, 0.68, 0.52]; // Different pass rates per model
  const now = new Date();

  // Split scenarios into skill-based and non-skill-based
  const skillScenarios = scenarios.filter((s) => s.skillId);
  const nonSkillScenarios = scenarios.filter((s) => !s.skillId);

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
      
      // Choose between skill-based or non-skill scenarios (70% skill-based if available)
      const useSkillBased = skills.length > 0 && skillScenarios.length > 0 && Math.random() < 0.7;
      
      let selectedScenario: TestScenario;
      let skillVersion: { id: string } | undefined;
      let skillId: string | undefined;
      let skillName: string | undefined;
      
      if (useSkillBased) {
        const skill = skills[Math.floor(Math.random() * skills.length)];
        const availableScenarios = skillScenarios.filter((s) => s.skillId === skill.id);
        if (availableScenarios.length === 0) continue;
        
        selectedScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
        skillVersion = skill.versions[Math.floor(Math.random() * skill.versions.length)];
        skillId = skill.id;
        skillName = skill.name;
      } else {
        // Use non-skill scenarios (for Wix Chat, Design System, etc.)
        if (nonSkillScenarios.length === 0) continue;
        selectedScenario = nonSkillScenarios[Math.floor(Math.random() * nonSkillScenarios.length)];
        skillVersion = { id: `no-skill-${selectedScenario.id}` };
        skillId = "no-skill";
        skillName = selectedScenario.name;
      }

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
      const runName = `${skillName} - ${model.model.split("-").slice(0, 2).join(" ")}${agentSuffix}`;

      runs.push({
        id: generateId(),
        projectId: selectedScenario.projectId,
        name: runName,
        skillId: skillId || "no-skill",
        skillName: skillName || selectedScenario.name,
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
  runs.push(...generateAgentComparisonRuns(skills, scenarios));

  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

/**
 * Generate runs specifically for comparing agents
 */
function generateAgentComparisonRuns(
  skills: Skill[],
  scenarios: TestScenario[]
): EvalRun[] {
  const runs: EvalRun[] = [];
  const now = new Date();
  const model: ModelConfig = { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 };
  
  // Create comparison runs - prefer skill-based scenarios, fallback to any scenario
  const skillBasedScenarios = scenarios.filter((s) => s.skillId);
  const allScenarios = scenarios;
  
  let scenario: TestScenario | undefined;
  let skillVersion: { id: string };
  let skillId: string;
  let skillName: string;
  
  if (skills.length > 0 && skillBasedScenarios.length > 0) {
    const skill = skills[0];
    const availableScenarios = skillBasedScenarios.filter((s) => s.skillId === skill.id);
    scenario = availableScenarios[0] || skillBasedScenarios[0];
    skillVersion = skill.versions[skill.versions.length - 1];
    skillId = skill.id;
    skillName = skill.name;
  } else if (allScenarios.length > 0) {
    scenario = allScenarios[0];
    skillVersion = { id: `no-skill-${scenario.id}` };
    skillId = "no-skill";
    skillName = scenario.name;
  } else {
    return runs;
  }
  
  if (!scenario) return runs;

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
      projectId: scenario.projectId,
      name: `Agent Comparison: ${agent.name}`,
      skillId: skillId,
      skillName: skillName,
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
