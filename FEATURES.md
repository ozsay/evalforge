# EvalForge - Agent Evaluation Platform

## ✅ Implemented Features

### 1. SKILL.md Management
- **Create Skills**: Add Claude Code Agent Skills with YAML frontmatter
- **SKILL.md Editor**: Syntax-aware editor for SKILL.md files with validation
- **Metadata Parsing**: Automatic extraction of name, description, allowed-tools from frontmatter
- **Version History**: Track changes across skill versions with model/prompt configuration
- **Import/Export**: Load from file or export skills as .md files
- **Sync Sources**: Synchronize skills from external sources:
  - **GitHub**: Sync SKILL.md from any GitHub repository (owner/repo, branch, path)
  - **PromptHub**: Sync from internal PromptHub tool by ID
  - **Unsynced**: Local-only skills (default)

### 2. Target Groups
- **Group Management**: Create, edit, and manage target groups
- **Polymorphic Targets**: Group different types of testable targets:
  - **Agent Skills**: Reference existing SKILL.md definitions
  - **Coding Agents**: Reference configured coding agents (CLI-based)
  - **Prompt Agents**: Inline agent configurations with system prompts and MCP
- **Hierarchical Navigation**: Browse target groups by type in sidebar
- **Test Binding**: Test scenarios are bound to target groups for comprehensive testing

### 3. Prompt Agents
- **Inline Configuration**: Define agents with system prompts directly in the UI
- **MCP Server Support**: Configure multiple MCP servers per agent:
  - Server name, command, arguments
  - Environment variables
- **Model Configuration**: Per-agent LLM settings (provider, model, temperature, tokens)
- **Tags**: Organize prompt agents with custom tags

### 4. Test Scenarios with Visual Assertion Builder
- **Scenario Management**: Create, edit, duplicate, and delete test scenarios
- **Target Group Binding**: Associate scenarios with target groups (not individual skills)
- **Test Suites**: Group scenarios into reusable test suites
- **Trigger Prompts**: Define prompts that activate skills
- **Expected Files**: Specify expected file outputs from skill execution

### 5. Assertion Types (5 Types Implemented)
- **File Presence**: Check if specific files exist or don't exist
- **File Content**: Assert file contents contain/exclude strings, match regex, or JSON path values
- **Build Check**: Run build commands and validate success/failure with warning thresholds
- **Vitest Tests**: Execute custom test files with configurable pass rate thresholds
- **Playwright (Natural Language)**: Define E2E tests with plain English steps and expected outcomes

### 6. Mock Skill Execution Engine
- **Simulated File System**: Virtual file system for testing without real file operations
- **Mock LLM Responses**: Realistic mock outputs based on trigger prompt patterns
- **Assertion Runner**: Execute all assertion types against mock file system

### 7. Evaluation Runner with Matrix Testing
- **Version Selection**: Compare multiple skill versions in single run
- **Model Selection**: Test across different LLM providers and models (OpenAI, Anthropic, Google, Local)
- **System Prompt Variations**: Test different prompts against same skill
- **Scenario Selection**: Run multiple test scenarios in matrix configuration
- **Live Results**: Real-time display of evaluation progress and assertion results

### 8. Self-Improving Evaluation
- **Iterative Improvement**: Run evaluation cycles that automatically improve targets
- **Target Selection**: Choose any target (skill, coding agent, or prompt agent)
- **Test Suite Binding**: Run improvements against a specific test suite
- **Feedback Generation**: System generates improvement suggestions after each iteration
- **Progress Tracking**: Visual display of improvement iterations and metrics
- **Improvement Metrics**: Track pass rate changes and overall improvement percentage
- **Run History**: View all improvement runs with detailed iteration breakdown

### 9. Results & Comparison
- **Overview Dashboard**: Summary statistics across all evaluation runs
- **Comparison Heatmap**: Visual matrix comparing pass rates across runs and scenarios
- **Trend Charts**: Historical pass rate and assertion trends over time
- **Export**: Download results as JSON for external analysis
- **Run Selection**: Select and compare up to 5 runs side-by-side

### 10. Human-in-the-Loop Labeling
- **Label Panel**: Quick labeling with configurable labels (Correct, Incorrect, Partial, etc.)
- **Keyboard Shortcuts**: Speed through labeling with 1-6 keys and arrow navigation
- **Filter Options**: Filter by skill, run, or label status
- **Progress Tracking**: Session stats showing reviewed vs remaining items

### 11. Coding Agents Configuration
- **Agent Management**: Create custom coding agents with unique configurations
- **Built-in Agents**: Pre-configured agents (Claude Code, Aider, Codex CLI, etc.)
- **Wix Agents**: Specialized agents for Wix development:
  - **Wix Vibe**: AI-powered site and component building
  - **Wix App Builder**: Dashboard apps, widgets, and Blocks
  - **Wix Claude Coder**: Claude CLI with Wix MCP capabilities
- **Model Configuration**: Per-agent LLM provider, model, temperature, and token settings
- **Default Agent**: Set preferred agent for evaluations

### 12. Settings
- **API Key Management**: Configure keys for all supported LLM providers
- **Default Model**: Set global default model configuration
- **Label Configuration**: Customize labeling options and shortcuts
- **Demo Data**: Load or clear demo data for testing

### 13. Dashboard
- **Stats Overview**: Quick view of target groups, scenarios, runs, and pass rates
- **Quick Actions**: One-click navigation to create skills, add scenarios, run evaluations
- **Recent Activity**: Latest evaluation runs with status and metrics
- **Getting Started**: Onboarding guide for new users

## Data Models

```typescript
// Core Skill (SKILL.md) with Sync Support
interface Skill {
  id: string;
  name: string;
  description: string;
  skillMd: string;
  metadata: SkillMetadata;
  versions: SkillVersion[];
  testScenarios: string[];
  syncSource?: SkillSyncSource; // GitHub, PromptHub, or none
}

// Sync Source Types
type SkillSyncSource = 
  | { type: "github"; repository: string; branch?: string; path: string; }
  | { type: "prompthub"; promptHubId: string; version?: string; }
  | { type: "none" };

// Target Group (groups multiple testable targets)
interface TargetGroup {
  id: string;
  name: string;
  description: string;
  targets: Target[];
}

// Polymorphic Target
interface Target {
  id: string;
  type: "agent_skill" | "coding_agent" | "prompt_agent";
  skillId?: string;           // For agent_skill
  agentId?: string;           // For coding_agent
  promptAgentConfig?: PromptAgentConfig; // For prompt_agent
}

// Prompt Agent (inline configuration)
interface PromptAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  mcpServers: MCPServerConfig[];
  modelConfig?: ModelConfig;
}

// Test Scenario with Target Group binding
interface TestScenario {
  id: string;
  targetGroupId?: string;  // Bound to target group
  suiteIds?: string[];     // Part of test suites
  name: string;
  triggerPrompt: string;
  expectedFiles: ExpectedFile[];
  assertions: Assertion[];
}

// Assertion Types
type Assertion = 
  | FilePresenceAssertion
  | FileContentAssertion
  | BuildCheckAssertion
  | VitestAssertion
  | PlaywrightNLAssertion;

// Self-Improving Evaluation Run
interface ImprovementRun {
  id: string;
  targetId: string;
  targetType: "skill" | "coding_agent" | "prompt_agent";
  testSuiteId: string;      // Runs against a test suite
  testSuiteName: string;
  iterations: ImprovementIteration[];
  status: "pending" | "running" | "completed" | "failed";
  initialPassRate: number;
  currentPassRate: number;
  improvement: number;
}

// Evaluation Run
interface EvalRun {
  id: string;
  skillId: string;
  config: EvalConfig;
  results: EvalRunResult[];
  aggregateMetrics: EvalMetrics;
}
```

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State**: Zustand with localStorage persistence
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6

## Navigation Structure

```
/dashboard         - Overview and quick actions
/target-groups     - Manage target groups (skills, agents, prompt agents)
  └── /skills      - Agent skills subcategory
  └── /agents      - Coding agents subcategory  
  └── /prompt-agents - Prompt agents subcategory
/skills            - SKILL.md management with sync sources
/scenarios         - Test scenarios with target group binding
/agents            - Coding agent configuration
/prompt-agents     - Prompt agent management
/evaluation        - Run evaluations with matrix config
/self-improving    - Self-improving evaluation runs
/results           - View and compare results
/labeling          - Human review and labeling
/settings          - API keys and preferences
```

## Demo Data (Wix-specific)

### Skills
- Wix Dashboard Page - Basic (PromptHub synced)
- Wix Dashboard Page - Advanced (GitHub synced)
- Wix Backend - HTTP Functions (PromptHub synced)
- Wix Backend - Velo Backend
- React Component Generator (GitHub synced)

### Coding Agents
- Wix Vibe - AI-powered site building
- Wix App Builder - Dashboard apps, widgets, Blocks
- Wix Claude Coder - Claude CLI with Wix MCP

### Prompt Agents
- Wix Chat - General Assistant
- Wix Chat - Developer Mode
- Wix Chat - Support Specialist

## Running the Application

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or next available port) in your browser.
