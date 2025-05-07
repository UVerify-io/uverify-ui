import {
  useState,
  useEffect,
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

export type UVerifyConfig = {
  backendUrl: string;
  cardanoNetwork: string;
  serviceAccount: string;
};

const mainnetServiceAccount =
  'addr1qxqup4lcghajeawjx3faccuewk2k3ztneps8segrcn28ky223ul5q54jq72wps946c5gw8z5mfjhqa9r8znzk4vd4sls8jqsva';
const testnetServiceAccount =
  'addr_test1vzfw9tj3lvpae32ugu2sdl34hhk6m8pxdvxsns4ch37tg3gn2jpfu';

export const useUVerifyConfig = () => {
  const [config, setConfig] = useState<UVerifyConfig>({
    backendUrl: 'https://api.uvify.io',
    cardanoNetwork: 'mainnet',
    serviceAccount: mainnetServiceAccount,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch config.json: ${response.status}`);
        }
        const data: UVerifyConfig = await response.json();
        setConfig({
          ...data,
          serviceAccount:
            data.cardanoNetwork.toLowerCase() === 'mainnet'
              ? mainnetServiceAccount
              : testnetServiceAccount,
        });
      } catch (err) {
        console.error('Error fetching config.json using default config:', err);
      }
    };

    fetchConfig();
  }, []);

  return config;
};

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
  ice?: Partial<{
    [key in Shades]: string;
  }>;
  green?: Partial<{
    [key in Shades]: string;
  }>;
  cyan?: Partial<{ [key in Shades]: string }>;
  red?: Partial<{ [key in Shades]: string }>;
  blue?: Partial<{ [key in Shades]: string }>;
  pink?: Partial<{ [key in Shades]: string }>;
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
  footer: {
    hide: boolean;
  };
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
