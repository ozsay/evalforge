import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Layers,
  Trash2,
  Edit3,
  Copy,
  FileCode2,
  Bot,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Server,
  X,
  TestTube2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent } from "@components/ui/Card";
import { Input, Textarea, Select } from "@components/ui/Input";
import { Modal, ModalBody, ModalFooter } from "@components/ui/Modal";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/Tabs";
import {
  useStore,
  useTargetGroups,
  useSkills,
  useAgents,
  useTargetGroupScenarios,
} from "@lib/store";
import type {
  TargetGroup,
  Target,
  TargetType,
  CreateTargetGroupInput,
  PromptAgentConfig,
  MCPServerConfig,
  LLMProvider,
} from "@lib/types";
import { AVAILABLE_MODELS } from "@lib/types";
import { generateId, formatRelativeTime, cn } from "@lib/utils";

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

// Target type configuration
const TARGET_TYPES: {
  type: TargetType;
  label: string;
  icon: typeof FileCode2;
  color: string;
  description: string;
}[] = [
  {
    type: "agent_skill",
    label: "Agent Skill",
    icon: FileCode2,
    color: "bg-violet-500",
    description: "Reference an existing SKILL.md",
  },
  {
    type: "coding_agent",
    label: "Coding Agent",
    icon: Bot,
    color: "bg-emerald-500",
    description: "Reference an existing CLI agent",
  },
  {
    type: "prompt_agent",
    label: "Prompt Agent",
    icon: MessageSquare,
    color: "bg-amber-500",
    description: "Define a custom prompt-based agent",
  },
];

// Default form data
const defaultFormData: Omit<CreateTargetGroupInput, "targets"> = {
  name: "",
  description: "",
};

const defaultPromptAgentConfig: PromptAgentConfig = {
  name: "",
  description: "",
  systemPrompt: "",
  mcpServers: [],
  modelConfig: {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.5,
    maxTokens: 4096,
  },
};

export function TargetGroupsPage() {
  const navigate = useNavigate();
  const targetGroups = useTargetGroups();
  const skills = useSkills();
  const agents = useAgents();
  const {
    addTargetGroup,
    updateTargetGroup,
    deleteTargetGroup,
    duplicateTargetGroup,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TargetGroup | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState(defaultFormData);
  const [targets, setTargets] = useState<Target[]>([]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    return targetGroups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [targetGroups, searchQuery]);

  const openCreateModal = () => {
    setFormData(defaultFormData);
    setTargets([]);
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const openEditModal = (group: TargetGroup) => {
    setFormData({
      name: group.name,
      description: group.description,
    });
    setTargets([...group.targets]);
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    const input: CreateTargetGroupInput = {
      ...formData,
      targets,
    };

    if (editingGroup) {
      updateTargetGroup(editingGroup.id, input);
    } else {
      addTargetGroup(input);
    }
    setIsModalOpen(false);
  };

  // Target management
  const addTarget = (type: TargetType) => {
    const newTarget: Target = {
      id: generateId(),
      type,
      ...(type === "prompt_agent" && {
        promptAgentConfig: { ...defaultPromptAgentConfig },
      }),
    };
    setTargets([...targets, newTarget]);
  };

  const updateTarget = (index: number, updates: Partial<Target>) => {
    const newTargets = [...targets];
    newTargets[index] = { ...newTargets[index], ...updates } as Target;
    setTargets(newTargets);
  };

  const removeTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Target Groups"
        description="Organize testable entities into groups for evaluation"
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            New Target Group
          </Button>
        }
      />

      {/* Search */}
      <div className="max-w-md mb-6">
        <Input
          placeholder="Search target groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Target Groups List */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No target groups yet"
          description="Target groups help organize skills, agents, and prompt agents for evaluation."
          actionLabel="Create Target Group"
          onAction={openCreateModal}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredGroups.map((group) => (
            <TargetGroupCard
              key={group.id}
              group={group}
              skills={skills}
              agents={agents}
              isExpanded={expandedGroup === group.id}
              onToggle={() =>
                setExpandedGroup(expandedGroup === group.id ? null : group.id)
              }
              onEdit={() => openEditModal(group)}
              onDuplicate={() => duplicateTargetGroup(group.id)}
              onDelete={() => deleteTargetGroup(group.id)}
              onNavigateToScenarios={() =>
                navigate(`/scenarios?targetGroupId=${group.id}`)
              }
            />
          ))}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? "Edit Target Group" : "Create Target Group"}
        description="Define a group of testable targets"
        size="xl"
      >
        <ModalBody>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="targets">
                Targets ({targets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Input
                label="Group Name"
                placeholder="e.g., React Development Suite"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Textarea
                label="Description"
                placeholder="What is this target group for?"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </TabsContent>

            <TabsContent value="targets" className="space-y-4">
              {/* Add Target Buttons */}
              <div className="flex flex-wrap gap-2">
                {TARGET_TYPES.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => addTarget(type.type)}
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
                    <span className="text-sm font-medium">Add {type.label}</span>
                  </button>
                ))}
              </div>

              {/* Targets List */}
              {targets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No targets yet. Click a button above to add one.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {targets.map((target, index) => (
                    <TargetEditor
                      key={target.id}
                      target={target}
                      skills={skills}
                      agents={agents}
                      onChange={(updates) => updateTarget(index, updates)}
                      onRemove={() => removeTarget(index)}
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
          <Button onClick={handleSubmit} disabled={!formData.name}>
            {editingGroup ? "Update" : "Create"} Target Group
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Target Group Card Component
interface TargetGroupCardProps {
  group: TargetGroup;
  skills: ReturnType<typeof useSkills>;
  agents: ReturnType<typeof useAgents>;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onNavigateToScenarios: () => void;
}

function TargetGroupCard({
  group,
  skills,
  agents,
  isExpanded,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
  onNavigateToScenarios,
}: TargetGroupCardProps) {
  const scenarios = useTargetGroupScenarios(group.id);

  // Count targets by type
  const targetCounts = useMemo(() => {
    const counts = { agent_skill: 0, coding_agent: 0, prompt_agent: 0 };
    group.targets.forEach((t) => counts[t.type]++);
    return counts;
  }, [group.targets]);

  const getTargetName = (target: Target) => {
    switch (target.type) {
      case "agent_skill":
        return skills.find((s) => s.id === target.skillId)?.name || "Unknown Skill";
      case "coding_agent":
        return agents.find((a) => a.id === target.agentId)?.name || "Unknown Agent";
      case "prompt_agent":
        return target.promptAgentConfig?.name || "Unnamed Prompt Agent";
    }
  };

  const getTargetTypeConfig = (type: TargetType) =>
    TARGET_TYPES.find((t) => t.type === type)!;

  return (
    <motion.div variants={item}>
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div
            className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onToggle}
          >
            <button className="text-gray-400">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <Badge variant="gray" size="sm">
                  {group.targets.length} target{group.targets.length !== 1 && "s"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {group.description || "No description"}
              </p>

              {/* Target type badges */}
              <div className="flex items-center gap-2 mt-2">
                {targetCounts.agent_skill > 0 && (
                  <Badge variant="primary" size="sm">
                    <FileCode2 className="w-3 h-3 mr-1" />
                    {targetCounts.agent_skill} Skill{targetCounts.agent_skill !== 1 && "s"}
                  </Badge>
                )}
                {targetCounts.coding_agent > 0 && (
                  <Badge variant="success" size="sm">
                    <Bot className="w-3 h-3 mr-1" />
                    {targetCounts.coding_agent} Agent{targetCounts.coding_agent !== 1 && "s"}
                  </Badge>
                )}
                {targetCounts.prompt_agent > 0 && (
                  <Badge variant="warning" size="sm">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {targetCounts.prompt_agent} Prompt{targetCounts.prompt_agent !== 1 && "s"}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <TestTube2 className="w-4 h-4" />
                  <span>
                    {scenarios.length} scenario{scenarios.length !== 1 && "s"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToScenarios();
                }}
              >
                <TestTube2 className="w-4 h-4 mr-1" />
                Scenarios
              </Button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
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
                Targets in this group
              </h4>
              <div className="space-y-2">
                {group.targets.map((target) => {
                  const config = getTargetTypeConfig(target.type);
                  return (
                    <div
                      key={target.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          config.color
                        )}
                      >
                        <config.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {getTargetName(target)}
                        </p>
                        <p className="text-xs text-gray-500">{config.label}</p>
                      </div>
                      {target.type === "prompt_agent" && target.promptAgentConfig && (
                        <Badge variant="gray" size="sm">
                          {target.promptAgentConfig.mcpServers.length} MCP server
                          {target.promptAgentConfig.mcpServers.length !== 1 && "s"}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Updated {formatRelativeTime(group.updatedAt)}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Target Editor Component
interface TargetEditorProps {
  target: Target;
  skills: ReturnType<typeof useSkills>;
  agents: ReturnType<typeof useAgents>;
  onChange: (updates: Partial<Target>) => void;
  onRemove: () => void;
}

function TargetEditor({
  target,
  skills,
  agents,
  onChange,
  onRemove,
}: TargetEditorProps) {
  const config = TARGET_TYPES.find((t) => t.type === target.type)!;

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            config.color
          )}
        >
          <config.icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <span className="font-medium text-gray-900">{config.label}</span>
          <p className="text-xs text-gray-500">{config.description}</p>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Type-specific fields */}
      {target.type === "agent_skill" && (
        <Select
          label="Select Skill"
          value={target.skillId || ""}
          onChange={(e) => onChange({ skillId: e.target.value || undefined })}
          options={[
            { value: "", label: "Select a skill..." },
            ...skills.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      )}

      {target.type === "coding_agent" && (
        <Select
          label="Select Agent"
          value={target.agentId || ""}
          onChange={(e) => onChange({ agentId: e.target.value || undefined })}
          options={[
            { value: "", label: "Select an agent..." },
            ...agents.map((a) => ({ value: a.id, label: a.name })),
          ]}
        />
      )}

      {target.type === "prompt_agent" && target.promptAgentConfig && (
        <PromptAgentEditor
          config={target.promptAgentConfig}
          onChange={(updates) =>
            onChange({
              promptAgentConfig: { ...target.promptAgentConfig!, ...updates },
            })
          }
        />
      )}
    </div>
  );
}

// Prompt Agent Editor Component
interface PromptAgentEditorProps {
  config: PromptAgentConfig;
  onChange: (updates: Partial<PromptAgentConfig>) => void;
}

function PromptAgentEditor({ config, onChange }: PromptAgentEditorProps) {
  const [mcpServerInput, setMcpServerInput] = useState<MCPServerConfig>({
    name: "",
    command: "",
    args: [],
    envVars: {},
  });
  const [argsText, setArgsText] = useState("");

  const addMcpServer = () => {
    if (!mcpServerInput.name || !mcpServerInput.command) return;
    
    const newServer: MCPServerConfig = {
      ...mcpServerInput,
      args: argsText.trim() ? argsText.trim().split(/\s+/) : [],
    };
    
    onChange({
      mcpServers: [...config.mcpServers, newServer],
    });
    
    setMcpServerInput({ name: "", command: "", args: [], envVars: {} });
    setArgsText("");
  };

  const removeMcpServer = (index: number) => {
    onChange({
      mcpServers: config.mcpServers.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Agent Name"
        placeholder="e.g., API Validator"
        value={config.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />

      <Textarea
        label="Description (optional)"
        placeholder="What does this agent do?"
        rows={2}
        value={config.description || ""}
        onChange={(e) => onChange({ description: e.target.value })}
      />

      <Textarea
        label="System Prompt"
        placeholder="Define the agent's behavior and instructions..."
        rows={6}
        value={config.systemPrompt}
        onChange={(e) => onChange({ systemPrompt: e.target.value })}
        className="font-mono text-sm"
      />

      {/* Model Configuration */}
      {config.modelConfig && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Model Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Provider"
              value={config.modelConfig.provider}
              onChange={(e) =>
                onChange({
                  modelConfig: {
                    ...config.modelConfig!,
                    provider: e.target.value as LLMProvider,
                    model: AVAILABLE_MODELS[e.target.value as LLMProvider][0],
                  },
                })
              }
              options={Object.keys(AVAILABLE_MODELS).map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
              }))}
            />
            <Select
              label="Model"
              value={config.modelConfig.model}
              onChange={(e) =>
                onChange({
                  modelConfig: { ...config.modelConfig!, model: e.target.value },
                })
              }
              options={AVAILABLE_MODELS[config.modelConfig.provider].map((m) => ({
                value: m,
                label: m,
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Input
              label="Temperature"
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={config.modelConfig.temperature}
              onChange={(e) =>
                onChange({
                  modelConfig: {
                    ...config.modelConfig!,
                    temperature: parseFloat(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Max Tokens"
              type="number"
              min={100}
              max={128000}
              step={100}
              value={config.modelConfig.maxTokens}
              onChange={(e) =>
                onChange({
                  modelConfig: {
                    ...config.modelConfig!,
                    maxTokens: parseInt(e.target.value),
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {/* MCP Servers */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4" />
          MCP Servers
        </h4>

        {/* Existing servers */}
        {config.mcpServers.length > 0 && (
          <div className="space-y-2 mb-4">
            {config.mcpServers.map((server, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border"
              >
                <Server className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{server.name}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">
                    {server.command} {server.args?.join(" ")}
                  </p>
                </div>
                <button
                  onClick={() => removeMcpServer(index)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new server form */}
        <div className="p-3 bg-white rounded-lg border space-y-3">
          <p className="text-xs font-medium text-gray-500">Add MCP Server</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Server name"
              value={mcpServerInput.name}
              onChange={(e) =>
                setMcpServerInput({ ...mcpServerInput, name: e.target.value })
              }
            />
            <Input
              placeholder="Command (e.g., npx)"
              value={mcpServerInput.command}
              onChange={(e) =>
                setMcpServerInput({ ...mcpServerInput, command: e.target.value })
              }
            />
          </div>
          <Input
            placeholder="Arguments (space-separated)"
            value={argsText}
            onChange={(e) => setArgsText(e.target.value)}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={addMcpServer}
            disabled={!mcpServerInput.name || !mcpServerInput.command}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Server
          </Button>
        </div>
      </div>
    </div>
  );
}
