import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  FileCode2,
  Copy,
  Trash2,
  Edit3,
  History,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Github,
  Cloud,
  CloudOff,
  RefreshCw,
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
import { useStore, useSkills } from "@lib/store";
import type { Skill, SkillSyncSource, SkillSyncSourceType } from "@lib/types";
import { parseSkillMd, validateSkillMd, extractSkillContent } from "@lib/utils/skillParser";
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

// Example SKILL.md template
const SKILL_TEMPLATE = `---
name: my-skill
description: Brief description of what this skill does and when to use it
allowed-tools: Read, Write, Bash
---

# My Skill

## Instructions

Provide clear, step-by-step guidance for Claude.

1. First, analyze the request
2. Then, implement the solution
3. Finally, verify the output

## Examples

Show concrete examples of using this skill.

\`\`\`typescript
// Example code here
\`\`\`
`;

export function SkillsPage() {
  const { projectId } = useTenant();
  const skills = useSkills();
  const { addSkill, updateSkill, deleteSkill, duplicateSkill } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showVersions, setShowVersions] = useState<string | null>(null);

  // Form state
  const [skillMd, setSkillMd] = useState(SKILL_TEMPLATE);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  // Sync source state
  const [syncSourceType, setSyncSourceType] = useState<SkillSyncSourceType>("none");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [githubPath, setGithubPath] = useState("SKILL.md");
  const [promptHubId, setPromptHubId] = useState("");

  // Validation state
  const validation = useMemo(() => validateSkillMd(skillMd), [skillMd]);
  const parsedMetadata = useMemo(() => parseSkillMd(skillMd), [skillMd]);

  // Filter skills
  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setSkillMd(SKILL_TEMPLATE);
    setCustomName("");
    setCustomDescription("");
    setSyncSourceType("none");
    setGithubRepo("");
    setGithubBranch("main");
    setGithubPath("SKILL.md");
    setPromptHubId("");
    setEditingSkill(null);
    setIsModalOpen(true);
  };

  const openEditModal = (skill: Skill) => {
    setSkillMd(skill.skillMd);
    setCustomName(skill.name);
    setCustomDescription(skill.description);
    // Load sync source settings
    const syncSource = skill.syncSource || { type: "none" as const };
    setSyncSourceType(syncSource.type);
    if (syncSource.type === "github") {
      setGithubRepo(syncSource.repository);
      setGithubBranch(syncSource.branch || "main");
      setGithubPath(syncSource.path);
    } else if (syncSource.type === "prompthub") {
      setPromptHubId(syncSource.promptHubId);
    }
    setEditingSkill(skill);
    setIsModalOpen(true);
  };

  const buildSyncSource = (): SkillSyncSource => {
    switch (syncSourceType) {
      case "github":
        return {
          type: "github",
          repository: githubRepo,
          branch: githubBranch || "main",
          path: githubPath || "SKILL.md",
        };
      case "prompthub":
        return {
          type: "prompthub",
          promptHubId: promptHubId,
        };
      default:
        return { type: "none" };
    }
  };

  const handleSubmit = () => {
    if (!validation.valid) return;

    const name = customName || parsedMetadata.name || "Untitled Skill";
    const description = customDescription || parsedMetadata.description || "";
    const syncSource = buildSyncSource();

    if (editingSkill) {
      updateSkill(editingSkill.id, {
        name,
        description,
        skillMd,
        syncSource,
      });
    } else {
      addSkill({
        projectId,
        name,
        description,
        skillMd,
        syncSource,
      });
    }
    setIsModalOpen(false);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setSkillMd(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = (skill: Skill) => {
    const blob = new Blob([skill.skillMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.name.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Agent Skills"
        description="Manage Claude Code Agent Skills (SKILL.md files)"
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            New Skill
          </Button>
        }
      />

      {/* Search */}
      <div className="max-w-md mb-6">
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <EmptyState
          icon={FileCode2}
          title="No skills yet"
          description="Claude Code Agent Skills teach Claude how to perform specific tasks. Create your first SKILL.md to get started."
          actionLabel="Create Skill"
          onAction={openCreateModal}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onEdit={() => openEditModal(skill)}
              onDuplicate={() => duplicateSkill(skill.id)}
              onDelete={() => deleteSkill(skill.id)}
              onExport={() => handleExport(skill)}
              onViewVersions={() => setShowVersions(skill.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? "Edit Skill" : "Create Skill"}
        description="Define a Claude Code Agent Skill with YAML frontmatter"
        size="xl"
      >
        <ModalBody>
          <Tabs defaultValue="editor" className="space-y-4">
            <TabsList>
              <TabsTrigger value="editor">SKILL.md Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="sync">Sync Source</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {validation.valid ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Valid SKILL.md
                    </Badge>
                  ) : (
                    <Badge variant="error" size="sm">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Invalid format
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </Button>
              </div>

              {!validation.valid && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                  <p className="text-sm text-error-700 font-medium">Validation Errors:</p>
                  <ul className="text-sm text-error-600 mt-1 list-disc list-inside">
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="relative">
                <Textarea
                  value={skillMd}
                  onChange={(e) => setSkillMd(e.target.value)}
                  rows={20}
                  className="font-mono text-sm bg-gray-900 text-gray-100 border-gray-700"
                  placeholder="Paste or write your SKILL.md content here..."
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {parsedMetadata.name || "Untitled Skill"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {parsedMetadata.description || "No description"}
                  </p>
                  
                  {parsedMetadata.allowedTools && parsedMetadata.allowedTools.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Allowed Tools:</p>
                      <div className="flex flex-wrap gap-1">
                        {parsedMetadata.allowedTools.map((tool) => (
                          <Badge key={tool} variant="primary" size="sm">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Instructions Preview:</p>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                      {extractSkillContent(skillMd).slice(0, 500)}
                      {extractSkillContent(skillMd).length > 500 && "..."}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <p className="text-sm text-gray-500">
                Override the metadata extracted from SKILL.md frontmatter:
              </p>
              <Input
                label="Custom Name (optional)"
                placeholder={parsedMetadata.name || "Leave empty to use from frontmatter"}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                hint={`From frontmatter: ${parsedMetadata.name || "Not set"}`}
              />
              <Textarea
                label="Custom Description (optional)"
                placeholder={parsedMetadata.description || "Leave empty to use from frontmatter"}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={3}
                hint={`From frontmatter: ${parsedMetadata.description || "Not set"}`}
              />
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <p className="text-sm text-gray-500">
                Configure where this skill's SKILL.md content is synchronized from:
              </p>

              <Select
                label="Sync Source"
                value={syncSourceType}
                onChange={(e) => setSyncSourceType(e.target.value as SkillSyncSourceType)}
                options={[
                  { value: "none", label: "Unsynced (Local only)" },
                  { value: "github", label: "GitHub Repository" },
                  { value: "prompthub", label: "PromptHub (Internal)" },
                ]}
              />

              {syncSourceType === "github" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Github className="w-5 h-5" />
                    <span className="font-medium">GitHub Configuration</span>
                  </div>
                  <Input
                    label="Repository"
                    placeholder="owner/repo (e.g., wix/skills-library)"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    hint="The GitHub repository containing the SKILL.md file"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Branch"
                      placeholder="main"
                      value={githubBranch}
                      onChange={(e) => setGithubBranch(e.target.value)}
                    />
                    <Input
                      label="Path to SKILL.md"
                      placeholder="skills/my-skill/SKILL.md"
                      value={githubPath}
                      onChange={(e) => setGithubPath(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    onClick={() => {
                      // TODO: Implement actual sync
                      alert("Sync from GitHub would fetch the latest SKILL.md content");
                    }}
                  >
                    Sync Now
                  </Button>
                </div>
              )}

              {syncSourceType === "prompthub" && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Cloud className="w-5 h-5" />
                    <span className="font-medium">PromptHub Configuration</span>
                  </div>
                  <Input
                    label="PromptHub ID"
                    placeholder="e.g., wix-dashboard-v2"
                    value={promptHubId}
                    onChange={(e) => setPromptHubId(e.target.value)}
                    hint="The unique identifier for this skill in PromptHub"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    onClick={() => {
                      // TODO: Implement actual sync
                      alert("Sync from PromptHub would fetch the latest content");
                    }}
                  >
                    Sync Now
                  </Button>
                </div>
              )}

              {syncSourceType === "none" && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CloudOff className="w-5 h-5" />
                    <span>This skill is managed locally and not synchronized with any external source.</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!validation.valid}>
            {editingSkill ? "Update" : "Create"} Skill
          </Button>
        </ModalFooter>
      </Modal>

      {/* Version History Modal */}
      <Modal
        isOpen={!!showVersions}
        onClose={() => setShowVersions(null)}
        title="Version History"
        size="lg"
      >
        <ModalBody>
          {showVersions && (
            <VersionHistory
              skill={skills.find((s) => s.id === showVersions)!}
            />
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}

// Skill Card Component
interface SkillCardProps {
  skill: Skill;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
  onViewVersions: () => void;
}

function SkillCard({
  skill,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  onViewVersions,
}: SkillCardProps) {

  return (
    <motion.div variants={item}>
      <Card className="group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
              <FileCode2 className="w-6 h-6 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                <Badge variant="gray" size="sm">
                  v{skill.versions.length}
                </Badge>
                {skill.syncSource?.type === "github" && (
                  <Badge variant="default" size="sm" className="flex items-center gap-1">
                    <Github className="w-3 h-3" />
                    GitHub
                  </Badge>
                )}
                {skill.syncSource?.type === "prompthub" && (
                  <Badge variant="primary" size="sm" className="flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    PromptHub
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {skill.description || "No description"}
              </p>

              {/* Metadata Preview */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {skill.metadata.allowedTools && skill.metadata.allowedTools.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Tools:</span>
                    <div className="flex gap-1">
                      {skill.metadata.allowedTools.slice(0, 3).map((tool) => (
                        <Badge key={tool} variant="primary" size="sm">
                          {tool}
                        </Badge>
                      ))}
                      {skill.metadata.allowedTools.length > 3 && (
                        <Badge variant="gray" size="sm">
                          +{skill.metadata.allowedTools.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <span className="text-gray-400">
                  Updated {formatRelativeTime(skill.updatedAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onViewVersions}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Version history"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={onEdit}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onExport}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onDuplicate}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Version History Component
function VersionHistory({ skill }: { skill: Skill }) {
  if (!skill) return null;

  return (
    <div className="space-y-3">
      {skill.versions
        .slice()
        .reverse()
        .map((version, index) => (
          <div
            key={version.id}
            className={cn(
              "p-4 rounded-lg border",
              index === 0 ? "bg-primary-50 border-primary-200" : "bg-gray-50 border-gray-200"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  Version {version.version}
                </span>
                {index === 0 && (
                  <Badge variant="primary" size="sm">
                    Current
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(version.createdAt)}
              </span>
            </div>

            {version.notes && (
              <p className="text-sm text-gray-600 mb-2">{version.notes}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Model: {version.model.model}</span>
              <span>T={version.model.temperature}</span>
            </div>

            <div className="mt-2 p-2 bg-white rounded border">
              <pre className="text-xs text-gray-700 font-mono line-clamp-3">
                {version.skillMd.slice(0, 200)}...
              </pre>
            </div>
          </div>
        ))}
    </div>
  );
}
