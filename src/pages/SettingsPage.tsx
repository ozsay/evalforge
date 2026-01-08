import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Cpu,
  Tags,
  Palette,
  Save,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Database,
  Download,
  Upload,
} from "lucide-react";
import { PageHeader } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/Card";
import { Input, Select } from "@components/ui/Input";
import { Badge } from "@components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/Tabs";
import { useStore, useSettings } from "@lib/store";
import { AVAILABLE_MODELS, type LLMProvider, type LabelConfig } from "@lib/types";
import { cn } from "@lib/utils";

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

const providerOptions = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "local", label: "Local (Ollama)" },
];

const colorOptions = [
  { value: "success", label: "Green" },
  { value: "error", label: "Red" },
  { value: "warning", label: "Yellow" },
  { value: "primary", label: "Blue" },
  { value: "gray", label: "Gray" },
];

export function SettingsPage() {
  const settings = useSettings();
  const { updateSettings } = useStore();

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    openai: "",
    anthropic: "",
    google: "",
    local: "",
  });

  const [defaultModel, setDefaultModel] = useState(settings.defaultModel);
  const [labelConfigs, setLabelConfigs] = useState<LabelConfig[]>(settings.labelConfigs);
  const [newLabel, setNewLabel] = useState({
    name: "",
    color: "gray",
    shortcut: "",
  });

  const [saved, setSaved] = useState(false);

  // Save settings
  const saveSettings = () => {
    updateSettings({
      defaultModel,
      labelConfigs,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Add new label
  const addLabel = () => {
    if (!newLabel.name) return;

    const label: LabelConfig = {
      id: newLabel.name.toLowerCase().replace(/\s+/g, "-"),
      name: newLabel.name,
      color: newLabel.color,
      icon: "tag",
      shortcut: newLabel.shortcut || `${labelConfigs.length + 1}`,
    };

    setLabelConfigs([...labelConfigs, label]);
    setNewLabel({ name: "", color: "gray", shortcut: "" });
  };

  // Remove label
  const removeLabel = (id: string) => {
    setLabelConfigs(labelConfigs.filter((l) => l.id !== id));
  };

  // Get model options for provider
  const getModelOptions = (provider: LLMProvider) => {
    return AVAILABLE_MODELS[provider].map((model) => ({
      value: model,
      label: model,
    }));
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Settings"
        description="Configure your evaluation platform"
        actions={
          <Button onClick={saveSettings} leftIcon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />

      <motion.div variants={container} initial="hidden" animate="show">
        <Tabs defaultValue="data" className="space-y-6">
          <TabsList>
            <TabsTrigger value="data">
              <Database className="w-4 h-4 mr-1.5" />
              Data
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="w-4 h-4 mr-1.5" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="model">
              <Cpu className="w-4 h-4 mr-1.5" />
              Default Model
            </TabsTrigger>
            <TabsTrigger value="labels">
              <Tags className="w-4 h-4 mr-1.5" />
              Labels
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="w-4 h-4 mr-1.5" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Data Management */}
          <TabsContent value="data">
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Demo Data</CardTitle>
                  <CardDescription>
                    Load sample data to explore the platform's features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-br from-primary-50 to-violet-100 rounded-xl p-6 border border-primary-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Download className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Load Demo Data
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Populate the platform with realistic sample data including:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 mb-4">
                          <li>• 5 Agent Skills (React, API, Database, Testing, Auth)</li>
                          <li>• 10+ Test Scenarios with assertions</li>
                          <li>• 15+ Evaluation runs with mixed results</li>
                          <li>• AI-generated failure analyses</li>
                          <li>• Built-in and custom agents</li>
                        </ul>
                        <Button
                          onClick={() => {
                            useStore.getState().loadDemoData();
                            setSaved(true);
                            setTimeout(() => setSaved(false), 2000);
                          }}
                          leftIcon={<Download className="w-4 h-4" />}
                        >
                          Load Demo Data
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Data Management
                    </h4>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                            useStore.getState().clearAllData();
                          }
                        }}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Clear All Data
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const state = useStore.getState();
                          const data = {
                            skills: state.skills,
                            testScenarios: state.testScenarios,
                            agents: state.agents,
                            evalRuns: state.evalRuns,
                          };
                          const blob = new Blob([JSON.stringify(data, null, 2)], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "evalforge-data.json";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        leftIcon={<Upload className="w-4 h-4" />}
                      >
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api">
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Configure API keys for different LLM providers. Keys are stored locally.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning-700">
                        Mock Mode Active
                      </p>
                      <p className="text-sm text-warning-600 mt-1">
                        This demo uses mock LLM responses. API keys are not required and will
                        not be sent to any external service.
                      </p>
                    </div>
                  </div>

                  {providerOptions.map((provider) => (
                    <div key={provider.value}>
                      <Input
                        label={provider.label}
                        type="password"
                        placeholder={`Enter ${provider.label} API key...`}
                        value={apiKeys[provider.value]}
                        onChange={(e) =>
                          setApiKeys({ ...apiKeys, [provider.value]: e.target.value })
                        }
                        hint="API keys are stored locally in your browser"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Default Model */}
          <TabsContent value="model">
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Default Model Configuration</CardTitle>
                  <CardDescription>
                    Set the default model settings for new skills and evaluations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Default Provider"
                      value={defaultModel.provider}
                      onChange={(e) =>
                        setDefaultModel({
                          ...defaultModel,
                          provider: e.target.value as LLMProvider,
                          model: AVAILABLE_MODELS[e.target.value as LLMProvider][0],
                        })
                      }
                      options={providerOptions}
                    />
                    <Select
                      label="Default Model"
                      value={defaultModel.model}
                      onChange={(e) =>
                        setDefaultModel({ ...defaultModel, model: e.target.value })
                      }
                      options={getModelOptions(defaultModel.provider)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Default Temperature"
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={defaultModel.temperature}
                      onChange={(e) =>
                        setDefaultModel({
                          ...defaultModel,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                    />
                    <Input
                      label="Default Max Tokens"
                      type="number"
                      min={1}
                      max={32000}
                      value={defaultModel.maxTokens}
                      onChange={(e) =>
                        setDefaultModel({
                          ...defaultModel,
                          maxTokens: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Labels */}
          <TabsContent value="labels">
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Label Configuration</CardTitle>
                  <CardDescription>
                    Customize the labels available for human-in-the-loop labeling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Existing Labels */}
                  <div className="space-y-2">
                    {labelConfigs.map((label, index) => (
                      <div
                        key={label.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="w-8 text-center text-sm font-medium text-gray-400">
                          {index + 1}
                        </span>
                        <Badge
                          variant={label.color as any}
                          className="min-w-[100px] justify-center"
                        >
                          {label.name}
                        </Badge>
                        <span className="flex-1 text-sm text-gray-500">
                          ID: {label.id}
                        </span>
                        <kbd className="px-2 py-0.5 text-xs font-mono bg-white border border-gray-200 rounded">
                          {label.shortcut}
                        </kbd>
                        <button
                          onClick={() => removeLabel(label.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Label */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Add New Label
                    </h4>
                    <div className="flex items-end gap-3">
                      <Input
                        label="Label Name"
                        placeholder="e.g., Needs Improvement"
                        value={newLabel.name}
                        onChange={(e) =>
                          setNewLabel({ ...newLabel, name: e.target.value })
                        }
                      />
                      <Select
                        label="Color"
                        value={newLabel.color}
                        onChange={(e) =>
                          setNewLabel({ ...newLabel, color: e.target.value })
                        }
                        options={colorOptions}
                      />
                      <Input
                        label="Shortcut"
                        placeholder="Key"
                        className="w-20"
                        value={newLabel.shortcut}
                        onChange={(e) =>
                          setNewLabel({ ...newLabel, shortcut: e.target.value })
                        }
                      />
                      <Button onClick={addLabel} disabled={!newLabel.name}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance">
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Theme
                      </label>
                      <div className="flex gap-3">
                        {[
                          { value: "light", label: "Light", icon: "☀️" },
                          { value: "dark", label: "Dark", icon: "🌙" },
                          { value: "system", label: "System", icon: "💻" },
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() =>
                              updateSettings({ theme: theme.value as "light" | "dark" | "system" })
                            }
                            className={cn(
                              "flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors",
                              settings.theme === theme.value
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <span className="text-xl">{theme.icon}</span>
                            <span className="text-sm font-medium">{theme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Note: Dark mode is coming soon. Currently only light theme is available.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
