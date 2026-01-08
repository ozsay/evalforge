import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileCode2,
  TestTube2,
  Play,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { useStats, useRecentEvalRuns, useSkills, useTestScenarios } from "@lib/store";
import { formatRelativeTime, cn } from "@lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const stats = useStats();
  const recentRuns = useRecentEvalRuns(5);
  const skills = useSkills();
  const scenarios = useTestScenarios();

  // Prepare mini trend data
  const trendData = recentRuns
    .filter((r) => r.status === "completed")
    .slice(0, 10)
    .map((r) => ({
      name: new Date(r.startedAt).toLocaleDateString(),
      passRate: r.aggregateMetrics.passRate,
    }))
    .reverse();

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your Agent Skills evaluation platform"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-4 gap-4">
          <StatCard
            icon={FileCode2}
            label="Agent Skills"
            value={stats.totalSkills}
            subLabel={`${stats.totalVersions} versions`}
            color="violet"
            to="/skills"
          />
          <StatCard
            icon={TestTube2}
            label="Test Scenarios"
            value={stats.totalScenarios}
            subLabel={`${stats.totalAssertions} assertions`}
            color="teal"
            to="/scenarios"
          />
          <StatCard
            icon={Play}
            label="Eval Runs"
            value={stats.totalEvalRuns}
            subLabel={`${stats.completedRuns} completed`}
            color="orange"
            to="/evaluation"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Pass Rate"
            value={`${stats.avgPassRate.toFixed(1)}%`}
            subLabel="Across all runs"
            color="emerald"
            highlight
            to="/results"
          />
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Quick Actions */}
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Link to="/skills">
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-200 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center mb-3">
                          <FileCode2 className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Create Skill
                        </h4>
                        <p className="text-sm text-gray-600">
                          Define a new SKILL.md for Claude
                        </p>
                        <ArrowRight className="w-4 h-4 text-violet-500 mt-2 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </Link>

                    <Link to="/scenarios">
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 border border-teal-200 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center mb-3">
                          <TestTube2 className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Add Test Scenario
                        </h4>
                        <p className="text-sm text-gray-600">
                          Create assertions for your skills
                        </p>
                        <ArrowRight className="w-4 h-4 text-teal-500 mt-2 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </Link>

                    <Link to="/evaluation">
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center mb-3">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Run Evaluation
                        </h4>
                        <p className="text-sm text-gray-600">
                          Test skills across models
                        </p>
                        <ArrowRight className="w-4 h-4 text-orange-500 mt-2 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Runs */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Evaluations</CardTitle>
                  <Link to="/results">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentRuns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No evaluations yet</p>
                      <Link to="/evaluation">
                        <Button variant="secondary" size="sm" className="mt-3">
                          Run Your First Evaluation
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentRuns.map((run) => (
                        <div
                          key={run.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                run.status === "completed"
                                  ? "bg-success-500"
                                  : run.status === "running"
                                  ? "bg-primary-500 animate-pulse"
                                  : run.status === "failed"
                                  ? "bg-error-500"
                                  : "bg-gray-400"
                              )}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {run.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {run.skillName} •{" "}
                                {formatRelativeTime(run.startedAt)}
                              </p>
                            </div>
                          </div>

                          {run.status === "completed" && (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-success-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {run.aggregateMetrics.passed}
                                </span>
                                <span className="text-error-600 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" />
                                  {run.aggregateMetrics.failed}
                                </span>
                              </div>
                              <Badge
                                variant={
                                  run.aggregateMetrics.passRate >= 80
                                    ? "success"
                                    : run.aggregateMetrics.passRate >= 50
                                    ? "warning"
                                    : "error"
                                }
                                size="sm"
                              >
                                {run.aggregateMetrics.passRate.toFixed(0)}%
                              </Badge>
                            </div>
                          )}

                          {run.status === "running" && (
                            <Badge variant="primary" size="sm">
                              Running...
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Pass Rate Trend */}
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pass Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData.length < 2 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      <p>Need more runs to show trends</p>
                    </div>
                  ) : (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <XAxis dataKey="name" hide />
                          <YAxis domain={[0, 100]} hide />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                            formatter={(v: number) => [`${v.toFixed(1)}%`, "Pass Rate"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="passRate"
                            stroke="#6366F1"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Skills */}
            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Recent Skills</CardTitle>
                  <Link to="/skills">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {skills.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No skills created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {skills.slice(0, 5).map((skill) => (
                        <Link
                          key={skill.id}
                          to={`/scenarios?skillId=${skill.id}`}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                            <FileCode2 className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {skill.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              v{skill.versions.length} •{" "}
                              {scenarios.filter((s) => s.skillId === skill.id).length}{" "}
                              scenarios
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Getting Started */}
            {stats.totalSkills === 0 && (
              <motion.div variants={item}>
                <Card className="bg-gradient-to-br from-primary-50 to-violet-100 border-primary-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Getting Started
                    </h4>
                    <ol className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                          1
                        </span>
                        <span>Create your first SKILL.md with instructions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary-400 text-white text-xs flex items-center justify-center flex-shrink-0">
                          2
                        </span>
                        <span>Add test scenarios with assertions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary-300 text-white text-xs flex items-center justify-center flex-shrink-0">
                          3
                        </span>
                        <span>Run evaluations across different models</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subLabel,
  color,
  highlight,
  to,
}: {
  icon: typeof FileCode2;
  label: string;
  value: string | number;
  subLabel: string;
  color: string;
  highlight?: boolean;
  to: string;
}) {
  const colorClasses: Record<string, string> = {
    violet: "from-violet-400 to-purple-500",
    teal: "from-teal-400 to-cyan-500",
    orange: "from-orange-400 to-amber-500",
    emerald: "from-emerald-400 to-green-500",
  };

  return (
    <Link to={to}>
      <motion.div whileHover={{ y: -2 }} className="cursor-pointer">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  colorClasses[color]
                )}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p
              className={cn(
                "text-2xl font-bold",
                highlight ? "text-primary-600" : "text-gray-900"
              )}
            >
              {value}
            </p>
            <p className="text-sm text-gray-600 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
