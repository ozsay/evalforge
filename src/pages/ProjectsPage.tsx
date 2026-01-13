import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  FolderKanban,
  ArrowRight,
  Trash2,
  Edit3,
  Calendar,
} from "lucide-react";
import { Button } from "@components/ui/Button";
import { Card, CardContent } from "@components/ui/Card";
import { Input, Textarea } from "@components/ui/Input";
import { Modal, ModalBody, ModalFooter } from "@components/ui/Modal";
import { EmptyState } from "@components/ui/EmptyState";
import { useStore, useProjects } from "@lib/store";
import type { Project } from "@lib/types";
import { formatRelativeTime, cn } from "@lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ProjectsPage() {
  const navigate = useNavigate();
  const projects = useProjects();
  const { addProject, updateProject, deleteProject } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const openCreateModal = () => {
    setName("");
    setDescription("");
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setName(project.name);
    setDescription(project.description || "");
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, { name, description });
    } else {
      const project = addProject({ name, description });
      // Navigate to the new project
      navigate(`/${project.id}/dashboard`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this project and all its data? This cannot be undone.")) {
      deleteProject(id);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/${projectId}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EvalForge</h1>
              <p className="text-gray-600 mt-1">
                Select a project to continue or create a new one
              </p>
            </div>
            <Button
              onClick={openCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
          >
            <EmptyState
              icon={<FolderKanban className="w-12 h-12" />}
              title="No projects yet"
              description="Create your first project to start evaluating AI agents"
              action={
                <Button
                  onClick={openCreateModal}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create First Project
                </Button>
              }
            />
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Card
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                        <FolderKanban className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(project);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatRelativeTime(project.createdAt)}
                      </div>
                      <div className="flex items-center gap-1 text-violet-600 font-medium text-sm group-hover:gap-2 transition-all">
                        Open
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Add Project Card */}
            <motion.div variants={itemVariants}>
              <Card
                className={cn(
                  "cursor-pointer border-2 border-dashed border-gray-300",
                  "hover:border-violet-400 hover:bg-violet-50/50 transition-all duration-200",
                  "flex items-center justify-center min-h-[200px]"
                )}
                onClick={openCreateModal}
              >
                <CardContent className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-600">New Project</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "Create Project"}
        description={
          editingProject
            ? "Update your project details"
            : "Start a new evaluation project"
        }
      >
        <ModalBody className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g., Wix Dashboard Agents"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Textarea
            label="Description (optional)"
            placeholder="Brief description of this project's purpose"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {editingProject ? "Update" : "Create"} Project
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
