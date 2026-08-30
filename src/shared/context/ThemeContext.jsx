import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  accentColor: 'violet',
  setAccentColor: () => {},
  density: 'comfortable',
  setDensity: () => {},
  fontSize: 'medium',
  setFontSize: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('aicto-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      const domTheme = document.documentElement.getAttribute('data-theme');
      if (domTheme === 'light' || domTheme === 'dark') return domTheme;
    } catch {
      // ignore localStorage errors
    }
    return 'light';
  });

  const [accentColor, setAccentColorState] = useState(() => {
    try {
      return localStorage.getItem('aicto-accent') || document.documentElement.getAttribute('data-accent') || 'violet';
    } catch {
      return 'violet';
    }
  });

  const [density, setDensityState] = useState(() => {
    try {
      return localStorage.getItem('aicto-density') || document.documentElement.getAttribute('data-density') || 'comfortable';
    } catch {
      return 'comfortable';
    }
  });

  const [fontSize, setFontSizeState] = useState(() => {
    try {
      return localStorage.getItem('aicto-font-size') || document.documentElement.getAttribute('data-font-size') || 'medium';
    } catch {
      return 'medium';
    }
  });

  // Synchronize DOM attributes with current state
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
    }
    try {
      localStorage.setItem('aicto-theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    try {
      localStorage.setItem('aicto-accent', accentColor);
    } catch {}
  }, [accentColor]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    try {
      localStorage.setItem('aicto-density', density);
    } catch {}
  }, [density]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    try {
      localStorage.setItem('aicto-font-size', fontSize);
    } catch {}
  }, [fontSize]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setAccentColor = (newAccent) => {
    setAccentColorState(newAccent);
  };

  const setDensity = (newDensity) => {
    setDensityState(newDensity);
  };

  const setFontSize = (newSize) => {
    setFontSizeState(newSize);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor,
        density,
        setDensity,
        fontSize,
        setFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
