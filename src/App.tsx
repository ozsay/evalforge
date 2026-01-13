import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "@components/layout/AppLayout";
import { TenantProvider } from "@lib/context";
import { ProjectsPage } from "@pages/ProjectsPage";
import { Dashboard } from "@pages/Dashboard";
import { SkillsPage } from "@pages/SkillsPage";
import { TestScenariosPage } from "@pages/TestScenariosPage";
import { TestSuitesPage } from "@pages/TestSuitesPage";
import { TargetGroupsPage } from "@pages/TargetGroupsPage";
import { AgentsPage } from "@pages/AgentsPage";
import { PromptAgentsPage } from "@pages/PromptAgentsPage";
import { EvaluationPage } from "@pages/EvaluationPage";
import { SelfImprovingPage } from "@pages/SelfImprovingPage";
import { ResultsPage } from "@pages/ResultsPage";
import { LabelingPage } from "@pages/LabelingPage";
import { SettingsPage } from "@pages/SettingsPage";

/**
 * Project-scoped routes wrapped with TenantProvider
 * All routes here require a valid projectId in the URL
 */
function ProjectRoutes() {
  return (
    <TenantProvider>
      <AppLayout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="scenarios" element={<TestScenariosPage />} />
            <Route path="suites" element={<TestSuitesPage />} />
            <Route path="target-groups" element={<TargetGroupsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="prompt-agents" element={<PromptAgentsPage />} />
            <Route path="evaluation" element={<EvaluationPage />} />
            <Route path="self-improving" element={<SelfImprovingPage />} />
            <Route path="self-improving/:runId" element={<SelfImprovingPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="labeling" element={<LabelingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Default redirect within project */}
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </AppLayout>
    </TenantProvider>
  );
}

function App() {
  return (
    <Routes>
      {/* Project selector (no tenant context needed) */}
      <Route path="/projects" element={<ProjectsPage />} />
      
      {/* Project-scoped routes */}
      <Route path="/:projectId/*" element={<ProjectRoutes />} />
      
      {/* Root redirects to projects selector */}
      <Route path="/" element={<Navigate to="/projects" replace />} />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default App;
