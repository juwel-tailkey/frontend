import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { activateProject, fetchActiveProject } from "../api/activeProject";
import { useAuth } from "./AuthContext";
import type { ActiveProjectSummary } from "../types";

type ActiveProjectContextValue = {
  activeProject: ActiveProjectSummary | null;
  loading: boolean;
  switchProject: (projectId: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null);

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeProject, setActiveProject] = useState<ActiveProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setActiveProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const project = await fetchActiveProject();
      setActiveProject(project);
    } catch {
      setActiveProject(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const switchProject = useCallback(async (projectId: number) => {
    const project = await activateProject(projectId);
    setActiveProject(project);
  }, []);

  const value = useMemo(
    () => ({
      activeProject,
      loading,
      switchProject,
      refresh
    }),
    [activeProject, loading, switchProject, refresh]
  );

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject(): ActiveProjectContextValue {
  const context = useContext(ActiveProjectContext);

  if (!context) {
    throw new Error("useActiveProject must be used within ActiveProjectProvider");
  }

  return context;
}
