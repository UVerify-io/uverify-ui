import { createContext, useContext, useEffect, useState } from 'react';

export type UVerifyConfig = {
  backendUrl: string;
  cardanoNetwork: string;
  serviceAccount: string;
};

const UVerifyConfigContext = createContext<UVerifyConfig | null>(null);
const mainnetServiceAccount =
  'addr1qxqup4lcghajeawjx3faccuewk2k3ztneps8segrcn28ky223ul5q54jq72wps946c5gw8z5mfjhqa9r8znzk4vd4sls8jqsva';
const testnetServiceAccount =
  'addr_test1vzfw9tj3lvpae32ugu2sdl34hhk6m8pxdvxsns4ch37tg3gn2jpfu';

export const UVerifyConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const defaultConfig: UVerifyConfig = {
    backendUrl: 'https://api.uverify.io',
    cardanoNetwork: 'mainnet',
    serviceAccount: mainnetServiceAccount,
  };

  const [config, setConfig] = useState<UVerifyConfig>(defaultConfig);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch config.json: ${response.status}`);
        }
        const data: UVerifyConfig = await response.json();

        if (
          data.cardanoNetwork !== 'mainnet' ||
          data.backendUrl !== 'https://api.uverify.io'
        ) {
          setConfig({
            ...data,
            serviceAccount:
              data.cardanoNetwork.toLowerCase() === 'mainnet'
                ? mainnetServiceAccount
                : testnetServiceAccount,
          });
        }
      } catch (err) {
        console.error('Error fetching config.json using default config:', err);
      }
    };

    fetchConfig();
  }, []);

  return (
    <UVerifyConfigContext.Provider value={config}>
      {children}
    </UVerifyConfigContext.Provider>
  );
};

export const useUVerifyConfig = () => {
  const config = useContext(UVerifyConfigContext);
  if (!config) {
    throw new Error(
      'useUVerifyConfig must be used within a UVerifyConfigProvider'
    );
  }
  return config;
};
