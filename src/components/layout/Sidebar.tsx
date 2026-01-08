import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileCode2,
  TestTube2,
  FolderKanban,
  Bot,
  Play,
  BarChart3,
  Tags,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/skills", label: "Agent Skills", icon: FileCode2 },
  { to: "/scenarios", label: "Test Scenarios", icon: TestTube2 },
  { to: "/suites", label: "Test Suites", icon: FolderKanban },
  { to: "/agents", label: "Coding Agents", icon: Bot },
  { to: "/evaluation", label: "Evaluation", icon: Play },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/labeling", label: "Labeling", icon: Tags },
];

const bottomItems = [{ to: "/settings", label: "Settings", icon: Settings }];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md shadow-violet-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            EvalForge
          </h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider -mt-0.5">
            Skills Testing
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-primary-50 rounded-lg border border-primary-100"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon className="relative z-10 w-5 h-5" />
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-gray-100">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary-700 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
