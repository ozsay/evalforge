import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileCode2,
  TestTube2,
  FolderKanban,
  Layers,
  Bot,
  MessageSquare,
  Play,
  Sparkles,
  BarChart3,
  Tags,
  Settings,
  Zap,
  ChevronDown,
} from "lucide-react";
import { cn } from "@lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    to: "/target-groups",
    label: "Target Groups",
    icon: Layers,
    children: [
      { to: "/skills", label: "Agent Skills", icon: FileCode2 },
      { to: "/agents", label: "Coding Agents", icon: Bot },
      { to: "/prompt-agents", label: "Prompt Agents", icon: MessageSquare },
    ],
  },
  { to: "/scenarios", label: "Test Scenarios", icon: TestTube2 },
  { to: "/suites", label: "Test Suites", icon: FolderKanban },
  { to: "/evaluation", label: "Evaluation", icon: Play },
  { to: "/self-improving", label: "Self-Improving", icon: Sparkles },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/labeling", label: "Labeling", icon: Tags },
];

const bottomItems: NavItem[] = [{ to: "/settings", label: "Settings", icon: Settings }];

export function Sidebar() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["/target-groups"]);

  const toggleGroup = (to: string) => {
    setExpandedGroups((prev) =>
      prev.includes(to) ? prev.filter((g) => g !== to) : [...prev, to]
    );
  };

  const isPathActive = (path: string, item: NavItem): boolean => {
    if (location.pathname === path) return true;
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return true;
    // Check if any children are active
    if (item.children) {
      return item.children.some(
        (child) =>
          location.pathname === child.to ||
          (child.to !== "/dashboard" && location.pathname.startsWith(child.to))
      );
    }
    return false;
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.to);
    const isActive = isPathActive(item.to, item);
    const isChildActive =
      hasChildren &&
      item.children!.some(
        (child) =>
          location.pathname === child.to ||
          (child.to !== "/dashboard" && location.pathname.startsWith(child.to))
      );

    if (hasChildren) {
      return (
        <li key={item.to}>
          {/* Parent with children - can be clicked to navigate AND expand */}
          <div className="space-y-1">
            <div className="flex items-center">
              <NavLink
                to={item.to}
                className={cn(
                  "relative flex-1 flex items-center gap-3 px-3 py-2.5 rounded-l-lg text-sm font-medium transition-colors",
                  isActive && !isChildActive
                    ? "text-primary-700 bg-primary-50"
                    : isChildActive
                    ? "text-primary-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
              <button
                onClick={() => toggleGroup(item.to)}
                className={cn(
                  "p-2.5 rounded-r-lg transition-colors",
                  isActive || isChildActive
                    ? "text-primary-600 bg-primary-50 hover:bg-primary-100"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>
            </div>

            {/* Children */}
            <AnimatePresence>
              {isExpanded && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-4 pl-4 border-l border-gray-200 space-y-1"
                >
                  {item.children!.map((child) => renderNavItem(child, true))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </li>
      );
    }

    // Regular nav item (no children)
    const itemIsActive =
      location.pathname === item.to ||
      (item.to !== "/dashboard" && location.pathname.startsWith(item.to));

    return (
      <li key={item.to}>
        <NavLink
          to={item.to}
          className={cn(
            "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            itemIsActive
              ? "text-primary-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            isChild && "text-sm py-2"
          )}
        >
          {itemIsActive && !isChild && (
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
          {itemIsActive && isChild && (
            <motion.div
              layoutId="sidebar-child-active"
              className="absolute inset-0 bg-primary-50/50 rounded-lg"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            />
          )}
          <item.icon className={cn("relative z-10", isChild ? "w-4 h-4" : "w-5 h-5")} />
          <span className="relative z-10">{item.label}</span>
        </NavLink>
      </li>
    );
  };

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
        <ul className="space-y-1">{navItems.map((item) => renderNavItem(item))}</ul>
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
