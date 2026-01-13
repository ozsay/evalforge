import { createContext, useContext, useMemo, ReactNode } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useProjectById } from "@lib/store";
import type { Project } from "@lib/types";

// ==========================================
// Tenant Context Types
// ==========================================

interface TenantContextValue {
  /** Current project ID from URL */
  projectId: string;
  /** Current project object (undefined if loading or not found) */
  project: Project | undefined;
  /** Whether the project is valid and loaded */
  isValid: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

// ==========================================
// Tenant Provider
// ==========================================

interface TenantProviderProps {
  children: ReactNode;
}

/**
 * TenantProvider reads the projectId from URL params and provides
 * tenant context to all child components.
 * 
 * If no valid project is found, redirects to the projects list.
 */
export function TenantProvider({ children }: TenantProviderProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProjectById(projectId || "");

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<TenantContextValue>(
    () => ({
      projectId: projectId || "",
      project,
      isValid: !!project,
    }),
    [projectId, project]
  );

  // If no projectId in URL or project not found, redirect to projects list
  // This is checked after hooks to follow rules of hooks
  if (!projectId || !project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

// ==========================================
// Tenant Hook
// ==========================================

/**
 * Hook to access the current tenant/project context.
 * Must be used within a TenantProvider.
 * 
 * @returns Current tenant context with projectId and project
 * @throws Error if used outside of TenantProvider
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  
  return context;
}

/**
 * Safe version of useTenant that returns null if not within a provider.
 * Useful for components that may be rendered both inside and outside tenant context.
 */
export function useTenantSafe(): TenantContextValue | null {
  return useContext(TenantContext);
}

// ==========================================
// Helper Hook for Building Tenant-Scoped URLs
// ==========================================

/**
 * Hook that returns a function to build URLs scoped to the current project.
 * 
 * @example
 * const buildUrl = useTenantUrl();
 * const dashboardUrl = buildUrl("/dashboard"); // "/proj-123/dashboard"
 */
export function useTenantUrl(): (path: string) => string {
  const { projectId } = useTenant();
  
  return (path: string) => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `/${projectId}${normalizedPath}`;
  };
}
