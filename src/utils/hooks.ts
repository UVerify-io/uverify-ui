import {
  useState,
  RefObject,
  useMemo,
  useSyncExternalStore,
  createContext,
  useContext,
} from 'react';
import {
  FingerprintStyle,
  IdentityCardStyle,
  MetadataViewerStyle,
  PaginationStyle,
} from '../templates/defaultStyles';

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

export function useDimensions(ref: RefObject<HTMLElement>) {
  const dimensions = useSyncExternalStore(subscribe, () =>
    JSON.stringify({
      width: ref.current?.offsetWidth ?? 0,
      height: ref.current?.offsetHeight ?? 0,
    })
  );
  return useMemo(() => JSON.parse(dimensions), [dimensions]);
}

export type Shades =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

export type Colors = {
  ice: Partial<{
    [key in Shades]: string;
  }>;
  green: Partial<{
    [key in Shades]: string;
  }>;
  cyan?: Partial<{ [key in Shades]: string }>;
};

export type Components = Partial<{
  pagination: PaginationStyle;
  identityCard: IdentityCardStyle;
  metadataViewer: MetadataViewerStyle;
  fingerprint: FingerprintStyle;
}>;

export type ThemeSettings = {
  background: string;
  colors: Colors;
  components: Components;
};

export type ThemeContextType = {
  background: string;
  setBackground: (update: string) => void;
  restoreDefaults: () => void;
  applyTheme: (theme: Partial<ThemeSettings>) => void;
  colors: Colors;
  setColors: (update: Colors) => void;
  components: Components;
  setComponents: (update: Components) => void;
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
