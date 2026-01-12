// ==========================================
// Core Types for EvalForge - Agent Skills Testing
// ==========================================

// LLM Provider Types
export type LLMProvider = "openai" | "anthropic" | "google" | "local";

export interface ModelConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const AVAILABLE_MODELS: Record<LLMProvider, string[]> = {
  openai: ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  anthropic: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  google: ["gemini-pro", "gemini-ultra"],
  local: ["llama-3", "mistral-7b", "codellama-34b"],
};

// ==========================================
// Claude Code Agent Skill Types (SKILL.md)
// ==========================================
//
// RELATIONSHIP MODEL:
// 
//   Skill (1) ──────────► TestScenario (N)
//     │                        │
//     │ defines WHAT           │ defines HOW TO TEST
//     │ capability to test     │ with trigger + assertions
//     │                        │
//     └── SKILL.md content     └── Each scenario belongs to exactly one skill
//
// A Skill represents a coding capability defined by a SKILL.md file 
// (following the agentskills.io specification). TestScenarios are 
// specific test cases that verify whether an Agent can execute 
// that skill correctly.
//
// ==========================================

/**
 * Metadata parsed from SKILL.md frontmatter.
 * 
 * Following the agentskills.io specification, this includes:
 * - name: Skill identifier (max 64 chars, lowercase + hyphens)
 * - description: What the skill does and when to use it (max 1024 chars)
 * - allowedTools: Pre-approved tools the skill may use
 * - skills: Sub-skills for composite agents
 * 
 * @see https://agentskills.io/specification
 */
export interface SkillMetadata {
  name: string;
  description: string;
  allowedTools?: string[];
  skills?: string[]; // For subagents
  [key: string]: unknown; // Allow other custom metadata
}

/**
 * A historical snapshot of a Skill's SKILL.md content.
 * 
 * Note: SkillVersions are for audit/history purposes only.
 * Evaluations always run against the current Skill content,
 * not historical versions.
 * 
 * @deprecated Evaluations no longer test against specific versions.
 * This is kept for historical audit trail only.
 */
export interface SkillVersion {
  id: string;
  skillId: string;
  skillMd: string;
  metadata: SkillMetadata;
  model: ModelConfig;
  systemPrompt?: string;
  version: number;
  createdAt: string;
  notes?: string;
}

/**
 * A Skill defines WHAT capability is being tested.
 * 
 * Skills represent coding capabilities that Agents can perform,
 * defined by a SKILL.md file following the agentskills.io specification.
 * 
 * Each Skill has one or more TestScenarios that define specific
 * test cases to verify the skill works correctly.
 * 
 * RELATIONSHIP:
 * - Skill (1) → TestScenario (N): One skill has many test scenarios
 * - TestScenarios belong to exactly ONE skill (no sharing)
 * 
 * @example
 * ```
 * Skill: "pdf-processing"
 *   ├── TestScenario: "Extract text from PDF"
 *   ├── TestScenario: "Merge two PDFs"
 *   └── TestScenario: "Fill PDF form"
 * ```
 * 
 * @see https://agentskills.io/specification
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  /** The current SKILL.md content for this skill */
  skillMd: string;
  metadata: SkillMetadata;
  /** 
   * Historical versions for audit trail only.
   * @deprecated Evaluations run against current skillMd, not versions
   */
  versions: SkillVersion[];
  /** IDs of TestScenarios that test this skill (1:N relationship) */
  testScenarios: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateSkillInput = {
  name: string;
  description: string;
  skillMd: string;
};

export type UpdateSkillInput = Partial<CreateSkillInput>;

// ==========================================
// Assertion Types
// ==========================================

export type AssertionType = 
  | "file_presence"
  | "file_content"
  | "build_check"
  | "vitest"
  | "playwright_nl";

// File Presence Assertion
export interface FilePresenceAssertion {
  id: string;
  type: "file_presence";
  name: string;
  paths: string[];
  shouldExist: boolean;
}

// File Content Assertion
export interface FileContentCheck {
  contains?: string[];
  notContains?: string[];
  matches?: string; // Regex pattern
  jsonPath?: { path: string; value: unknown }[];
}

export interface FileContentAssertion {
  id: string;
  type: "file_content";
  name: string;
  path: string;
  checks: FileContentCheck;
}

// Build Check Assertion
export interface BuildCheckAssertion {
  id: string;
  type: "build_check";
  name: string;
  command: string;
  expectSuccess: boolean;
  allowedWarnings?: number;
  timeout?: number; // in ms
}

// Vitest Assertion
export interface VitestAssertion {
  id: string;
  type: "vitest";
  name: string;
  testFile: string; // Test file content
  testFileName: string;
  minPassRate: number; // 0-100
}

// Natural Language Playwright Assertion
export interface PlaywrightNLAssertion {
  id: string;
  type: "playwright_nl";
  name: string;
  description: string;
  steps: string[];
  expectedOutcome: string;
  timeout?: number;
}

export type Assertion =
  | FilePresenceAssertion
  | FileContentAssertion
  | BuildCheckAssertion
  | VitestAssertion
  | PlaywrightNLAssertion;

// ==========================================
// Test Scenario Types
// ==========================================
//
// TestScenarios define HOW TO TEST a Skill. Each scenario belongs
// to exactly one Skill and specifies:
// - A trigger prompt (what to ask the agent)
// - Expected files (what should be created)
// - Assertions (how to verify correctness)
//
// ==========================================

/**
 * A file that the agent is expected to create or modify.
 */
export interface ExpectedFile {
  /** Relative path where the file should be created */
  path: string;
  /** Optional: expected content (for content assertions) */
  content?: string;
}

/**
 * A TestScenario defines HOW TO TEST a specific use case of a Skill.
 * 
 * RELATIONSHIP:
 * - Each TestScenario belongs to exactly ONE Skill (via skillId)
 * - Scenarios are NOT reusable across skills
 * - A Skill can have multiple TestScenarios covering different use cases
 * 
 * STRUCTURE:
 * - triggerPrompt: The user message sent to the Agent
 * - expectedFiles: Files the agent should create/modify
 * - assertions: Checks to verify the agent's output is correct
 * 
 * @example
 * ```typescript
 * // Scenario for testing a "create-react-component" skill
 * {
 *   skillId: "skill-create-react-component",
 *   name: "Create Button component",
 *   triggerPrompt: "Create a Button component with primary and secondary variants",
 *   expectedFiles: [
 *     { path: "src/components/Button.tsx" },
 *     { path: "src/components/Button.test.tsx" }
 *   ],
 *   assertions: [
 *     { type: "file_presence", paths: ["src/components/Button.tsx"], shouldExist: true },
 *     { type: "build_check", command: "npm run build", expectSuccess: true },
 *     { type: "vitest", testFile: "...", minPassRate: 100 }
 *   ]
 * }
 * ```
 */
export interface TestScenario {
  id: string;
  /** 
   * @deprecated Use targetGroupId instead. Kept for backward compatibility.
   * The Skill this scenario tests.
   * 
   * BEST PRACTICE: Each scenario should belong to exactly one skill.
   * 
   * When skillId is provided:
   * - The scenario tests that specific skill
   * - Results are attributed to that skill in reports
   * 
   * When skillId is omitted (standalone scenarios):
   * - The scenario can still run, but won't be linked to a skill
   * - Useful for generic tests or cross-skill scenarios in suites
   * - The agent's default behavior is tested without skill context
   */
  skillId?: string;
  /**
   * The Target Group this scenario is bound to.
   * 
   * Target Groups contain one or more targets (Skills, Agents, or Prompt Agents)
   * that this scenario should be evaluated against.
   * 
   * When running evaluation:
   * - Matrix mode: Run against all targets in the group
   * - Selective mode: User picks which targets to evaluate
   */
  targetGroupId?: string;
  /** Test suites this scenario is included in (for organization/grouping) */
  suiteIds?: string[];
  name: string;
  description: string;
  /** The prompt sent to the Agent to trigger the skill */
  triggerPrompt: string;
  /** Files the agent is expected to create or modify */
  expectedFiles: ExpectedFile[];
  /** Assertions to verify the agent's output is correct */
  assertions: Assertion[];
  /** Tags for filtering and organization */
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateTestScenarioInput = Omit<TestScenario, "id" | "createdAt" | "updatedAt">;
export type UpdateTestScenarioInput = Partial<CreateTestScenarioInput>;

// ==========================================
// Test Suite Types
// ==========================================

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  scenarioIds: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateTestSuiteInput = Omit<TestSuite, "id" | "createdAt" | "updatedAt">;
export type UpdateTestSuiteInput = Partial<CreateTestSuiteInput>;

// ==========================================
// Assertion Result Types
// ==========================================

export type AssertionResultStatus = "passed" | "failed" | "skipped" | "error";

export interface AssertionResult {
  id: string;
  assertionId: string;
  assertionType: AssertionType;
  assertionName: string;
  status: AssertionResultStatus;
  message?: string;
  expected?: string;
  actual?: string;
  duration?: number; // ms
  details?: Record<string, unknown>;
}

// ==========================================
// Evaluation Types
// ==========================================
//
// EVALUATION MODEL:
// 
//   EvalRun
//     │
//     ├── skillId: Which Skill is being tested
//     │
//     ├── config: EvalRunConfig
//     │     ├── scenarioIds: Which TestScenarios to run
//     │     └── agentIds: Which Agents to compare
//     │
//     └── results: EvalRunResult[]
//           └── One result per (Scenario × Agent) combination
//
// The evaluation matrix is: Scenarios × Agents
// Each cell produces assertion results and pass/fail metrics.
//
// ==========================================

export type EvalStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type EntityType = "skill" | "scenario" | "variation";

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

/**
 * @deprecated Use EvalRunConfig instead. This was for the old matrix testing
 * approach that included version/model/prompt combinations.
 */
export interface EvalConfig {
  skillVersionIds: string[];
  modelConfigs: ModelConfig[];
  systemPrompts: string[];
  testScenarioIds: string[];
}

export interface EvalMetrics {
  totalAssertions: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  passRate: number;
  avgDuration: number;
  totalDuration: number;
}

export interface EvalRunResult {
  id: string;
  skillVersionId: string;
  modelConfig?: ModelConfig;
  systemPrompt?: string;
  agentId?: string; // Agent used for evaluation
  agentName?: string; // Agent name for display
  toolId?: string; // Alias for agentId (backward compatibility)
  toolName?: string; // Alias for agentName (backward compatibility)
  scenarioId: string;
  scenarioName: string;
  assertionResults: AssertionResult[];
  metrics?: EvalMetrics;
  passed: number;
  failed: number;
  passRate: number;
  duration: number;
  mockOutput?: string; // Simulated skill output
  mockFiles?: ExpectedFile[]; // Simulated generated files
  startedAt?: string;
  completedAt?: string;
}

// ==========================================
// Failure Analysis Types
// ==========================================

export type FailureCategory = 
  | "missing_file" 
  | "wrong_content" 
  | "build_error" 
  | "test_failure" 
  | "runtime_error" 
  | "performance";

export type FailureSeverity = "critical" | "high" | "medium" | "low";

/**
 * Execution trace - what the agent actually did during a run.
 * Used for debugging and understanding agent behavior.
 */
export interface ExecutionTrace {
  /** Commands the agent executed */
  commands: {
    command: string;
    exitCode: number;
    output?: string;
    duration?: number;
  }[];
  /** Files the agent created or modified */
  filesModified: {
    path: string;
    action: "created" | "modified" | "deleted";
    content?: string;
  }[];
  /** API calls made (for LLM agents) */
  apiCalls?: {
    endpoint: string;
    tokensUsed: number;
    duration: number;
  }[];
  /** Total execution time in ms */
  totalDuration: number;
}

/**
 * Diff content for comparing expected vs actual file content.
 */
export interface DiffContent {
  path: string;
  expected: string;
  actual: string;
  /** Pre-computed diff lines for display */
  diffLines?: {
    type: "added" | "removed" | "unchanged";
    content: string;
    lineNumber?: number;
  }[];
}

export interface FailureAnalysis {
  category: FailureCategory;
  severity: FailureSeverity;
  summary: string;
  details: string;
  rootCause: string;
  suggestedFix: string;
  relatedAssertions: string[];
  codeSnippet?: string;
  similarIssues?: string[];
  /** Diff showing expected vs actual content */
  diff?: DiffContent;
  /** Execution trace showing what the agent did */
  executionTrace?: ExecutionTrace;
  /** Pattern ID for grouping similar failures */
  patternId?: string;
}

/**
 * Configuration for running an evaluation.
 * 
 * SIMPLIFIED MODEL:
 * The evaluation matrix is now: Scenarios × Agents
 * 
 * - skillVersionIds removed: Always tests current SKILL.md content
 * - models removed: Each Agent defines its own model
 * - systemPrompts removed: System prompts are part of the SKILL.md
 * 
 * Optional overrides available for advanced use cases.
 */
export interface EvalRunConfig {
  /** Scenarios to run (required) */
  scenarioIds: string[];
  /** Agents to test against (required) */
  agentIds: string[];
  /** Optional: Override the agent's default model */
  modelOverride?: ModelConfig;
  /** How many scenarios to run in parallel (default: 1) */
  parallelism?: number;
  /** Timeout per scenario in ms (default: 60000) */
  timeout?: number;
  
  // Deprecated fields for backward compatibility
  /** @deprecated Use current skill content instead */
  skillVersionIds?: string[];
  /** @deprecated Use agent's default model or modelOverride */
  models?: ModelConfig[];
  /** @deprecated System prompts are part of SKILL.md now */
  systemPrompts?: string[];
  /** @deprecated Use agentIds instead */
  toolIds?: string[];
}

export interface EvalRun {
  id: string;
  name: string;
  skillId: string;
  skillName: string;
  config: EvalRunConfig;
  status: EvalStatus;
  progress: number;
  results: EvalRunResult[];
  aggregateMetrics: EvalMetrics;
  failureAnalyses?: FailureAnalysis[];
  startedAt: string;
  completedAt?: string;
}

export type CreateEvalRunInput = {
  name: string;
  skillId: string;
  config: EvalRunConfig;
};

// ==========================================
// Label Configuration (for human review)
// ==========================================

export interface Label {
  id: string;
  resultId: string;
  type: string;
  value: string;
  notes?: string;
  labeledBy: string;
  labeledAt: string;
}

export interface LabelConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  shortcut: string;
}

export const DEFAULT_LABELS: LabelConfig[] = [
  { id: "correct", name: "Correct", color: "success", icon: "check", shortcut: "1" },
  { id: "incorrect", name: "Incorrect", color: "error", icon: "x", shortcut: "2" },
  { id: "partial", name: "Partial", color: "warning", icon: "minus", shortcut: "3" },
  { id: "needs-review", name: "Needs Review", color: "primary", icon: "eye", shortcut: "4" },
  { id: "invalid", name: "Invalid", color: "gray", icon: "ban", shortcut: "5" },
  { id: "excellent", name: "Excellent", color: "success", icon: "star", shortcut: "6" },
];

// ==========================================
// Agent Types (CLI-Based Coding Agents)
// ==========================================

export type AgentType = "claude_code" | "codex" | "cursor_cli" | "custom";

// Template file to copy into workspace before running agent
export interface TemplateFile {
  sourcePath?: string;  // Path to template file (for file-based templates)
  targetPath: string;   // Where to copy/create in workspace
  content?: string;     // Inline content (alternative to sourcePath)
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AgentType;
  
  // CLI Execution
  runCommand: string;              // e.g., "npx @anthropic-ai/claude-code"
  runArgs?: string[];              // Additional CLI arguments
  
  // Template Filesystem Setup
  workingDirectory?: string;       // Base path for execution
  templateFiles?: TemplateFile[];  // Files to copy into workspace before running
  envVars?: Record<string, string>; // Environment variables for the command
  
  // Optional LLM Config (can be passed via CLI args for some agents)
  modelConfig?: ModelConfig;
  
  // Metadata
  capabilities: string[];
  isBuiltIn: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateAgentInput = Omit<Agent, "id" | "createdAt" | "updatedAt" | "isBuiltIn">;
export type UpdateAgentInput = Partial<CreateAgentInput>;

// Built-in agents
export const BUILTIN_AGENTS: Agent[] = [
  {
    id: "agent-claude-code",
    type: "claude_code",
    name: "Claude Code",
    description: "Anthropic's Claude-powered coding agent with careful, thorough code generation",
    icon: "brain",
    runCommand: "npx",
    runArgs: ["@anthropic-ai/claude-code", "run"],
    capabilities: [
      "File creation and modification",
      "Multi-file refactoring",
      "Test generation",
      "Documentation",
      "Code review",
      "Careful reasoning",
    ],
    isBuiltIn: true,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "agent-codex",
    type: "codex",
    name: "OpenAI Codex CLI",
    description: "OpenAI's fast code generation CLI optimized for speed",
    icon: "zap",
    runCommand: "npx",
    runArgs: ["@openai/codex", "run"],
    capabilities: [
      "Fast code completion",
      "Function generation",
      "Code translation",
      "Quick prototyping",
      "API integration",
    ],
    isBuiltIn: true,
    isDefault: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "agent-cursor-cli",
    type: "cursor_cli",
    name: "Cursor CLI",
    description: "Cursor's AI-powered coding assistant with IDE integration",
    icon: "terminal",
    runCommand: "cursor",
    runArgs: ["--cli", "run"],
    capabilities: [
      "Context-aware editing",
      "Codebase understanding",
      "Intelligent autocomplete",
      "Multi-file changes",
      "Chat-based coding",
      "Symbol navigation",
    ],
    isBuiltIn: true,
    isDefault: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// ==========================================
// Settings Types
// ==========================================

export interface APIKeyConfig {
  provider: LLMProvider;
  key: string;
  isValid: boolean;
}

export interface Settings {
  apiKeys: APIKeyConfig[];
  defaultModel: ModelConfig;
  defaultAgent: string; // Agent ID
  labelConfigs: LabelConfig[];
  theme: "light" | "dark" | "system";
}

// ==========================================
// UI Types
// ==========================================

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

// ==========================================
// Comparison Types
// ==========================================

export interface ComparisonCell {
  skillVersionId: string;
  modelConfig: ModelConfig;
  systemPrompt?: string;
  agentId?: string;
  agentName?: string;
  scenarioId: string;
  passRate: number;
  passed: number;
  failed: number;
  total: number;
}

export interface ComparisonMatrix {
  rows: string[]; // e.g., skill version names
  columns: string[]; // e.g., model names
  cells: ComparisonCell[][];
}

export interface TrendPoint {
  date: string;
  passRate: number;
  totalTests: number;
  skillVersion?: string;
}

// ==========================================
// Target Group Types
// ==========================================
//
// Target Groups unify different testable entities:
// - agent_skill: References an existing Skill (SKILL.md)
// - coding_agent: References an existing Agent (CLI command)
// - prompt_agent: Inline configuration with systemPrompt + MCP servers
//
// Test Scenarios are bound to Target Groups instead of directly to Skills.
//
// ==========================================

/**
 * Target type discriminator for polymorphic Target entity.
 */
export type TargetType = "agent_skill" | "coding_agent" | "prompt_agent";

/**
 * MCP Server Configuration for Prompt Agents.
 * Defines how to connect to an MCP server.
 */
export interface MCPServerConfig {
  /** Unique name for this MCP server */
  name: string;
  /** Command to start the MCP server */
  command: string;
  /** Command line arguments */
  args?: string[];
  /** Environment variables for the server process */
  envVars?: Record<string, string>;
}

/**
 * Prompt Agent Configuration.
 * An inline agent definition with a system prompt and optional MCP servers.
 * Unlike Coding Agents, these don't have a CLI command - they're pure prompt-based.
 */
export interface PromptAgentConfig {
  /** Display name for this prompt agent */
  name: string;
  /** Optional description */
  description?: string;
  /** The system prompt that defines agent behavior */
  systemPrompt: string;
  /** MCP servers this agent can connect to */
  mcpServers: MCPServerConfig[];
  /** Optional model configuration override */
  modelConfig?: ModelConfig;
}

/**
 * A standalone Prompt Agent entity.
 * Can be managed independently and referenced by Target Groups.
 */
export interface PromptAgent {
  id: string;
  name: string;
  description: string;
  /** The system prompt that defines agent behavior */
  systemPrompt: string;
  /** MCP servers this agent can connect to */
  mcpServers: MCPServerConfig[];
  /** Model configuration for this agent */
  modelConfig: ModelConfig;
  /** Tags for organization */
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreatePromptAgentInput = Omit<PromptAgent, "id" | "createdAt" | "updatedAt">;
export type UpdatePromptAgentInput = Partial<CreatePromptAgentInput>;

/**
 * A Target represents a testable entity within a Target Group.
 * 
 * Polymorphic type - exactly one of the reference fields should be set
 * based on the `type` discriminator.
 * 
 * @example
 * // Agent Skill target
 * { id: "t1", type: "agent_skill", skillId: "skill-123" }
 * 
 * // Coding Agent target
 * { id: "t2", type: "coding_agent", agentId: "agent-456" }
 * 
 * // Prompt Agent target (reference to standalone entity)
 * { id: "t3", type: "prompt_agent", promptAgentId: "pa-789" }
 * 
 * // Prompt Agent target (inline config - legacy/quick setup)
 * { id: "t4", type: "prompt_agent", promptAgentConfig: { name: "...", systemPrompt: "...", mcpServers: [] } }
 */
export interface Target {
  id: string;
  type: TargetType;
  /** For agent_skill: Reference to a Skill entity */
  skillId?: string;
  /** For coding_agent: Reference to an Agent entity */
  agentId?: string;
  /** For prompt_agent: Reference to a PromptAgent entity */
  promptAgentId?: string;
  /** For prompt_agent: Inline prompt agent configuration (alternative to promptAgentId) */
  promptAgentConfig?: PromptAgentConfig;
}

/**
 * A Target Group is a collection of testable targets.
 * 
 * Test Scenarios are bound to Target Groups. When running an evaluation,
 * you can either run against all targets in the group (matrix mode)
 * or select specific targets to evaluate.
 * 
 * @example
 * ```typescript
 * {
 *   id: "tg-1",
 *   name: "React Development",
 *   description: "Targets for React component development",
 *   targets: [
 *     { id: "t1", type: "agent_skill", skillId: "skill-react" },
 *     { id: "t2", type: "coding_agent", agentId: "agent-claude-code" }
 *   ]
 * }
 * ```
 */
export interface TargetGroup {
  id: string;
  name: string;
  description: string;
  targets: Target[];
  createdAt: string;
  updatedAt: string;
}

export type CreateTargetGroupInput = Omit<TargetGroup, "id" | "createdAt" | "updatedAt">;
export type UpdateTargetGroupInput = Partial<CreateTargetGroupInput>;

export type CreateTargetInput = Omit<Target, "id">;
export type UpdateTargetInput = Partial<CreateTargetInput>;

// ==========================================
// Type Aliases (Backward Compatibility)
// ==========================================
// CodingTool is an alias for Agent - they represent the same concept
// (CLI-based coding agents like Claude Code, Codex, Cursor)

export type CodingTool = Agent;
export type CodingToolType = AgentType;
export type CreateCodingToolInput = CreateAgentInput;
export type UpdateCodingToolInput = UpdateAgentInput;
export const BUILTIN_TOOLS = BUILTIN_AGENTS;

// ==========================================
// Self-Improving Evaluation Types
// ==========================================

/**
 * Represents a single change made during an improvement iteration.
 */
export interface ImprovementChange {
  /** The field that was changed (e.g., "systemPrompt", "skillMd", "temperature") */
  field: string;
  /** The value before the change */
  before: string;
  /** The value after the change */
  after: string;
  /** Why this change was made */
  reason: string;
}

/**
 * A snapshot of a target's state at a specific iteration.
 */
export interface TargetSnapshot {
  /** For skills: the SKILL.md content */
  skillMd?: string;
  /** For prompt agents: the system prompt */
  systemPrompt?: string;
  /** Model configuration snapshot */
  modelConfig?: ModelConfig;
  /** For prompt agents: MCP server configs */
  mcpServers?: MCPServerConfig[];
}

/**
 * Represents a single iteration in the improvement process.
 */
export interface ImprovementIteration {
  id: string;
  iterationNumber: number;
  /** Pass rate achieved in this iteration (0-100) */
  passRate: number;
  /** Number of assertions passed */
  passed: number;
  /** Number of assertions failed */
  failed: number;
  /** Changes applied after this evaluation (empty for final iteration) */
  changes: ImprovementChange[];
  /** LLM feedback that led to the changes */
  feedback: string;
  /** Snapshot of the target at this iteration */
  targetSnapshot: TargetSnapshot;
  /** When this iteration was evaluated */
  evaluatedAt: string;
}

/**
 * Status of an improvement run.
 */
export type ImprovementRunStatus = "pending" | "running" | "completed" | "failed";

/**
 * Type of target being improved.
 */
export type ImprovementTargetType = "skill" | "prompt_agent" | "coding_agent";

/**
 * Represents a complete self-improving evaluation run.
 */
export interface ImprovementRun {
  id: string;
  /** Type of target being improved */
  targetType: ImprovementTargetType;
  /** ID of the target being improved */
  targetId: string;
  /** Display name of the target */
  targetName: string;
  /** Current status of the run */
  status: ImprovementRunStatus;
  /** Maximum number of iterations to run */
  maxIterations: number;
  /** All iterations completed so far */
  iterations: ImprovementIteration[];
  /** Pass rate from the first iteration */
  initialPassRate: number;
  /** Pass rate from the last iteration */
  finalPassRate: number;
  /** Improvement in percentage points (finalPassRate - initialPassRate) */
  improvement: number;
  /** When the run was started */
  startedAt: string;
  /** When the run completed (if completed) */
  completedAt?: string;
}

export type CreateImprovementRunInput = {
  targetType: ImprovementTargetType;
  targetId: string;
  targetName: string;
  maxIterations: number;
};
