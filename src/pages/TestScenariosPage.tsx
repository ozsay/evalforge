import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  TestTube2,
  Trash2,
  Edit3,
  Copy,
  Play,
  FileCheck,
  FileText,
  Hammer,
  FlaskConical,
  Globe,
  ChevronDown,
  ChevronRight,
  GripVertical,
  FolderKanban,
  Layers,
  Tag,
  X,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent } from "@components/ui/Card";
import { Input, Textarea, Select } from "@components/ui/Input";
import { Modal, ModalBody, ModalFooter } from "@components/ui/Modal";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/Tabs";
import { useTenant } from "@lib/context";
import { useStore, useTestScenarios, useTestSuites, useTargetGroups } from "@lib/store";
import type {
  TestScenario,
  CreateTestScenarioInput,
  Assertion,
  AssertionType,
  FilePresenceAssertion,
  FileContentAssertion,
  BuildCheckAssertion,
  VitestAssertion,
  PlaywrightNLAssertion,
  ExpectedFile,
} from "@lib/types";
import { generateId, cn } from "@lib/utils";

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

// Assertion type config
const ASSERTION_TYPES: {
  type: AssertionType;
  label: string;
  icon: typeof FileCheck;
  color: string;
  description: string;
}[] = [
  {
    type: "file_presence",
    label: "File Presence",
    icon: FileCheck,
    color: "bg-blue-500",
    description: "Check if specific files exist",
  },
  {
    type: "file_content",
    label: "File Content",
    icon: FileText,
    color: "bg-emerald-500",
    description: "Assert file contents match patterns",
  },
  {
    type: "build_check",
    label: "Build Check",
    icon: Hammer,
    color: "bg-amber-500",
    description: "Run build and check for errors",
  },
  {
    type: "vitest",
    label: "Vitest Tests",
    icon: FlaskConical,
    color: "bg-purple-500",
    description: "Run custom Vitest test files",
  },
  {
    type: "playwright_nl",
    label: "Playwright (NL)",
    icon: Globe,
    color: "bg-pink-500",
    description: "Natural language E2E tests",
  },
];

type FilterMode = "all" | "suite" | "targetGroup" | "standalone";

export function TestScenariosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const suiteIdFilter = searchParams.get("suiteId");
  const targetGroupIdFilter = searchParams.get("targetGroupId");

  const { projectId } = useTenant();
  const allScenarios = useTestScenarios();
  const testSuites = useTestSuites();
  const targetGroups = useTargetGroups();
  const {
    addTestScenario,
    updateTestScenario,
    deleteTestScenario,
    duplicateTestScenario,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>(
    suiteIdFilter ? "suite" : targetGroupIdFilter ? "targetGroup" : "all"
  );
  const [selectedSuiteId, setSelectedSuiteId] = useState(suiteIdFilter || "");
  const [selectedTargetGroupId, setSelectedTargetGroupId] = useState(targetGroupIdFilter || "");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<TestScenario | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  // Form state - targetGroupId can be undefined for standalone scenarios
  type FormDataType = {
    targetGroupId?: string;
    name: string;
    description: string;
    triggerPrompt: string;
  };
  const [formData, setFormData] = useState<FormDataType>({
    targetGroupId: undefined,
    name: "",
    description: "",
    triggerPrompt: "",
  });
  const [expectedFiles, setExpectedFiles] = useState<ExpectedFile[]>([]);
  const [assertions, setAssertions] = useState<Assertion[]>([]);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [formSuiteIds, setFormSuiteIds] = useState<string[]>([]);

  // Get all unique tags across scenarios
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allScenarios.forEach((s) => {
      s.tags?.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [allScenarios]);

  // Filter scenarios
  const filteredScenarios = useMemo(() => {
    return allScenarios.filter((scenario) => {
      // Text search
      const matchesSearch =
        scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (scenario.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter mode
      let matchesFilter = true;
      if (filterMode === "suite" && selectedSuiteId) {
        matchesFilter = (scenario.suiteIds || []).includes(selectedSuiteId);
      } else if (filterMode === "targetGroup" && selectedTargetGroupId) {
        matchesFilter = scenario.targetGroupId === selectedTargetGroupId;
      } else if (filterMode === "standalone") {
        matchesFilter = !scenario.targetGroupId && (!scenario.suiteIds || scenario.suiteIds.length === 0);
      }

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => (scenario.tags || []).includes(tag));

      return matchesSearch && matchesFilter && matchesTags;
    });
  }, [allScenarios, searchQuery, filterMode, selectedSuiteId, selectedTargetGroupId, selectedTags]);

  const getTargetGroupName = (targetGroupId?: string) =>
    targetGroupId ? targetGroups.find((g) => g.id === targetGroupId)?.name || "Unknown Group" : undefined;

  const openCreateModal = () => {
    setFormData({
      targetGroupId: filterMode === "targetGroup" && selectedTargetGroupId ? selectedTargetGroupId : undefined,
      name: "",
      description: "",
      triggerPrompt: "",
    });
    setExpectedFiles([]);
    setAssertions([]);
    setFormTags([]);
    setTagInput("");
    setFormSuiteIds(filterMode === "suite" && selectedSuiteId ? [selectedSuiteId] : []);
    setEditingScenario(null);
    setIsModalOpen(true);
  };

  const openEditModal = (scenario: TestScenario) => {
    setFormData({
      targetGroupId: scenario.targetGroupId,
      name: scenario.name,
      description: scenario.description,
      triggerPrompt: scenario.triggerPrompt,
    });
    setExpectedFiles([...scenario.expectedFiles]);
    setAssertions([...scenario.assertions]);
    setFormTags(scenario.tags ? [...scenario.tags] : []);
    setTagInput("");
    setFormSuiteIds(scenario.suiteIds ? [...scenario.suiteIds] : []);
    setEditingScenario(scenario);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.triggerPrompt) return;

    const scenarioInput: CreateTestScenarioInput = {
      projectId,
      ...formData,
      targetGroupId: formData.targetGroupId || undefined, // Don't send empty string
      expectedFiles,
      assertions,
      tags: formTags.length > 0 ? formTags : undefined,
      suiteIds: formSuiteIds.length > 0 ? formSuiteIds : undefined,
    };

    if (editingScenario) {
      updateTestScenario(editingScenario.id, scenarioInput);
    } else {
      addTestScenario(scenarioInput);
    }
    setIsModalOpen(false);
  };

  const addFormTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !formTags.includes(trimmed)) {
      setFormTags([...formTags, trimmed]);
      setTagInput("");
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Expected file management
  const addExpectedFile = () => {
    setExpectedFiles([...expectedFiles, { path: "", content: "" }]);
  };

  const updateExpectedFile = (index: number, updates: Partial<ExpectedFile>) => {
    const newFiles = [...expectedFiles];
    newFiles[index] = { ...newFiles[index], ...updates };
    setExpectedFiles(newFiles);
  };

  const removeExpectedFile = (index: number) => {
    setExpectedFiles(expectedFiles.filter((_, i) => i !== index));
  };

  // Assertion management
  const addNewAssertion = (type: AssertionType) => {
    const baseAssertion = {
      id: generateId(),
      name: `New ${ASSERTION_TYPES.find((t) => t.type === type)?.label}`,
    };

    let newAssertion: Assertion;

    switch (type) {
      case "file_presence":
        newAssertion = {
          ...baseAssertion,
          type: "file_presence",
          paths: [],
          shouldExist: true,
        } as FilePresenceAssertion;
        break;
      case "file_content":
        newAssertion = {
          ...baseAssertion,
          type: "file_content",
          path: "",
          checks: {},
        } as FileContentAssertion;
        break;
      case "build_check":
        newAssertion = {
          ...baseAssertion,
          type: "build_check",
          command: "npm run build",
          expectSuccess: true,
        } as BuildCheckAssertion;
        break;
      case "vitest":
        newAssertion = {
          ...baseAssertion,
          type: "vitest",
          testFile: "",
          testFileName: "test.spec.ts",
          minPassRate: 100,
        } as VitestAssertion;
        break;
      case "playwright_nl":
        newAssertion = {
          ...baseAssertion,
          type: "playwright_nl",
          description: "",
          steps: [],
          expectedOutcome: "",
        } as PlaywrightNLAssertion;
        break;
    }

    setAssertions([...assertions, newAssertion]);
  };

  const updateAssertionLocal = (index: number, updates: Partial<Assertion>) => {
    const newAssertions = [...assertions];
    newAssertions[index] = { ...newAssertions[index], ...updates } as Assertion;
    setAssertions(newAssertions);
  };

  const removeAssertionLocal = (index: number) => {
    setAssertions(assertions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Test Scenarios"
        description="Define test cases and assertions for your Target Groups"
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            New Scenario
          </Button>
        }
      />

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search scenarios by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value as FilterMode);
              setSelectedSuiteId("");
              setSelectedTargetGroupId("");
            }}
            options={[
              { value: "all", label: "All Scenarios" },
              { value: "targetGroup", label: "By Target Group" },
              { value: "suite", label: "By Suite" },
              { value: "standalone", label: "Standalone Only" },
            ]}
          />
          {filterMode === "targetGroup" && (
            <Select
              value={selectedTargetGroupId}
              onChange={(e) => setSelectedTargetGroupId(e.target.value)}
              options={[
                { value: "", label: "Select Target Group..." },
                ...targetGroups.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />
          )}
          {filterMode === "suite" && (
            <Select
              value={selectedSuiteId}
              onChange={(e) => setSelectedSuiteId(e.target.value)}
              options={[
                { value: "", label: "Select Suite..." },
                ...testSuites.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
          )}
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Tags:</span>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "primary" : "gray"}
                className="cursor-pointer"
                onClick={() => toggleTagFilter(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <X className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scenarios List */}
      {filteredScenarios.length === 0 ? (
        <EmptyState
          icon={TestTube2}
          title="No test scenarios yet"
          description="Test scenarios define how to evaluate your Target Groups with specific assertions."
          actionLabel="Create Scenario"
          onAction={openCreateModal}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredScenarios.map((scenario) => (
            <motion.div key={scenario.id} variants={item}>
              <Card>
                <CardContent className="p-0">
                  {/* Header */}
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setExpandedScenario(
                        expandedScenario === scenario.id ? null : scenario.id
                      )
                    }
                  >
                    <button className="text-gray-400">
                      {expandedScenario === scenario.id ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <TestTube2 className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                        {scenario.targetGroupId ? (
                          <Badge variant="primary" size="sm">
                            <Layers className="w-3 h-3 mr-1" />
                            {getTargetGroupName(scenario.targetGroupId)}
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Standalone
                          </Badge>
                        )}
                        {scenario.suiteIds && scenario.suiteIds.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FolderKanban className="w-3 h-3 text-violet-500" />
                            <span className="text-xs text-violet-600">
                              {scenario.suiteIds.length} suite{scenario.suiteIds.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {scenario.description || scenario.triggerPrompt}
                      </p>
                      {scenario.tags && scenario.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {scenario.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="gray" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {scenario.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{scenario.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {scenario.assertions.slice(0, 4).map((assertion) => {
                          const config = ASSERTION_TYPES.find((t) => t.type === assertion.type);
                          return (
                            <div
                              key={assertion.id}
                              className={cn(
                                "w-6 h-6 rounded flex items-center justify-center",
                                config?.color || "bg-gray-400"
                              )}
                              title={config?.label}
                            >
                              {config && <config.icon className="w-3.5 h-3.5 text-white" />}
                            </div>
                          );
                        })}
                        {scenario.assertions.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{scenario.assertions.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${projectId}/evaluation?scenarioId=${scenario.id}`);
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Run
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(scenario);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTestScenario(scenario.id);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTestScenario(scenario.id);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedScenario === scenario.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-gray-100 p-4 bg-gray-25"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        {/* Trigger Prompt */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Trigger Prompt
                          </h4>
                          <div className="bg-white p-3 rounded-lg border text-sm text-gray-700">
                            {scenario.triggerPrompt}
                          </div>
                        </div>

                        {/* Expected Files */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Expected Files ({scenario.expectedFiles.length})
                          </h4>
                          <div className="bg-white p-3 rounded-lg border">
                            {scenario.expectedFiles.length === 0 ? (
                              <p className="text-sm text-gray-500">No expected files</p>
                            ) : (
                              <ul className="space-y-1">
                                {scenario.expectedFiles.map((file, i) => (
                                  <li
                                    key={i}
                                    className="text-sm font-mono text-gray-700"
                                  >
                                    {file.path}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Assertions */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Assertions ({scenario.assertions.length})
                        </h4>
                        <div className="space-y-2">
                          {scenario.assertions.map((assertion) => {
                            const config = ASSERTION_TYPES.find(
                              (t) => t.type === assertion.type
                            );
                            return (
                              <div
                                key={assertion.id}
                                className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                              >
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    config?.color || "bg-gray-400"
                                  )}
                                >
                                  {config && (
                                    <config.icon className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {assertion.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {config?.label}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingScenario ? "Edit Scenario" : "Create Test Scenario"}
        description="Define test inputs, expected outputs, and assertions"
        size="xl"
      >
        <ModalBody>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="files">Expected Files</TabsTrigger>
              <TabsTrigger value="assertions">
                Assertions ({assertions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Select
                label="Target Group"
                value={formData.targetGroupId || ""}
                onChange={(e) => setFormData({ ...formData, targetGroupId: e.target.value || undefined })}
                options={[
                  { value: "", label: "No target group (standalone)" },
                  ...targetGroups.map((g) => ({ value: g.id, label: g.name })),
                ]}
              />
              <Input
                label="Scenario Name"
                placeholder="e.g., Create React Component"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Textarea
                label="Description"
                placeholder="What does this scenario test?"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Textarea
                label="Trigger Prompt"
                placeholder="The prompt that will be sent to the target agents..."
                rows={4}
                value={formData.triggerPrompt}
                onChange={(e) => setFormData({ ...formData, triggerPrompt: e.target.value })}
                hint="This is the user message that will be sent to target agents"
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
                        addFormTag();
                      }
                    }}
                    leftIcon={<Tag className="w-4 h-4" />}
                    className="flex-1"
                  />
                  <Button variant="secondary" size="sm" onClick={addFormTag}>
                    Add
                  </Button>
                </div>
                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="primary"
                        className="cursor-pointer"
                        onClick={() => setFormTags(formTags.filter((t) => t !== tag))}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Suite Selection */}
              {testSuites.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Test Suites
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {testSuites.map((suite) => (
                      <Badge
                        key={suite.id}
                        variant={formSuiteIds.includes(suite.id) ? "primary" : "gray"}
                        className="cursor-pointer"
                        onClick={() =>
                          setFormSuiteIds((prev) =>
                            prev.includes(suite.id)
                              ? prev.filter((id) => id !== suite.id)
                              : [...prev, suite.id]
                          )
                        }
                      >
                        <FolderKanban className="w-3 h-3 mr-1" />
                        {suite.name}
                        {formSuiteIds.includes(suite.id) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to add/remove from suites
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Define files expected to be created by the target agents
                </p>
                <Button variant="secondary" size="sm" onClick={addExpectedFile}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add File
                </Button>
              </div>

              {expectedFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No expected files defined</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="e.g., src/components/Button.tsx"
                          value={file.path}
                          onChange={(e) =>
                            updateExpectedFile(index, { path: e.target.value })
                          }
                          className="flex-1"
                        />
                        <button
                          onClick={() => removeExpectedFile(index)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Textarea
                        placeholder="Expected content (optional)"
                        rows={3}
                        value={file.content || ""}
                        onChange={(e) =>
                          updateExpectedFile(index, { content: e.target.value })
                        }
                        className="font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="assertions" className="space-y-4">
              {/* Assertion Type Selector */}
              <div className="flex flex-wrap gap-2">
                {ASSERTION_TYPES.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => addNewAssertion(type.type)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center",
                        type.color
                      )}
                    >
                      <type.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Assertions List */}
              {assertions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No assertions yet. Click a button above to add one.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assertions.map((assertion, index) => (
                    <AssertionEditor
                      key={assertion.id}
                      assertion={assertion}
                      onChange={(updates) => updateAssertionLocal(index, updates)}
                      onRemove={() => removeAssertionLocal(index)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.triggerPrompt}
          >
            {editingScenario ? "Update" : "Create"} Scenario
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Assertion Editor Component
interface AssertionEditorProps {
  assertion: Assertion;
  onChange: (updates: Partial<Assertion>) => void;
  onRemove: () => void;
}

function AssertionEditor({ assertion, onChange, onRemove }: AssertionEditorProps) {
  const config = ASSERTION_TYPES.find((t) => t.type === assertion.type);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            config?.color || "bg-gray-400"
          )}
        >
          {config && <config.icon className="w-4 h-4 text-white" />}
        </div>
        <Input
          value={assertion.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="flex-1 font-medium"
          placeholder="Assertion name"
        />
        <Badge variant="gray" size="sm">
          {config?.label}
        </Badge>
        <button
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Type-specific fields */}
      {assertion.type === "file_presence" && (
        <FilePresenceFields
          assertion={assertion}
          onChange={onChange}
        />
      )}
      {assertion.type === "file_content" && (
        <FileContentFields
          assertion={assertion}
          onChange={onChange}
        />
      )}
      {assertion.type === "build_check" && (
        <BuildCheckFields
          assertion={assertion}
          onChange={onChange}
        />
      )}
      {assertion.type === "vitest" && (
        <VitestFields
          assertion={assertion}
          onChange={onChange}
        />
      )}
      {assertion.type === "playwright_nl" && (
        <PlaywrightNLFields
          assertion={assertion}
          onChange={onChange}
        />
      )}
    </div>
  );
}

// Field components for each assertion type
function FilePresenceFields({
  assertion,
  onChange,
}: {
  assertion: FilePresenceAssertion;
  onChange: (updates: Partial<FilePresenceAssertion>) => void;
}) {
  const [pathInput, setPathInput] = useState("");

  const addPath = () => {
    if (pathInput && !assertion.paths.includes(pathInput)) {
      onChange({ paths: [...assertion.paths, pathInput] });
      setPathInput("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="e.g., src/index.ts"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && (e.preventDefault(), addPath())}
          className="flex-1"
        />
        <Button variant="secondary" size="sm" onClick={addPath}>
          Add Path
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {assertion.paths.map((path, i) => (
          <Badge
            key={i}
            variant="gray"
            className="cursor-pointer"
            onClick={() =>
              onChange({ paths: assertion.paths.filter((_, idx) => idx !== i) })
            }
          >
            {path} ×
          </Badge>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={assertion.shouldExist}
          onChange={(e) => onChange({ shouldExist: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm">Files should exist</span>
      </label>
    </div>
  );
}

function FileContentFields({
  assertion,
  onChange,
}: {
  assertion: FileContentAssertion;
  onChange: (updates: Partial<FileContentAssertion>) => void;
}) {
  const [containsInput, setContainsInput] = useState("");

  const addContains = () => {
    if (containsInput) {
      const current = assertion.checks.contains || [];
      onChange({
        checks: { ...assertion.checks, contains: [...current, containsInput] },
      });
      setContainsInput("");
    }
  };

  return (
    <div className="space-y-3">
      <Input
        label="File Path"
        placeholder="e.g., src/components/Button.tsx"
        value={assertion.path}
        onChange={(e) => onChange({ path: e.target.value })}
      />
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Must Contain
        </label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Text to find..."
            value={containsInput}
            onChange={(e) => setContainsInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addContains())}
            className="flex-1"
          />
          <Button variant="secondary" size="sm" onClick={addContains}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(assertion.checks.contains || []).map((text, i) => (
            <Badge
              key={i}
              variant="success"
              className="cursor-pointer"
              onClick={() =>
                onChange({
                  checks: {
                    ...assertion.checks,
                    contains: assertion.checks.contains?.filter((_, idx) => idx !== i),
                  },
                })
              }
            >
              {text.slice(0, 20)}
              {text.length > 20 && "..."} ×
            </Badge>
          ))}
        </div>
      </div>
      <Input
        label="Regex Pattern (optional)"
        placeholder="e.g., export (const|function)"
        value={assertion.checks.matches || ""}
        onChange={(e) =>
          onChange({ checks: { ...assertion.checks, matches: e.target.value } })
        }
      />
    </div>
  );
}

function BuildCheckFields({
  assertion,
  onChange,
}: {
  assertion: BuildCheckAssertion;
  onChange: (updates: Partial<BuildCheckAssertion>) => void;
}) {
  return (
    <div className="space-y-3">
      <Input
        label="Build Command"
        placeholder="npm run build"
        value={assertion.command}
        onChange={(e) => onChange({ command: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={assertion.expectSuccess}
            onChange={(e) => onChange({ expectSuccess: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Expect build to succeed</span>
        </label>
        <Input
          label="Allowed Warnings"
          type="number"
          min={0}
          value={assertion.allowedWarnings || 0}
          onChange={(e) => onChange({ allowedWarnings: parseInt(e.target.value) })}
        />
      </div>
    </div>
  );
}

function VitestFields({
  assertion,
  onChange,
}: {
  assertion: VitestAssertion;
  onChange: (updates: Partial<VitestAssertion>) => void;
}) {
  return (
    <div className="space-y-3">
      <Input
        label="Test File Name"
        placeholder="e.g., Button.test.tsx"
        value={assertion.testFileName}
        onChange={(e) => onChange({ testFileName: e.target.value })}
      />
      <Textarea
        label="Test File Content"
        placeholder="import { test, expect } from 'vitest'..."
        rows={8}
        value={assertion.testFile}
        onChange={(e) => onChange({ testFile: e.target.value })}
        className="font-mono text-sm"
      />
      <Input
        label="Minimum Pass Rate (%)"
        type="number"
        min={0}
        max={100}
        value={assertion.minPassRate}
        onChange={(e) => onChange({ minPassRate: parseInt(e.target.value) })}
      />
    </div>
  );
}

function PlaywrightNLFields({
  assertion,
  onChange,
}: {
  assertion: PlaywrightNLAssertion;
  onChange: (updates: Partial<PlaywrightNLAssertion>) => void;
}) {
  const [stepInput, setStepInput] = useState("");

  const addStep = () => {
    if (stepInput) {
      onChange({ steps: [...assertion.steps, stepInput] });
      setStepInput("");
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        label="Test Description"
        placeholder="User can successfully log in with valid credentials"
        rows={2}
        value={assertion.description}
        onChange={(e) => onChange({ description: e.target.value })}
      />
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Test Steps (Natural Language)
        </label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="e.g., Navigate to the login page"
            value={stepInput}
            onChange={(e) => setStepInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStep())}
            className="flex-1"
          />
          <Button variant="secondary" size="sm" onClick={addStep}>
            Add Step
          </Button>
        </div>
        <ol className="mt-2 space-y-1">
          {assertion.steps.map((step, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded border"
            >
              <span className="text-gray-400">{i + 1}.</span>
              <span className="flex-1">{step}</span>
              <button
                onClick={() =>
                  onChange({ steps: assertion.steps.filter((_, idx) => idx !== i) })
                }
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ol>
      </div>
      <Input
        label="Expected Outcome"
        placeholder="User is redirected to the dashboard"
        value={assertion.expectedOutcome}
        onChange={(e) => onChange({ expectedOutcome: e.target.value })}
      />
    </div>
  );
}

