# EvalForge - Agent Skills Testing Platform

## ✅ Implemented Features

### 1. SKILL.md Management
- **Create Skills**: Add Claude Code Agent Skills with YAML frontmatter
- **SKILL.md Editor**: Syntax-aware editor for SKILL.md files with validation
- **Metadata Parsing**: Automatic extraction of name, description, allowed-tools from frontmatter
- **Version History**: Track changes across skill versions with model/prompt configuration
- **Import/Export**: Load from file or export skills as .md files

### 2. Test Scenarios with Visual Assertion Builder
- **Scenario Management**: Create, edit, duplicate, and delete test scenarios
- **Trigger Prompts**: Define prompts that activate skills
- **Expected Files**: Specify expected file outputs from skill execution

### 3. Assertion Types (5 Types Implemented)
- **File Presence**: Check if specific files exist or don't exist
- **File Content**: Assert file contents contain/exclude strings, match regex, or JSON path values
- **Build Check**: Run build commands and validate success/failure with warning thresholds
- **Vitest Tests**: Execute custom test files with configurable pass rate thresholds
- **Playwright (Natural Language)**: Define E2E tests with plain English steps and expected outcomes

### 4. Mock Skill Execution Engine
- **Simulated File System**: Virtual file system for testing without real file operations
- **Mock LLM Responses**: Realistic mock outputs based on trigger prompt patterns
- **Assertion Runner**: Execute all assertion types against mock file system

### 5. Evaluation Runner with Matrix Testing
- **Version Selection**: Compare multiple skill versions in single run
- **Model Selection**: Test across different LLM providers and models (OpenAI, Anthropic, Google, Local)
- **System Prompt Variations**: Test different prompts against same skill
- **Scenario Selection**: Run multiple test scenarios in matrix configuration
- **Live Results**: Real-time display of evaluation progress and assertion results

### 6. Results & Comparison
- **Overview Dashboard**: Summary statistics across all evaluation runs
- **Comparison Heatmap**: Visual matrix comparing pass rates across runs and scenarios
- **Trend Charts**: Historical pass rate and assertion trends over time
- **Export**: Download results as JSON for external analysis
- **Run Selection**: Select and compare up to 5 runs side-by-side

### 7. Human-in-the-Loop Labeling
- **Label Panel**: Quick labeling with configurable labels (Correct, Incorrect, Partial, etc.)
- **Keyboard Shortcuts**: Speed through labeling with 1-6 keys and arrow navigation
- **Filter Options**: Filter by skill, run, or label status
- **Progress Tracking**: Session stats showing reviewed vs remaining items

### 8. Coding Agents Configuration
- **Agent Management**: Create custom coding agents with unique system prompts
- **Model Configuration**: Per-agent LLM provider, model, temperature, and token settings
- **Default Agent**: Set preferred agent for evaluations

### 9. Settings
- **API Key Management**: Configure keys for all supported LLM providers
- **Default Model**: Set global default model configuration
- **Label Configuration**: Customize labeling options and shortcuts

### 10. Dashboard
- **Stats Overview**: Quick view of skills, scenarios, runs, and pass rates
- **Quick Actions**: One-click navigation to create skills, add scenarios, run evaluations
- **Recent Activity**: Latest evaluation runs with status and metrics
- **Getting Started**: Onboarding guide for new users

## Data Models

```typescript
// Core Skill (SKILL.md)
interface Skill {
  id: string;
  name: string;
  description: string;
  skillMd: string;
  metadata: SkillMetadata;
  versions: SkillVersion[];
  testScenarios: string[];
}

// Test Scenario with Assertions
interface TestScenario {
  id: string;
  skillId: string;
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
/skills            - SKILL.md management
/scenarios         - Test scenarios with assertions
/agents            - Coding agent configuration
/evaluation        - Run evaluations with matrix config
/results           - View and compare results
/labeling          - Human review and labeling
/settings          - API keys and preferences
```

## Running the Application

```bash
cd demo-eval
npm install
npm run dev
```

Open http://localhost:5173 (or next available port) in your browser.
