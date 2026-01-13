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
  Terminal,
  FileCode,
  Clock,
  GitCompare,
  Layers,
  Plus,
  Minus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@lib/utils";
import type { 
  FailureAnalysis as FailureAnalysisType, 
  FailureCategory, 
  FailureSeverity,
  DiffContent,
  ExecutionTrace,
} from "@lib/types";
import { Badge } from "./ui/Badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/Tabs";

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

// ==========================================
// Diff View Component
// ==========================================

function DiffView({ diff }: { diff: DiffContent }) {
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  
  // Generate simple diff lines if not provided
  const diffLines = diff.diffLines || generateSimpleDiff(diff.expected, diff.actual);
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">
            {diff.path}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("split")}
            className={cn(
              "px-2 py-1 text-xs rounded-sm",
              viewMode === "split" 
                ? "bg-gray-600 text-white" 
                : "text-gray-400 hover:text-white"
            )}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode("unified")}
            className={cn(
              "px-2 py-1 text-xs rounded-sm",
              viewMode === "unified" 
                ? "bg-gray-600 text-white" 
                : "text-gray-400 hover:text-white"
            )}
          >
            Unified
          </button>
        </div>
      </div>
      
      {viewMode === "split" ? (
        <div className="grid grid-cols-2 divide-x divide-gray-700">
          {/* Expected */}
          <div className="overflow-auto max-h-64">
            <div className="px-2 py-1 bg-red-900/30 text-xs text-red-300 font-medium sticky top-0">
              Expected
            </div>
            <pre className="p-3 text-xs font-mono text-gray-300 whitespace-pre-wrap">
              {diff.expected || "(empty)"}
            </pre>
          </div>
          {/* Actual */}
          <div className="overflow-auto max-h-64">
            <div className="px-2 py-1 bg-green-900/30 text-xs text-green-300 font-medium sticky top-0">
              Actual
            </div>
            <pre className="p-3 text-xs font-mono text-gray-300 whitespace-pre-wrap">
              {diff.actual || "(empty)"}
            </pre>
          </div>
        </div>
      ) : (
        <div className="overflow-auto max-h-64">
          {diffLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "px-4 py-0.5 font-mono text-xs flex items-center gap-2",
                line.type === "added" && "bg-green-900/30 text-green-300",
                line.type === "removed" && "bg-red-900/30 text-red-300",
                line.type === "unchanged" && "text-gray-400"
              )}
            >
              <span className="w-4 shrink-0 text-gray-500">
                {line.type === "added" ? <Plus className="w-3 h-3" /> : 
                 line.type === "removed" ? <Minus className="w-3 h-3" /> : ""}
              </span>
              <span className="whitespace-pre">{line.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function generateSimpleDiff(expected: string, actual: string) {
  const expectedLines = expected.split("\n");
  const actualLines = actual.split("\n");
  const result: { type: "added" | "removed" | "unchanged"; content: string }[] = [];
  
  // Simple line-by-line diff (not a real diff algorithm)
  const maxLines = Math.max(expectedLines.length, actualLines.length);
  for (let i = 0; i < maxLines; i++) {
    const exp = expectedLines[i];
    const act = actualLines[i];
    
    if (exp === act) {
      if (exp !== undefined) {
        result.push({ type: "unchanged", content: exp });
      }
    } else {
      if (exp !== undefined) {
        result.push({ type: "removed", content: exp });
      }
      if (act !== undefined) {
        result.push({ type: "added", content: act });
      }
    }
  }
  
  return result;
}

// ==========================================
// Execution Trace Component
// ==========================================

function ExecutionTraceView({ trace }: { trace: ExecutionTrace }) {
  const [expandedCommand, setExpandedCommand] = useState<number | null>(null);
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Terminal className="w-4 h-4" />
          <span>{trace.commands.length} command(s)</span>
        </div>
        <div className="flex items-center gap-1">
          <FileCode className="w-4 h-4" />
          <span>{trace.filesModified.length} file(s) modified</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{(trace.totalDuration / 1000).toFixed(1)}s total</span>
        </div>
      </div>
      
      {/* Commands */}
      {trace.commands.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Commands Executed
          </h5>
          <div className="space-y-1">
            {trace.commands.map((cmd, i) => (
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedCommand(expandedCommand === i ? null : i)}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <code className="text-xs font-mono text-gray-700 truncate">
                      {cmd.command}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge 
                      variant={cmd.exitCode === 0 ? "success" : "error"} 
                      size="sm"
                    >
                      exit {cmd.exitCode}
                    </Badge>
                    {cmd.duration && (
                      <span className="text-xs text-gray-500">
                        {cmd.duration}ms
                      </span>
                    )}
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        expandedCommand === i && "rotate-180"
                      )} 
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {expandedCommand === i && cmd.output && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <pre className="p-3 bg-gray-900 text-gray-300 text-xs font-mono overflow-x-auto max-h-48">
                        {cmd.output}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Files Modified */}
      {trace.filesModified.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            Files Modified
          </h5>
          <div className="grid gap-1">
            {trace.filesModified.map((file, i) => (
              <div 
                key={i}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm",
                  file.action === "created" && "bg-green-50 text-green-700",
                  file.action === "modified" && "bg-blue-50 text-blue-700",
                  file.action === "deleted" && "bg-red-50 text-red-700"
                )}
              >
                <span className={cn(
                  "text-xs font-medium uppercase w-16",
                  file.action === "created" && "text-green-600",
                  file.action === "modified" && "text-blue-600",
                  file.action === "deleted" && "text-red-600"
                )}>
                  {file.action}
                </span>
                <code className="font-mono text-gray-700">{file.path}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Failure Pattern Group Component
// ==========================================

interface FailurePattern {
  patternId: string;
  count: number;
  category: FailureCategory;
  severity: FailureSeverity;
  summary: string;
  analyses: FailureAnalysisType[];
}

function FailurePatternsView({ analyses }: { analyses: FailureAnalysisType[] }) {
  // Group by pattern ID (if available) or by category + summary
  const patterns = useMemo(() => {
    const patternMap = new Map<string, FailurePattern>();
    
    analyses.forEach(analysis => {
      const key = analysis.patternId || `${analysis.category}-${analysis.summary}`;
      
      if (patternMap.has(key)) {
        const existing = patternMap.get(key)!;
        existing.count++;
        existing.analyses.push(analysis);
      } else {
        patternMap.set(key, {
          patternId: key,
          count: 1,
          category: analysis.category,
          severity: analysis.severity,
          summary: analysis.summary,
          analyses: [analysis],
        });
      }
    });
    
    return Array.from(patternMap.values())
      .sort((a, b) => b.count - a.count);
  }, [analyses]);
  
  if (patterns.length === analyses.length) {
    // No patterns detected (all unique)
    return (
      <div className="text-center py-8 text-gray-500">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No repeated failure patterns detected</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {patterns.filter(p => p.count > 1).map((pattern) => {
        const category = categoryConfig[pattern.category];
        const severity = severityConfig[pattern.severity];
        const Icon = category.icon;
        
        return (
          <div 
            key={pattern.patternId}
            className={cn(
              "p-4 rounded-lg border",
              severity.border,
              severity.bg
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg bg-white shadow-sm", category.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", severity.text)}>
                    {pattern.severity.toUpperCase()}
                  </span>
                  <Badge variant="gray" size="sm">
                    {pattern.count}× occurrences
                  </Badge>
                </div>
                <p className="font-medium text-gray-900">{pattern.summary}</p>
                <p className="text-sm text-gray-600 mt-1">
                  This failure pattern occurred {pattern.count} times across different runs.
                  Consider addressing this systematically.
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// Analysis Card Component
// ==========================================

function AnalysisCard({ analysis, index }: { analysis: FailureAnalysisType; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [activeTab, setActiveTab] = useState("details");
  const category = categoryConfig[analysis.category];
  const severity = severityConfig[analysis.severity];
  const Icon = category.icon;

  const hasDiff = !!analysis.diff;
  const hasTrace = !!analysis.executionTrace;

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
              {hasDiff && (
                <Badge variant="gray" size="sm">Diff</Badge>
              )}
              {hasTrace && (
                <Badge variant="gray" size="sm">Trace</Badge>
              )}
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
            <div className="px-4 pb-4">
              {/* Tabs for different views */}
              {(hasDiff || hasTrace) && (
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mb-4">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {hasDiff && <TabsTrigger value="diff">Diff View</TabsTrigger>}
                    {hasTrace && <TabsTrigger value="trace">Execution Trace</TabsTrigger>}
                  </TabsList>
                </Tabs>
              )}
              
              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-4">
                  {/* Details */}
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Details</h4>
                        <p className="text-sm text-gray-600 mt-1">{analysis.details}</p>
                      </div>
                    </div>
                  </div>

                  {/* Root Cause */}
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start gap-2 mb-2">
                      <Target className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Root Cause Analysis</h4>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{analysis.rootCause}</p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Fix */}
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-start gap-2 mb-2">
                      <Wrench className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
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
                        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
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
              )}
              
              {/* Diff Tab */}
              {activeTab === "diff" && analysis.diff && (
                <DiffView diff={analysis.diff} />
              )}
              
              {/* Execution Trace Tab */}
              {activeTab === "trace" && analysis.executionTrace && (
                <ExecutionTraceView trace={analysis.executionTrace} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==========================================
// Main Panel Component
// ==========================================

export function FailureAnalysisPanel({ analyses, className }: FailureAnalysisProps) {
  const [viewMode, setViewMode] = useState<"list" | "patterns">("list");
  
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
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                viewMode === "list" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("patterns")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                viewMode === "patterns" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Patterns
            </button>
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
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {sortedAnalyses.map((analysis, index) => (
            <AnalysisCard key={index} analysis={analysis} index={index} />
          ))}
        </div>
      ) : (
        <FailurePatternsView analyses={analyses} />
      )}
    </div>
  );
}

export default FailureAnalysisPanel;
