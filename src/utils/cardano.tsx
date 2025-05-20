import Tag from '../components/Tag';
import { UVerifyConfig } from './UVerifyConfigProvider';

type NetworkType = 'mainnet' | 'preprod' | 'preview';

export const getCardanoNetwork = (config: UVerifyConfig): NetworkType => {
  let network = config.cardanoNetwork;
  if (typeof network === 'undefined') {
    console.log(
      `Environment variable CARDANO_NETWORK missing. Falling back to mainnet.`
    );
    return 'mainnet';
  }

  network = network.toLowerCase();
  if (['preprod', 'preview', 'mainnet'].includes(network)) {
    return network as NetworkType;
  } else {
    console.log(
      `Invalid CARDANO_NETWORK: ${network}. Falling back to mainnet.`
    );
    return 'mainnet';
  }
};

export const getCardanoNetworkIndicator = (
  config: UVerifyConfig,
  size?: 'sm' | 'md',
  className?: string
) => {
  const network = getCardanoNetwork(config);

  if (network !== 'mainnet') {
    return (
      <Tag
        size={size}
        label={network}
        color={network === 'preprod' ? 'ice' : 'cyan'}
        className={className}
      />
    );
  }
  return null;
};
