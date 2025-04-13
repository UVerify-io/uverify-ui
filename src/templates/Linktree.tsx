import { Template, UVerifyCertificateExtraData } from './Template';
import { UVerifyMetadata, UVerifyCertificate } from '../common/types';
import { ThemeSettings } from '../utils/hooks';
import { JSX, useEffect, useState } from 'react';
import {
  ChatIcon,
  DiscordIcon,
  GitHubIcon,
  GlobeIcon,
  InfoIcon,
  InstagramIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
  YouTubeIcon,
} from '../components/Icons';
import {
  ConnectWalletList,
  useCardano,
} from '@cardano-foundation/cardano-connect-with-wallet';
import {
  NetworkType,
  UnavailableWalletVisibility,
} from '@cardano-foundation/cardano-connect-with-wallet-core';
import Button from '../components/Button';
import Modal from '../components/Modal';

declare interface LinktreeData {
  picture: string;
  name: string;
  subtitle: string;
  x: string;
  telegram: string;
  instagram: string;
  discord: string;
  reddit: string;
  youtube: string;
  linkedin: string;
  github: string;
  website: string;
}

class LinktreeTemplate extends Template {
  public name = 'Linktree';
  public theme: Partial<ThemeSettings> = {
    background:
      'bg-[linear-gradient(109.6deg,_rgba(var(--color-ice-500),0.5)_11.2%,_rgba(var(--color-ice-400),0.5)_42%,_rgba(var(--color-cyan-500),0.5)_71.5%,_rgba(var(--color-blue-500),0.5)_100.2%)]',
  };

  public layoutMetadata = {
    batch_ids: 'Connected batch IDs, separated by commas',
    whitelabel: 'A label for subtle UI template changes',
  };

  public render(
    _hash: string,
    _metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData
  ): JSX.Element {
    if (typeof certificate === 'undefined') {
      return <></>;
    }
    const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
    const [buttonState, _setButtonState] = useState<
      'enabled' | 'loading' | 'disabled'
    >('enabled');
    const [linktreeData, setLinktreeData] = useState<LinktreeData>();
    const [claimed, setClaimed] = useState(false);
    const { isConnected, disconnect } = useCardano({
      limitNetwork: NetworkType.TESTNET,
    });

    useEffect(() => {
      setLinktreeData({
        picture: 'github',
        name: 'Fabian Bormann',
        subtitle: 'Cardano Foundation - Ecosystem Engineering',
        x: 'johndoe',
        telegram: 'johndoe',
        instagram: 'johndoe',
        discord: 'johndoe',
        reddit: 'johndoe',
        youtube: 'johndoe',
        linkedin: 'johndoe',
        github: 'fabianbormann',
        website: 'https://johndoe.com',
      });
      setClaimed(true);
    }, []);

    const renderClaimingPage = () => {
      return <></>;
    };

    const connectButton = isConnected ? (
      <Button
        color="pink"
        variant="contained"
        className="mt-4 min-w-[236px]"
        label="Disconnect Wallet"
        onClick={disconnect}
      />
    ) : (
      <div className="flex flex-col items-center justify-center">
        <Button
          className="mt-4 min-w-[236px]"
          state={buttonState}
          label="Connect Wallet"
          variant="glass"
          onClick={() => setIsWalletDialogOpen(true)}
          color="blue"
        />
      </div>
    );

    const linkTreeButton = (text: string, icon: JSX.Element) => (
      <a
        href="#"
        className="m-2 text-blue-900 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer bg-white/60 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20 hover:bg-white/40"
      >
        {icon}
        <p className="ml-2 text-xs font-bold">{text}</p>
      </a>
    );

    const renderLinkTree = () => {
      const socials = [
        { key: 'github', name: 'GitHub', icon: <GitHubIcon /> },
        { key: 'x', name: 'X', icon: <XIcon /> },
        { key: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon /> },
        { key: 'telegram', name: 'Telegram', icon: <ChatIcon /> },
        { key: 'instagram', name: 'Instagram', icon: <InstagramIcon /> },
        { key: 'discord', name: 'Discord', icon: <DiscordIcon /> },
        { key: 'reddit', name: 'Reddit', icon: <RedditIcon /> },
        { key: 'youtube', name: 'YouTube', icon: <YouTubeIcon /> },
        { key: 'website', name: 'Website', icon: <GlobeIcon /> },
      ];

      return (
        <div className="w-full flex flex-col items-center justify-center">
          <img
            src={`https://avatars.githubusercontent.com/${linktreeData?.github}`}
            className="w-40 h-40 rounded-full"
          />
          <h1 className="text-2xl font-bold mt-4">{linktreeData?.name}</h1>
          <p className="text-blue-900 text-md mt-1">{linktreeData?.subtitle}</p>
          <div className="w-3/5 flex flex-row flex-wrap items-center justify-center sm:p-8">
            {socials.map((social) => {
              if (linktreeData && social.key in linktreeData) {
                return linkTreeButton(social.name, social.icon);
              }
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen text-white w-full flex flex-col justify-center items-center">
        {claimed ? renderLinkTree() : renderClaimingPage()}
        <div className="flex flex-col items-center justify-center">
          {connectButton}
        </div>
        <Modal
          title="Connect Wallet"
          isOpen={isWalletDialogOpen}
          onClose={() => setIsWalletDialogOpen(false)}
        >
          <ConnectWalletList
            borderRadius={5}
            showUnavailableWallets={
              UnavailableWalletVisibility.SHOW_UNAVAILABLE
            }
            supportedWallets={['yoroi', 'lace', 'nami', 'eternl', 'vespr']}
            onConnect={() => setIsWalletDialogOpen(false)}
            gap={6}
            customCSS={`
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
            limitNetwork={NetworkType.TESTNET}
          />
          <div className="mt-4">
            <a
              href="#"
              className="inline-flex items-center text-xs font-normal hover:underline"
            >
              <InfoIcon className="w-3 h-3 me-2" />
              Why do I need to connect with my wallet?
            </a>
          </div>
        </Modal>
      </div>
    );
  }
}

export default LinktreeTemplate;
