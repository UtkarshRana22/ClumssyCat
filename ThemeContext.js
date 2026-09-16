import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getColors, getPaperTheme } from './theme';

const STORAGE_KEY = 'clumssycat-theme-mode';

const ThemeContext = createContext(null);

// Holds the light/dark mode choice from the Profile screen's toggle,
// persisted in AsyncStorage so it survives app restarts. Wrap the app in
// <ThemeProvider> once (in App.js) and read `useAppTheme()` in any screen.
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
      setLoaded(true);
    });
  }, []);

  function toggleTheme() {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: getColors(mode),
      paperTheme: getPaperTheme(mode),
      toggleTheme,
    }),
    [mode]
  );

  // Don't render with the wrong theme for a frame while AsyncStorage is
  // still being read — App.js already shows a loading spinner while fonts
  // and the initial route resolve, so this just piggybacks on that gap.
  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme() must be used inside a <ThemeProvider>');
  }
  return ctx;
}
