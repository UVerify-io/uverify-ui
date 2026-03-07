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
    <div className="w-full mt-4 p-4 bg-cyan-500/10 border border-cyan-400/25 rounded-xl backdrop-blur-sm text-white/80">
      <div className="flex gap-3">
        <svg
          className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5"
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
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">
            Mobile Access Instructions
          </h3>
          <p className="text-xs text-white/70 leading-relaxed">
            On mobile, tap the copy icon{' '}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('URL copied to clipboard');
              }}
              className="inline-flex items-center align-middle mx-0.5 p-1 rounded-lg bg-white/10 border border-white/20 hover:bg-cyan-500/25 hover:border-cyan-400/40 transition-colors duration-200"
              title="Copy URL"
            >
              <svg
                className="h-3 w-3 text-cyan-300"
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
            </button>{' '}
            to copy the URL, then open a supported wallet and paste it into the
            in-app dApp browser.
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
        peerConnectEnabled={false}
        showUnavailableWallets={UnavailableWalletVisibility.SHOW_UNAVAILABLE}
        supportedWallets={[
          'eternl',
          'vespr',
          'yoroi',
          'lace',
          'begin',
          'typhon',
          'gerowallet',
        ]}
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
              `${wallet} is not installed. Please install the ${wallet} app and try again.`,
            );
          } else if (error.name === 'WrongNetworkTypeError') {
            showWalletConnectError(
              `You're connected to the wrong network. Please switch to the ${config.cardanoNetwork} network in your ${wallet} app settings and try again.`,
            );
          } else {
            showWalletConnectError(
              `Unable to connect to ${wallet}. If you didn't cancel the connection manually, please ensure at least one wallet is created in the ${wallet} app and try again.`,
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
            & > button {
              color: rgba(255, 255, 255, 0.85) !important;
              background: rgba(255, 255, 255, 0.07) !important;
              border: 1px solid rgba(255, 255, 255, 0.15) !important;
              border-radius: 12px !important;
              transition: background 200ms, border-color 200ms, box-shadow 200ms !important;
            }
            & > button:hover {
              background: rgba(6, 182, 212, 0.2) !important;
              border-color: rgba(34, 211, 238, 0.35) !important;
              color: white !important;
              box-shadow: 0 0 14px 0 rgba(34, 211, 238, 0.15) !important;
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
