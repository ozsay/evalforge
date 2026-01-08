# Testing at Scale & LLM-Generated Tests Plan

## Overview

This plan addresses two key challenges:
1. **Scale**: Running thousands of test scenarios efficiently
2. **LLM-Generated Tests**: Automatically creating test scenarios and assertions using AI

---

## Part 1: Testing at Scale

### 1.1 Test Organization & Discovery

```
Problem: Managing hundreds of skills with thousands of scenarios becomes unwieldy
```

**Solution: Hierarchical Organization**

```typescript
interface TestSuite {
  id: string;
  name: string;
  description: string;
  tags: string[];
  skills: string[];           // Skill IDs
  scenarios: string[];        // Scenario IDs (can span multiple skills)
  config: {
    parallelism: number;      // Max concurrent tests
    timeout: number;          // Per-test timeout
    retries: number;          // Retry failed tests
    failFast: boolean;        // Stop on first failure
  };
}

interface TestTag {
  id: string;
  name: string;
  color: string;
  description: string;
}
```

**UI Additions:**
- Folder/workspace view for organizing skills
- Tag-based filtering (e.g., `#critical`, `#regression`, `#smoke`)
- Search with query syntax: `tag:critical model:claude-3 status:failing`
- Saved filters / "smart folders"

### 1.2 Batch Execution Engine

```
Problem: Running 1000+ scenarios sequentially takes too long
```

**Solution: Worker Pool Architecture**

```typescript
interface BatchConfig {
  maxConcurrency: number;     // Default: 10
  chunkSize: number;          // Scenarios per chunk
  priorityQueue: boolean;     // Run failing tests first
  cacheStrategy: 'none' | 'content-hash' | 'ttl';
}

interface ExecutionPlan {
  id: string;
  chunks: ExecutionChunk[];
  estimatedDuration: number;
  priorityOrder: string[];    // Scenario IDs in priority order
}

interface ExecutionChunk {
  id: string;
  scenarios: string[];
  status: 'pending' | 'running' | 'completed';
  workerId?: string;
}
```

**Implementation:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Batch Controller                          │
│  - Receives evaluation request                               │
│  - Builds execution plan                                     │
│  - Manages worker pool                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │Worker 1 │   │Worker 2 │   │Worker N │
   │         │   │         │   │         │
   │ Chunk A │   │ Chunk B │   │ Chunk C │
   └────┬────┘   └────┬────┘   └────┬────┘
        │             │             │
        └─────────────┼─────────────┘
                      ▼
              ┌──────────────┐
              │Result Aggregator│
              │  - Metrics      │
              │  - Reports      │
              └──────────────┘
```

### 1.3 Result Caching & Deduplication

```
Problem: Re-running identical tests wastes compute
```

**Solution: Content-Addressed Caching**

```typescript
interface CacheKey {
  skillContentHash: string;     // Hash of SKILL.md
  scenarioContentHash: string;  // Hash of trigger + assertions
  modelFingerprint: string;     // model + temperature + tokens
  systemPromptHash?: string;
}

interface CachedResult {
  key: CacheKey;
  result: EvalRunResult;
  cachedAt: string;
  hitCount: number;
  ttl?: number;                 // Time-to-live in seconds
}

// Cache invalidation rules
interface CachePolicy {
  maxAge: number;               // Max cache age in seconds
  maxSize: number;              // Max cache entries
  invalidateOn: ('skill_change' | 'scenario_change' | 'model_change')[];
}
```

### 1.4 Incremental Testing

```
Problem: Running full test suite on every change is slow
```

**Solution: Impact Analysis**

```typescript
interface ChangeImpact {
  changedSkillIds: string[];
  affectedScenarios: string[];
  recommendedTests: string[];   // Minimum test set
  confidence: number;           // 0-1 confidence in recommendations
}

// Dependency graph
interface DependencyGraph {
  nodes: Map<string, SkillNode>;
  edges: Map<string, string[]>; // skill -> dependent scenarios
}

function analyzeImpact(
  changes: FileChange[],
  graph: DependencyGraph
): ChangeImpact;
```

**Modes:**
1. **Full Suite**: Run everything
2. **Affected Only**: Run tests affected by recent changes
3. **Failing First**: Prioritize previously failing tests
4. **Smoke Tests**: Run tagged critical path tests only

### 1.5 Distributed Execution (Future)

For very large test suites, support distributed execution:

```typescript
interface DistributedConfig {
  mode: 'local' | 'remote' | 'hybrid';
  workers: WorkerNode[];
  loadBalancing: 'round-robin' | 'least-loaded' | 'locality';
}

interface WorkerNode {
  id: string;
  endpoint: string;
  capabilities: string[];       // e.g., ['gpu', 'local-llm']
  maxConcurrency: number;
  currentLoad: number;
}
```

---

## Part 2: LLM-Generated Tests

### 2.1 Test Generation Pipeline

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   SKILL.md  │────▶│ LLM Analyzer │────▶│  Candidate  │
│   (input)   │     │              │     │  Scenarios  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                    ┌──────────────┐            │
                    │   Human      │◀───────────┘
                    │   Review     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Approved    │
                    │  Test Suite  │
                    └──────────────┘
```

### 2.2 Scenario Generation

```typescript
interface GenerationRequest {
  skillId: string;
  generationMode: 'comprehensive' | 'edge-cases' | 'regression' | 'security';
  targetCount: number;          // Approximate number of scenarios
  constraints?: {
    maxAssertions: number;
    requiredAssertionTypes: AssertionType[];
    excludePatterns: string[];
  };
}

interface GeneratedScenario {
  id: string;
  source: 'llm-generated';
  generatorModel: string;
  confidence: number;           // LLM's confidence 0-1
  reasoning: string;            // Why this test matters
  scenario: TestScenario;
  humanApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}
```

**Generation Prompts:**

```typescript
const GENERATION_PROMPTS = {
  comprehensive: `
    Analyze this SKILL.md and generate comprehensive test scenarios.
    
    For each scenario:
    1. Identify a specific use case the skill should handle
    2. Create a realistic trigger prompt
    3. Define expected file outputs
    4. Add appropriate assertions (file presence, content, build, etc.)
    
    Focus on:
    - Happy path scenarios
    - Common variations
    - Input edge cases
    - Error handling
    
    SKILL.md:
    {skillContent}
    
    Output JSON array of test scenarios.
  `,
  
  edgeCases: `
    Given this SKILL.md and existing test scenarios, identify MISSING edge cases.
    
    Consider:
    - Empty inputs
    - Very large inputs
    - Special characters
    - Concurrent operations
    - Resource limits
    - Malformed requests
    
    Existing scenarios:
    {existingScenarios}
    
    SKILL.md:
    {skillContent}
    
    Generate NEW scenarios that cover gaps.
  `,
  
  security: `
    Analyze this SKILL.md for potential security vulnerabilities.
    
    Generate test scenarios for:
    - Injection attacks (command, path, etc.)
    - Unauthorized file access
    - Resource exhaustion
    - Information disclosure
    - Privilege escalation
    
    SKILL.md:
    {skillContent}
  `,
};
```

### 2.3 Assertion Generation

```typescript
interface AssertionGenerationRequest {
  scenarioId: string;
  triggerPrompt: string;
  expectedBehavior: string;     // Natural language description
  existingAssertions: Assertion[];
}

// LLM generates structured assertions
interface GeneratedAssertion {
  assertion: Assertion;
  reasoning: string;
  priority: 'critical' | 'important' | 'nice-to-have';
  coverage: string[];           // What aspects this tests
}
```

**Smart Assertion Suggestions:**

```typescript
async function suggestAssertions(
  scenario: TestScenario,
  skillContent: string
): Promise<GeneratedAssertion[]> {
  // 1. Analyze skill to understand expected outputs
  const skillAnalysis = await analyzeSKill(skillContent);
  
  // 2. Look at trigger prompt to understand intent
  const intentAnalysis = await analyzeIntent(scenario.triggerPrompt);
  
  // 3. Generate assertions based on analysis
  const suggestions = await generateAssertions({
    expectedFiles: skillAnalysis.likelyOutputs,
    expectedPatterns: skillAnalysis.codePatterns,
    intent: intentAnalysis,
  });
  
  // 4. Deduplicate with existing assertions
  return filterExisting(suggestions, scenario.assertions);
}
```

### 2.4 Test Coverage Analysis

```typescript
interface CoverageReport {
  skillId: string;
  totalScenarios: number;
  coverage: {
    happyPath: CoverageMetric;
    errorHandling: CoverageMetric;
    edgeCases: CoverageMetric;
    security: CoverageMetric;
    performance: CoverageMetric;
  };
  gaps: CoverageGap[];
  suggestions: GeneratedScenario[];
}

interface CoverageMetric {
  percentage: number;
  testedAspects: string[];
  missingAspects: string[];
}

interface CoverageGap {
  type: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedScenario?: GeneratedScenario;
}
```

### 2.5 Mutation Testing with LLMs

Use LLMs to create "mutant" skill versions that SHOULD fail tests:

```typescript
interface MutationTest {
  id: string;
  originalSkillId: string;
  mutationType: 'logic' | 'output' | 'error-handling' | 'security';
  mutatedSkillMd: string;
  expectedFailures: string[];   // Assertion IDs that should fail
  actualFailures: string[];     // What actually failed
  mutationKilled: boolean;      // Did tests catch the mutation?
}

// Mutation types
const MUTATION_TYPES = {
  logic: 'Change conditional logic or algorithms',
  output: 'Modify expected output format/content',
  errorHandling: 'Remove or break error handling',
  security: 'Introduce security vulnerabilities',
};
```

### 2.6 Human-in-the-Loop Approval Workflow

```
┌────────────────────────────────────────────────────────┐
│                  LLM Generation Queue                   │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │Scenario1│ │Scenario2│ │Scenario3│ │   ...   │      │
│  │ 🤖 85%  │ │ 🤖 92%  │ │ 🤖 78%  │ │         │      │
│  └────┬────┘ └────┬────┘ └────┬────┘ └─────────┘      │
└───────┼──────────┼──────────┼─────────────────────────┘
        │          │          │
        ▼          ▼          ▼
┌────────────────────────────────────────────────────────┐
│                  Human Review Panel                     │
│                                                         │
│  [✓ Approve] [✗ Reject] [✎ Edit] [⊕ Merge]            │
│                                                         │
│  Reasoning: "This tests the common case of..."         │
│  Confidence: ████████░░ 85%                            │
│                                                         │
│  ┌─ Preview ──────────────────────────────────────┐   │
│  │ Trigger: "Create a React button component"      │   │
│  │ Expected: src/Button.tsx, src/Button.test.tsx   │   │
│  │ Assertions: 3 file presence, 2 content checks   │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## Part 3: Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Test Suite model and organization UI
- [ ] Tag system for skills and scenarios
- [ ] Basic batch execution with configurable concurrency
- [ ] Result caching with content-hash keys

### Phase 2: Scale Infrastructure (Week 3-4)
- [ ] Worker pool architecture
- [ ] Progress tracking and cancellation
- [ ] Incremental testing based on changes
- [ ] Performance dashboard (execution times, bottlenecks)

### Phase 3: LLM Test Generation (Week 5-6)
- [ ] Scenario generation from SKILL.md
- [ ] Assertion suggestion engine
- [ ] Human review queue UI
- [ ] Approval workflow

### Phase 4: Advanced Features (Week 7-8)
- [ ] Coverage analysis and gap detection
- [ ] Mutation testing
- [ ] Auto-regression suite builder
- [ ] CI/CD integration helpers

---

## Part 4: New Data Models

```typescript
// Add to src/lib/types/index.ts

// Test organization
interface TestSuite {
  id: string;
  name: string;
  description: string;
  tags: string[];
  skillIds: string[];
  scenarioIds: string[];
  config: BatchConfig;
  createdAt: string;
  updatedAt: string;
}

// Batch execution
interface BatchConfig {
  maxConcurrency: number;
  timeout: number;
  retries: number;
  failFast: boolean;
  cacheStrategy: 'none' | 'content-hash' | 'ttl';
}

interface BatchRun {
  id: string;
  suiteId?: string;
  status: 'queued' | 'running' | 'completed' | 'cancelled' | 'failed';
  config: BatchConfig;
  totalScenarios: number;
  completedScenarios: number;
  failedScenarios: number;
  workers: WorkerStatus[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

interface WorkerStatus {
  id: string;
  status: 'idle' | 'running' | 'error';
  currentScenario?: string;
  completedCount: number;
  errorCount: number;
}

// LLM-generated tests
interface GenerationJob {
  id: string;
  skillId: string;
  mode: 'comprehensive' | 'edge-cases' | 'regression' | 'security';
  model: string;
  status: 'pending' | 'generating' | 'review' | 'completed';
  generatedScenarios: GeneratedScenario[];
  approvedCount: number;
  rejectedCount: number;
  createdAt: string;
}

interface GeneratedScenario {
  id: string;
  jobId: string;
  scenario: TestScenario;
  confidence: number;
  reasoning: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  reviewedBy?: string;
  reviewedAt?: string;
  editNotes?: string;
}

// Coverage
interface CoverageSnapshot {
  id: string;
  skillId: string;
  timestamp: string;
  metrics: CoverageMetrics;
  gaps: CoverageGap[];
}

interface CoverageMetrics {
  scenarioCount: number;
  assertionCount: number;
  categoryBreakdown: Record<string, number>;
  estimatedCoverage: number; // 0-100
}
```

---

## Part 5: UI Wireframes

### Batch Execution Dashboard
```
┌────────────────────────────────────────────────────────────┐
│  Batch Run: "Full Regression Suite"                   ⋮    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Progress: ████████████░░░░░░░░ 58%  (174 / 300)          │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Workers                                               │ │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │ │
│  │ │Worker 1│ │Worker 2│ │Worker 3│ │Worker 4│         │ │
│  │ │ ████   │ │ ██░░   │ │ ███░   │ │ █░░░   │         │ │
│  │ │ 45/45  │ │ 38/45  │ │ 42/45  │ │ 49/45  │         │ │
│  │ └────────┘ └────────┘ └────────┘ └────────┘         │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Live Results                            [Pause] [Cancel]  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ✓ skill-react/create-component - 100% (2.3s)         │ │
│  │ ✓ skill-react/add-tests - 100% (1.8s)                │ │
│  │ ✗ skill-api/error-handling - 66% (3.1s)              │ │
│  │ ◐ skill-api/validation - running...                   │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### LLM Test Generation Panel
```
┌────────────────────────────────────────────────────────────┐
│  🤖 Generate Tests for: "react-component" skill            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Mode:  ○ Comprehensive  ○ Edge Cases  ● Security         │
│  Count: [~10 scenarios    ▼]                               │
│                                                            │
│  [Generate with Claude 3.5 Sonnet]                         │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  Generated Scenarios (Review Queue)                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 1. Path Traversal Attack                    92% conf │ │
│  │    "Create component at ../../../etc/passwd"         │ │
│  │    [✓ Approve] [✗ Reject] [✎ Edit]                  │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 2. Command Injection Test                   88% conf │ │
│  │    "Create component named `$(whoami)`"              │ │
│  │    [✓ Approve] [✗ Reject] [✎ Edit]                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Progress: 2 approved, 0 rejected, 8 pending              │
│  [Approve All High-Confidence (>90%)]                      │
└────────────────────────────────────────────────────────────┘
```

---

## Summary

This plan provides a roadmap for:

1. **Scale**: Worker pools, caching, incremental testing, and organization
2. **LLM Tests**: Automatic generation, human review, coverage analysis

The architecture is designed to be incrementally adoptable - start with basic batching, then add caching, then LLM generation as the test suite grows.

