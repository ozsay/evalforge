import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileCode2,
  MessageSquare,
  Bot,
  ArrowLeft,
  Zap,
  Target,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Select } from "@components/ui/Input";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import {
  useStore,
  useImprovementRuns,
  useImprovementRunById,
  useSkills,
  usePromptAgents,
  useAgents,
  useTestSuites,
} from "@lib/store";
import type { ImprovementRun, ImprovementIteration, ImprovementTargetType } from "@lib/types";
import { formatRelativeTime, cn } from "@lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function SelfImprovingPage() {
  const { runId } = useParams<{ runId: string }>();

  if (runId) {
    return <RunDetailView runId={runId} />;
  }

  return <StartView />;
}

// ==========================================
// Start View - Select Target and Start Run
// ==========================================

function StartView() {
  const navigate = useNavigate();
  const improvementRuns = useImprovementRuns();
  const skills = useSkills();
  const promptAgents = usePromptAgents();
  const agents = useAgents();
  const testSuites = useTestSuites();
  const { startImprovementRun } = useStore();

  const [targetType, setTargetType] = useState<ImprovementTargetType>("skill");
  const [targetId, setTargetId] = useState("");
  const [testSuiteId, setTestSuiteId] = useState("");
  const [maxIterations, setMaxIterations] = useState(3);

  const targetOptions = useMemo(() => {
    switch (targetType) {
      case "skill":
        return skills.map((s) => ({ value: s.id, label: s.name }));
      case "prompt_agent":
        return promptAgents.map((p) => ({ value: p.id, label: p.name }));
      case "coding_agent":
        return agents.filter((a) => !a.isBuiltIn).map((a) => ({ value: a.id, label: a.name }));
      default:
        return [];
    }
  }, [targetType, skills, promptAgents, agents]);

  const selectedTarget = useMemo(() => {
    switch (targetType) {
      case "skill":
        return skills.find((s) => s.id === targetId);
      case "prompt_agent":
        return promptAgents.find((p) => p.id === targetId);
      case "coding_agent":
        return agents.find((a) => a.id === targetId);
      default:
        return undefined;
    }
  }, [targetType, targetId, skills, promptAgents, agents]);

  const selectedTestSuite = useMemo(() => {
    return testSuites.find((s) => s.id === testSuiteId);
  }, [testSuiteId, testSuites]);

  const handleStartRun = () => {
    if (!targetId || !selectedTarget || !testSuiteId || !selectedTestSuite) return;

    const run = startImprovementRun({
      targetType,
      targetId,
      targetName: selectedTarget.name,
      testSuiteId,
      testSuiteName: selectedTestSuite.name,
      maxIterations,
    });

    navigate(`/self-improving/${run.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8"
    >
      <PageHeader
        title="Self-Improving Evaluation"
        description="Automatically evaluate and improve your targets through iterative LLM-driven refinement"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Start New Run Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card variant="elevated" className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Start Improvement Run
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Select
                label="Target Type"
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as ImprovementTargetType);
                  setTargetId("");
                }}
                options={[
                  { value: "skill", label: "Agent Skill" },
                  { value: "prompt_agent", label: "Prompt Agent" },
                  { value: "coding_agent", label: "Coding Agent" },
                ]}
              />

              <Select
                label="Select Target"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                options={[
                  { value: "", label: "Choose a target..." },
                  ...targetOptions,
                ]}
              />

              <Select
                label="Test Suite"
                value={testSuiteId}
                onChange={(e) => setTestSuiteId(e.target.value)}
                options={[
                  { value: "", label: "Choose a test suite..." },
                  ...testSuites.map((s) => ({ value: s.id, label: `${s.name} (${s.scenarioIds.length} scenarios)` })),
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Max Iterations
                </label>
                <div className="flex items-center gap-3">
                  {[2, 3, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMaxIterations(n)}
                      className={cn(
                        "w-12 h-10 rounded-lg font-medium transition-all",
                        maxIterations === n
                          ? "bg-violet-100 text-violet-700 border-2 border-violet-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleStartRun}
                disabled={!targetId || !testSuiteId}
                className="w-full"
                leftIcon={<Play className="w-4 h-4" />}
              >
                Start Improvement Run
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Previous Runs List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Runs</h2>

          {improvementRuns.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No improvement runs yet"
              description="Start your first self-improving evaluation to see the magic happen"
            />
          ) : (
            <div className="space-y-3">
              {improvementRuns.map((run) => (
                <RunCard key={run.id} run={run} onClick={() => navigate(`/self-improving/${run.id}`)} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// Run Card Component
// ==========================================

function RunCard({ run, onClick }: { run: ImprovementRun; onClick: () => void }) {
  const getStatusBadge = () => {
    switch (run.status) {
      case "running":
        return (
          <Badge variant="primary" size="sm" className="animate-pulse">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="error" size="sm">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="gray" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getTargetIcon = () => {
    switch (run.targetType) {
      case "skill":
        return <FileCode2 className="w-5 h-5 text-violet-500" />;
      case "prompt_agent":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "coding_agent":
        return <Bot className="w-5 h-5 text-emerald-500" />;
    }
  };

  const improvementDelta = run.improvement;
  const ImprovementIcon = improvementDelta > 0 ? TrendingUp : improvementDelta < 0 ? TrendingDown : Minus;
  const improvementColor =
    improvementDelta > 0 ? "text-emerald-600" : improvementDelta < 0 ? "text-red-600" : "text-gray-500";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-violet-200 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          {getTargetIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{run.targetName}</h3>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="text-gray-600">
              Suite: <span className="font-medium">{run.testSuiteName}</span>
            </span>
            <span>
              {run.iterations.length}/{run.maxIterations} iterations
            </span>
            <span>{formatRelativeTime(run.startedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {run.status === "completed" && (
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-gray-900">{run.finalPassRate}%</span>
                <div className={cn("flex items-center text-sm font-medium", improvementColor)}>
                  <ImprovementIcon className="w-4 h-4" />
                  {improvementDelta > 0 ? "+" : ""}
                  {improvementDelta}
                </div>
              </div>
              <span className="text-xs text-gray-500">Pass Rate</span>
            </div>
          )}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// Run Detail View
// ==========================================

function RunDetailView({ runId }: { runId: string }) {
  const navigate = useNavigate();
  const run = useImprovementRunById(runId);
  const [expandedIterations, setExpandedIterations] = useState<string[]>([]);

  if (!run) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Sparkles}
          title="Run not found"
          description="This improvement run doesn't exist or has been deleted"
          actionLabel="Back to Self-Improving"
          onAction={() => navigate("/self-improving")}
        />
      </div>
    );
  }

  const toggleIteration = (id: string) => {
    setExpandedIterations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const improvementDelta = run.improvement;
  const ImprovementIcon = improvementDelta > 0 ? TrendingUp : improvementDelta < 0 ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/self-improving")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Self-Improving
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{run.targetName}</h1>
            <p className="text-gray-600 mb-2">
              Testing against: <span className="font-medium">{run.testSuiteName}</span>
            </p>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  run.targetType === "skill"
                    ? "primary"
                    : run.targetType === "prompt_agent"
                    ? "default"
                    : "success"
                }
                size="sm"
              >
                {run.targetType.replace("_", " ")}
              </Badge>
              <span className="text-sm text-gray-500">
                {run.iterations.length}/{run.maxIterations} iterations
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatRelativeTime(run.startedAt)}</span>
            </div>
          </div>

          {run.status === "running" && (
            <Badge variant="primary" size="lg" className="animate-pulse">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Iteration {run.iterations.length + 1}...
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Target className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Initial Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{run.initialPassRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-violet-50 to-purple-100">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-200 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-violet-600">Final Pass Rate</p>
                  <p className="text-2xl font-bold text-violet-900">{run.finalPassRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            className={cn(
              "bg-gradient-to-br",
              improvementDelta > 0
                ? "from-emerald-50 to-green-100"
                : improvementDelta < 0
                ? "from-red-50 to-red-100"
                : "from-gray-50 to-gray-100"
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    improvementDelta > 0
                      ? "bg-emerald-200"
                      : improvementDelta < 0
                      ? "bg-red-200"
                      : "bg-gray-200"
                  )}
                >
                  <ImprovementIcon
                    className={cn(
                      "w-5 h-5",
                      improvementDelta > 0
                        ? "text-emerald-600"
                        : improvementDelta < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    )}
                  />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm",
                      improvementDelta > 0
                        ? "text-emerald-600"
                        : improvementDelta < 0
                        ? "text-red-600"
                        : "text-gray-500"
                    )}
                  >
                    Improvement
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      improvementDelta > 0
                        ? "text-emerald-700"
                        : improvementDelta < 0
                        ? "text-red-700"
                        : "text-gray-700"
                    )}
                  >
                    {improvementDelta > 0 ? "+" : ""}
                    {improvementDelta}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Iteration Timeline */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Improvement Journey</h2>

      <div className="space-y-4">
        {run.iterations.map((iteration, index) => (
          <IterationCard
            key={iteration.id}
            iteration={iteration}
            isLast={index === run.iterations.length - 1}
            isExpanded={expandedIterations.includes(iteration.id)}
            onToggle={() => toggleIteration(iteration.id)}
            previousPassRate={index > 0 ? run.iterations[index - 1].passRate : undefined}
          />
        ))}

        {run.status === "running" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative pl-8"
          >
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-violet-200 animate-pulse" />
            <div className="absolute left-0 top-6 w-6 h-6 rounded-full bg-violet-100 border-2 border-violet-400 flex items-center justify-center animate-pulse">
              <Loader2 className="w-3 h-3 text-violet-600 animate-spin" />
            </div>
            <Card className="border-violet-200 border-dashed">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 text-violet-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Processing iteration {run.iterations.length + 1}...</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ==========================================
// Iteration Card Component
// ==========================================

function IterationCard({
  iteration,
  isLast,
  isExpanded,
  onToggle,
  previousPassRate,
}: {
  iteration: ImprovementIteration;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  previousPassRate?: number;
}) {
  const delta = previousPassRate !== undefined ? iteration.passRate - previousPassRate : 0;
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-gray-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative pl-8"
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Timeline dot */}
      <div
        className={cn(
          "absolute left-0 top-6 w-6 h-6 rounded-full border-2 flex items-center justify-center",
          iteration.iterationNumber === 1
            ? "bg-gray-100 border-gray-300"
            : delta > 0
            ? "bg-emerald-100 border-emerald-400"
            : delta < 0
            ? "bg-red-100 border-red-400"
            : "bg-gray-100 border-gray-300"
        )}
      >
        <span className="text-xs font-bold text-gray-600">{iteration.iterationNumber}</span>
      </div>

      <Card className="overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Iteration {iteration.iterationNumber}</h3>
                <p className="text-sm text-gray-500">{formatRelativeTime(iteration.evaluatedAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Pass/Fail counts */}
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {iteration.passed}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="w-4 h-4" />
                  {iteration.failed}
                </span>
              </div>

              {/* Pass rate with delta */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">{iteration.passRate}%</span>
                {previousPassRate !== undefined && (
                  <span className={cn("flex items-center text-sm font-medium", deltaColor)}>
                    <DeltaIcon className="w-4 h-4" />
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </span>
                )}
              </div>

              {/* Expand toggle */}
              <div className="text-gray-400">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                {/* Feedback */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">LLM Feedback</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {iteration.feedback}
                  </p>
                </div>

                {/* Changes */}
                {iteration.changes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Changes Applied ({iteration.changes.length})
                    </h4>
                    <div className="space-y-3">
                      {iteration.changes.map((change, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="primary" size="sm">
                              {change.field}
                            </Badge>
                            <span className="text-xs text-gray-500">{change.reason}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div>
                              <span className="text-red-500 font-medium">- Before:</span>
                              <pre className="mt-1 p-2 bg-red-50 rounded text-gray-700 overflow-x-auto whitespace-pre-wrap">
                                {change.before.length > 200
                                  ? change.before.substring(0, 200) + "..."
                                  : change.before}
                              </pre>
                            </div>
                            <div>
                              <span className="text-emerald-500 font-medium">+ After:</span>
                              <pre className="mt-1 p-2 bg-emerald-50 rounded text-gray-700 overflow-x-auto whitespace-pre-wrap">
                                {change.after.length > 200
                                  ? change.after.substring(0, 200) + "..."
                                  : change.after}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {iteration.changes.length === 0 && iteration.iterationNumber === 1 && (
                  <p className="text-sm text-gray-500 italic">
                    Initial evaluation - no changes applied yet
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
