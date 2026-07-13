import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'electric';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    let initialTheme: Theme = 'light';
    
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }
    
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'electric');
    document.body.classList.remove('bg-blueprint', 'bg-blueprint-dark', 'bg-blueprint-electric');

    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('bg-blueprint-dark');
    } else if (theme === 'electric') {
      root.classList.add('electric', 'dark'); // Electric is fundamentally dark
      document.body.classList.add('bg-blueprint-electric');
    } else {
      document.body.classList.add('bg-blueprint');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'electric' : 'light'));
  };

  const setThemeMode = (mode: Theme) => setTheme(mode);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
