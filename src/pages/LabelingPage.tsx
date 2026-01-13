import { useState, useMemo } from "react";
import {
  Tags,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Eye,
  Star,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Select } from "@components/ui/Input";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { useStore, useEvalRuns, useSkills, useSettings } from "@lib/store";
import type { EvalRunResult, LabelConfig } from "@lib/types";
import { cn } from "@lib/utils";

export function LabelingPage() {
  const evalRuns = useEvalRuns();
  const skills = useSkills();
  const settings = useSettings();
  const { addLabel } = useStore();

  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedRunId, setSelectedRunId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [labelFilter, setLabelFilter] = useState<string>("all");

  // Get results for labeling
  const allResults = useMemo(() => {
    let results: (EvalRunResult & { runName: string; runId: string })[] = [];

    evalRuns
      .filter((run) => run.status === "completed")
      .filter((run) => !selectedSkillId || run.skillId === selectedSkillId)
      .filter((run) => !selectedRunId || run.id === selectedRunId)
      .forEach((run) => {
        run.results.forEach((result) => {
          results.push({
            ...result,
            runName: run.name,
            runId: run.id,
          });
        });
      });

    return results;
  }, [evalRuns, selectedSkillId, selectedRunId]);

  // Current result
  const currentResult = allResults[currentIndex];

  // Navigation
  const goNext = () => {
    if (currentIndex < allResults.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Apply label
  const applyLabel = (label: LabelConfig) => {
    if (!currentResult) return;
    addLabel(currentResult.id, {
      type: label.id,
      value: label.name,
      labeledBy: "user",
    });
    // Auto-advance to next
    if (currentIndex < allResults.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();

    const label = settings.labelConfigs.find((l) => l.shortcut === e.key);
    if (label) applyLabel(label);
  };

  const getLabelIcon = (iconName: string) => {
    switch (iconName) {
      case "check":
        return ThumbsUp;
      case "x":
        return ThumbsDown;
      case "minus":
        return Minus;
      case "eye":
        return Eye;
      case "star":
        return Star;
      default:
        return Tags;
    }
  };

  return (
    <div className="p-8" onKeyDown={handleKeyDown} tabIndex={0}>
      <PageHeader
        title="Human Labeling"
        description="Review and label evaluation results for quality assurance"
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Select
          value={selectedSkillId}
          onChange={(e) => {
            setSelectedSkillId(e.target.value);
            setCurrentIndex(0);
          }}
          options={[
            { value: "", label: "All Skills" },
            ...skills.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        <Select
          value={selectedRunId}
          onChange={(e) => {
            setSelectedRunId(e.target.value);
            setCurrentIndex(0);
          }}
          options={[
            { value: "", label: "All Runs" },
            ...evalRuns
              .filter((r) => r.status === "completed")
              .map((r) => ({ value: r.id, label: r.name })),
          ]}
        />
        <Select
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value)}
          options={[
            { value: "all", label: "All Results" },
            { value: "unlabeled", label: "Unlabeled Only" },
            { value: "labeled", label: "Labeled Only" },
          ]}
        />
        <div className="ml-auto text-sm text-gray-500">
          {allResults.length > 0 && (
            <span>
              {currentIndex + 1} of {allResults.length} results
            </span>
          )}
        </div>
      </div>

      {allResults.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No results to label"
          description="Run some evaluations to generate results for labeling"
        />
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8">
            {currentResult && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{currentResult.scenarioName}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Run: {currentResult.runName} •{" "}
                        {currentResult.modelConfig?.model || "N/A"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        currentResult.passRate >= 80
                          ? "success"
                          : currentResult.passRate >= 50
                          ? "warning"
                          : "error"
                      }
                    >
                      {currentResult.passRate.toFixed(0)}% Pass
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mock Output */}
                  {currentResult.mockOutput && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Skill Output
                      </h4>
                      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto max-h-64 scrollbar-thin">
                        {currentResult.mockOutput}
                      </pre>
                    </div>
                  )}

                  {/* Generated Files */}
                  {currentResult.mockFiles && currentResult.mockFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Generated Files
                      </h4>
                      <div className="space-y-2">
                        {currentResult.mockFiles.map((file, i) => (
                          <div
                            key={i}
                            className="p-3 bg-gray-50 rounded-lg border"
                          >
                            <p className="text-sm font-mono font-medium text-gray-700 mb-2">
                              {file.path}
                            </p>
                            {file.content && (
                              <pre className="text-xs text-gray-600 overflow-x-auto max-h-32">
                                {file.content}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assertion Results */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Assertions ({currentResult.assertionResults.length})
                    </h4>
                    <div className="space-y-2">
                      {currentResult.assertionResults.map((ar) => (
                        <div
                          key={ar.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            ar.status === "passed"
                              ? "bg-success-50 border-success-200"
                              : ar.status === "failed"
                              ? "bg-error-50 border-error-200"
                              : "bg-gray-50 border-gray-200"
                          )}
                        >
                          {ar.status === "passed" && (
                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                          )}
                          {ar.status === "failed" && (
                            <XCircle className="w-5 h-5 text-error-500" />
                          )}
                          {ar.status !== "passed" && ar.status !== "failed" && (
                            <AlertCircle className="w-5 h-5 text-warning-500" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {ar.assertionName}
                            </p>
                            <p className="text-xs text-gray-500">{ar.message}</p>
                          </div>
                          <Badge variant="gray" size="sm">
                            {ar.assertionType.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="secondary"
                onClick={goPrev}
                disabled={currentIndex === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={goNext}
                disabled={currentIndex >= allResults.length - 1}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Label Panel */}
          <div className="col-span-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">Apply Label</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Use keyboard shortcuts (1-6) or click to label
                </p>
                <div className="space-y-2">
                  {settings.labelConfigs.map((label) => {
                    const Icon = getLabelIcon(label.icon);
                    return (
                      <button
                        key={label.id}
                        onClick={() => applyLabel(label)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                          "hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            label.color === "success" && "bg-success-100 text-success-600",
                            label.color === "error" && "bg-error-100 text-error-600",
                            label.color === "warning" && "bg-warning-100 text-warning-600",
                            label.color === "primary" && "bg-primary-100 text-primary-600",
                            label.color === "gray" && "bg-gray-100 text-gray-600"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-left text-sm font-medium text-gray-700">
                          {label.name}
                        </span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded-sm text-xs text-gray-500 font-mono">
                          {label.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Session Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {currentIndex + 1}
                      </p>
                      <p className="text-xs text-gray-500">Reviewed</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {allResults.length - currentIndex - 1}
                      </p>
                      <p className="text-xs text-gray-500">Remaining</p>
                    </div>
                  </div>
                </div>

                {/* Keyboard Help */}
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs font-medium text-primary-700 mb-2">
                    Keyboard Shortcuts
                  </p>
                  <ul className="text-xs text-primary-600 space-y-1">
                    <li>← / → Navigate between results</li>
                    <li>1-6 Apply labels</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
