import { Colors, Components, ThemeSettings } from '@uverify/core';
import {
  useState,
  RefObject,
  useMemo,
  useSyncExternalStore,
  createContext,
  useContext,
} from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });
  const setValue = (value: T) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

function subscribe(callback: (e: Event) => void) {
  window.addEventListener('resize', callback);
  return () => {
    window.removeEventListener('resize', callback);
  };
}

export function useDimensions(ref: RefObject<HTMLElement | null>) {
  const dimensions = useSyncExternalStore(subscribe, () =>
    JSON.stringify({
      width: ref?.current?.offsetWidth ?? 0,
      height: ref?.current?.offsetHeight ?? 0,
    })
  );
  return useMemo(() => JSON.parse(dimensions), [dimensions]);
}

export type ThemeContextType = {
  background: string;
  setBackground: (update: string) => void;
  restoreDefaults: () => void;
  applyTheme: (theme: Partial<ThemeSettings>) => void;
  colors: Colors;
  setColors: (update: Colors) => void;
  components: Components;
  setComponents: (update: Components) => void;
  hideFooter: boolean;
  setHideFooter: (update: boolean) => void;
};

export const UVerifyThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType
);

export const useUVerifyTheme = () => {
  const context = useContext(UVerifyThemeContext);
  if (!context) {
    throw new Error(
      'useUVerifyTheme must be used within a UVerifyThemeProvider'
    );
  }
  return context;
};
