import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "@components/layout/AppLayout";
import { Dashboard } from "@pages/Dashboard";
import { SkillsPage } from "@pages/SkillsPage";
import { TestScenariosPage } from "@pages/TestScenariosPage";
import { TestSuitesPage } from "@pages/TestSuitesPage";
import { AgentsPage } from "@pages/AgentsPage";
import { EvaluationPage } from "@pages/EvaluationPage";
import { ResultsPage } from "@pages/ResultsPage";
import { LabelingPage } from "@pages/LabelingPage";
import { SettingsPage } from "@pages/SettingsPage";

function App() {
  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/scenarios" element={<TestScenariosPage />} />
          <Route path="/suites" element={<TestSuitesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/labeling" element={<LabelingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AnimatePresence>
    </AppLayout>
  );
}

export default App;
