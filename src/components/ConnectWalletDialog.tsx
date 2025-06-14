import { ConnectWalletList } from '@cardano-foundation/cardano-connect-with-wallet';
import Modal from './Modal';
import {
  capitalize,
  checkIsMobile,
  NetworkType,
  UnavailableWalletVisibility,
} from '@cardano-foundation/cardano-connect-with-wallet-core';
import { toast } from 'react-toastify';
import AccordionInfo from './AccordionInfo';
import { InfoIcon } from './Icons';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';

interface ConnectWalletDialogProps {
  isWalletDialogOpen: boolean;
  setIsWalletDialogOpen: (isOpen: boolean) => void;
  networkType: NetworkType;
  background?: string;
  customWalletExplainer?: string;
}

export function ConnectWalletDialog({
  isWalletDialogOpen,
  setIsWalletDialogOpen,
  networkType,
  background,
  customWalletExplainer,
}: ConnectWalletDialogProps) {
  const config = useUVerifyConfig();
  const walletExplainer = customWalletExplainer
    ? customWalletExplainer
    : 'Connecting your wallet is required to pay for certificate creation and cover transaction costs. It also serves as your authentication, enabling access to different UI templates and personalized features.';

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
            to copy the URL, then open one of the supported wallets listed above
            and paste the URL into the wallet's in-app dApp browser.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      title="Connect Wallet"
      isOpen={isWalletDialogOpen}
      background={background}
      onClose={() => setIsWalletDialogOpen(false)}
    >
      <ConnectWalletList
        borderRadius={5}
        showUnavailableWallets={UnavailableWalletVisibility.SHOW_UNAVAILABLE}
        supportedWallets={['eternl', 'vespr', 'begin', 'yoroi', 'lace']}
        onConnect={() => setIsWalletDialogOpen(false)}
        onConnectError={(walletname, error) => {
          const wallet = capitalize(walletname);

          const showWalletConnectError = (message: string) => {
            const WALLET_TOAST_ID = 'wallet-error';
            if (toast.isActive(WALLET_TOAST_ID)) {
              toast.update(WALLET_TOAST_ID, {
                render: message,
                type: 'warning',
              });
            } else {
              toast.warning(message, {
                toastId: WALLET_TOAST_ID,
              });
            }
          };

          if (error.name === 'WalletNotInstalledError') {
            showWalletConnectError(
              `${wallet} is not installed. Please install the ${wallet} app and try again.`
            );
          } else if (error.name === 'WrongNetworkTypeError') {
            showWalletConnectError(
              `You're connected to the wrong network. Please switch to the ${config.cardanoNetwork} network in your ${wallet} app settings and try again.`
            );
          } else {
            showWalletConnectError(
              `Unable to connect to ${wallet}. If you didn't cancel the connection manually, please ensure at least one wallet is created in the ${wallet} app and try again.`
            );
          }
        }}
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
      <AccordionInfo
        question="Why do I need to connect with my wallet?"
        answer={walletExplainer}
        InfoIcon={InfoIcon}
      />
      {checkIsMobile() &&
        typeof (window as any).cardano === 'undefined' &&
        mobileInfo}
    </Modal>
  );
}
