import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

interface DarkModeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('neurowiki-dark-mode');
    if (saved !== null) {
      const isDarkMode = saved === 'true';
      // Apply immediately on mount
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return isDarkMode;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return prefersDark;
  });

  // Use ref to track current value for immediate DOM updates
  const isDarkRef = useRef(isDark);
  
  // Keep ref in sync with state
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('neurowiki-dark-mode', String(isDark));
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    console.log('toggleDarkMode called in context. Current isDark:', isDarkRef.current);
    setIsDark(prev => {
      const newValue = !prev;
      console.log('Setting new value:', newValue);
      // Immediately update the DOM for instant feedback
      const root = document.documentElement;
      const classesBefore = Array.from(root.classList).join(' ');
      console.log('HTML element classes before:', classesBefore || '(empty)');
      if (newValue) {
        root.classList.add('dark');
        const classesAfter = Array.from(root.classList).join(' ');
        console.log('Added dark class. Classes after:', classesAfter || '(empty)');
        console.log('Has dark class?', root.classList.contains('dark'));
      } else {
        root.classList.remove('dark');
        const classesAfter = Array.from(root.classList).join(' ');
        console.log('Removed dark class. Classes after:', classesAfter || '(empty)');
        console.log('Has dark class?', root.classList.contains('dark'));
      }
      localStorage.setItem('neurowiki-dark-mode', String(newValue));
      console.log('Updated localStorage to:', newValue);
      // Update ref immediately
      isDarkRef.current = newValue;
      return newValue;
    });
  }, []);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
}
