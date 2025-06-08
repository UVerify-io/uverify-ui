import { ReactNode, useState } from 'react';
import { UVerifyThemeContext } from './hooks';
import {
  defaultFingerprintStyle,
  defaultIdentityCardStyle,
  defaultMetadataViewerStyle,
  defaultPaginationStyle,
} from '../templates/defaultStyles';
import { ThemeSettings, Colors, Shades } from '@uverify/core';

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
    pink: {
      50: '254, 241, 248',
      100: '254, 229, 243',
      200: '255, 211, 236',
      300: '255, 161, 214',
      400: '255, 102, 189',
      500: '251, 57, 167',
      600: '235, 23, 143',
      700: '205, 9, 120',
      800: '169, 11, 101',
      900: '141, 14, 86',
      950: '87, 0, 49',
    },
    red: {
      50: '255, 243, 241',
      100: '255, 229, 225',
      200: '255, 207, 199',
      300: '255, 174, 160',
      400: '255, 144, 125',
      500: '248, 87, 59',
      600: '229, 58, 29',
      700: '193, 45, 20',
      800: '160, 40, 20',
      900: '132, 40, 24',
      950: '72, 17, 7',
    },
    blue: {
      50: '239, 250, 255',
      100: '223, 243, 255',
      200: '184, 233, 255',
      300: '120, 218, 255',
      400: '83, 208, 255',
      500: '6, 176, 241',
      600: '0, 141, 206',
      700: '0, 113, 167',
      800: '2, 95, 138',
      900: '8, 79, 114',
      950: '6, 49, 75',
    },
  },
  components: {
    pagination: defaultPaginationStyle,
    identityCard: defaultIdentityCardStyle,
    metadataViewer: defaultMetadataViewerStyle,
    fingerprint: defaultFingerprintStyle,
  },
  footer: {
    hide: false,
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
  const [hideFooter, setHideFooter] = useState(false);

  const restoreDefaults = () => {
    setBackground(defaultTheme.background);
    setColors(defaultTheme.colors);
    setHideFooter(defaultTheme.footer.hide);

    for (const shade of [
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
    ] as Shades[]) {
      for (const color of [
        'ice',
        'green',
        'cyan',
        'blue',
        'pink',
        'red',
      ] as (keyof Colors)[]) {
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
      console.log('Setting background:', theme.background);
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
      if (theme.colors.blue) {
        Object.entries(theme.colors.blue).forEach(([key, value]) => {
          setCSSVariable(`--color-blue-${key}`, value);
        });
      }
      if (theme.colors.pink) {
        Object.entries(theme.colors.pink).forEach(([key, value]) => {
          setCSSVariable(`--color-pink-${key}`, value);
        });
      }
      if (theme.colors.red) {
        Object.entries(theme.colors.red).forEach(([key, value]) => {
          setCSSVariable(`--color-red-${key}`, value);
        });
      }
      setColors({ ...colors, ...theme.colors });
    }

    if (typeof theme.footer?.hide === 'boolean') {
      setHideFooter(theme.footer.hide);
    } else {
      setHideFooter(false);
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
        hideFooter,
        setHideFooter,
      }}
    >
      {children}
    </UVerifyThemeContext.Provider>
  );
};
