import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type FontSize = 'normal' | 'large' | 'xl';

interface AccessibilityState {
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'hci-accessibility-preferences';

const fontSizeOrder: FontSize[] = ['normal', 'large', 'xl'];

function getInitialState(): AccessibilityState {
  if (typeof window === 'undefined') {
    return { fontSize: 'normal', highContrast: false, reduceMotion: false };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load accessibility preferences:', e);
  }

  // Check system preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    fontSize: 'normal',
    highContrast: false,
    reduceMotion: prefersReducedMotion,
  };
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(getInitialState);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save accessibility preferences:', e);
    }
  }, [state]);

  // Apply classes to document
  useEffect(() => {
    const html = document.documentElement;

    // Font size
    html.classList.remove('font-size-normal', 'font-size-large', 'font-size-xl');
    html.classList.add(`font-size-${state.fontSize}`);

    // High contrast
    html.classList.toggle('high-contrast', state.highContrast);

    // Reduce motion
    html.classList.toggle('reduce-motion', state.reduceMotion);
  }, [state]);

  const setFontSize = (size: FontSize) => {
    setState(prev => ({ ...prev, fontSize: size }));
  };

  const toggleHighContrast = () => {
    setState(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleReduceMotion = () => {
    setState(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  };

  const increaseFontSize = () => {
    setState(prev => {
      const currentIndex = fontSizeOrder.indexOf(prev.fontSize);
      const nextIndex = Math.min(currentIndex + 1, fontSizeOrder.length - 1);
      return { ...prev, fontSize: fontSizeOrder[nextIndex] };
    });
  };

  const decreaseFontSize = () => {
    setState(prev => {
      const currentIndex = fontSizeOrder.indexOf(prev.fontSize);
      const nextIndex = Math.max(currentIndex - 1, 0);
      return { ...prev, fontSize: fontSizeOrder[nextIndex] };
    });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        ...state,
        setFontSize,
        toggleHighContrast,
        toggleReduceMotion,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
