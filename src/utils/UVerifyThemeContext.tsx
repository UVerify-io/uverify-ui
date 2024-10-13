import { ReactNode, useState } from 'react';
import { Colors, Shades, ThemeSettings, UVerifyThemeContext } from './hooks';
import {
  defaultFingerprintStyle,
  defaultIdentityCardStyle,
  defaultMetadataViewerStyle,
  defaultPaginationStyle,
} from '../templates/defaultStyles';

const defaultTheme: ThemeSettings = {
  background: 'bg-main-gradient',
  colors: {
    ice: {
      50: '235, 254, 255',
      100: '206, 251, 255',
      200: '162, 246, 255',
      300: '99, 236, 253',
      400: '28, 217, 244',
      500: '0, 190, 220',
      600: '3, 150, 183',
      700: '10, 119, 148',
      800: '18, 96, 120',
      900: '20, 80, 101',
      950: '6, 53, 70',
    },
    green: {
      50: '235, 254, 246',
      100: '206, 253, 231',
      200: '162, 248, 211',
      300: '74, 174, 177',
      400: '45, 221, 162',
      500: '5, 196, 139',
      600: '0, 160, 114',
      700: '0, 128, 94',
      800: '0, 65, 76',
      900: '1, 53, 64',
      950: '0, 47, 37',
    },
    cyan: {
      50: '239, 255, 253',
      100: '199, 255, 251',
      200: '159, 255, 249',
      300: '80, 248, 243',
      400: '29, 227, 228',
      500: '4, 196, 200',
      600: '0, 154, 161',
      700: '5, 122, 128',
      800: '10, 95, 101',
      900: '13, 80, 84',
      950: '0, 45, 51',
    },
  },
  components: {
    pagination: defaultPaginationStyle,
    identityCard: defaultIdentityCardStyle,
    metadataViewer: defaultMetadataViewerStyle,
    fingerprint: defaultFingerprintStyle,
  },
};

type UVerifyThemeProviderProps = {
  children: ReactNode;
};

const setCSSVariable = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value);
};

export const UVerifyThemeProvider: React.FC<UVerifyThemeProviderProps> = ({
  children,
}) => {
  const [background, setBackground] = useState(defaultTheme.background);
  const [components, setComponents] = useState(defaultTheme.components);
  const [colors, setColors] = useState(defaultTheme.colors);

  const restoreDefaults = () => {
    setBackground(defaultTheme.background);
    setColors(defaultTheme.colors);

    for (const shade of Object.keys(defaultTheme.colors.ice) as Shades[]) {
      for (const color of ['ice', 'green', 'cyan'] as (keyof Colors)[]) {
        if (defaultTheme.colors[color]) {
          setCSSVariable(
            `--color-${color}-${shade}`,
            defaultTheme.colors[color][shade] || ''
          );
        }
      }
    }

    setComponents(defaultTheme.components);
  };

  const applyTheme = (theme: Partial<ThemeSettings>) => {
    if (theme.background) {
      setBackground(theme.background);
    }

    if (theme.colors) {
      if (theme.colors.ice) {
        Object.entries(theme.colors.ice).forEach(([key, value]) => {
          setCSSVariable(`--color-ice-${key}`, value);
        });
      }
      if (theme.colors.green) {
        Object.entries(theme.colors.green).forEach(([key, value]) => {
          setCSSVariable(`--color-green-${key}`, value);
        });
      }
      if (theme.colors.cyan) {
        Object.entries(theme.colors.cyan).forEach(([key, value]) => {
          setCSSVariable(`--color-cyan-${key}`, value);
        });
      }
      setColors({ ...colors, ...theme.colors });
    }

    if (theme.components) {
      setComponents({ ...components, ...theme.components });
    }
  };

  return (
    <UVerifyThemeContext.Provider
      value={{
        background,
        setBackground,
        restoreDefaults,
        applyTheme,
        colors,
        setColors,
        components,
        setComponents,
      }}
    >
      {children}
    </UVerifyThemeContext.Provider>
  );
};
