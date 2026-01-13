import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  FolderKanban,
  Trash2,
  Edit3,
  Copy,
  Play,
  TestTube2,
  ChevronDown,
  ChevronRight,
  Tag,
  X,
  Check,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent } from "@components/ui/Card";
import { Input, Textarea } from "@components/ui/Input";
import { Modal, ModalBody, ModalFooter } from "@components/ui/Modal";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { useTenant } from "@lib/context";
import { useStore, useTestSuites, useTestScenarios, useSkills } from "@lib/store";
import type { TestSuite, CreateTestSuiteInput, TestScenario } from "@lib/types";
import { cn, formatRelativeTime } from "@lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function TestSuitesPage() {
  const navigate = useNavigate();
  const { projectId } = useTenant();
  const testSuites = useTestSuites();
  const allScenarios = useTestScenarios();
  const skills = useSkills();
  const {
    addTestSuite,
    updateTestSuite,
    deleteTestSuite,
    duplicateTestSuite,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null);
  const [expandedSuite, setExpandedSuite] = useState<string | null>(null);

  // Form state - projectId is added at submit time, not stored in form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Filter suites
  const filteredSuites = useMemo(() => {
    return testSuites.filter((suite) => {
      const matchesSearch =
        suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suite.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (suite.tags || []).some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesSearch;
    });
  }, [testSuites, searchQuery]);

  // Get scenario details for a suite
  const getSuiteScenarios = (suite: TestSuite): TestScenario[] => {
    return allScenarios.filter((s) => suite.scenarioIds.includes(s.id));
  };

  // Get skill name for a scenario
  const getSkillName = (skillId?: string) =>
    skillId ? skills.find((s) => s.id === skillId)?.name : undefined;

  const openCreateModal = () => {
    setFormData({ name: "", description: "" });
    setSelectedScenarioIds([]);
    setTags([]);
    setTagInput("");
    setEditingSuite(null);
    setIsModalOpen(true);
  };

  const openEditModal = (suite: TestSuite) => {
    setFormData({
      name: suite.name,
      description: suite.description,
    });
    setSelectedScenarioIds([...suite.scenarioIds]);
    setTags(suite.tags ? [...suite.tags] : []);
    setTagInput("");
    setEditingSuite(suite);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    const suiteInput: CreateTestSuiteInput = {
      projectId,
      ...formData,
      scenarioIds: selectedScenarioIds,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (editingSuite) {
      updateTestSuite(editingSuite.id, suiteInput);
    } else {
      addTestSuite(suiteInput);
    }
    setIsModalOpen(false);
  };

  const toggleScenarioSelection = (scenarioId: string) => {
    setSelectedScenarioIds((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Group scenarios by type for display
  const groupedScenarios = useMemo(() => {
    const skillLinked = allScenarios.filter((s) => s.skillId);
    const standalone = allScenarios.filter((s) => !s.skillId);
    return { skillLinked, standalone };
  }, [allScenarios]);

  return (
    <div className="p-8">
      <PageHeader
        title="Test Suites"
        description="Group related test scenarios for organized evaluation"
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            New Suite
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search suites by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Badge variant="gray">
          {testSuites.length} suite{testSuites.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Suites List */}
      {filteredSuites.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No test suites yet"
          description="Test suites help you group related test scenarios for organized evaluation across multiple skills."
          actionLabel="Create Suite"
          onAction={openCreateModal}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredSuites.map((suite) => {
            const scenarios = getSuiteScenarios(suite);
            const isExpanded = expandedSuite === suite.id;

            return (
              <motion.div key={suite.id} variants={item}>
                <Card>
                  <CardContent className="p-0">
                    {/* Header */}
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedSuite(isExpanded ? null : suite.id)}
                    >
                      <button className="text-gray-400">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0">
                        <FolderKanban className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{suite.name}</h3>
                          <Badge variant="primary" size="sm">
                            {scenarios.length} scenario{scenarios.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {suite.description}
                        </p>
                        {suite.tags && suite.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {suite.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="gray" size="sm">
                                {tag}
                              </Badge>
                            ))}
                            {suite.tags.length > 4 && (
                              <span className="text-xs text-gray-400">
                                +{suite.tags.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatRelativeTime(suite.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to evaluation with suite pre-selected
                            const scenarioParam = suite.scenarioIds.join(",");
                            navigate(`/${projectId}/evaluation?scenarioIds=${scenarioParam}`);
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Run Suite
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(suite);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTestSuite(suite.id);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTestSuite(suite.id);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border-t border-gray-100 p-4 bg-gray-25"
                      >
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Scenarios in this suite
                        </h4>
                        {scenarios.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No scenarios in this suite yet.
                          </p>
                        ) : (
                          <div className="grid gap-2">
                            {scenarios.map((scenario) => (
                              <div
                                key={scenario.id}
                                className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                              >
                                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0">
                                  <TestTube2 className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {scenario.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {scenario.skillId && (
                                      <span className="text-xs text-gray-500">
                                        {getSkillName(scenario.skillId)}
                                      </span>
                                    )}
                                    {!scenario.skillId && (
                                      <Badge variant="gray" size="sm">
                                        Standalone
                                      </Badge>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      {scenario.assertions.length} assertions
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/${projectId}/scenarios?highlight=${scenario.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSuite ? "Edit Test Suite" : "Create Test Suite"}
        description="Group related test scenarios for organized evaluation"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Suite Name"
              placeholder="e.g., Wix CLI Dashboard Pages"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Textarea
              label="Description"
              placeholder="What does this suite test?"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Tags
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  leftIcon={<Tag className="w-4 h-4" />}
                  className="flex-1"
                />
                <Button variant="secondary" size="sm" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="primary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Scenario Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Scenarios ({selectedScenarioIds.length} selected)
              </label>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {/* Skill-linked scenarios */}
                {groupedScenarios.skillLinked.length > 0 && (
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium text-gray-500 uppercase px-2 py-1">
                      Skill-linked Scenarios
                    </p>
                    {groupedScenarios.skillLinked.map((scenario) => (
                      <label
                        key={scenario.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                          selectedScenarioIds.includes(scenario.id)
                            ? "bg-violet-50"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors",
                            selectedScenarioIds.includes(scenario.id)
                              ? "bg-violet-600 border-violet-600"
                              : "border-gray-300"
                          )}
                          onClick={() => toggleScenarioSelection(scenario.id)}
                        >
                          {selectedScenarioIds.includes(scenario.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {scenario.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getSkillName(scenario.skillId)}
                          </p>
                        </div>
                        {scenario.tags && scenario.tags.length > 0 && (
                          <div className="flex gap-1">
                            {scenario.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="gray" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* Standalone scenarios */}
                {groupedScenarios.standalone.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-500 uppercase px-2 py-1">
                      Standalone Scenarios
                    </p>
                    {groupedScenarios.standalone.map((scenario) => (
                      <label
                        key={scenario.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                          selectedScenarioIds.includes(scenario.id)
                            ? "bg-violet-50"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors",
                            selectedScenarioIds.includes(scenario.id)
                              ? "bg-violet-600 border-violet-600"
                              : "border-gray-300"
                          )}
                          onClick={() => toggleScenarioSelection(scenario.id)}
                        >
                          {selectedScenarioIds.includes(scenario.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {scenario.name}
                          </p>
                          <Badge variant="gray" size="sm">
                            Standalone
                          </Badge>
                        </div>
                        {scenario.tags && scenario.tags.length > 0 && (
                          <div className="flex gap-1">
                            {scenario.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="gray" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {allScenarios.length === 0 && (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No scenarios available. Create scenarios first.
                  </p>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name}>
            {editingSuite ? "Update" : "Create"} Suite
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

