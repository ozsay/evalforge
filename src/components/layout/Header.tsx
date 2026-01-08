import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Command } from "lucide-react";
import { cn } from "@lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left side - Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>

        {/* Right side - Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <motion.div
              animate={{ width: isSearchFocused ? 320 : 240 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "w-full h-9 pl-9 pr-12 rounded-lg text-sm bg-gray-50 border transition-colors",
                  isSearchFocused
                    ? "border-primary-300 bg-white ring-2 ring-primary-100"
                    : "border-gray-200 hover:border-gray-300"
                )}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
                <Command className="w-3 h-3" />K
              </kbd>
            </motion.div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
          </button>

          {/* Divider */}
          {actions && <div className="w-px h-8 bg-gray-200" />}

          {/* Page actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}

// Page header component for consistent styling
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300">/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title & Actions */}
      <div className="flex items-start justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 mt-1"
            >
              {description}
            </motion.p>
          )}
        </div>
        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
}

