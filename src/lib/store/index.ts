import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateId } from "@lib/utils";
import {
  // Project / Tenant types
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  // Core types
  Skill,
  SkillVersion,
  TestScenario,
  TestSuite,
  Assertion,
  EvalRun,
  EvalRunResult,
  Agent,
  Settings,
  ModelConfig,
  CreateSkillInput,
  UpdateSkillInput,
  CreateTestScenarioInput,
  UpdateTestScenarioInput,
  CreateTestSuiteInput,
  UpdateTestSuiteInput,
  CreateAgentInput,
  UpdateAgentInput,
  CreateEvalRunInput,
  Label,
  DEFAULT_LABELS,
  BUILTIN_AGENTS,
  // CodingTool aliases (same as Agent)
  CodingTool,
  CreateCodingToolInput,
  UpdateCodingToolInput,
  // Target Group types
  TargetGroup,
  Target,
  CreateTargetGroupInput,
  UpdateTargetGroupInput,
  CreateTargetInput,
  UpdateTargetInput,
  // Prompt Agent types
  PromptAgent,
  CreatePromptAgentInput,
  UpdatePromptAgentInput,
  // Self-Improving Evaluation types
  ImprovementRun,
  ImprovementIteration,
  CreateImprovementRunInput,
  ImprovementRunStatus,
} from "@lib/types";
import { parseSkillMd } from "@lib/utils/skillParser";
import { generateDemoData } from "@lib/mock/demoData";

// ==========================================
// Generate Demo Data at Module Load
// ==========================================
// Demo data for skills, testScenarios, evalRuns is always fresh
// Agents and settings are persisted (user customizations saved)
const demoData = generateDemoData();

// ==========================================
// Store State Interface
// ==========================================

interface AppState {
  // Data
  projects: Project[];
  skills: Skill[];
  testScenarios: TestScenario[];
  testSuites: TestSuite[];
  targetGroups: TargetGroup[];
  promptAgents: PromptAgent[];
  agents: Agent[];
  evalRuns: EvalRun[];
  improvementRuns: ImprovementRun[];
  settings: Settings;

  // Project Actions
  addProject: (input: CreateProjectInput) => Project;
  updateProject: (id: string, input: UpdateProjectInput) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;

  // Skill Actions
  addSkill: (input: CreateSkillInput) => Skill;
  updateSkill: (id: string, input: UpdateSkillInput) => void;
  deleteSkill: (id: string) => void;
  duplicateSkill: (id: string) => Skill;
  addSkillVersion: (skillId: string, skillMd: string, model: ModelConfig, systemPrompt?: string, notes?: string) => void;

  // Test Scenario Actions
  addTestScenario: (input: CreateTestScenarioInput) => TestScenario;
  updateTestScenario: (id: string, input: UpdateTestScenarioInput) => void;
  deleteTestScenario: (id: string) => void;
  duplicateTestScenario: (id: string) => TestScenario;
  addAssertion: (scenarioId: string, assertion: Omit<Assertion, "id">) => void;
  updateAssertion: (scenarioId: string, assertionId: string, updates: Partial<Assertion>) => void;
  removeAssertion: (scenarioId: string, assertionId: string) => void;

  // Test Suite Actions
  addTestSuite: (input: CreateTestSuiteInput) => TestSuite;
  updateTestSuite: (id: string, input: UpdateTestSuiteInput) => void;
  deleteTestSuite: (id: string) => void;
  duplicateTestSuite: (id: string) => TestSuite;
  addScenarioToSuite: (suiteId: string, scenarioId: string) => void;
  removeScenarioFromSuite: (suiteId: string, scenarioId: string) => void;

  // Target Group Actions
  addTargetGroup: (input: CreateTargetGroupInput) => TargetGroup;
  updateTargetGroup: (id: string, input: UpdateTargetGroupInput) => void;
  deleteTargetGroup: (id: string) => void;
  duplicateTargetGroup: (id: string) => TargetGroup;
  addTargetToGroup: (groupId: string, target: CreateTargetInput) => void;
  removeTargetFromGroup: (groupId: string, targetId: string) => void;
  updateTargetInGroup: (groupId: string, targetId: string, updates: UpdateTargetInput) => void;

  // Prompt Agent Actions
  addPromptAgent: (input: CreatePromptAgentInput) => PromptAgent;
  updatePromptAgent: (id: string, input: UpdatePromptAgentInput) => void;
  deletePromptAgent: (id: string) => void;
  duplicatePromptAgent: (id: string) => PromptAgent;
  getPromptAgentById: (id: string) => PromptAgent | undefined;

  // Agent Actions
  addAgent: (input: CreateAgentInput) => Agent;
  updateAgent: (id: string, input: UpdateAgentInput) => void;
  deleteAgent: (id: string) => void;
  setDefaultAgent: (id: string) => void;
  duplicateAgent: (id: string) => Agent;
  getAllAgents: () => Agent[];

  // CodingTool Actions (aliases for Agent actions)
  addCodingTool: (input: CreateCodingToolInput) => CodingTool;
  updateCodingTool: (id: string, input: UpdateCodingToolInput) => void;
  deleteCodingTool: (id: string) => void;
  getCodingToolById: (id: string) => CodingTool | undefined;
  getAllTools: () => CodingTool[];

  // Eval Run Actions
  createEvalRun: (input: CreateEvalRunInput) => EvalRun;
  updateEvalRunStatus: (id: string, status: EvalRun["status"], progress?: number) => void;
  addEvalRunResult: (runId: string, result: Omit<EvalRunResult, "id">) => void;
  completeEvalRun: (id: string) => void;
  deleteEvalRun: (id: string) => void;

  // Label Actions
  addLabel: (resultId: string, label: Omit<Label, "id" | "resultId" | "labeledAt">) => void;

  // Improvement Run Actions
  startImprovementRun: (input: CreateImprovementRunInput) => ImprovementRun;
  updateImprovementRunStatus: (id: string, status: ImprovementRunStatus) => void;
  addImprovementIteration: (runId: string, iteration: Omit<ImprovementIteration, "id">) => void;
  completeImprovementRun: (id: string) => void;
  deleteImprovementRun: (id: string) => void;
  getImprovementRunById: (id: string) => ImprovementRun | undefined;

  // Settings Actions
  updateSettings: (settings: Partial<Settings>) => void;

  // Demo Data
  loadDemoData: () => void;
  clearAllData: () => void;

  // Getters
  getSkillById: (id: string) => Skill | undefined;
  getTestScenarioById: (id: string) => TestScenario | undefined;
  getTestSuiteById: (id: string) => TestSuite | undefined;
  getTargetGroupById: (id: string) => TargetGroup | undefined;
  getAgentById: (id: string) => Agent | undefined;
  getEvalRunById: (id: string) => EvalRun | undefined;
  getSkillVersionById: (skillId: string, versionId: string) => SkillVersion | undefined;
  getTestScenariosForSkill: (skillId: string) => TestScenario[];
  getTestScenariosForSuite: (suiteId: string) => TestScenario[];
  getTestScenariosForTargetGroup: (targetGroupId: string) => TestScenario[];
  getStandaloneScenarios: () => TestScenario[];
  getDefaultAgent: () => Agent | undefined;
}

// ==========================================
// Default Settings
// ==========================================

const defaultModel: ModelConfig = {
  provider: "anthropic",
  model: "claude-3-sonnet",
  temperature: 0.7,
  maxTokens: 4096,
};

// Get the default agent ID from built-in agents
const defaultAgentId = BUILTIN_AGENTS.find((a) => a.isDefault)?.id || BUILTIN_AGENTS[0]?.id || "";

const defaultSettings: Settings = {
  apiKeys: [],
  defaultModel,
  defaultAgent: defaultAgentId,
  labelConfigs: DEFAULT_LABELS,
  theme: "light",
};

// ==========================================
// Store Implementation
// ==========================================

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State - Demo data for skills/scenarios/suites/runs, built-in agents
      projects: demoData.projects || [],
      skills: demoData.skills,
      testScenarios: demoData.testScenarios,
      testSuites: demoData.testSuites || [],
      targetGroups: demoData.targetGroups || [],
      promptAgents: demoData.promptAgents || [],
      agents: [...BUILTIN_AGENTS, ...demoData.agents.filter(a => !a.isBuiltIn)],
      evalRuns: demoData.evalRuns,
      improvementRuns: demoData.improvementRuns || [],
      settings: { ...defaultSettings },

      // ==========================================
      // Project Actions
      // ==========================================

      addProject: (input) => {
        const now = new Date().toISOString();
        const project: Project = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: [...state.projects, project],
        }));
        return project;
      },

      updateProject: (id, input) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...input, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          // Also delete all data belonging to this project
          skills: state.skills.filter((s) => s.projectId !== id),
          testScenarios: state.testScenarios.filter((s) => s.projectId !== id),
          testSuites: state.testSuites.filter((s) => s.projectId !== id),
          targetGroups: state.targetGroups.filter((t) => t.projectId !== id),
          promptAgents: state.promptAgents.filter((p) => p.projectId !== id),
          evalRuns: state.evalRuns.filter((r) => r.projectId !== id),
          improvementRuns: state.improvementRuns.filter((r) => r.projectId !== id),
        }));
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      // ==========================================
      // Skill Actions
      // ==========================================

      addSkill: (input) => {
        const now = new Date().toISOString();
        const metadata = parseSkillMd(input.skillMd);
        
        const skill: Skill = {
          id: generateId(),
          projectId: input.projectId,
          name: input.name || metadata.name || "Untitled Skill",
          description: input.description || metadata.description || "",
          skillMd: input.skillMd,
          metadata,
          versions: [],
          testScenarios: [],
          syncSource: input.syncSource,
          createdAt: now,
          updatedAt: now,
        };

        // Add initial version
        const initialVersion: SkillVersion = {
          id: generateId(),
          skillId: skill.id,
          skillMd: input.skillMd,
          metadata,
          model: get().settings.defaultModel,
          version: 1,
          createdAt: now,
          notes: "Initial version",
        };
        skill.versions.push(initialVersion);

        set((state) => ({
          skills: [...state.skills, skill],
        }));
        return skill;
      },

      updateSkill: (id, input) => {
        set((state) => ({
          skills: state.skills.map((skill) => {
            if (skill.id !== id) return skill;

            const now = new Date().toISOString();
            let updatedSkill = { ...skill, ...input, updatedAt: now };

            // If skillMd changed, parse new metadata and add version
            if (input.skillMd && input.skillMd !== skill.skillMd) {
              const metadata = parseSkillMd(input.skillMd);
              updatedSkill.metadata = metadata;
              updatedSkill.name = input.name || metadata.name || skill.name;
              updatedSkill.description = input.description || metadata.description || skill.description;

              const newVersion: SkillVersion = {
                id: generateId(),
                skillId: id,
                skillMd: input.skillMd,
                metadata,
                model: state.settings.defaultModel,
                version: skill.versions.length + 1,
                createdAt: now,
              };
              updatedSkill.versions = [...skill.versions, newVersion];
            }

            return updatedSkill;
          }),
        }));
      },

      deleteSkill: (id) => {
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
          testScenarios: state.testScenarios.filter((ts) => ts.skillId !== id),
        }));
      },

      duplicateSkill: (id) => {
        const skill = get().skills.find((s) => s.id === id);
        if (!skill) throw new Error("Skill not found");

        return get().addSkill({
          projectId: skill.projectId,
          name: `${skill.name} (Copy)`,
          description: skill.description,
          skillMd: skill.skillMd,
          syncSource: skill.syncSource,
        });
      },

      addSkillVersion: (skillId, skillMd, model, systemPrompt, notes) => {
        const metadata = parseSkillMd(skillMd);
        const now = new Date().toISOString();

        set((state) => ({
          skills: state.skills.map((skill) => {
            if (skill.id !== skillId) return skill;

            const newVersion: SkillVersion = {
              id: generateId(),
              skillId,
              skillMd,
              metadata,
              model,
              systemPrompt,
              version: skill.versions.length + 1,
              createdAt: now,
              notes,
            };

            return {
              ...skill,
              versions: [...skill.versions, newVersion],
              updatedAt: now,
            };
          }),
        }));
      },

      // ==========================================
      // Test Scenario Actions
      // ==========================================

      addTestScenario: (input) => {
        const now = new Date().toISOString();
        const scenario: TestScenario = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          testScenarios: [...state.testScenarios, scenario],
          // Only update skill if skillId is provided
          skills: input.skillId
            ? state.skills.map((skill) =>
                skill.id === input.skillId
                  ? { ...skill, testScenarios: [...skill.testScenarios, scenario.id] }
                  : skill
              )
            : state.skills,
          // Update suites if suiteIds provided
          testSuites: input.suiteIds?.length
            ? state.testSuites.map((suite) =>
                input.suiteIds!.includes(suite.id)
                  ? { ...suite, scenarioIds: [...suite.scenarioIds, scenario.id] }
                  : suite
              )
            : state.testSuites,
        }));
        return scenario;
      },

      updateTestScenario: (id, input) => {
        set((state) => ({
          testScenarios: state.testScenarios.map((scenario) =>
            scenario.id === id
              ? { ...scenario, ...input, updatedAt: new Date().toISOString() }
              : scenario
          ),
        }));
      },

      deleteTestScenario: (id) => {
        const scenario = get().testScenarios.find((s) => s.id === id);
        if (!scenario) return;

        set((state) => ({
          testScenarios: state.testScenarios.filter((s) => s.id !== id),
          // Only update skill if scenario had a skillId
          skills: scenario.skillId
            ? state.skills.map((skill) =>
                skill.id === scenario.skillId
                  ? { ...skill, testScenarios: skill.testScenarios.filter((sid) => sid !== id) }
                  : skill
              )
            : state.skills,
          // Remove from all suites
          testSuites: state.testSuites.map((suite) => ({
            ...suite,
            scenarioIds: suite.scenarioIds.filter((sid) => sid !== id),
          })),
        }));
      },

      duplicateTestScenario: (id) => {
        const scenario = get().testScenarios.find((s) => s.id === id);
        if (!scenario) throw new Error("Test scenario not found");

        return get().addTestScenario({
          ...scenario,
          name: `${scenario.name} (Copy)`,
          assertions: scenario.assertions.map((a) => ({ ...a, id: generateId() })),
        });
      },

      addAssertion: (scenarioId, assertion) => {
        const newAssertion = { ...assertion, id: generateId() } as Assertion;
        set((state) => ({
          testScenarios: state.testScenarios.map((scenario) =>
            scenario.id === scenarioId
              ? {
                  ...scenario,
                  assertions: [...scenario.assertions, newAssertion],
                  updatedAt: new Date().toISOString(),
                }
              : scenario
          ),
        }));
      },

      updateAssertion: (scenarioId, assertionId, updates) => {
        set((state) => ({
          testScenarios: state.testScenarios.map((scenario) =>
            scenario.id === scenarioId
              ? {
                  ...scenario,
                  assertions: scenario.assertions.map((a) =>
                    a.id === assertionId ? ({ ...a, ...updates } as Assertion) : a
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : scenario
          ),
        }));
      },

      removeAssertion: (scenarioId, assertionId) => {
        set((state) => ({
          testScenarios: state.testScenarios.map((scenario) =>
            scenario.id === scenarioId
              ? {
                  ...scenario,
                  assertions: scenario.assertions.filter((a) => a.id !== assertionId),
                  updatedAt: new Date().toISOString(),
                }
              : scenario
          ),
        }));
      },

      // ==========================================
      // Test Suite Actions
      // ==========================================

      addTestSuite: (input) => {
        const now = new Date().toISOString();
        const suite: TestSuite = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          testSuites: [...state.testSuites, suite],
          // Update scenarios with new suite id
          testScenarios: state.testScenarios.map((scenario) =>
            input.scenarioIds.includes(scenario.id)
              ? {
                  ...scenario,
                  suiteIds: [...(scenario.suiteIds || []), suite.id],
                  updatedAt: now,
                }
              : scenario
          ),
        }));
        return suite;
      },

      updateTestSuite: (id, input) => {
        const now = new Date().toISOString();
        const currentSuite = get().testSuites.find((s) => s.id === id);
        if (!currentSuite) return;

        set((state) => {
          const newScenarioIds = input.scenarioIds || currentSuite.scenarioIds;
          const addedScenarios = newScenarioIds.filter(
            (sid) => !currentSuite.scenarioIds.includes(sid)
          );
          const removedScenarios = currentSuite.scenarioIds.filter(
            (sid) => !newScenarioIds.includes(sid)
          );

          return {
            testSuites: state.testSuites.map((suite) =>
              suite.id === id ? { ...suite, ...input, updatedAt: now } : suite
            ),
            // Update scenario suiteIds
            testScenarios: state.testScenarios.map((scenario) => {
              let suiteIds = scenario.suiteIds || [];
              if (addedScenarios.includes(scenario.id)) {
                suiteIds = [...suiteIds, id];
              }
              if (removedScenarios.includes(scenario.id)) {
                suiteIds = suiteIds.filter((sid) => sid !== id);
              }
              return { ...scenario, suiteIds, updatedAt: now };
            }),
          };
        });
      },

      deleteTestSuite: (id) => {
        set((state) => ({
          testSuites: state.testSuites.filter((s) => s.id !== id),
          // Remove suite from all scenarios
          testScenarios: state.testScenarios.map((scenario) => ({
            ...scenario,
            suiteIds: (scenario.suiteIds || []).filter((sid) => sid !== id),
          })),
        }));
      },

      duplicateTestSuite: (id) => {
        const suite = get().testSuites.find((s) => s.id === id);
        if (!suite) throw new Error("Test suite not found");

        return get().addTestSuite({
          projectId: suite.projectId,
          name: `${suite.name} (Copy)`,
          description: suite.description,
          scenarioIds: [...suite.scenarioIds],
          tags: suite.tags ? [...suite.tags] : undefined,
        });
      },

      addScenarioToSuite: (suiteId, scenarioId) => {
        const now = new Date().toISOString();
        set((state) => ({
          testSuites: state.testSuites.map((suite) =>
            suite.id === suiteId && !suite.scenarioIds.includes(scenarioId)
              ? { ...suite, scenarioIds: [...suite.scenarioIds, scenarioId], updatedAt: now }
              : suite
          ),
          testScenarios: state.testScenarios.map((scenario) =>
            scenario.id === scenarioId && !(scenario.suiteIds || []).includes(suiteId)
              ? { ...scenario, suiteIds: [...(scenario.suiteIds || []), suiteId], updatedAt: now }
              : scenario
          ),
        }));
      },

      removeScenarioFromSuite: (suiteId, scenarioId) => {
        const now = new Date().toISOString();
        set((state) => ({
          testSuites: state.testSuites.map((suite) =>
            suite.id === suiteId
              ? { ...suite, scenarioIds: suite.scenarioIds.filter((sid) => sid !== scenarioId), updatedAt: now }
              : suite
          ),
          testScenarios: state.testScenarios.map((scenario) =>
            scenario.id === scenarioId
              ? { ...scenario, suiteIds: (scenario.suiteIds || []).filter((sid) => sid !== suiteId), updatedAt: now }
              : scenario
          ),
        }));
      },

      // ==========================================
      // Target Group Actions
      // ==========================================

      addTargetGroup: (input) => {
        const now = new Date().toISOString();
        const targetGroup: TargetGroup = {
          id: generateId(),
          projectId: input.projectId,
          name: input.name,
          description: input.description,
          targets: input.targets.map((t) => ({ ...t, id: t.id || generateId() })),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          targetGroups: [...state.targetGroups, targetGroup],
        }));
        return targetGroup;
      },

      updateTargetGroup: (id, input) => {
        set((state) => ({
          targetGroups: state.targetGroups.map((group) =>
            group.id === id
              ? { ...group, ...input, updatedAt: new Date().toISOString() }
              : group
          ),
        }));
      },

      deleteTargetGroup: (id) => {
        set((state) => ({
          targetGroups: state.targetGroups.filter((g) => g.id !== id),
          // Clear targetGroupId from scenarios that referenced this group
          testScenarios: state.testScenarios.map((scenario) =>
            scenario.targetGroupId === id
              ? { ...scenario, targetGroupId: undefined, updatedAt: new Date().toISOString() }
              : scenario
          ),
        }));
      },

      duplicateTargetGroup: (id) => {
        const group = get().targetGroups.find((g) => g.id === id);
        if (!group) throw new Error("Target group not found");

        return get().addTargetGroup({
          projectId: group.projectId,
          name: `${group.name} (Copy)`,
          description: group.description,
          targets: group.targets.map((t) => ({ ...t, id: generateId() })),
        });
      },

      addTargetToGroup: (groupId, target) => {
        const now = new Date().toISOString();
        const newTarget: Target = {
          ...target,
          id: generateId(),
        };

        set((state) => ({
          targetGroups: state.targetGroups.map((group) =>
            group.id === groupId
              ? { ...group, targets: [...group.targets, newTarget], updatedAt: now }
              : group
          ),
        }));
      },

      removeTargetFromGroup: (groupId, targetId) => {
        const now = new Date().toISOString();
        set((state) => ({
          targetGroups: state.targetGroups.map((group) =>
            group.id === groupId
              ? { ...group, targets: group.targets.filter((t) => t.id !== targetId), updatedAt: now }
              : group
          ),
        }));
      },

      updateTargetInGroup: (groupId, targetId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          targetGroups: state.targetGroups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  targets: group.targets.map((t) =>
                    t.id === targetId ? { ...t, ...updates } as Target : t
                  ),
                  updatedAt: now,
                }
              : group
          ),
        }));
      },

      // ==========================================
      // Prompt Agent Actions
      // ==========================================

      addPromptAgent: (input) => {
        const now = new Date().toISOString();
        const promptAgent: PromptAgent = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          promptAgents: [...state.promptAgents, promptAgent],
        }));
        return promptAgent;
      },

      updatePromptAgent: (id, input) => {
        set((state) => ({
          promptAgents: state.promptAgents.map((pa) =>
            pa.id === id
              ? { ...pa, ...input, updatedAt: new Date().toISOString() }
              : pa
          ),
        }));
      },

      deletePromptAgent: (id) => {
        set((state) => ({
          promptAgents: state.promptAgents.filter((pa) => pa.id !== id),
        }));
      },

      duplicatePromptAgent: (id) => {
        const promptAgent = get().promptAgents.find((pa) => pa.id === id);
        if (!promptAgent) throw new Error("Prompt agent not found");

        return get().addPromptAgent({
          projectId: promptAgent.projectId,
          name: `${promptAgent.name} (Copy)`,
          description: promptAgent.description,
          systemPrompt: promptAgent.systemPrompt,
          mcpServers: [...promptAgent.mcpServers],
          modelConfig: { ...promptAgent.modelConfig },
          tags: promptAgent.tags ? [...promptAgent.tags] : undefined,
        });
      },

      getPromptAgentById: (id) => get().promptAgents.find((pa) => pa.id === id),

      // ==========================================
      // Agent Actions
      // ==========================================

      addAgent: (input) => {
        const now = new Date().toISOString();
        const agent: Agent = {
          id: generateId(),
          ...input,
          isBuiltIn: false, // Custom agents are never built-in
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          agents: [...state.agents, agent],
        }));
        return agent;
      },

      updateAgent: (id, input) => {
        set((state) => ({
          agents: state.agents.map((agent) => {
            // Don't allow editing built-in agents (except isDefault)
            if (agent.id === id) {
              if (agent.isBuiltIn) {
                // Only allow changing isDefault for built-in agents
                return {
                  ...agent,
                  isDefault: input.isDefault ?? agent.isDefault,
                  updatedAt: new Date().toISOString(),
                };
              }
              return { ...agent, ...input, updatedAt: new Date().toISOString() };
            }
            return agent;
          }),
        }));
      },

      deleteAgent: (id) => {
        const agent = get().agents.find((a) => a.id === id);
        // Cannot delete default agent or built-in agents
        if (agent?.isDefault || agent?.isBuiltIn) return;

        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
        }));
      },

      setDefaultAgent: (id) => {
        set((state) => ({
          agents: state.agents.map((agent) => ({
            ...agent,
            isDefault: agent.id === id,
          })),
          settings: { ...state.settings, defaultAgent: id },
        }));
      },

      duplicateAgent: (id) => {
        const agent = get().agents.find((a) => a.id === id);
        if (!agent) throw new Error("Agent not found");

        const now = new Date().toISOString();
        const newAgent: Agent = {
          ...agent,
          id: generateId(),
          name: `${agent.name} (Copy)`,
          isBuiltIn: false,
          isDefault: false,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          agents: [...state.agents, newAgent],
        }));
        return newAgent;
      },

      getAllAgents: () => get().agents,

      // ==========================================
      // CodingTool Actions (aliases for Agent actions)
      // ==========================================

      addCodingTool: (input) => get().addAgent(input),
      updateCodingTool: (id, input) => get().updateAgent(id, input),
      deleteCodingTool: (id) => get().deleteAgent(id),
      getCodingToolById: (id) => get().getAgentById(id),
      getAllTools: () => get().agents,

      // ==========================================
      // Eval Run Actions
      // ==========================================

      createEvalRun: (input) => {
        const now = new Date().toISOString();
        const skill = get().getSkillById(input.skillId);

        const evalRun: EvalRun = {
          id: generateId(),
          projectId: input.projectId,
          name: input.name,
          skillId: input.skillId,
          skillName: skill?.name || "Unknown Skill",
          config: input.config,
          status: "pending",
          progress: 0,
          results: [],
          aggregateMetrics: {
            totalAssertions: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: 0,
            passRate: 0,
            avgDuration: 0,
            totalDuration: 0,
          },
          startedAt: now,
        };

        set((state) => ({
          evalRuns: [...state.evalRuns, evalRun],
        }));
        return evalRun;
      },

      updateEvalRunStatus: (id, status, progress) => {
        set((state) => ({
          evalRuns: state.evalRuns.map((run) =>
            run.id === id
              ? { ...run, status, progress: progress ?? run.progress }
              : run
          ),
        }));
      },

      addEvalRunResult: (runId, result) => {
        set((state) => ({
          evalRuns: state.evalRuns.map((run) => {
            if (run.id !== runId) return run;

            const newResult: EvalRunResult = {
              id: generateId(),
              ...result,
            };

            const results = [...run.results, newResult];

            // Recalculate aggregate metrics
            const allAssertionResults = results.flatMap((r) => r.assertionResults);
            const passed = allAssertionResults.filter((ar) => ar.status === "passed").length;
            const failed = allAssertionResults.filter((ar) => ar.status === "failed").length;
            const skipped = allAssertionResults.filter((ar) => ar.status === "skipped").length;
            const errors = allAssertionResults.filter((ar) => ar.status === "error").length;
            const totalAssertions = allAssertionResults.length;
            const totalDuration = allAssertionResults.reduce((sum, ar) => sum + (ar.duration || 0), 0);

            return {
              ...run,
              results,
              aggregateMetrics: {
                totalAssertions,
                passed,
                failed,
                skipped,
                errors,
                passRate: totalAssertions > 0 ? (passed / totalAssertions) * 100 : 0,
                avgDuration: totalAssertions > 0 ? totalDuration / totalAssertions : 0,
                totalDuration,
              },
            };
          }),
        }));
      },

      completeEvalRun: (id) => {
        set((state) => ({
          evalRuns: state.evalRuns.map((run) =>
            run.id === id
              ? {
                  ...run,
                  status: "completed",
                  progress: 100,
                  completedAt: new Date().toISOString(),
                }
              : run
          ),
        }));
      },

      deleteEvalRun: (id) => {
        set((state) => ({
          evalRuns: state.evalRuns.filter((r) => r.id !== id),
        }));
      },

      // ==========================================
      // Label Actions
      // ==========================================

      addLabel: (resultId, label) => {
        // Labels would be stored within eval run results
        // For now, this is a placeholder
        console.log("Adding label to result", resultId, label);
      },

      // ==========================================
      // Improvement Run Actions
      // ==========================================

      startImprovementRun: (input) => {
        const now = new Date().toISOString();
        const run: ImprovementRun = {
          id: generateId(),
          ...input,
          status: "running",
          iterations: [],
          initialPassRate: 0,
          finalPassRate: 0,
          improvement: 0,
          startedAt: now,
        };

        set((state) => ({
          improvementRuns: [run, ...state.improvementRuns],
        }));
        return run;
      },

      updateImprovementRunStatus: (id, status) => {
        set((state) => ({
          improvementRuns: state.improvementRuns.map((run) =>
            run.id === id ? { ...run, status } : run
          ),
        }));
      },

      addImprovementIteration: (runId, iteration) => {
        const newIteration: ImprovementIteration = {
          ...iteration,
          id: generateId(),
        };

        set((state) => ({
          improvementRuns: state.improvementRuns.map((run) => {
            if (run.id !== runId) return run;

            const iterations = [...run.iterations, newIteration];
            const initialPassRate = iterations[0]?.passRate || 0;
            const finalPassRate = newIteration.passRate;

            return {
              ...run,
              iterations,
              initialPassRate,
              finalPassRate,
              improvement: finalPassRate - initialPassRate,
            };
          }),
        }));
      },

      completeImprovementRun: (id) => {
        set((state) => ({
          improvementRuns: state.improvementRuns.map((run) =>
            run.id === id
              ? { ...run, status: "completed" as const, completedAt: new Date().toISOString() }
              : run
          ),
        }));
      },

      deleteImprovementRun: (id) => {
        set((state) => ({
          improvementRuns: state.improvementRuns.filter((r) => r.id !== id),
        }));
      },

      getImprovementRunById: (id) => get().improvementRuns.find((r) => r.id === id),

      // ==========================================
      // Settings Actions
      // ==========================================

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // ==========================================
      // Demo Data Actions
      // ==========================================

      loadDemoData: () => {
        const demoData = generateDemoData();
        set({
          projects: demoData.projects || [],
          skills: demoData.skills,
          testScenarios: demoData.testScenarios,
          testSuites: demoData.testSuites || [],
          targetGroups: demoData.targetGroups || [],
          promptAgents: demoData.promptAgents || [],
          agents: demoData.agents,
          evalRuns: demoData.evalRuns,
          improvementRuns: demoData.improvementRuns || [],
        });
      },

      clearAllData: () => {
        set({
          projects: [],
          skills: [],
          testScenarios: [],
          testSuites: [],
          targetGroups: [],
          promptAgents: [],
          agents: [],
          evalRuns: [],
          improvementRuns: [],
        });
      },

      // ==========================================
      // Getters
      // ==========================================

      getSkillById: (id) => get().skills.find((s) => s.id === id),
      getTestScenarioById: (id) => get().testScenarios.find((s) => s.id === id),
      getTestSuiteById: (id) => get().testSuites.find((s) => s.id === id),
      getTargetGroupById: (id) => get().targetGroups.find((g) => g.id === id),
      getAgentById: (id) => get().agents.find((a) => a.id === id),
      getEvalRunById: (id) => get().evalRuns.find((r) => r.id === id),
      
      getSkillVersionById: (skillId, versionId) => {
        const skill = get().skills.find((s) => s.id === skillId);
        return skill?.versions.find((v) => v.id === versionId);
      },

      getTestScenariosForSkill: (skillId) => {
        return get().testScenarios.filter((ts) => ts.skillId === skillId);
      },

      getTestScenariosForSuite: (suiteId) => {
        const suite = get().testSuites.find((s) => s.id === suiteId);
        if (!suite) return [];
        return get().testScenarios.filter((ts) => suite.scenarioIds.includes(ts.id));
      },

      getTestScenariosForTargetGroup: (targetGroupId) => {
        return get().testScenarios.filter((ts) => ts.targetGroupId === targetGroupId);
      },

      getStandaloneScenarios: () => {
        return get().testScenarios.filter(
          (ts) => !ts.skillId && (!ts.suiteIds || ts.suiteIds.length === 0)
        );
      },

      getDefaultAgent: () => {
        return get().agents.find((a) => a.isDefault);
      },
    }),
    {
      name: "evalforge-skills-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist agents and settings (user customizations)
      // Skills, testScenarios, evalRuns always load fresh from demo data
      partialize: (state) => ({
        projects: state.projects,
        agents: state.agents,
        settings: state.settings,
      }),
      // Merge persisted data with fresh demo data
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState> | undefined;
        
        // Projects: merge persisted with demo (avoid duplicates)
        const persistedProjects = persisted?.projects || [];
        const demoProjectIds = (demoData.projects || []).map(p => p.id);
        const userProjects = persistedProjects.filter(p => !demoProjectIds.includes(p.id));
        
        // Agents: merge persisted with built-in and demo custom agents
        const persistedAgents = persisted?.agents || [];
        const builtInIds = BUILTIN_AGENTS.map(a => a.id);
        const demoCustomAgents = demoData.agents.filter(a => !a.isBuiltIn);
        const demoCustomIds = demoCustomAgents.map(a => a.id);
        const userCustomAgents = persistedAgents.filter(
          a => !builtInIds.includes(a.id) && !a.isBuiltIn && !demoCustomIds.includes(a.id)
        );
        
        return {
          ...currentState,
          projects: [...(demoData.projects || []), ...userProjects],
          agents: [...BUILTIN_AGENTS, ...demoCustomAgents, ...userCustomAgents],
          settings: persisted?.settings || currentState.settings,
        };
      },
    }
  )
);

// ==========================================
// Selector Hooks
// ==========================================

// Import tenant context for project-scoped hooks
import { useTenantSafe } from "@lib/context";

// Project hooks (no tenant scoping needed)
export const useProjects = () => useStore((state) => state.projects);
export const useProjectById = (id: string) => useStore((state) => state.projects.find((p) => p.id === id));

// Raw hooks (return all data, for use outside tenant context)
export const useAllSkills = () => useStore((state) => state.skills);
export const useAllTestScenarios = () => useStore((state) => state.testScenarios);
export const useAllTestSuites = () => useStore((state) => state.testSuites);
export const useAllTargetGroups = () => useStore((state) => state.targetGroups);
export const useAllPromptAgents = () => useStore((state) => state.promptAgents);
export const useAllEvalRuns = () => useStore((state) => state.evalRuns);
export const useAllImprovementRuns = () => useStore((state) => state.improvementRuns);

// Project-scoped hooks (automatically use tenant context)
export const useSkills = () => {
  const tenant = useTenantSafe();
  const skills = useStore((state) => state.skills);
  return useMemo(
    () => tenant?.projectId ? skills.filter((s) => s.projectId === tenant.projectId) : skills,
    [skills, tenant?.projectId]
  );
};

export const useTestScenarios = () => {
  const tenant = useTenantSafe();
  const scenarios = useStore((state) => state.testScenarios);
  return useMemo(
    () => tenant?.projectId ? scenarios.filter((s) => s.projectId === tenant.projectId) : scenarios,
    [scenarios, tenant?.projectId]
  );
};

export const useTestSuites = () => {
  const tenant = useTenantSafe();
  const suites = useStore((state) => state.testSuites);
  return useMemo(
    () => tenant?.projectId ? suites.filter((s) => s.projectId === tenant.projectId) : suites,
    [suites, tenant?.projectId]
  );
};

export const useTargetGroups = () => {
  const tenant = useTenantSafe();
  const groups = useStore((state) => state.targetGroups);
  return useMemo(
    () => tenant?.projectId ? groups.filter((g) => g.projectId === tenant.projectId) : groups,
    [groups, tenant?.projectId]
  );
};

export const usePromptAgents = () => {
  const tenant = useTenantSafe();
  const agents = useStore((state) => state.promptAgents);
  return useMemo(
    () => tenant?.projectId ? agents.filter((a) => a.projectId === tenant.projectId) : agents,
    [agents, tenant?.projectId]
  );
};

export const useEvalRuns = () => {
  const tenant = useTenantSafe();
  const runs = useStore((state) => state.evalRuns);
  return useMemo(
    () => tenant?.projectId ? runs.filter((r) => r.projectId === tenant.projectId) : runs,
    [runs, tenant?.projectId]
  );
};

export const useImprovementRuns = () => {
  const tenant = useTenantSafe();
  const runs = useStore((state) => state.improvementRuns);
  return useMemo(
    () => tenant?.projectId ? runs.filter((r) => r.projectId === tenant.projectId) : runs,
    [runs, tenant?.projectId]
  );
};

// Agents are not project-scoped (shared across projects)
export const useAgents = () => useStore((state) => state.agents);
export const useCodingTools = () => useStore((state) => state.agents); // Alias for useAgents
export const useSettings = () => useStore((state) => state.settings);

export const useImprovementRunById = (runId: string) => {
  const improvementRuns = useStore((state) => state.improvementRuns);
  return useMemo(
    () => improvementRuns.find((r) => r.id === runId),
    [improvementRuns, runId]
  );
};

export const useStandaloneScenarios = () => {
  const testScenarios = useStore((state) => state.testScenarios);
  return useMemo(
    () => testScenarios.filter((ts) => !ts.skillId && (!ts.suiteIds || ts.suiteIds.length === 0)),
    [testScenarios]
  );
};

export const useSuiteScenarios = (suiteId: string) => {
  const testScenarios = useStore((state) => state.testScenarios);
  const testSuites = useStore((state) => state.testSuites);
  return useMemo(() => {
    const suite = testSuites.find((s) => s.id === suiteId);
    if (!suite) return [];
    return testScenarios.filter((ts) => suite.scenarioIds.includes(ts.id));
  }, [testScenarios, testSuites, suiteId]);
};

export const useSkillTestScenarios = (skillId: string) => {
  const testScenarios = useStore((state) => state.testScenarios);
  return useMemo(
    () => testScenarios.filter((ts) => ts.skillId === skillId),
    [testScenarios, skillId]
  );
};

export const useTargetGroupScenarios = (targetGroupId: string) => {
  const testScenarios = useStore((state) => state.testScenarios);
  return useMemo(
    () => testScenarios.filter((ts) => ts.targetGroupId === targetGroupId),
    [testScenarios, targetGroupId]
  );
};

export const useRecentEvalRuns = (limit = 10) => {
  const evalRuns = useStore((state) => state.evalRuns);
  return useMemo(
    () =>
      [...evalRuns]
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, limit),
    [evalRuns, limit]
  );
};

export const useStats = () => {
  const skills = useStore((state) => state.skills);
  const testScenarios = useStore((state) => state.testScenarios);
  const testSuites = useStore((state) => state.testSuites);
  const evalRuns = useStore((state) => state.evalRuns);

  return useMemo(() => {
    const completedRuns = evalRuns.filter((r) => r.status === "completed");
    const avgPassRate =
      completedRuns.length > 0
        ? completedRuns.reduce((sum, r) => sum + r.aggregateMetrics.passRate, 0) / completedRuns.length
        : 0;
    const standaloneScenarios = testScenarios.filter(
      (ts) => !ts.skillId && (!ts.suiteIds || ts.suiteIds.length === 0)
    ).length;

    return {
      totalSkills: skills.length,
      totalScenarios: testScenarios.length,
      totalSuites: testSuites.length,
      standaloneScenarios,
      totalVersions: skills.reduce((sum, s) => sum + s.versions.length, 0),
      totalEvalRuns: evalRuns.length,
      completedRuns: completedRuns.length,
      avgPassRate,
      totalAssertions: testScenarios.reduce((sum, ts) => sum + ts.assertions.length, 0),
    };
  }, [skills, testScenarios, testSuites, evalRuns]);
};
