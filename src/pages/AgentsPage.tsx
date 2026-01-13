import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Bot,
  Copy,
  Trash2,
  Edit3,
  Star,
  Terminal,
  FolderOpen,
  Settings2,
  Zap,
  Brain,
  Lock,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent } from "@components/ui/Card";
import { Input, Textarea, Select } from "@components/ui/Input";
import { Modal, ModalBody, ModalFooter } from "@components/ui/Modal";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { useStore, useAgents } from "@lib/store";
import type { Agent, CreateAgentInput, AgentType, LLMProvider } from "@lib/types";
import { AVAILABLE_MODELS } from "@lib/types";
import { formatRelativeTime, cn } from "@lib/utils";

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

// Get icon component based on agent icon string
function getAgentIcon(icon: string) {
  switch (icon) {
    case "brain":
      return Brain;
    case "zap":
      return Zap;
    case "terminal":
      return Terminal;
    default:
      return Bot;
  }
}

const AGENT_TYPES: { value: AgentType; label: string }[] = [
  { value: "claude_code", label: "Claude Code" },
  { value: "codex", label: "OpenAI Codex" },
  { value: "cursor_cli", label: "Cursor CLI" },
  { value: "custom", label: "Custom" },
];

const defaultFormData: CreateAgentInput = {
  name: "",
  description: "",
  icon: "bot",
  type: "custom",
  runCommand: "",
  runArgs: [],
  workingDirectory: "",
  templateFiles: [],
  envVars: {},
  capabilities: [],
  isDefault: false,
};

export function AgentsPage() {
  const agents = useAgents();
  const { addAgent, updateAgent, deleteAgent, setDefaultAgent, duplicateAgent } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAgentInput>(defaultFormData);
  const [runArgsText, setRunArgsText] = useState("");
  const [capabilitiesText, setCapabilitiesText] = useState("");
  const [envVarsText, setEnvVarsText] = useState("");
  const [showModelConfig, setShowModelConfig] = useState(false);

  // Filter agents
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate built-in and custom agents
  const builtInAgents = filteredAgents.filter((a) => a.isBuiltIn);
  const customAgents = filteredAgents.filter((a) => !a.isBuiltIn);

  const openCreateModal = () => {
    setFormData(defaultFormData);
    setRunArgsText("");
    setCapabilitiesText("");
    setEnvVarsText("");
    setShowModelConfig(false);
    setEditingAgent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (agent: Agent) => {
    // Don't allow editing built-in agents
    if (agent.isBuiltIn) return;

    setFormData({
      name: agent.name,
      description: agent.description,
      icon: agent.icon,
      type: agent.type,
      runCommand: agent.runCommand,
      runArgs: agent.runArgs,
      workingDirectory: agent.workingDirectory,
      templateFiles: agent.templateFiles,
      envVars: agent.envVars,
      modelConfig: agent.modelConfig,
      capabilities: agent.capabilities,
      isDefault: agent.isDefault,
    });
    setRunArgsText(agent.runArgs?.join(" ") || "");
    setCapabilitiesText(agent.capabilities?.join("\n") || "");
    setEnvVarsText(
      agent.envVars
        ? Object.entries(agent.envVars)
            .map(([k, v]) => `${k}=${v}`)
            .join("\n")
        : ""
    );
    setShowModelConfig(!!agent.modelConfig);
    setEditingAgent(agent);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.runCommand) return;

    // Parse text fields into arrays/objects
    const runArgs = runArgsText.trim() ? runArgsText.trim().split(/\s+/) : [];
    const capabilities = capabilitiesText.trim()
      ? capabilitiesText.trim().split("\n").filter(Boolean)
      : [];
    const envVars = envVarsText.trim()
      ? Object.fromEntries(
          envVarsText
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const [key, ...valueParts] = line.split("=");
              return [key, valueParts.join("=")];
            })
        )
      : undefined;

    const agentData: CreateAgentInput = {
      ...formData,
      runArgs,
      capabilities,
      envVars,
      modelConfig: showModelConfig ? formData.modelConfig : undefined,
    };

    if (editingAgent) {
      updateAgent(editingAgent.id, agentData);
    } else {
      addAgent(agentData);
    }
    setIsModalOpen(false);
  };

  const handleDuplicate = (agent: Agent) => {
    duplicateAgent(agent.id);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Coding Agents"
        description="Configure CLI-based coding agents for skill evaluation"
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            New Agent
          </Button>
        }
      />

      {/* Search */}
      <div className="max-w-md mb-6">
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create agents with CLI commands to test your skills"
          actionLabel="Create Agent"
          onAction={openCreateModal}
        />
      ) : (
        <div className="space-y-8">
          {/* Built-in Agents */}
          {builtInAgents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Built-in Agents
              </h2>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4"
              >
                {builtInAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onEdit={() => openEditModal(agent)}
                    onDuplicate={() => handleDuplicate(agent)}
                    onDelete={() => deleteAgent(agent.id)}
                    onSetDefault={() => setDefaultAgent(agent.id)}
                  />
                ))}
              </motion.div>
            </div>
          )}

          {/* Custom Agents */}
          {customAgents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Custom Agents
              </h2>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4"
              >
                {customAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onEdit={() => openEditModal(agent)}
                    onDuplicate={() => handleDuplicate(agent)}
                    onDelete={() => deleteAgent(agent.id)}
                    onSetDefault={() => setDefaultAgent(agent.id)}
                  />
                ))}
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgent ? "Edit Agent" : "Create Agent"}
        description="Configure the agent's CLI command and workspace setup"
        size="lg"
      >
        <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Agent Name"
              placeholder="e.g., Claude Code Custom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Select
              label="Agent Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AgentType })}
              options={AGENT_TYPES}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="What makes this agent unique?"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* CLI Configuration */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              CLI Configuration
            </h3>
            <div className="space-y-4">
              <Input
                label="Run Command"
                placeholder="e.g., npx @anthropic-ai/claude-code"
                value={formData.runCommand}
                onChange={(e) => setFormData({ ...formData, runCommand: e.target.value })}
              />
              <Input
                label="Arguments (space-separated)"
                placeholder="e.g., run --verbose --model claude-3"
                value={runArgsText}
                onChange={(e) => setRunArgsText(e.target.value)}
              />
            </div>
          </div>

          {/* Workspace Setup */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Workspace Setup
            </h3>
            <div className="space-y-4">
              <Input
                label="Working Directory (optional)"
                placeholder="e.g., ./workspace"
                value={formData.workingDirectory || ""}
                onChange={(e) => setFormData({ ...formData, workingDirectory: e.target.value })}
              />
              <Textarea
                label="Environment Variables (KEY=value, one per line)"
                placeholder="NODE_ENV=development&#10;DEBUG=true"
                rows={3}
                value={envVarsText}
                onChange={(e) => setEnvVarsText(e.target.value)}
              />
            </div>
          </div>

          {/* Capabilities */}
          <div className="border-t pt-4">
            <Textarea
              label="Capabilities (one per line)"
              placeholder="File creation&#10;Multi-file refactoring&#10;Test generation"
              rows={3}
              value={capabilitiesText}
              onChange={(e) => setCapabilitiesText(e.target.value)}
            />
          </div>

          {/* Optional Model Config */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={showModelConfig}
                onChange={(e) => {
                  setShowModelConfig(e.target.checked);
                  if (e.target.checked && !formData.modelConfig) {
                    setFormData({
                      ...formData,
                      modelConfig: {
                        provider: "anthropic",
                        model: "claude-3-sonnet",
                        temperature: 0.7,
                        maxTokens: 4096,
                      },
                    });
                  }
                }}
                className="w-4 h-4 rounded-sm border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Include Model Configuration (optional)
              </span>
            </label>

            {showModelConfig && formData.modelConfig && (
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Provider"
                    value={formData.modelConfig.provider}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modelConfig: {
                          ...formData.modelConfig!,
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
                    value={formData.modelConfig.model}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modelConfig: { ...formData.modelConfig!, model: e.target.value },
                      })
                    }
                    options={AVAILABLE_MODELS[formData.modelConfig.provider].map((m) => ({
                      value: m,
                      label: m,
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Temperature"
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={formData.modelConfig.temperature}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modelConfig: {
                          ...formData.modelConfig!,
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
                    value={formData.modelConfig.maxTokens}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modelConfig: {
                          ...formData.modelConfig!,
                          maxTokens: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.runCommand}>
            {editingAgent ? "Update" : "Create"} Agent
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Agent Card Component
function AgentCard({
  agent,
  onEdit,
  onDuplicate,
  onDelete,
  onSetDefault,
}: {
  agent: Agent;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const IconComponent = getAgentIcon(agent.icon);
  const fullCommand = [agent.runCommand, ...(agent.runArgs || [])].join(" ");

  return (
    <motion.div variants={item}>
      <Card className={cn("h-full", agent.isDefault && "ring-2 ring-primary-300")}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                agent.isDefault
                  ? "bg-linear-to-br from-primary-400 to-violet-600"
                  : agent.isBuiltIn
                  ? "bg-linear-to-br from-emerald-400 to-teal-600"
                  : "bg-linear-to-br from-gray-400 to-gray-600"
              )}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                {agent.isDefault && (
                  <Badge variant="primary" size="sm">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}
                {agent.isBuiltIn && (
                  <Badge variant="gray" size="sm">
                    <Lock className="w-3 h-3 mr-1" />
                    Built-in
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {agent.description || "No description"}
              </p>

              {/* CLI Command */}
              <div className="flex items-center gap-2 text-sm">
                <Terminal className="w-4 h-4 text-gray-400" />
                <code className="text-xs bg-gray-100 px-2 py-1 rounded-sm font-mono text-gray-700 truncate max-w-[200px]">
                  {fullCommand}
                </code>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-start gap-1">
              {!agent.isDefault && (
                <button
                  onClick={onSetDefault}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                  title="Set as default"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              {!agent.isBuiltIn && (
                <button
                  onClick={onEdit}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onDuplicate}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              {!agent.isDefault && !agent.isBuiltIn && (
                <button
                  onClick={onDelete}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Capabilities */}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 4).map((cap, i) => (
                  <Badge key={i} variant="gray" size="sm">
                    {cap}
                  </Badge>
                ))}
                {agent.capabilities.length > 4 && (
                  <Badge variant="gray" size="sm">
                    +{agent.capabilities.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Environment / Working Dir */}
          {(agent.workingDirectory || agent.envVars) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {agent.workingDirectory && (
                  <div className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    <span>{agent.workingDirectory}</span>
                  </div>
                )}
                {agent.envVars && Object.keys(agent.envVars).length > 0 && (
                  <div className="flex items-center gap-1">
                    <Settings2 className="w-3 h-3" />
                    <span>{Object.keys(agent.envVars).length} env vars</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Updated {formatRelativeTime(agent.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
