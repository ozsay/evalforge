# EvalForge

## The Evaluation Platform for AI Coding Agents

---

## Vision

**Make AI coding agents reliable, measurable, and continuously improving.**

EvalForge is the quality assurance layer for AI-powered development tools. As organizations deploy AI coding agents across their engineering workflows, they need confidence that these agents perform correctly, consistently, and improve over time.

---

## The Problem

### AI Coding Agents Are Everywhere—But How Do You Trust Them?

Organizations are rapidly adopting AI coding agents (Claude Code, Cursor, Aider, custom agents) to accelerate development. But they face critical challenges:

| Challenge | Impact |
|-----------|--------|
| **No standardized testing** | Can't verify agent outputs systematically |
| **Black box behavior** | Hard to understand why agents succeed or fail |
| **Regression risk** | Prompt changes can break working behaviors |
| **Model dependency** | Different LLMs produce different results |
| **Scale problems** | Manual review doesn't scale with agent usage |

**The result?** Teams either slow down to manually verify every output, or ship with uncertainty about agent reliability.

---

## The Solution

### EvalForge: Systematic Evaluation for AI Agents

EvalForge provides a complete evaluation framework that lets you:

1. **Define** what good agent output looks like
2. **Test** agents systematically across scenarios
3. **Compare** performance across models, prompts, and versions
4. **Improve** agents through automated feedback loops
5. **Monitor** quality over time with human-in-the-loop validation

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         EvalForge                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   DEFINE     │    │    TEST      │    │   IMPROVE    │     │
│   │              │    │              │    │              │     │
│   │ • Skills     │───▶│ • Scenarios  │───▶│ • Feedback   │     │
│   │ • Agents     │    │ • Assertions │    │ • Iterations │     │
│   │ • Prompts    │    │ • Matrix     │    │ • Metrics    │     │
│   └──────────────┘    └──────────────┘    └──────────────┘     │
│          │                   │                   │              │
│          ▼                   ▼                   ▼              │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    INSIGHTS                              │  │
│   │  Pass rates • Trends • Comparisons • Failure analysis   │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Capabilities

### 🎯 Target Groups
Organize and test any combination of AI targets:
- **Agent Skills** — SKILL.md definitions for Claude Code and similar
- **Coding Agents** — CLI-based agents (Claude Code, Aider, custom)
- **Prompt Agents** — Custom prompts with MCP server integrations

### 📋 Test Scenarios
Define comprehensive test cases with:
- Natural language trigger prompts
- Expected file outputs
- Multi-layer assertions (files, content, builds, tests, E2E)

### 🔬 Matrix Evaluation
Test systematically across dimensions:
- Multiple model providers (OpenAI, Anthropic, Google)
- Different prompt versions
- Various skill configurations
- Parallel scenario execution

### 🔄 Self-Improving Evaluation
Automated improvement cycles:
- Select target and test suite
- Run initial evaluation against the suite
- Generate improvement feedback
- Re-evaluate with changes
- Track improvement metrics across iterations

### 👁️ Human-in-the-Loop
Efficient manual review:
- Keyboard-driven labeling
- Configurable label taxonomies
- Progress tracking
- Quality gates

### 📊 Analytics & Comparison
Understand performance at a glance:
- Pass rate dashboards
- Comparison heatmaps
- Trend analysis over time
- Failure pattern detection

---

## Use Cases

### 1. Skill Development & Validation
> "Before deploying a new SKILL.md, I need to know it works correctly across edge cases."

- Create test scenarios for each skill capability
- Run matrix evaluations across models
- Validate before production deployment

### 2. Prompt Engineering
> "How do I know if my prompt change improved or broke the agent?"

- Version control for prompts with sync from GitHub/PromptHub
- A/B testing across prompt variations
- Quantified improvement metrics

### 3. Model Migration
> "We want to switch from GPT-4 to Claude—what breaks?"

- Same scenarios, different models
- Side-by-side comparison
- Regression detection

### 4. Continuous Quality
> "Our agents need to stay reliable as we iterate."

- Automated evaluation runs
- Trend monitoring
- Alert on regression

### 5. Agent Improvement
> "This agent is at 70% pass rate—how do I get to 90%?"

- Self-improving evaluation cycles
- Automated feedback generation
- Iterative refinement tracking

---

## Key Differentiators

| Feature | EvalForge | Manual Testing | Generic CI |
|---------|-----------|----------------|------------|
| Agent-aware assertions | ✅ | ❌ | ❌ |
| Multi-model testing | ✅ | Limited | ❌ |
| Natural language E2E | ✅ | ❌ | ❌ |
| Self-improvement loops | ✅ | ❌ | ❌ |
| Human labeling workflow | ✅ | Manual | ❌ |
| Skill/Prompt versioning | ✅ | Manual | Limited |
| MCP integration | ✅ | ❌ | ❌ |

---

## Platform Overview

### Dashboard
Central command center with:
- Key metrics at a glance
- Quick actions for common workflows
- Recent activity feed
- Onboarding guidance

### Target Groups
Unified management for all testable targets:
- Create and organize groups
- Mix different target types
- Bind to test scenarios

### Skills
SKILL.md lifecycle management:
- Rich editor with validation
- Version history
- Sync from GitHub or PromptHub
- Import/Export

### Scenarios
Test case builder:
- Visual assertion configuration
- 5 assertion types
- Suite organization
- Target group binding

### Evaluation
Matrix test runner:
- Configure dimensions
- Real-time progress
- Live results streaming

### Self-Improving
Automated improvement:
- Select target and scenarios
- Run improvement cycles
- Track progress across iterations
- Measure improvement

### Results
Analysis and comparison:
- Heatmap visualization
- Trend charts
- Multi-run comparison
- JSON export

### Labeling
Human review interface:
- Efficient keyboard workflow
- Configurable labels
- Filter and sort
- Session statistics

---

## Target Users

### 🧑‍💻 AI Platform Teams
Building and maintaining AI coding agents for their organization.
- Need systematic quality assurance
- Want to iterate quickly with confidence
- Require metrics for stakeholders

### 🛠️ Developer Experience Teams
Deploying AI tools to engineering teams.
- Need to validate agent reliability
- Want to compare tool options
- Require quality gates before rollout

### 🔬 Prompt Engineers
Optimizing agent behavior through prompts.
- Need rapid iteration feedback
- Want quantified improvement metrics
- Require A/B testing capabilities

### 🏢 Engineering Leadership
Responsible for AI tool adoption.
- Need visibility into agent quality
- Want trend data for decisions
- Require risk assessment

---

## Wix Integration

EvalForge includes first-class support for Wix development workflows:

### Pre-configured Agents
- **Wix Vibe** — AI-powered site and component building
- **Wix App Builder** — Dashboard apps, widgets, and Blocks
- **Wix Claude Coder** — Claude CLI with Wix MCP capabilities

### Wix-Specific Skills
- Dashboard page development
- Backend HTTP functions
- Velo backend modules

### Prompt Agents with Wix MCP
- Wix Chat variants with MCP server integration
- Full platform API access
- Site, app, and data capabilities

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the platform
npm run dev

# Open in browser
open http://localhost:5173
```

### Quick Start Flow
1. **Load demo data** — See the platform with realistic examples
2. **Explore target groups** — Understand how targets are organized
3. **Run an evaluation** — Execute test scenarios
4. **View results** — Analyze pass rates and trends
5. **Try self-improving** — Watch an agent get better automatically

---

## Roadmap

### Now
- ✅ Target Groups with polymorphic targets
- ✅ 5 assertion types
- ✅ Matrix evaluation
- ✅ Self-improving evaluation
- ✅ Human labeling

### Next
- 🔜 GitHub Actions integration
- 🔜 Slack/Teams notifications
- 🔜 Scheduled evaluation runs
- 🔜 Custom assertion plugins

### Future
- 🔮 Live agent monitoring
- 🔮 Automatic failure remediation
- 🔮 Cross-organization benchmarks
- 🔮 Agent marketplace integration

---

## Summary

**EvalForge transforms AI agent quality from guesswork into science.**

| Before EvalForge | With EvalForge |
|------------------|----------------|
| "Does this agent work?" | "This agent passes 94% of scenarios" |
| "Is the new prompt better?" | "Pass rate improved 12% vs baseline" |
| "Which model should we use?" | "Claude outperforms GPT-4 on 7/10 skills" |
| "How do we improve this?" | "Self-improvement cycle raised pass rate to 89%" |

---

*EvalForge — Because reliable AI agents shouldn't be a matter of luck.*
