import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MessageSquare,
  Copy,
  Trash2,
  Edit3,
  Server,
  Code,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Cpu,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent } from "@components/ui/Card";
import { Input, Textarea, Select } from "@components/ui/Input";
import { Modal, ModalBody, ModalFooter } from "@components/ui/Modal";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { useTenant } from "@lib/context";
import { useStore, usePromptAgents } from "@lib/store";
import type {
  PromptAgent,
  CreatePromptAgentInput,
  MCPServerConfig,
  LLMProvider,
} from "@lib/types";
import { AVAILABLE_MODELS } from "@lib/types";
import { formatRelativeTime, generateId } from "@lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface MCPServerFormData {
  id: string;
  name: string;
  command: string;
  args: string;
  envVars: string;
}

export function PromptAgentsPage() {
  const { projectId } = useTenant();
  const promptAgents = usePromptAgents();
  const { addPromptAgent, updatePromptAgent, deletePromptAgent, duplicatePromptAgent } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    systemPrompt: string;
    tags: string;
    provider: LLMProvider;
    model: string;
    temperature: number;
    maxTokens: number;
  }>({
    name: "",
    description: "",
    systemPrompt: "",
    tags: "",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.3,
    maxTokens: 4096,
  });

  const [mcpServers, setMcpServers] = useState<MCPServerFormData[]>([]);

  const filteredAgents = useMemo(() => {
    if (!searchQuery) return promptAgents;
    const query = searchQuery.toLowerCase();
    return promptAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [promptAgents, searchQuery]);

  const openCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      systemPrompt: "",
      tags: "",
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.3,
      maxTokens: 4096,
    });
    setMcpServers([]);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (agent: PromptAgent) => {
    setFormData({
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      tags: agent.tags?.join(", ") || "",
      provider: agent.modelConfig.provider,
      model: agent.modelConfig.model,
      temperature: agent.modelConfig.temperature,
      maxTokens: agent.modelConfig.maxTokens,
    });
    setMcpServers(
      agent.mcpServers.map((s) => ({
        id: generateId(),
        name: s.name,
        command: s.command,
        args: s.args?.join(" ") || "",
        envVars: s.envVars ? JSON.stringify(s.envVars, null, 2) : "",
      }))
    );
    setEditingId(agent.id);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.systemPrompt) return;

    const mcpServerConfigs: MCPServerConfig[] = mcpServers
      .filter((s) => s.name && s.command)
      .map((s) => ({
        name: s.name,
        command: s.command,
        args: s.args ? s.args.split(/\s+/).filter(Boolean) : undefined,
        envVars: s.envVars ? JSON.parse(s.envVars) : undefined,
      }));

    const input: CreatePromptAgentInput = {
      projectId,
      name: formData.name,
      description: formData.description,
      systemPrompt: formData.systemPrompt,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      mcpServers: mcpServerConfigs,
      modelConfig: {
        provider: formData.provider,
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
      },
    };

    if (editingId) {
      updatePromptAgent(editingId, input);
    } else {
      addPromptAgent(input);
    }

    setIsModalOpen(false);
  };

  const addMcpServer = () => {
    setMcpServers([
      ...mcpServers,
      { id: generateId(), name: "", command: "", args: "", envVars: "" },
    ]);
  };

  const updateMcpServer = (id: string, field: keyof MCPServerFormData, value: string) => {
    setMcpServers(mcpServers.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeMcpServer = (id: string) => {
    setMcpServers(mcpServers.filter((s) => s.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8"
    >
      <PageHeader
        title="Prompt Agents"
        description="Manage reusable AI agents with custom system prompts and MCP server configurations"
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            New Prompt Agent
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search prompt agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={searchQuery ? "No agents found" : "No prompt agents yet"}
          description={
            searchQuery
              ? "Try adjusting your search terms"
              : "Create your first prompt agent with a custom system prompt and MCP configuration"
          }
          actionLabel={!searchQuery ? "Create Prompt Agent" : undefined}
          onAction={!searchQuery ? openCreateModal : undefined}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredAgents.map((agent) => (
            <PromptAgentCard
              key={agent.id}
              agent={agent}
              onEdit={() => openEditModal(agent)}
              onDuplicate={() => duplicatePromptAgent(agent.id)}
              onDelete={() => deletePromptAgent(agent.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Prompt Agent" : "Create Prompt Agent"}
        size="lg"
      >
        <ModalBody className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., React Expert"
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this agent does..."
              rows={2}
            />
            <Input
              label="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., react, typescript, frontend"
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">System Prompt</label>
            <Textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              placeholder="Define the agent's behavior and expertise..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* Model Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-500" />
              Model Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Provider"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    provider: e.target.value as LLMProvider,
                    model: AVAILABLE_MODELS[e.target.value as LLMProvider][0],
                  })
                }
                options={[
                  { value: "anthropic", label: "Anthropic" },
                  { value: "openai", label: "OpenAI" },
                  { value: "google", label: "Google" },
                  { value: "mistral", label: "Mistral" },
                ]}
              />
              <Select
                label="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                options={AVAILABLE_MODELS[formData.provider].map((m) => ({
                  value: m,
                  label: m,
                }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Temperature"
                value={formData.temperature.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0 })
                }
                min={0}
                max={2}
                step={0.1}
              />
              <Input
                type="number"
                label="Max Tokens"
                value={formData.maxTokens.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 1024 })
                }
                min={1}
                max={32768}
              />
            </div>
          </div>

          {/* MCP Servers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                MCP Servers
              </h3>
              <Button variant="ghost" size="sm" onClick={addMcpServer}>
                <Plus className="w-4 h-4 mr-1" />
                Add Server
              </Button>
            </div>

            {mcpServers.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Server className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No MCP servers configured</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={addMcpServer}>
                  Add MCP Server
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {mcpServers.map((server, index) => (
                  <div key={server.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Server {index + 1}
                      </span>
                      <button
                        onClick={() => removeMcpServer(server.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Server name"
                        value={server.name}
                        onChange={(e) => updateMcpServer(server.id, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Command (e.g., npx)"
                        value={server.command}
                        onChange={(e) => updateMcpServer(server.id, "command", e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Arguments (space-separated)"
                      value={server.args}
                      onChange={(e) => updateMcpServer(server.id, "args", e.target.value)}
                    />
                    <Textarea
                      placeholder='Environment variables (JSON, e.g., {"API_KEY": "..."})'
                      value={server.envVars}
                      onChange={(e) => updateMcpServer(server.id, "envVars", e.target.value)}
                      rows={2}
                      className="font-mono text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.systemPrompt}
          >
            {editingId ? "Save Changes" : "Create Agent"}
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

function PromptAgentCard({
  agent,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  agent: PromptAgent;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div variants={itemVariants}>
      <Card variant="elevated" className="group h-full flex flex-col">
        <CardContent className="flex-1 flex flex-col p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                <p className="text-xs text-gray-500">{formatRelativeTime(agent.updatedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-sm"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onDuplicate}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-sm"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>

          {/* Tags */}
          {agent.tags && agent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.tags.map((tag) => (
                <Badge key={tag} variant="gray" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Model Info */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary" size="sm" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {agent.modelConfig.model.split("-").slice(0, 2).join("-")}
            </Badge>
            <Badge variant="gray" size="sm">
              temp: {agent.modelConfig.temperature}
            </Badge>
          </div>

          {/* MCP Servers */}
          {agent.mcpServers.length > 0 && (
            <div className="mt-auto pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <Server className="w-4 h-4" />
                {agent.mcpServers.length} MCP Server{agent.mcpServers.length > 1 ? "s" : ""}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-2 overflow-hidden"
                  >
                    {agent.mcpServers.map((server) => (
                      <div
                        key={server.name}
                        className="text-xs bg-gray-50 px-3 py-2 rounded-sm flex items-center gap-2"
                      >
                        <Code className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-gray-700">{server.name}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500 font-mono truncate">
                          {server.command} {server.args?.join(" ")}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* System Prompt Preview */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">System Prompt</p>
            <p className="text-xs text-gray-600 font-mono line-clamp-2 bg-gray-50 p-2 rounded-sm">
              {agent.systemPrompt.substring(0, 150)}...
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
