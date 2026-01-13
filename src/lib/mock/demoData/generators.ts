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
  LLMTrace,
  LLMTraceStep,
  LLMTraceSummary,
  LLMStepType,
  LLMBreakdownStats,
  TokenUsage,
  LLMProvider,
} from "@lib/types";
import { BUILTIN_AGENTS, MODEL_PRICING } from "@lib/types";
import { generateId, generateFailureAnalysis } from "./shared";

// ==========================================
// LLM Trace Generation
// ==========================================

/**
 * Get cost per token based on model
 */
function getModelPricing(model: string, provider: LLMProvider): { inputPer1M: number; outputPer1M: number } {
  const pricing = MODEL_PRICING.find(p => p.model === model && p.provider === provider);
  return pricing || { inputPer1M: 1.0, outputPer1M: 2.0 }; // Default fallback
}

/**
 * Calculate cost for token usage
 */
function calculateCost(tokenUsage: TokenUsage, model: string, provider: LLMProvider): number {
  const pricing = getModelPricing(model, provider);
  const inputCost = (tokenUsage.prompt / 1_000_000) * pricing.inputPer1M;
  const outputCost = (tokenUsage.completion / 1_000_000) * pricing.outputPer1M;
  return inputCost + outputCost;
}

/**
 * Generate a single LLM trace step for an agent run
 */
function generateLLMTraceStep(
  stepNumber: number,
  type: LLMStepType,
  model: string,
  provider: LLMProvider,
  startTime: Date
): LLMTraceStep {
  // Realistic token ranges based on step type (agent activity)
  const tokenRanges: Record<LLMStepType, { promptMin: number; promptMax: number; completionMin: number; completionMax: number }> = {
    completion: { promptMin: 1000, promptMax: 4000, completionMin: 200, completionMax: 2000 },
    tool_use: { promptMin: 500, promptMax: 1500, completionMin: 50, completionMax: 300 },
    tool_result: { promptMin: 200, promptMax: 2000, completionMin: 0, completionMax: 0 }, // Tool results don't generate completion tokens
    thinking: { promptMin: 500, promptMax: 2000, completionMin: 300, completionMax: 1500 },
  };

  const range = tokenRanges[type];
  const promptTokens = Math.floor(Math.random() * (range.promptMax - range.promptMin)) + range.promptMin;
  const completionTokens = Math.floor(Math.random() * (range.completionMax - range.completionMin)) + range.completionMin;
  const tokenUsage: TokenUsage = {
    prompt: promptTokens,
    completion: completionTokens,
    total: promptTokens + completionTokens,
  };

  // Duration based on token count (roughly 50-100 tokens per second)
  const tokensPerSecond = Math.random() * 50 + 50;
  const durationMs = Math.floor((tokenUsage.total / tokensPerSecond) * 1000);

  const costUsd = calculateCost(tokenUsage, model, provider);

  // Tool-specific fields (for tool_use steps)
  const toolNames = ["read_file", "write_file", "edit_file", "execute_command", "list_dir", "grep", "bash"];
  const toolName = type === "tool_use" ? toolNames[Math.floor(Math.random() * toolNames.length)] : undefined;
  const toolArguments = toolName ? JSON.stringify({ path: "/src/components/Button.tsx", content: "..." }) : undefined;

  // Input/output previews reflecting agent activity
  const inputPreviews: Record<LLMStepType, string> = {
    completion: "Create a React Button component with primary and secondary variants...",
    tool_use: `Using ${toolName || "tool"} to modify the codebase...`,
    tool_result: `${toolName || "Tool"} executed successfully`,
    thinking: "Let me analyze the requirements and plan the implementation...",
  };

  const outputPreviews: Record<LLMStepType, string> = {
    completion: "I'll create a Button component with TypeScript and Tailwind CSS...",
    tool_use: `{ "tool": "${toolName || "tool"}", "path": "src/components/Button.tsx" }`,
    tool_result: "File written successfully. Created Button.tsx with 45 lines.",
    thinking: "I need to: 1) Create the component file, 2) Add types, 3) Export from index...",
  };

  const success = Math.random() > 0.05; // 95% success rate

  return {
    id: generateId(),
    stepNumber,
    type,
    model,
    provider,
    startedAt: startTime.toISOString(),
    durationMs,
    tokenUsage,
    costUsd,
    toolName,
    toolArguments,
    inputPreview: inputPreviews[type],
    outputPreview: outputPreviews[type],
    success,
    error: success ? undefined : "API rate limit exceeded",
  };
}

/**
 * Generate LLM trace summary from steps
 */
function generateLLMTraceSummary(steps: LLMTraceStep[]): LLMTraceSummary {
  const totalTokens: TokenUsage = {
    prompt: 0,
    completion: 0,
    total: 0,
  };
  let totalDurationMs = 0;
  let totalCostUsd = 0;
  const stepTypeBreakdown: Partial<Record<LLMStepType, LLMBreakdownStats>> = {};
  const modelBreakdown: Record<string, LLMBreakdownStats> = {};
  const modelsUsed = new Set<string>();

  for (const step of steps) {
    // Aggregate totals
    totalTokens.prompt += step.tokenUsage.prompt;
    totalTokens.completion += step.tokenUsage.completion;
    totalTokens.total += step.tokenUsage.total;
    totalDurationMs += step.durationMs;
    totalCostUsd += step.costUsd;

    modelsUsed.add(step.model);

    // Step type breakdown
    if (!stepTypeBreakdown[step.type]) {
      stepTypeBreakdown[step.type] = { count: 0, durationMs: 0, tokens: 0, costUsd: 0 };
    }
    stepTypeBreakdown[step.type]!.count++;
    stepTypeBreakdown[step.type]!.durationMs += step.durationMs;
    stepTypeBreakdown[step.type]!.tokens += step.tokenUsage.total;
    stepTypeBreakdown[step.type]!.costUsd += step.costUsd;

    // Model breakdown
    if (!modelBreakdown[step.model]) {
      modelBreakdown[step.model] = { count: 0, durationMs: 0, tokens: 0, costUsd: 0 };
    }
    modelBreakdown[step.model].count++;
    modelBreakdown[step.model].durationMs += step.durationMs;
    modelBreakdown[step.model].tokens += step.tokenUsage.total;
    modelBreakdown[step.model].costUsd += step.costUsd;
  }

  return {
    totalSteps: steps.length,
    totalDurationMs,
    totalTokens,
    totalCostUsd,
    stepTypeBreakdown,
    modelBreakdown,
    modelsUsed: Array.from(modelsUsed),
  };
}

/**
 * Generate a complete LLM trace for an agent run.
 * Simulates what a coding agent (like Claude Code) does during task execution.
 */
function generateLLMTrace(model: ModelConfig, _numAssertions: number): LLMTrace {
  const steps: LLMTraceStep[] = [];
  let currentTime = new Date();
  let stepNumber = 1;

  // Simulate a realistic coding agent workflow
  // Number of iterations (agent usually does 2-5 rounds of thinking/editing)
  const numIterations = Math.floor(Math.random() * 4) + 2;

  for (let i = 0; i < numIterations; i++) {
    // Thinking step (agent plans what to do)
    if (Math.random() > 0.3) {
      const thinkStep = generateLLMTraceStep(stepNumber++, "thinking", model.model, model.provider, currentTime);
      steps.push(thinkStep);
      currentTime = new Date(currentTime.getTime() + thinkStep.durationMs);
    }

    // Completion step (agent generates response/code)
    const completionStep = generateLLMTraceStep(stepNumber++, "completion", model.model, model.provider, currentTime);
    steps.push(completionStep);
    currentTime = new Date(currentTime.getTime() + completionStep.durationMs);

    // Tool use steps (agent reads/writes files, runs commands)
    const numToolCalls = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numToolCalls; j++) {
      // Tool use
      const toolStep = generateLLMTraceStep(stepNumber++, "tool_use", model.model, model.provider, currentTime);
      steps.push(toolStep);
      currentTime = new Date(currentTime.getTime() + toolStep.durationMs);

      // Tool result
      const resultStep = generateLLMTraceStep(stepNumber++, "tool_result", model.model, model.provider, currentTime);
      steps.push(resultStep);
      currentTime = new Date(currentTime.getTime() + resultStep.durationMs);
    }
  }

  // Final completion (agent wraps up)
  const finalStep = generateLLMTraceStep(stepNumber, "completion", model.model, model.provider, currentTime);
  steps.push(finalStep);

  return {
    id: generateId(),
    steps,
    summary: generateLLMTraceSummary(steps),
  };
}

/**
 * Aggregate multiple LLM traces into a single summary
 */
function aggregateLLMTraceSummaries(traces: LLMTrace[]): LLMTraceSummary {
  const allSteps = traces.flatMap(t => t.steps);
  return generateLLMTraceSummary(allSteps);
}

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

      // Generate LLM trace for this result
      const llmTrace = generateLLMTrace(model, assertionResults.length);

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
        llmTrace,
      });

      const runDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      runDate.setHours(Math.floor(Math.random() * 12) + 8);

      // Build run name including agent if used
      const agentSuffix = agent ? ` via ${agent.name}` : "";
      const runName = `${skillName} - ${model.model.split("-").slice(0, 2).join(" ")}${agentSuffix}`;

      // Aggregate LLM traces from all results
      const allTraces = results.filter(r => r.llmTrace).map(r => r.llmTrace!);
      const llmTraceSummary = allTraces.length > 0 ? aggregateLLMTraceSummaries(allTraces) : undefined;

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
        llmTraceSummary,
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

    // Generate LLM trace for this result
    const llmTrace = generateLLMTrace(model, assertionResults.length);

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
      llmTrace,
    }];

    const runDate = new Date(now.getTime() - (1 + agentIndex) * 60 * 60 * 1000); // 1-3 hours ago

    // Aggregate LLM traces
    const allTraces = results.filter(r => r.llmTrace).map(r => r.llmTrace!);
    const llmTraceSummary = allTraces.length > 0 ? aggregateLLMTraceSummaries(allTraces) : undefined;

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
      llmTraceSummary,
      startedAt: runDate.toISOString(),
      completedAt: new Date(runDate.getTime() + totalDuration + 3000).toISOString(),
    });
  });

  return runs;
}
