import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextValue {
  isDayMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDayMode: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDayMode, setIsDayMode] = useState(() => {
    try {
      return localStorage.getItem("v7-theme") === "day";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("v7-theme", isDayMode ? "day" : "night");
    if (isDayMode) {
      document.documentElement.classList.add("day-mode");
    } else {
      document.documentElement.classList.remove("day-mode");
    }
  }, [isDayMode]);

  function toggleTheme() {
    setIsDayMode((prev) => !prev);
  }

  return (
    <ThemeContext.Provider value={{ isDayMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
