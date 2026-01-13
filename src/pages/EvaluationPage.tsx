import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Square,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Cpu,
  TestTube2,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Wrench,
  Brain,
  Zap,
  Terminal,
  Settings2,
  DollarSign,
  Timer,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Input, Select } from "@components/ui/Input";
import { Badge, TrendBadge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/Tabs";
import { useTenant } from "@lib/context";
import { useStore, useSkills, useTestScenarios, useTestSuites, useRecentEvalRuns, useAgents } from "@lib/store";
import type {
  EvalRunConfig,
  EvalRun,
  EvalRunResult,
  ModelConfig,
  TestScenario,
  LLMProvider,
  Agent,
  Skill,
} from "@lib/types";
import { AVAILABLE_MODELS as MODELS } from "@lib/types";
import { runScenario } from "@lib/mock/skillRunner";
import { cn, formatRelativeTime } from "@lib/utils";

// Agent icon mapping
const AgentIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type) {
    case "claude_code":
      return <Brain className={className} />;
    case "codex":
      return <Zap className={className} />;
    case "cursor_cli":
      return <Terminal className={className} />;
    default:
      return <Settings2 className={className} />;
  }
};

// Status icons
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "passed":
      return <CheckCircle2 className="w-4 h-4 text-success-500" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-error-500" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-warning-500" />;
    case "running":
      return <RefreshCw className="w-4 h-4 text-primary-500 animate-spin" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export function EvaluationPage() {
  const [searchParams] = useSearchParams();
  const scenarioIdParam = searchParams.get("scenarioId");
  const scenarioIdsParam = searchParams.get("scenarioIds"); // For suite selection

  const { projectId } = useTenant();
  const skills = useSkills();
  const testScenarios = useTestScenarios();
  const testSuites = useTestSuites();
  const recentRuns = useRecentEvalRuns(10);
  const agents = useAgents();
  const {
    createEvalRun,
    updateEvalRunStatus,
    addEvalRunResult,
    completeEvalRun,
    getSkillById,
    getTestScenarioById,
    getAgentById,
    getTestSuiteById,
  } = useStore();

  // Parse scenario IDs from URL
  const initialScenarioIds = scenarioIdsParam 
    ? scenarioIdsParam.split(",").filter(Boolean)
    : scenarioIdParam 
      ? [scenarioIdParam] 
      : [];

  // Selection state
  // Note: Version selection removed - evaluations always use current SKILL.md content
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedSuiteId, setSelectedSuiteId] = useState(""); // Suite selection for cross-skill testing
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>(initialScenarioIds);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  // Model override - only used if you want to override agent's default model
  const [useModelOverride, setUseModelOverride] = useState(false);
  const [modelOverride, setModelOverride] = useState<ModelConfig>({
    provider: "anthropic", model: "claude-3-sonnet", temperature: 0.7, maxTokens: 4096
  });

  // Run state
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<EvalRun | null>(null);
  const [runProgress, setRunProgress] = useState(0);
  const [runResults, setRunResults] = useState<EvalRunResult[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  // Get skill and its scenarios
  const selectedSkill = getSkillById(selectedSkillId);
  const skillScenarios = testScenarios.filter((s) => s.skillId === selectedSkillId);
  
  // Get suite scenarios (cross-skill)
  const selectedSuite = getTestSuiteById(selectedSuiteId);
  const suiteScenarios = selectedSuite 
    ? testScenarios.filter((s) => selectedSuite.scenarioIds.includes(s.id))
    : [];

  // All available scenarios based on selection mode
  const availableScenarios = selectedSuiteId 
    ? suiteScenarios 
    : selectedSkillId 
      ? skillScenarios 
      : testScenarios; // Show all if neither selected

  // Handle suite selection - auto-populate scenarios
  useEffect(() => {
    if (selectedSuiteId && selectedSuite) {
      setSelectedScenarioIds(selectedSuite.scenarioIds);
      // Clear skill selection when suite is selected (suites are cross-skill)
      setSelectedSkillId("");
    }
  }, [selectedSuiteId, selectedSuite]);

  // Calculate total combinations: Scenarios × Agents
  // Simplified: no version or model matrix, just scenarios × agents
  const agentMultiplier = selectedAgentIds.length > 0 ? selectedAgentIds.length : 1;
  const totalCombinations = selectedScenarioIds.length * agentMultiplier;

  const toggleScenarioSelection = (scenarioId: string) => {
    setSelectedScenarioIds((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const updateModelOverride = (updates: Partial<ModelConfig>) => {
    setModelOverride((prev) => ({ ...prev, ...updates }));
  };

  // Run evaluation - simplified: Scenarios × Agents matrix
  const handleRunEvaluation = useCallback(async () => {
    // Must have at least one scenario selected
    if (selectedScenarioIds.length === 0) {
      return;
    }
    
    // For single-skill mode, must have a skill selected
    if (!selectedSuiteId && !selectedSkillId) {
      return;
    }

    setIsRunning(true);
    setRunProgress(0);
    setRunResults([]);

    // Simplified config: just scenarios and agents
    const config: EvalRunConfig = {
      scenarioIds: selectedScenarioIds,
      agentIds: selectedAgentIds,
      modelOverride: useModelOverride ? modelOverride : undefined,
      parallelism: 1,
      timeout: 60000,
    };

    const runName = selectedSuiteId && selectedSuite
      ? `Suite: ${selectedSuite.name} - ${new Date().toLocaleString()}`
      : selectedSkill 
        ? `${selectedSkill.name} - ${new Date().toLocaleString()}`
        : `Evaluation ${new Date().toLocaleString()}`;

    const run = createEvalRun({
      projectId,
      name: runName,
      skillId: selectedSkillId || "suite-run",
      config,
    });

    setCurrentRun(run);
    updateEvalRunStatus(run.id, "running");

    // Build combinations: Scenarios × Agents
    const combinations: {
      skill?: Skill;
      scenario: TestScenario;
      agent?: Agent;
    }[] = [];

    const agentsToRun = selectedAgentIds.length > 0 
      ? selectedAgentIds.map((id) => getAgentById(id)).filter(Boolean) as Agent[]
      : [undefined]; // Run without agent if none selected

    for (const scenarioId of config.scenarioIds) {
      const scenario = getTestScenarioById(scenarioId);
      if (!scenario) continue;

      // Get skill for this scenario
      const skill = scenario.skillId ? getSkillById(scenario.skillId) : selectedSkill;

      for (const agent of agentsToRun) {
        combinations.push({
          skill,
          scenario,
          agent,
        });
      }
    }

    // Run each combination
    let completed = 0;
    for (const combo of combinations) {
      try {
        // Pass skill and optional model override to runScenario
        const effectiveModel = useModelOverride 
          ? modelOverride 
          : combo.agent?.modelConfig || { provider: "anthropic", model: "claude-3-sonnet", temperature: 0.7, maxTokens: 4096 };
        
        const result = await runScenario(
          combo.skill ? {
            id: `current-${combo.skill.id}`,
            skillId: combo.skill.id,
            skillMd: combo.skill.skillMd,
            metadata: combo.skill.metadata,
            model: effectiveModel,
            version: 1, // Always version 1 - we only test current
            createdAt: combo.skill.updatedAt,
          } : undefined,
          combo.scenario,
          effectiveModel,
          undefined, // No custom system prompt - it's part of SKILL.md
          () => {}, // Progress callback
          combo.agent
        );

        setRunResults((prev) => [...prev, result]);
        addEvalRunResult(run.id, result);
      } catch (error) {
        console.error("Evaluation error:", error);
      }

      completed++;
      setRunProgress(Math.round((completed / combinations.length) * 100));
    }

    completeEvalRun(run.id);
    setIsRunning(false);
  }, [
    selectedSkillId,
    selectedSkill,
    selectedSuiteId,
    selectedSuite,
    selectedScenarioIds,
    selectedAgentIds,
    useModelOverride,
    modelOverride,
    createEvalRun,
    updateEvalRunStatus,
    addEvalRunResult,
    completeEvalRun,
    getSkillById,
    getTestScenarioById,
    getAgentById,
  ]);

  const handleStopEvaluation = () => {
    if (currentRun) {
      updateEvalRunStatus(currentRun.id, "cancelled");
    }
    setIsRunning(false);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Evaluation Runner"
        description="Test skill versions across models and scenarios"
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Configuration */}
        <div className="col-span-5 space-y-6">
          {/* Suite or Skill Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderKanban className="w-5 h-5 text-violet-500" />
                Select Suite or Skill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Suite Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Test Suite (cross-skill)
                </label>
                <Select
                  value={selectedSuiteId}
                  onChange={(e) => {
                    setSelectedSuiteId(e.target.value);
                    if (e.target.value) {
                      // Clear skill selection when suite is selected
                      setSelectedSkillId("");
                    }
                  }}
                  options={[
                    { value: "", label: "No suite selected" },
                    ...testSuites.map((s) => ({ 
                      value: s.id, 
                      label: `${s.name} (${s.scenarioIds.length} scenarios)` 
                    })),
                  ]}
                />
                {selectedSuite && (
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedSuite.scenarioIds.length} scenario(s) from multiple skills
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <div className="flex-1 border-t"></div>
                <span className="text-xs">or</span>
                <div className="flex-1 border-t"></div>
              </div>

              {/* Skill Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Single Skill
                </label>
                <Select
                  value={selectedSkillId}
                  onChange={(e) => {
                    setSelectedSkillId(e.target.value);
                    setSelectedScenarioIds([]);
                    // Clear suite when skill is selected
                    if (e.target.value) {
                      setSelectedSuiteId("");
                    }
                  }}
                  options={[
                    { value: "", label: "Select a skill..." },
                    ...skills.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  disabled={!!selectedSuiteId}
                />
                {selectedSkill && (
                  <p className="text-sm text-gray-500 mt-2">
                    {skillScenarios.length} scenario(s) • Tests current SKILL.md content
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Selection */}
          {(selectedSkillId || selectedSuiteId) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TestTube2 className="w-5 h-5 text-teal-500" />
                  Test Scenarios
                  {selectedSuiteId && (
                    <Badge variant="primary" size="sm">Suite Mode</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableScenarios.length === 0 ? (
                  <p className="text-sm text-gray-500">No scenarios available</p>
                ) : (
                  <div className="space-y-2">
                    {availableScenarios.map((scenario) => {
                      const skillName = scenario.skillId 
                        ? skills.find(s => s.id === scenario.skillId)?.name 
                        : null;
                      return (
                        <label
                          key={scenario.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                            selectedScenarioIds.includes(scenario.id)
                              ? "border-primary-300 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedScenarioIds.includes(scenario.id)}
                            onChange={() => toggleScenarioSelection(scenario.id)}
                            className="rounded-sm text-primary-600"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {scenario.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">
                                {scenario.assertions.length} assertion(s)
                              </p>
                              {selectedSuiteId && skillName && (
                                <Badge variant="gray" size="sm">{skillName}</Badge>
                              )}
                              {selectedSuiteId && !skillName && (
                                <Badge variant="warning" size="sm">Standalone</Badge>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Model Override (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="w-5 h-5 text-orange-500" />
                Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useModelOverride}
                  onChange={(e) => setUseModelOverride(e.target.checked)}
                  className="rounded-sm text-orange-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Override agent's default model
                  </span>
                  <p className="text-xs text-gray-500">
                    By default, each agent uses its own configured model
                  </p>
                </div>
              </label>
              
              {useModelOverride && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={modelOverride.provider}
                      onChange={(e) =>
                        updateModelOverride({
                          provider: e.target.value as LLMProvider,
                          model: MODELS[e.target.value as LLMProvider][0],
                        })
                      }
                      options={Object.keys(MODELS).map((p) => ({
                        value: p,
                        label: p.charAt(0).toUpperCase() + p.slice(1),
                      }))}
                    />
                    <Select
                      value={modelOverride.model}
                      onChange={(e) => updateModelOverride({ model: e.target.value })}
                      options={MODELS[modelOverride.provider].map((m) => ({
                        value: m,
                        label: m,
                      }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Temperature"
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={modelOverride.temperature}
                      onChange={(e) =>
                        updateModelOverride({ temperature: parseFloat(e.target.value) })
                      }
                    />
                    <Input
                      label="Max Tokens"
                      type="number"
                      min={100}
                      max={128000}
                      step={100}
                      value={modelOverride.maxTokens}
                      onChange={(e) =>
                        updateModelOverride({ maxTokens: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coding Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="w-5 h-5 text-rose-500" />
                Coding Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">
                Select coding agents to compare (optional - runs without agent if none selected)
              </p>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <label
                    key={agent.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedAgentIds.includes(agent.id)
                        ? "border-rose-300 bg-rose-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAgentIds.includes(agent.id)}
                      onChange={() => toggleAgentSelection(agent.id)}
                      className="rounded-sm text-rose-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AgentIcon type={agent.type} className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </span>
                        {agent.isBuiltIn && (
                          <Badge variant="gray" size="sm">Built-in</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {agent.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agent.capabilities.slice(0, 3).map((cap, i) => (
                          <span
                            key={i}
                            className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm"
                          >
                            {cap}
                          </span>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{agent.capabilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedAgentIds.length > 0 && (
                <div className="mt-3 p-2 bg-rose-50 rounded-lg">
                  <p className="text-xs text-rose-700">
                    <strong>{selectedAgentIds.length}</strong> agent(s) selected — each combination will be tested with each agent
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Run Button */}
          <div className="sticky bottom-0 bg-white p-4 -mx-8 border-t shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{totalCombinations}</span> total combination(s)
              </div>
              {isRunning && (
                <div className="text-sm text-gray-600">
                  Progress: <span className="font-medium">{runProgress}%</span>
                </div>
              )}
            </div>

            {isRunning ? (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-primary-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${runProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleStopEvaluation}
                  leftIcon={<Square className="w-4 h-4" />}
                >
                  Stop Evaluation
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleRunEvaluation}
                leftIcon={<Play className="w-4 h-4" />}
                disabled={
                  selectedScenarioIds.length === 0 ||
                  (!selectedSuiteId && !selectedSkillId)
                }
              >
                {selectedSuiteId ? "Run Suite Evaluation" : "Run Evaluation"}
              </Button>
            )}
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="col-span-7">
          <Tabs defaultValue="live">
            <TabsList>
              <TabsTrigger value="live">
                Live Results {runResults.length > 0 && `(${runResults.length})`}
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-4">
              {runResults.length === 0 ? (
                <EmptyState
                  icon={Play}
                  title="No results yet"
                  description="Configure your evaluation matrix and click Run to start"
                />
              ) : (
                <div className="space-y-3">
                  {runResults.map((result) => (
                    <ResultCard
                      key={result.id}
                      result={result}
                      isExpanded={expandedResult === result.id}
                      onToggle={() =>
                        setExpandedResult(
                          expandedResult === result.id ? null : result.id
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {recentRuns.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No evaluation history"
                  description="Run your first evaluation to see results here"
                />
              ) : (
                <HistoryRunsList runs={recentRuns} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Result Card Component
function ResultCard({
  result,
  isExpanded,
  onToggle,
}: {
  result: EvalRunResult;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const passed = result.passed;
  const failed = result.failed;
  const passRate = result.passRate;

  return (
    <Card>
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <button className="text-gray-400">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{result.scenarioName}</h4>
              <Badge variant="gray" size="sm">
                {result.modelConfig?.model || "N/A"}
              </Badge>
              {result.agentName && (
                <Badge variant="primary" size="sm">
                  {result.agentName}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Version ID: {result.skillVersionId.slice(0, 8)}...
              {result.systemPrompt && ` • Custom prompt`}
              {result.agentName && ` • via ${result.agentName}`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-success-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">{passed}</span>
              </div>
              <div className="flex items-center gap-1 text-error-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{failed}</span>
              </div>
            </div>
            <Badge
              variant={
                passRate >= 80
                  ? "success"
                  : passRate >= 50
                  ? "warning"
                  : "error"
              }
            >
              {passRate.toFixed(0)}%
            </Badge>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 space-y-4">
              {/* Mock Output */}
              {result.mockOutput && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Skill Output
                  </h5>
                  <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto max-h-48">
                    {result.mockOutput}
                  </pre>
                </div>
              )}

              {/* Generated Files */}
              {result.mockFiles && result.mockFiles.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Generated Files ({result.mockFiles.length})
                  </h5>
                  <div className="space-y-2">
                    {result.mockFiles.map((file, i) => (
                      <div
                        key={i}
                        className="p-2 bg-gray-50 rounded-lg border text-xs font-mono"
                      >
                        {file.path}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assertion Results */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Assertion Results
                </h5>
                <div className="space-y-2">
                  {result.assertionResults.map((ar) => (
                    <div
                      key={ar.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        ar.status === "passed"
                          ? "bg-success-50 border-success-200"
                          : ar.status === "failed"
                          ? "bg-error-50 border-error-200"
                          : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon status={ar.status} />
                        <span className="text-sm font-medium text-gray-900">
                          {ar.assertionName}
                        </span>
                        <Badge variant="gray" size="sm">
                          {ar.assertionType.replace(/_/g, " ")}
                        </Badge>
                        {ar.duration && (
                          <span className="text-xs text-gray-500 ml-auto">
                            {ar.duration}ms
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{ar.message}</p>
                      {ar.expected && ar.actual && (
                        <div className="mt-2 text-xs">
                          <p className="text-gray-500">
                            Expected: <span className="text-gray-700">{ar.expected}</span>
                          </p>
                          <p className="text-gray-500">
                            Actual: <span className="text-gray-700">{ar.actual}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ==========================================
// History Runs List - Grouped by Skill with Trends
// ==========================================

interface HistoryRunsListProps {
  runs: EvalRun[];
}

function HistoryRunsList({ runs }: HistoryRunsListProps) {
  // Group runs by skillId
  const groupedBySkill = runs.reduce((acc, run) => {
    const key = run.skillId;
    if (!acc[key]) {
      acc[key] = {
        skillName: run.skillName,
        runs: [],
      };
    }
    acc[key].runs.push(run);
    return acc;
  }, {} as Record<string, { skillName: string; runs: EvalRun[] }>);

  // Sort groups by most recent run
  const sortedGroups = Object.entries(groupedBySkill).sort((a, b) => {
    const aLatest = new Date(a[1].runs[0].startedAt).getTime();
    const bLatest = new Date(b[1].runs[0].startedAt).getTime();
    return bLatest - aLatest;
  });

  // Helper to get previous run for computing trends
  const getPreviousRun = (runs: EvalRun[], index: number): EvalRun | null => {
    return index < runs.length - 1 ? runs[index + 1] : null;
  };

  // Format duration in seconds
  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  // Format cost
  const formatCost = (usd: number) => {
    return `$${usd.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {sortedGroups.map(([skillId, group]) => (
        <Card key={skillId}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="w-4 h-4 text-violet-500" />
              {group.skillName}
              <Badge variant="gray" size="sm">
                {group.runs.length} run{group.runs.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {group.runs.map((run, index) => {
                const prevRun = getPreviousRun(group.runs, index);
                const cost = run.llmTraceSummary?.totalCostUsd || 0;
                const prevCost = prevRun?.llmTraceSummary?.totalCostUsd || 0;
                const duration = run.aggregateMetrics.totalDuration;
                const prevDuration = prevRun?.aggregateMetrics.totalDuration || 0;

                return (
                  <div
                    key={run.id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                      index === 0
                        ? "bg-gray-50 border-gray-200"
                        : "border-gray-100 hover:bg-gray-50"
                    )}
                  >
                    {/* Run name and time */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {run.name}
                        </p>
                        {index === 0 && (
                          <Badge variant="primary" size="sm">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(run.startedAt)}
                      </p>
                    </div>

                    {/* Pass Rate with trend */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-medium">
                            {run.aggregateMetrics.passRate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {prevRun && (
                        <TrendBadge
                          current={run.aggregateMetrics.passRate}
                          previous={prevRun.aggregateMetrics.passRate}
                          format="percent"
                          threshold={1}
                        />
                      )}
                    </div>

                    {/* Cost with trend */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatCost(cost)}
                          </span>
                        </div>
                      </div>
                      {prevRun && cost > 0 && prevCost > 0 && (
                        <TrendBadge
                          current={cost}
                          previous={prevCost}
                          format="currency"
                          inverse={true}
                        />
                      )}
                    </div>

                    {/* Duration with trend */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDuration(duration)}
                          </span>
                        </div>
                      </div>
                      {prevRun && (
                        <TrendBadge
                          current={duration}
                          previous={prevDuration}
                          format="duration"
                          inverse={true}
                        />
                      )}
                    </div>

                    {/* Status badge */}
                    <Badge
                      variant={
                        run.status === "completed"
                          ? "success"
                          : run.status === "failed"
                          ? "error"
                          : "gray"
                      }
                      size="sm"
                    >
                      {run.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
