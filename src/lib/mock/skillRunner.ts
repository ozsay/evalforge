import { sleep, generateId } from "@lib/utils";
import type {
  Assertion,
  AssertionResult,
  ExpectedFile,
  TestScenario,
  SkillVersion,
  ModelConfig,
  EvalRunResult,
  EvalMetrics,
  Agent,
} from "@lib/types";
import { executeWithAgent, type AgentExecutionResult } from "./toolRunner";

// ==========================================
// Mock File System
// ==========================================

export interface MockFile {
  path: string;
  content: string;
  createdAt: string;
}

export interface MockFileSystem {
  files: Map<string, MockFile>;
  addFile: (path: string, content: string) => void;
  getFile: (path: string) => MockFile | undefined;
  hasFile: (path: string) => boolean;
  listFiles: () => string[];
  clear: () => void;
}

export function createMockFileSystem(): MockFileSystem {
  const files = new Map<string, MockFile>();

  return {
    files,
    addFile: (path, content) => {
      files.set(path, {
        path,
        content,
        createdAt: new Date().toISOString(),
      });
    },
    getFile: (path) => files.get(path),
    hasFile: (path) => files.has(path),
    listFiles: () => Array.from(files.keys()),
    clear: () => files.clear(),
  };
}

// ==========================================
// Mock Skill Execution
// ==========================================

interface MockExecutionResult {
  output: string;
  files: ExpectedFile[];
  success: boolean;
  duration: number;
}

// Simulated outputs for different skill types
const MOCK_OUTPUTS = [
  {
    trigger: /create.*component/i,
    output: `I'll create a React component for you.

\`\`\`tsx
// src/components/Button.tsx
import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button onClick={onClick} className="btn">
      {label}
    </button>
  );
};
\`\`\`

I've created a reusable Button component with TypeScript support.`,
    files: [
      { path: "src/components/Button.tsx", content: `import React from 'react';\n\ninterface ButtonProps {\n  label: string;\n  onClick: () => void;\n}\n\nexport const Button: React.FC<ButtonProps> = ({ label, onClick }) => {\n  return (\n    <button onClick={onClick} className="btn">\n      {label}\n    </button>\n  );\n};` },
      { path: "src/components/index.ts", content: `export { Button } from './Button';` },
    ],
  },
  {
    trigger: /write.*test/i,
    output: `I'll write tests for the component.

\`\`\`typescript
// src/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    const { getByText } = render(<Button label="Click me" onClick={() => {}} />);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button label="Click" onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
\`\`\``,
    files: [
      { path: "src/components/Button.test.tsx", content: `import { render, fireEvent } from '@testing-library/react';\nimport { Button } from './Button';\n\ndescribe('Button', () => {\n  it('renders with label', () => {\n    const { getByText } = render(<Button label="Click me" onClick={() => {}} />);\n    expect(getByText('Click me')).toBeInTheDocument();\n  });\n});` },
    ],
  },
  {
    trigger: /setup.*project|initialize/i,
    output: `I'll set up the project structure for you.

Created the following files:
- package.json
- tsconfig.json
- src/index.ts
- README.md`,
    files: [
      { path: "package.json", content: `{\n  "name": "my-project",\n  "version": "1.0.0",\n  "main": "src/index.ts"\n}` },
      { path: "tsconfig.json", content: `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "strict": true\n  }\n}` },
      { path: "src/index.ts", content: `export const main = () => console.log('Hello');` },
      { path: "README.md", content: `# My Project\n\nA new project.` },
    ],
  },
];

const DEFAULT_MOCK_OUTPUT: MockExecutionResult = {
  output: `I've analyzed the request and created the necessary files.

The implementation follows best practices and includes proper error handling.`,
  files: [
    { path: "src/output.ts", content: `// Generated output\nexport const result = true;` },
  ],
  success: true,
  duration: 1500,
};

export async function mockSkillExecution(
  skillVersion: SkillVersion,
  scenario: TestScenario,
  _model: ModelConfig
): Promise<MockExecutionResult> {
  // Simulate execution delay based on model
  const baseDelay = 800 + Math.random() * 1200;
  await sleep(baseDelay);

  // Find matching mock output based on trigger prompt
  const matchingMock = MOCK_OUTPUTS.find((m) =>
    m.trigger.test(scenario.triggerPrompt)
  );

  if (matchingMock) {
    return {
      output: matchingMock.output,
      files: matchingMock.files,
      success: true,
      duration: baseDelay,
    };
  }

  // Use expected files from scenario if available
  if (scenario.expectedFiles.length > 0) {
    return {
      output: `Executed skill "${skillVersion.metadata.name}" successfully.\n\nGenerated ${scenario.expectedFiles.length} file(s) as expected.`,
      files: scenario.expectedFiles.map((ef) => ({
        path: ef.path,
        content: ef.content || `// Generated content for ${ef.path}`,
      })),
      success: true,
      duration: baseDelay,
    };
  }

  return {
    ...DEFAULT_MOCK_OUTPUT,
    duration: baseDelay,
  };
}

// ==========================================
// Assertion Runners
// ==========================================

async function runFilePresenceAssertion(
  assertion: Assertion & { type: "file_presence" },
  fs: MockFileSystem
): Promise<AssertionResult> {
  const startTime = Date.now();
  const missingFiles: string[] = [];
  const unexpectedFiles: string[] = [];

  for (const path of assertion.paths) {
    const exists = fs.hasFile(path);
    if (assertion.shouldExist && !exists) {
      missingFiles.push(path);
    } else if (!assertion.shouldExist && exists) {
      unexpectedFiles.push(path);
    }
  }

  const passed = missingFiles.length === 0 && unexpectedFiles.length === 0;
  let message = "";

  if (!passed) {
    if (missingFiles.length > 0) {
      message = `Missing files: ${missingFiles.join(", ")}`;
    }
    if (unexpectedFiles.length > 0) {
      message += `${message ? "; " : ""}Unexpected files: ${unexpectedFiles.join(", ")}`;
    }
  }

  return {
    id: generateId(),
    assertionId: assertion.id,
    assertionType: "file_presence",
    assertionName: assertion.name,
    status: passed ? "passed" : "failed",
    message: message || "All file presence checks passed",
    expected: assertion.shouldExist ? "Files should exist" : "Files should not exist",
    actual: `Found: ${fs.listFiles().filter((f) => assertion.paths.includes(f)).join(", ") || "none"}`,
    duration: Date.now() - startTime,
    details: { missingFiles, unexpectedFiles },
  };
}

async function runFileContentAssertion(
  assertion: Assertion & { type: "file_content" },
  fs: MockFileSystem
): Promise<AssertionResult> {
  const startTime = Date.now();
  const file = fs.getFile(assertion.path);

  if (!file) {
    return {
      id: generateId(),
      assertionId: assertion.id,
      assertionType: "file_content",
      assertionName: assertion.name,
      status: "failed",
      message: `File not found: ${assertion.path}`,
      expected: "File to exist",
      actual: "File does not exist",
      duration: Date.now() - startTime,
    };
  }

  const content = file.content;
  const failures: string[] = [];

  // Check contains
  if (assertion.checks.contains) {
    for (const str of assertion.checks.contains) {
      if (!content.includes(str)) {
        failures.push(`Missing: "${str}"`);
      }
    }
  }

  // Check notContains
  if (assertion.checks.notContains) {
    for (const str of assertion.checks.notContains) {
      if (content.includes(str)) {
        failures.push(`Should not contain: "${str}"`);
      }
    }
  }

  // Check regex match
  if (assertion.checks.matches) {
    try {
      const regex = new RegExp(assertion.checks.matches);
      if (!regex.test(content)) {
        failures.push(`Does not match pattern: ${assertion.checks.matches}`);
      }
    } catch (e) {
      failures.push(`Invalid regex: ${assertion.checks.matches}`);
    }
  }

  // Check JSON paths (simplified)
  if (assertion.checks.jsonPath) {
    try {
      const json = JSON.parse(content);
      for (const { path, value } of assertion.checks.jsonPath) {
        const parts = path.split(".");
        let current = json;
        for (const part of parts) {
          current = current?.[part];
        }
        if (JSON.stringify(current) !== JSON.stringify(value)) {
          failures.push(`JSON path ${path}: expected ${JSON.stringify(value)}, got ${JSON.stringify(current)}`);
        }
      }
    } catch {
      if (assertion.checks.jsonPath.length > 0) {
        failures.push("File is not valid JSON");
      }
    }
  }

  return {
    id: generateId(),
    assertionId: assertion.id,
    assertionType: "file_content",
    assertionName: assertion.name,
    status: failures.length === 0 ? "passed" : "failed",
    message: failures.length === 0 ? "All content checks passed" : failures.join("; "),
    expected: "Content to match all checks",
    actual: failures.length > 0 ? `${failures.length} check(s) failed` : "All checks passed",
    duration: Date.now() - startTime,
    details: { failures, contentLength: content.length },
  };
}

async function runBuildCheckAssertion(
  assertion: Assertion & { type: "build_check" },
  _fs: MockFileSystem
): Promise<AssertionResult> {
  const startTime = Date.now();
  
  // Simulate build time
  await sleep(500 + Math.random() * 500);

  // Mock build results - 85% success rate
  const success = Math.random() > 0.15;
  const warnings = Math.floor(Math.random() * 5);

  const passed = assertion.expectSuccess
    ? success && (assertion.allowedWarnings === undefined || warnings <= assertion.allowedWarnings)
    : !success;

  return {
    id: generateId(),
    assertionId: assertion.id,
    assertionType: "build_check",
    assertionName: assertion.name,
    status: passed ? "passed" : "failed",
    message: success
      ? `Build succeeded with ${warnings} warning(s)`
      : "Build failed with errors",
    expected: assertion.expectSuccess ? "Build to succeed" : "Build to fail",
    actual: success ? `Success (${warnings} warnings)` : "Failed",
    duration: Date.now() - startTime,
    details: { success, warnings, command: assertion.command },
  };
}

async function runVitestAssertion(
  assertion: Assertion & { type: "vitest" },
  _fs: MockFileSystem
): Promise<AssertionResult> {
  const startTime = Date.now();

  // Simulate test execution
  await sleep(300 + Math.random() * 700);

  // Mock test results
  const totalTests = 3 + Math.floor(Math.random() * 5);
  const passedTests = Math.floor(totalTests * (0.7 + Math.random() * 0.3));
  const passRate = (passedTests / totalTests) * 100;

  const passed = passRate >= assertion.minPassRate;

  return {
    id: generateId(),
    assertionId: assertion.id,
    assertionType: "vitest",
    assertionName: assertion.name,
    status: passed ? "passed" : "failed",
    message: `${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%)`,
    expected: `At least ${assertion.minPassRate}% pass rate`,
    actual: `${passRate.toFixed(1)}% pass rate`,
    duration: Date.now() - startTime,
    details: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      passRate,
      testFile: assertion.testFileName,
    },
  };
}

async function runPlaywrightNLAssertion(
  assertion: Assertion & { type: "playwright_nl" },
  _fs: MockFileSystem
): Promise<AssertionResult> {
  const startTime = Date.now();

  // Simulate E2E test execution
  await sleep(1000 + Math.random() * 2000);

  // Mock Playwright results - higher success rate for simpler tests
  const stepCount = assertion.steps.length;
  const success = Math.random() > (stepCount * 0.05); // More steps = higher failure chance

  const completedSteps = success
    ? stepCount
    : Math.floor(stepCount * (0.3 + Math.random() * 0.5));

  return {
    id: generateId(),
    assertionId: assertion.id,
    assertionType: "playwright_nl",
    assertionName: assertion.name,
    status: success ? "passed" : "failed",
    message: success
      ? `All ${stepCount} steps completed. ${assertion.expectedOutcome}`
      : `Failed at step ${completedSteps + 1}: "${assertion.steps[completedSteps] || "Unknown"}"`,
    expected: assertion.expectedOutcome,
    actual: success ? "Test passed" : `Failed after ${completedSteps} steps`,
    duration: Date.now() - startTime,
    details: {
      description: assertion.description,
      totalSteps: stepCount,
      completedSteps,
      steps: assertion.steps,
    },
  };
}

// ==========================================
// Main Runner
// ==========================================

export async function runAssertion(
  assertion: Assertion,
  fs: MockFileSystem
): Promise<AssertionResult> {
  switch (assertion.type) {
    case "file_presence":
      return runFilePresenceAssertion(assertion, fs);
    case "file_content":
      return runFileContentAssertion(assertion, fs);
    case "build_check":
      return runBuildCheckAssertion(assertion, fs);
    case "vitest":
      return runVitestAssertion(assertion, fs);
    case "playwright_nl":
      return runPlaywrightNLAssertion(assertion, fs);
    default:
      return {
        id: generateId(),
        assertionId: (assertion as Assertion).id,
        assertionType: (assertion as Assertion).type,
        assertionName: (assertion as Assertion).name,
        status: "error",
        message: `Unknown assertion type: ${(assertion as Assertion).type}`,
        duration: 0,
      };
  }
}

export async function runScenario(
  skillVersion: SkillVersion | undefined,
  scenario: TestScenario,
  model: ModelConfig,
  systemPrompt?: string,
  onAssertionComplete?: (result: AssertionResult) => void,
  agent?: Agent
): Promise<EvalRunResult> {
  const startTime = new Date().toISOString();
  const fs = createMockFileSystem();

  let execution: MockExecutionResult;
  let agentExecution: AgentExecutionResult | undefined;

  // Create a placeholder version if none provided (for suite runs without specific skill)
  const effectiveVersion: SkillVersion = skillVersion || {
    id: "placeholder",
    skillId: scenario.skillId || "standalone",
    skillMd: "",
    metadata: { name: scenario.name, description: scenario.description },
    model,
    version: 1,
    createdAt: new Date().toISOString(),
  };

  // Execute with agent if provided, otherwise use standard mock
  if (agent) {
    agentExecution = await executeWithAgent(agent, effectiveVersion, scenario);
    execution = {
      output: agentExecution.output,
      files: agentExecution.files,
      success: agentExecution.success,
      duration: agentExecution.duration,
    };
  } else {
    execution = await mockSkillExecution(effectiveVersion, scenario, model);
  }

  // Populate mock file system with generated files
  for (const file of execution.files) {
    fs.addFile(file.path, file.content || "");
  }

  // Run all assertions
  const assertionResults: AssertionResult[] = [];

  for (const assertion of scenario.assertions) {
    const result = await runAssertion(assertion, fs);
    assertionResults.push(result);
    onAssertionComplete?.(result);
  }

  // Calculate metrics
  const passed = assertionResults.filter((r) => r.status === "passed").length;
  const failed = assertionResults.filter((r) => r.status === "failed").length;
  const skipped = assertionResults.filter((r) => r.status === "skipped").length;
  const errors = assertionResults.filter((r) => r.status === "error").length;
  const totalDuration = assertionResults.reduce((sum, r) => sum + (r.duration || 0), 0);

  const metrics: EvalMetrics = {
    totalAssertions: assertionResults.length,
    passed,
    failed,
    skipped,
    errors,
    passRate: assertionResults.length > 0 ? (passed / assertionResults.length) * 100 : 0,
    avgDuration: assertionResults.length > 0 ? totalDuration / assertionResults.length : 0,
    totalDuration,
  };

  return {
    id: generateId(),
    skillVersionId: effectiveVersion.id,
    modelConfig: model,
    systemPrompt,
    agentId: agent?.id,
    agentName: agent?.name,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    assertionResults,
    metrics,
    passed,
    failed,
    passRate: assertionResults.length > 0 ? (passed / assertionResults.length) * 100 : 0,
    duration: totalDuration,
    mockOutput: execution.output,
    mockFiles: execution.files,
    startedAt: startTime,
    completedAt: new Date().toISOString(),
  };
}

