import Tag from '../components/Tag';

type NetworkType = 'mainnet' | 'preprod' | 'preview';

export const getCardanoNetwork = (): NetworkType => {
  let network = import.meta.env.VITE_CARDANO_NETWORK;
  if (typeof network === 'undefined') {
    console.log(
      `Environment variable CARDANO_NETWORK missing. Falling back to mainnet.`
    );
    return 'mainnet';
  }

  network = network.toLowerCase();
  if (['preprod', 'preview', 'mainnet'].includes(network)) {
    return network;
  } else {
    console.log(
      `Invalid CARDANO_NETWORK: ${network}. Falling back to mainnet.`
    );
    return 'mainnet';
  }
};

export const getCardanoNetworkIndicator = (
  size?: 'sm' | 'md',
  className?: string
) => {
  const network = getCardanoNetwork();

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
