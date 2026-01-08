import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  FileX,
  FileWarning,
  Hammer,
  TestTube2,
  Bug,
  Gauge,
  Lightbulb,
  Code,
  ChevronDown,
  AlertCircle,
  Target,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@lib/utils";
import type { FailureAnalysis as FailureAnalysisType, FailureCategory, FailureSeverity } from "@lib/types";

interface FailureAnalysisProps {
  analyses: FailureAnalysisType[];
  className?: string;
}

const categoryConfig: Record<FailureCategory, { icon: typeof AlertTriangle; label: string; color: string }> = {
  missing_file: { icon: FileX, label: "Missing File", color: "text-red-500" },
  wrong_content: { icon: FileWarning, label: "Content Mismatch", color: "text-orange-500" },
  build_error: { icon: Hammer, label: "Build Error", color: "text-red-600" },
  test_failure: { icon: TestTube2, label: "Test Failure", color: "text-amber-500" },
  runtime_error: { icon: Bug, label: "Runtime Error", color: "text-purple-500" },
  performance: { icon: Gauge, label: "Performance", color: "text-blue-500" },
};

const severityConfig: Record<FailureSeverity, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  high: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  low: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
};

function AnalysisCard({ analysis, index }: { analysis: FailureAnalysisType; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First one expanded by default
  const category = categoryConfig[analysis.category];
  const severity = severityConfig[analysis.severity];
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-xl border overflow-hidden",
        severity.border,
        severity.bg
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-white shadow-sm", category.color)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-semibold uppercase tracking-wide", severity.text)}>
                {analysis.severity}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-600">{category.label}</span>
            </div>
            <p className="font-medium text-gray-900 mt-0.5">{analysis.summary}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Details */}
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Details</h4>
                    <p className="text-sm text-gray-600 mt-1">{analysis.details}</p>
                  </div>
                </div>
              </div>

              {/* Root Cause */}
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-start gap-2 mb-2">
                  <Target className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Root Cause Analysis</h4>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{analysis.rootCause}</p>
                  </div>
                </div>
              </div>

              {/* Suggested Fix */}
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-start gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-700">Suggested Fix</h4>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{analysis.suggestedFix}</p>
                  </div>
                </div>
              </div>

              {/* Code Snippet */}
              {analysis.codeSnippet && (
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-300">Code Reference</h4>
                  </div>
                  <pre className="text-sm text-gray-300 font-mono">{analysis.codeSnippet}</pre>
                </div>
              )}

              {/* Similar Issues */}
              {analysis.similarIssues && analysis.similarIssues.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-700">Historical Context</h4>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {analysis.similarIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FailureAnalysisPanel({ analyses, className }: FailureAnalysisProps) {
  if (!analyses || analyses.length === 0) return null;

  // Group by severity
  const grouped = analyses.reduce((acc, analysis) => {
    acc[analysis.severity] = acc[analysis.severity] || [];
    acc[analysis.severity].push(analysis);
    return acc;
  }, {} as Record<FailureSeverity, FailureAnalysisType[]>);

  const severityOrder: FailureSeverity[] = ["critical", "high", "medium", "low"];
  const sortedAnalyses = severityOrder.flatMap((sev) => grouped[sev] || []);

  // Summary stats
  const criticalCount = grouped.critical?.length || 0;
  const highCount = grouped.high?.length || 0;
  const mediumCount = grouped.medium?.length || 0;
  const lowCount = grouped.low?.length || 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Failure Analysis</h3>
            <p className="text-sm text-gray-500">
              AI-powered root cause analysis for {analyses.length} failure{analyses.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        
        {/* Severity Summary */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
              {criticalCount} Critical
            </span>
          )}
          {highCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
              {highCount} High
            </span>
          )}
          {mediumCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
              {mediumCount} Medium
            </span>
          )}
          {lowCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              {lowCount} Low
            </span>
          )}
        </div>
      </div>

      {/* Analysis Cards */}
      <div className="space-y-3">
        {sortedAnalyses.map((analysis, index) => (
          <AnalysisCard key={index} analysis={analysis} index={index} />
        ))}
      </div>
    </div>
  );
}

export default FailureAnalysisPanel;

