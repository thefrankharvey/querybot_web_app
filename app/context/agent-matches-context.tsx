import React, { createContext, useContext, useState, useEffect } from "react";

const MatchesContext = createContext<any>(null);

export function MatchesProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("agent_matches");
    if (stored) setMatches(JSON.parse(stored));
  }, []);

  const saveMatches = (data: any[]) => {
    setMatches(data);
    localStorage.setItem("agent_matches", JSON.stringify(data));
  };

  return (
    <MatchesContext.Provider value={{ matches, saveMatches }}>
      {children}
    </MatchesContext.Provider>
  );
}

export function useAgentMatches() {
  return useContext(MatchesContext);
}
