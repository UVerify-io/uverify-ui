import { Template, UVerifyCertificateExtraData } from '../Template';
import { UVerifyMetadata, UVerifyCertificate } from '../../common/types';
import { ThemeSettings } from '../../utils/hooks';
import { JSX, useEffect, useState } from 'react';
import { HeartIcon } from '../../components/Icons';
import {
  ConnectWalletList,
  useCardano,
} from '@cardano-foundation/cardano-connect-with-wallet';
import {
  checkIsMobile,
  NetworkType,
  UnavailableWalletVisibility,
} from '@cardano-foundation/cardano-connect-with-wallet-core';
import Modal from '../../components/Modal';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ClaimingPage from './ClaimingPage';
import { SocialHubData } from './common';
import SocialHub from './SocialHub';
import ClaimUpdateDialog from './ClaimUpdateDialog';
import videoSrc from './assets/t_shirt_spin.mp4';
import Tag from '../../components/Tag';
import LoadingIndicator from '../../components/LoadingIndicator';
import { toast } from 'react-toastify';
import { useUVerifyConfig } from '../../utils/UVerifyConfigProvider';

class SocialHubTemplate extends Template {
  public name = 'SocialHub';
  public whitelist = [
    'addr1qyleluql6elu7sktvncqfufnq675hlt9z922ah9sm45dmp7kjn0vsay0vq28379mczjmglmam3svuxyka0tyw0uchwjqmxmhg3',
    'addr_test1qqleluql6elu7sktvncqfufnq675hlt9z922ah9sm45dmp7kjn0vsay0vq28379mczjmglmam3svuxyka0tyw0uchwjqcsxhyw',
  ];
  public theme: Partial<ThemeSettings> = {
    background:
      'bg-gradient-to-br from-neutral-900 via-indigo-950 to-neutral-800 text-zinc-200',
    colors: {
      pink: {
        50: '252, 243, 248',
        100: '251, 232, 244',
        200: '248, 210, 233',
        300: '244, 173, 214',
        400: '236, 122, 185',
        500: '226, 82, 157',
        600: '209, 49, 125',
        700: '177, 33, 97',
        800: '149, 31, 82',
        900: '125, 30, 71',
        950: '76, 11, 39',
      },
    },
    footer: {
      hide: true,
    },
  };

  public layoutMetadata = {
    batch_ids: 'Connected batch IDs, separated by commas',
    whitelabel: 'A label for subtle UI template changes',
  };

  public render(
    _hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData
  ): JSX.Element {
    const config = useUVerifyConfig();
    const networkType =
      config.cardanoNetwork === 'mainnet'
        ? NetworkType.MAINNET
        : NetworkType.TESTNET;
    const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
    const [isClaimUpdateItemDialogOpen, setIsClaimUpdateItemDialogOpen] =
      useState(false);
    const [socialHubData, setSocialHubData] = useState<SocialHubData>();
    const [claimed, setClaimed] = useState(false);
    const [owner, setOwner] = useState('');
    const [password, setPassword] = useState('');
    const [searchParams, _setSearchParams] = useSearchParams();
    const {
      isConnected,
      disconnect,
      usedAddresses,
      unusedAddresses,
      enabledWallet,
    } = useCardano({
      limitNetwork: networkType,
    });
    const [isLoading, setIsLoading] = useState(true);
    const userAddress =
      usedAddresses.length > 0 ? usedAddresses[0] : unusedAddresses[0];

    useEffect(() => {
      async function fetchSocialHub() {
        let item = searchParams.get('item');
        if (item) {
          try {
            const response = await axios.get(
              config.backendUrl +
                '/api/v1/extension/connected-goods/' +
                metadata.batch_ids +
                '/' +
                item
            );

            setPassword(item);
            setOwner(response.data.owner || '');
            setSocialHubData({
              ada_handle: response.data.ada_handle,
              email: response.data.email,
              github: response.data.github,
              name: response.data.name,
              picture: response.data.picture,
              subtitle: response.data.subtitle,
              x: response.data.x,
              telegram: response.data.telegram,
              instagram: response.data.instagram,
              discord: response.data.discord,
              reddit: response.data.reddit,
              youtube: response.data.youtube,
              linkedin: response.data.linkedin,
              website: response.data.website,
              itemName: response.data.item_name,
            });

            if (response.data.owner) {
              setClaimed(true);
            }
          } catch (error) {
            console.error('Error fetching socialHub data:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
      fetchSocialHub();
    }, [config]);

    const connectButton = isConnected ? (
      <div
        onClick={disconnect}
        className="m-2 text-pink-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-pink-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
      >
        <p className="ml-2 text-xs font-bold">Disconnect Wallet</p>
      </div>
    ) : claimed ? (
      <p className="text-white text-sm text-center mt-8">
        If you own this item, you can{' '}
        <span
          className="text-cyan-400 cursor-pointer hover:underline"
          onClick={() => setIsWalletDialogOpen(true)}
        >
          connect your wallet
        </span>{' '}
        to update the social hub.
      </p>
    ) : (
      <div
        onClick={() => setIsWalletDialogOpen(true)}
        className="mt-8 text-blue-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-blue-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
      >
        <p className="ml-2 text-xs font-bold">Connect Wallet</p>
      </div>
    );

    const renderUserOptions = () => {
      if (isConnected) {
        if (
          ![...usedAddresses, ...unusedAddresses].includes(owner) &&
          claimed
        ) {
          return (
            <p className="text-white text-sm text-center mt-8 mb-4">
              You are not the owner of this item.
            </p>
          );
        }
        return (
          <div
            onClick={() => {
              setIsClaimUpdateItemDialogOpen(true);
            }}
            className="mt-8 text-blue-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-blue-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
          >
            <p className="ml-2 text-xs font-bold">
              {claimed ? 'Update Social Hub' : 'Claim Shirt'}
            </p>
          </div>
        );
      }
      return null;
    };

    const mobileInfo = (
      <div className="sm:w-3/4 max-w-[600px] my-4 bg-blue-50 border-l-4 border-blue-500 text-blue-300 bg-blue-700 p-4 rounded-md shadow-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium">Mobile Access Instructions</h3>
            <p className="mt-2 text-sm">
              If you are on a mobile device, tap this copy icon{' '}
              <span className="inline-flex items-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('URL copied to clipboard');
                  }}
                  className="hover:bg-blue-600 rounded-full transition-colors duration-200"
                  title="Copy URL"
                >
                  <svg
                    className="h-4 w-4 text-blue-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </span>{' '}
              to copy the URL, then open one of the supported wallets listed
              above and paste the URL into the wallet's in-app dApp browser.
            </p>
          </div>
        </div>
      </div>
    );

    const footer = (
      <footer className="flex flex-col items-center p-1 text-white mt-4 mb-2">
        <div className="flex items-center justify-center mt-2 text-xs">
          Created with <HeartIcon className="mx-1" />
          by
          <a
            className="flex items-center justify-center mx-1 text-green-200"
            href="https://cardanofoundation.org/"
          >
            Cardano Foundation
          </a>
          x
          <a
            className="flex items-center justify-center mx-1 text-pink-200"
            href="https://app.uverify.io/"
          >
            UVerify
          </a>
        </div>
      </footer>
    );

    if (socialHubData?.itemName === undefined) {
      if (!searchParams.get('item')) {
        return (
          <div className="min-h-screen text-white w-full flex flex-col justify-center items-center">
            <div className="grow" />
            <p className="text-lg font-bold mt-4 w-3/4 text-center">
              This is a valid UVerify certificate, but it uses the Social Hub
              template, which needs a connected item included in your URL.
              Please make sure your URL ends with ?item=ITEM_ID. Try scanning
              the QR code again, or ask the sender to resend the correct link.
            </p>
            <div className="grow" />
            {footer}
          </div>
        );
      }

      if (isLoading) {
        return <LoadingIndicator />;
      }

      return (
        <div className="min-h-screen text-white w-full flex flex-col justify-center items-center">
          <div className="grow" />
          <p className="text-lg font-bold mt-4 w-3/4 text-center">
            This item is not part of the batch or is unrecognized. Please scan
            the QR code again or ask the sender to resend the link.
          </p>
          <div className="grow" />
          {footer}
        </div>
      );
    }

    return (
      <div className="min-h-screen text-white w-full flex flex-col justify-center items-center">
        <div className="flex flex-row items-center justify-center mt-8">
          <h1 className="text-2xl font-bold mr-2">{socialHubData.itemName}</h1>
          <Tag label={'#' + metadata.whitelabel} color="cyan" size="sm" />
        </div>
        <video
          className="w-1/2 h-auto rounded-xl mt-4 max-w-[320px] border-2 border-white/60 shadow-center shadow-white/20"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
        />
        {claimed ? (
          <SocialHub socialHubData={socialHubData} certificate={certificate} />
        ) : (
          <ClaimingPage />
        )}
        <div className="w-full flex flex-col items-center justify-center">
          {isConnected && renderUserOptions()}
          {connectButton}
        </div>

        <ClaimUpdateDialog
          open={isClaimUpdateItemDialogOpen}
          onClose={() => setIsClaimUpdateItemDialogOpen(false)}
          variant={claimed ? 'update' : 'claim'}
          password={password}
          userAddress={userAddress}
          batchId={metadata.batch_ids + ''}
          socialHubData={socialHubData}
          background={this.theme.background || ''}
          enabledWallet={enabledWallet}
        />

        <Modal
          title="Connect Wallet"
          isOpen={isWalletDialogOpen}
          background={this.theme.background}
          onClose={() => setIsWalletDialogOpen(false)}
        >
          <ConnectWalletList
            borderRadius={5}
            showUnavailableWallets={
              UnavailableWalletVisibility.SHOW_UNAVAILABLE
            }
            supportedWallets={['eternl', 'vespr', 'begin', 'yoroi', 'lace']}
            onConnect={() => setIsWalletDialogOpen(false)}
            gap={6}
            peerConnectCustomCSS={`
              color: black;
              z-index: 1000;
            `}
            customCSS={`
              min-width: 240px;
              width: 100%;
              & > span {
                color: #FFFFFFAA;
                background-color: rgb(255 255 255 / 0.2);
                border: 1px solid #FFFFFF40;
                transition-duration: 200ms;
              }
              & > span:hover {
                  background-color: rgb(255 255 255 / 0.3);
                  color: white;
                  box-shadow: 0 0 12px 0 rgb(255 255 255 / 0.1);
                }
              }
            `}
            limitNetwork={networkType}
          />
          {checkIsMobile() &&
            typeof (window as any).cardano === 'undefined' &&
            mobileInfo}
        </Modal>
        <div className="grow" />
        {footer}
      </div>
    );
  }
}

export default SocialHubTemplate;
