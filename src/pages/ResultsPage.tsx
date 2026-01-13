import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  Grid3X3,
  TrendingUp,
  Download,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Search,
  AlertTriangle,
  Wrench,
  DollarSign,
  Zap,
  Clock,
  Activity,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Input, Select } from "@components/ui/Input";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/Tabs";
import { FailureAnalysisPanel } from "@components/FailureAnalysis";
import { useEvalRuns, useSkills, useAgents } from "@lib/store";
import type { EvalRun } from "@lib/types";
import { cn, formatRelativeTime } from "@lib/utils";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export function ResultsPage() {
  const evalRuns = useEvalRuns();
  const skills = useSkills();
  const agents = useAgents();

  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  // Get unique agent IDs from all runs
  const agentsInRuns = useMemo(() => {
    const agentIds = new Set<string>();
    evalRuns.forEach((run) => {
      run.results.forEach((result) => {
        if (result.agentId) {
          agentIds.add(result.agentId);
        }
      });
    });
    return agents.filter((a) => agentIds.has(a.id));
  }, [evalRuns, agents]);

  // Filter runs
  const filteredRuns = useMemo(() => {
    return evalRuns.filter((run) => {
      const matchesSkill = !selectedSkillId || run.skillId === selectedSkillId;
      const matchesSearch =
        !searchQuery ||
        run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        run.skillName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by agent - check if any result in the run uses the selected agent
      const matchesAgent = !selectedAgentId || 
        run.results.some((result) => result.agentId === selectedAgentId);
      
      return matchesSkill && matchesSearch && matchesAgent;
    });
  }, [evalRuns, selectedSkillId, selectedAgentId, searchQuery]);

  // Get completed runs for charts
  const completedRuns = filteredRuns.filter((r) => r.status === "completed");

  // Prepare trend data
  const trendData = useMemo(() => {
    return completedRuns
      .slice(-20)
      .map((run) => ({
        name: new Date(run.startedAt).toLocaleDateString(),
        passRate: run.aggregateMetrics.passRate,
        passed: run.aggregateMetrics.passed,
        failed: run.aggregateMetrics.failed,
        total: run.aggregateMetrics.totalAssertions,
        runId: run.id,
      }))
      .reverse();
  }, [completedRuns]);

  // Comparison data for selected runs
  const comparisonData = useMemo(() => {
    return selectedRuns
      .map((id) => evalRuns.find((r) => r.id === id))
      .filter(Boolean) as EvalRun[];
  }, [selectedRuns, evalRuns]);

  // Aggregate tracing data from completed runs
  const tracingTotals = useMemo(() => {
    const runsWithTracing = completedRuns.filter(r => r.llmTraceSummary);
    if (runsWithTracing.length === 0) {
      return null;
    }

    let totalCost = 0;
    let totalTokens = 0;
    let totalDuration = 0;
    let totalSteps = 0;

    runsWithTracing.forEach(run => {
      if (run.llmTraceSummary) {
        totalCost += run.llmTraceSummary.totalCostUsd;
        totalTokens += run.llmTraceSummary.totalTokens.total;
        totalDuration += run.llmTraceSummary.totalDurationMs;
        totalSteps += run.llmTraceSummary.totalSteps;
      }
    });

    return {
      totalCost,
      totalTokens,
      totalDuration,
      totalSteps,
      runsWithTracing: runsWithTracing.length,
    };
  }, [completedRuns]);

  const toggleRunSelection = (runId: string) => {
    setSelectedRuns((prev) =>
      prev.includes(runId)
        ? prev.filter((id) => id !== runId)
        : prev.length < 5
        ? [...prev, runId]
        : prev
    );
  };

  const exportResults = () => {
    const data = filteredRuns.map((run) => ({
      id: run.id,
      name: run.name,
      skill: run.skillName,
      status: run.status,
      passRate: run.aggregateMetrics.passRate,
      passed: run.aggregateMetrics.passed,
      failed: run.aggregateMetrics.failed,
      total: run.aggregateMetrics.totalAssertions,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evaluation-results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Results & Comparison"
        description="Analyze and compare evaluation results across runs"
        actions={
          <Button variant="secondary" onClick={exportResults} leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search runs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          value={selectedSkillId}
          onChange={(e) => setSelectedSkillId(e.target.value)}
          options={[
            { value: "", label: "All Skills" },
            ...skills.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        {agentsInRuns.length > 0 && (
          <Select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            options={[
              { value: "", label: "All Agents" },
              ...agentsInRuns.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
        )}
      </div>

      {filteredRuns.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No evaluation results"
          description="Run some evaluations to see results and comparisons here"
        />
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="failures">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Failure Analysis
            </TabsTrigger>
            <TabsTrigger value="heatmap">
              <BarChart2 className="w-4 h-4 mr-2" />
              Comparison Heatmap
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <SummaryCard
                label="Total Runs"
                value={filteredRuns.length}
                subValue={`${completedRuns.length} completed`}
              />
              <SummaryCard
                label="Avg Pass Rate"
                value={
                  completedRuns.length > 0
                    ? `${(
                        completedRuns.reduce(
                          (sum, r) => sum + r.aggregateMetrics.passRate,
                          0
                        ) / completedRuns.length
                      ).toFixed(1)}%`
                    : "N/A"
                }
                subValue="Across all runs"
                highlight
              />
              <SummaryCard
                label="Total Assertions"
                value={completedRuns.reduce(
                  (sum, r) => sum + r.aggregateMetrics.totalAssertions,
                  0
                )}
                subValue="Tests executed"
              />
              <SummaryCard
                label="Pass/Fail"
                value={`${completedRuns.reduce(
                  (sum, r) => sum + r.aggregateMetrics.passed,
                  0
                )}/${completedRuns.reduce(
                  (sum, r) => sum + r.aggregateMetrics.failed,
                  0
                )}`}
                subValue="Passed / Failed"
              />
            </div>

            {/* LLM Tracing Summary Cards */}
            {tracingTotals && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <TracingSummaryCard
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Total Cost"
                  value={`$${tracingTotals.totalCost.toFixed(4)}`}
                  subValue={`${tracingTotals.runsWithTracing} runs with tracing`}
                  color="emerald"
                />
                <TracingSummaryCard
                  icon={<Zap className="w-5 h-5" />}
                  label="Total Tokens"
                  value={formatTokenCount(tracingTotals.totalTokens)}
                  subValue="Across all LLM calls"
                  color="violet"
                />
                <TracingSummaryCard
                  icon={<Clock className="w-5 h-5" />}
                  label="LLM Duration"
                  value={formatDuration(tracingTotals.totalDuration)}
                  subValue="Total LLM processing time"
                  color="amber"
                />
                <TracingSummaryCard
                  icon={<Activity className="w-5 h-5" />}
                  label="Total Steps"
                  value={tracingTotals.totalSteps.toLocaleString()}
                  subValue="LLM interactions"
                  color="sky"
                />
              </div>
            )}

            {/* Run List */}
            <div className="space-y-3">
              {filteredRuns.map((run) => (
                <RunCard
                  key={run.id}
                  run={run}
                  isExpanded={expandedRun === run.id}
                  isSelected={selectedRuns.includes(run.id)}
                  onToggle={() =>
                    setExpandedRun(expandedRun === run.id ? null : run.id)
                  }
                  onSelect={() => toggleRunSelection(run.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Failure Analysis Tab */}
          <TabsContent value="failures" className="mt-6">
            <FailureAnalysisTab runs={filteredRuns} />
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap" className="mt-6">
            {comparisonData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Select runs to compare in the Overview tab
                </p>
                <p className="text-sm text-gray-400">
                  You can select up to 5 runs for comparison
                </p>
              </div>
            ) : (
              <ComparisonHeatmap runs={comparisonData} />
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="mt-6">
            {trendData.length < 2 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Need at least 2 completed runs to show trends
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {/* Pass Rate Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pass Rate Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="passRateGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            stroke="#9CA3AF"
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                            stroke="#9CA3AF"
                            tickFormatter={(v) => `${v}%`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                            }}
                            formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, "Pass Rate"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="passRate"
                            stroke="#6366F1"
                            strokeWidth={2}
                            fill="url(#passRateGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Pass/Fail Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assertions Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            stroke="#9CA3AF"
                          />
                          <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="passed"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Passed"
                          />
                          <Line
                            type="monotone"
                            dataKey="failed"
                            stroke="#EF4444"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Failed"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Helper functions for formatting
function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toLocaleString();
}

function formatDuration(ms: number): string {
  if (ms >= 60_000) {
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  if (ms >= 1_000) {
    return `${(ms / 1_000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

// Summary Card
function SummaryCard({
  label,
  value,
  subValue,
  highlight,
}: {
  label: string;
  value: string | number;
  subValue: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p
          className={cn(
            "text-2xl font-bold",
            highlight ? "text-primary-600" : "text-gray-900"
          )}
        >
          {value}
        </p>
        <p className="text-xs text-gray-400 mt-1">{subValue}</p>
      </CardContent>
    </Card>
  );
}

// Tracing Summary Card with colored icon
function TracingSummaryCard({
  icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  color: "emerald" | "violet" | "amber" | "sky";
}) {
  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
    sky: "bg-sky-100 text-sky-600",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", colorClasses[color])}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-0.5">{label}</p>
            <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Run Card
function RunCard({
  run,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
}: {
  run: EvalRun;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  return (
    <Card className={cn(isSelected && "ring-2 ring-primary-300")}>
      <CardContent className="p-0">
        <div
          className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
          onClick={onToggle}
        >
          <button className="text-gray-400">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="rounded-sm text-primary-600"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{run.name}</h4>
              <Badge
                variant={
                  run.status === "completed"
                    ? "success"
                    : run.status === "running"
                    ? "primary"
                    : run.status === "failed"
                    ? "error"
                    : "gray"
                }
                size="sm"
              >
                {run.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {run.skillName} • {run.results.length} result(s) •{" "}
              {formatRelativeTime(run.startedAt)}
            </p>
          </div>

          {run.status === "completed" && (
            <div className="flex items-center gap-4">
              {/* LLM Tracing Badges */}
              {run.llmTraceSummary && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">
                    <DollarSign className="w-3 h-3" />
                    ${run.llmTraceSummary.totalCostUsd.toFixed(3)}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-md">
                    <Zap className="w-3 h-3" />
                    {formatTokenCount(run.llmTraceSummary.totalTokens.total)}
                  </span>
                </div>
              )}

              {/* Mini Progress Bar */}
              <div className="w-24">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{run.aggregateMetrics.passed} passed</span>
                  <span>{run.aggregateMetrics.failed} failed</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-success-500"
                    style={{
                      width: `${
                        (run.aggregateMetrics.passed /
                          Math.max(run.aggregateMetrics.totalAssertions, 1)) *
                        100
                      }%`,
                    }}
                  />
                  <div
                    className="bg-error-500"
                    style={{
                      width: `${
                        (run.aggregateMetrics.failed /
                          Math.max(run.aggregateMetrics.totalAssertions, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <Badge
                variant={
                  run.aggregateMetrics.passRate >= 80
                    ? "success"
                    : run.aggregateMetrics.passRate >= 50
                    ? "warning"
                    : "error"
                }
              >
                {run.aggregateMetrics.passRate.toFixed(1)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && run.status === "completed" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-gray-100 p-4 bg-gray-50"
          >
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-success-600">
                  {run.aggregateMetrics.passed}
                </p>
                <p className="text-xs text-gray-500">Passed</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-error-600">
                  {run.aggregateMetrics.failed}
                </p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-gray-900">
                  {run.aggregateMetrics.avgDuration.toFixed(0)}ms
                </p>
                <p className="text-xs text-gray-500">Avg Duration</p>
              </div>
            </div>

            {/* Results by Scenario */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Results by Scenario
              </h5>
              <div className="space-y-2">
                {run.results.map((result) => (
                  <ResultWithTracing key={result.id} result={result} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Result with expandable tracing
function ResultWithTracing({ result }: { result: EvalRun["results"][0] }) {
  const [showTracing, setShowTracing] = useState(false);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setShowTracing(!showTracing)}
      >
        <div className="flex items-center gap-3">
          <button className="text-gray-400">
            {showTracing ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <Badge variant="gray" size="sm">
            {result.modelConfig?.model || "N/A"}
          </Badge>
          {result.agentName && (
            <Badge variant="primary" size="sm" className="flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              {result.agentName}
            </Badge>
          )}
          <span className="text-sm font-medium text-gray-900">
            {result.scenarioName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Tracing mini-summary */}
          {result.llmTrace && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${result.llmTrace.summary.totalCostUsd.toFixed(4)}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {formatTokenCount(result.llmTrace.summary.totalTokens.total)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-success-600">
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              {result.passed}
            </span>
            <span className="text-error-600">
              <XCircle className="w-4 h-4 inline mr-1" />
              {result.failed}
            </span>
          </div>
          <Badge
            variant={
              result.passRate >= 80
                ? "success"
                : result.passRate >= 50
                ? "warning"
                : "error"
            }
            size="sm"
          >
            {result.passRate.toFixed(0)}%
          </Badge>
        </div>
      </div>

      {/* Expanded Tracing Table */}
      {showTracing && result.llmTrace && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-gray-100"
        >
          <LLMTracingTable trace={result.llmTrace} />
        </motion.div>
      )}
    </div>
  );
}

// LLM Tracing Table Component
function LLMTracingTable({ trace }: { trace: NonNullable<EvalRun["results"][0]["llmTrace"]> }) {
  const stepTypeColors: Record<string, string> = {
    completion: "bg-blue-100 text-blue-700",
    tool_use: "bg-purple-100 text-purple-700",
    tool_result: "bg-indigo-100 text-indigo-700",
    thinking: "bg-amber-100 text-amber-700",
  };

  const stepTypeLabels: Record<string, string> = {
    completion: "Completion",
    tool_use: "Tool Use",
    tool_result: "Tool Result",
    thinking: "Thinking",
  };

  return (
    <div className="p-4 bg-gray-50">
      {/* Summary Row */}
      <div className="flex items-center gap-6 mb-4 p-3 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {trace.summary.totalSteps} steps
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatDuration(trace.summary.totalDurationMs)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatTokenCount(trace.summary.totalTokens.total)} tokens
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            ${trace.summary.totalCostUsd.toFixed(4)}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1 text-xs text-gray-500">
          Models: {trace.summary.modelsUsed.map(m => (
            <Badge key={m} variant="gray" size="sm">{m}</Badge>
          ))}
        </div>
      </div>

      {/* Steps Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600">#</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Model</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">Tokens</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">Duration</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">Cost</th>
              <th className="text-center px-3 py-2 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trace.steps.map((step) => (
              <tr key={step.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-500">{step.stepNumber}</td>
                <td className="px-3 py-2">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium",
                    stepTypeColors[step.type] || "bg-gray-100 text-gray-700"
                  )}>
                    {stepTypeLabels[step.type] || step.type}
                    {step.toolName && (
                      <span className="ml-1 opacity-75">({step.toolName})</span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600 font-mono text-xs">
                  {step.model}
                </td>
                <td className="px-3 py-2 text-right text-gray-600">
                  <span className="text-xs text-gray-400">
                    {step.tokenUsage.prompt.toLocaleString()}↑
                  </span>
                  {" / "}
                  <span className="text-xs text-gray-400">
                    {step.tokenUsage.completion.toLocaleString()}↓
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-gray-600">
                  {formatDuration(step.durationMs)}
                </td>
                <td className="px-3 py-2 text-right text-gray-600">
                  ${step.costUsd.toFixed(5)}
                </td>
                <td className="px-3 py-2 text-center">
                  {step.success ? (
                    <CheckCircle2 className="w-4 h-4 text-success-500 inline" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error-500 inline" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Failure Analysis Tab
function FailureAnalysisTab({ runs }: { runs: EvalRun[] }) {
  // Collect all failure analyses from runs
  const allAnalyses = useMemo(() => {
    return runs.flatMap((run) => run.failureAnalyses || []);
  }, [runs]);

  // Get runs with failures for detailed view
  const runsWithFailures = runs.filter(
    (run) => run.failureAnalyses && run.failureAnalyses.length > 0
  );

  // Calculate failure statistics
  const stats = useMemo(() => {
    const categories: Record<string, number> = {};
    const severities: Record<string, number> = {};

    allAnalyses.forEach((analysis) => {
      categories[analysis.category] = (categories[analysis.category] || 0) + 1;
      severities[analysis.severity] = (severities[analysis.severity] || 0) + 1;
    });

    return { categories, severities };
  }, [allAnalyses]);

  if (allAnalyses.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No failure analyses available</p>
        <p className="text-sm text-gray-400">
          Run evaluations to see detailed failure analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{allAnalyses.length}</p>
            <p className="text-sm text-gray-500">Total Failures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-700">
              {stats.severities.critical || 0}
            </p>
            <p className="text-sm text-gray-500">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {stats.severities.high || 0}
            </p>
            <p className="text-sm text-gray-500">High</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-500">
              {(stats.severities.medium || 0) + (stats.severities.low || 0)}
            </p>
            <p className="text-sm text-gray-500">Medium/Low</p>
          </CardContent>
        </Card>
      </div>

      {/* Failure Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div
                key={category}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {category.replace("_", " ")}
                </span>
                <Badge variant="gray">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analyses by Run */}
      <div className="space-y-6">
        {runsWithFailures.slice(0, 5).map((run) => (
          <Card key={run.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{run.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {run.skillName} • {formatRelativeTime(run.startedAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    run.aggregateMetrics.passRate >= 80
                      ? "success"
                      : run.aggregateMetrics.passRate >= 50
                      ? "warning"
                      : "error"
                  }
                >
                  {run.aggregateMetrics.passRate.toFixed(1)}% Pass Rate
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <FailureAnalysisPanel analyses={run.failureAnalyses || []} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Comparison Heatmap
function ComparisonHeatmap({ runs }: { runs: EvalRun[] }) {
  // Build matrix data
  // Rows = scenarios, Columns = runs
  const scenarios = new Map<string, string>();
  runs.forEach((run) => {
    run.results.forEach((result) => {
      scenarios.set(result.scenarioId, result.scenarioName);
    });
  });

  const scenarioIds = Array.from(scenarios.keys());

  // Collect unique agents used
  const agentsUsed = useMemo(() => {
    const agentNames = new Set<string>();
    runs.forEach((run) => {
      run.results.forEach((result) => {
        if (result.agentName) {
          agentNames.add(result.agentName);
        }
      });
    });
    return Array.from(agentNames);
  }, [runs]);

  const getPassRate = (run: EvalRun, scenarioId: string) => {
    const result = run.results.find((r) => r.scenarioId === scenarioId);
    return result?.passRate ?? null;
  };

  const getCellColor = (passRate: number | null) => {
    if (passRate === null) return "bg-gray-100";
    if (passRate >= 80) return "bg-success-400";
    if (passRate >= 60) return "bg-success-200";
    if (passRate >= 40) return "bg-warning-200";
    if (passRate >= 20) return "bg-warning-400";
    return "bg-error-400";
  };

  return (
    <div className="overflow-x-auto">
      {/* Agents summary if multiple agents used */}
      {agentsUsed.length > 1 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Wrench className="w-4 h-4" />
            <span className="font-medium">Agents compared:</span>
            {agentsUsed.map((agentName) => (
              <Badge key={agentName} variant="primary" size="sm">
                {agentName}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-3 text-sm font-medium text-gray-700">
              Scenario
            </th>
            {runs.map((run) => (
              <th
                key={run.id}
                className="text-center p-3 text-sm font-medium text-gray-700 min-w-[120px]"
              >
                <div>{run.name}</div>
                <div className="text-xs font-normal text-gray-400">
                  {run.results[0]?.modelConfig?.model || "N/A"}
                </div>
                {run.results[0]?.agentName && (
                  <div className="text-xs font-normal text-primary-500 mt-1">
                    via {run.results[0]?.agentName}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenarioIds.map((scenarioId) => (
            <tr key={scenarioId} className="border-t">
              <td className="p-3 text-sm text-gray-900">
                {scenarios.get(scenarioId)}
              </td>
              {runs.map((run) => {
                const passRate = getPassRate(run, scenarioId);
                return (
                  <td key={`${run.id}-${scenarioId}`} className="p-2">
                    <div
                      className={cn(
                        "flex items-center justify-center h-12 rounded-lg text-sm font-medium",
                        getCellColor(passRate),
                        passRate !== null && passRate < 50
                          ? "text-white"
                          : "text-gray-900"
                      )}
                    >
                      {passRate !== null ? `${passRate.toFixed(0)}%` : "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Aggregate Row */}
          <tr className="border-t-2 border-gray-300 bg-gray-50">
            <td className="p-3 text-sm font-semibold text-gray-900">
              Overall
            </td>
            {runs.map((run) => (
              <td key={run.id} className="p-2">
                <div
                  className={cn(
                    "flex items-center justify-center h-12 rounded-lg text-sm font-bold",
                    getCellColor(run.aggregateMetrics.passRate),
                    run.aggregateMetrics.passRate < 50
                      ? "text-white"
                      : "text-gray-900"
                  )}
                >
                  {run.aggregateMetrics.passRate.toFixed(1)}%
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-error-400 rounded-sm" />
          <span className="text-xs text-gray-600">0-20%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-warning-400 rounded-sm" />
          <span className="text-xs text-gray-600">20-40%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-warning-200 rounded-sm" />
          <span className="text-xs text-gray-600">40-60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success-200 rounded-sm" />
          <span className="text-xs text-gray-600">60-80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success-400 rounded-sm" />
          <span className="text-xs text-gray-600">80-100%</span>
        </div>
      </div>
    </div>
  );
}
