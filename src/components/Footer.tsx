import IconButton from './IconButton';
import { HeartIcon, IconType } from './Icons';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';

declare interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  className = className ? ' ' + className : '';
  const date = new Date();
  const config = useUVerifyConfig();
  const isMainnet = config.cardanoNetwork?.toLowerCase() === 'mainnet';
  const otherNetworkUrl = isMainnet
    ? 'https://app.preprod.uverify.io'
    : 'https://app.uverify.io';

  return (
    <footer
      data-testid="footer"
      className={'flex flex-col items-center p-1 text-white mt-4 ' + className}
    >
      <div className="mt-6 mb-2">
        <IconButton
          href="mailto:hello@uverify.io"
          iconType={IconType.EmailIcon}
        />
        <IconButton
          href="https://discord.gg/Dvqkynn6xc"
          iconType={IconType.DiscordIcon}
        />
        <IconButton href="https://x.com/uvfyhq" iconType={IconType.XIcon} />
        <IconButton
          href="https://www.linkedin.com/company/uverify-io"
          iconType={IconType.LinkedInIcon}
        />
        <IconButton
          href="https://github.com/UVerify-io"
          iconType={IconType.GitHubIcon}
        />
      </div>
      {config.cardanoNetwork && (
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span
            className={`flex items-center gap-1 font-medium ${isMainnet ? 'text-green-400/80' : 'text-white/30'}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isMainnet ? 'bg-green-400/80' : 'bg-white/20'}`}
            />
            {isMainnet ? (
              'Mainnet'
            ) : (
              <a
                href={otherNetworkUrl}
                className="hover:text-white/75 transition-colors duration-200"
              >
                Mainnet
              </a>
            )}
          </span>
          <span className="text-white/20">|</span>
          <span
            className={`flex items-center gap-1 font-medium ${!isMainnet ? 'text-yellow-400/80' : 'text-white/30'}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${!isMainnet ? 'bg-yellow-400/80' : 'bg-white/20'}`}
            />
            {!isMainnet ? (
              'Preprod'
            ) : (
              <a
                href={otherNetworkUrl}
                className="hover:text-white/75 transition-colors duration-200"
              >
                Preprod
              </a>
            )}
          </span>
        </div>
      )}
      <div className="text-xs flex flex-col justify-center items-center text-white/55">
        <div>
          <a
            data-testid="terms-of-use-link"
            href="https://uverify.io/terms-of-use"
            className="hover:text-white/90 transition-colors duration-200"
          >
            Terms of Use
          </a>
          <span className="mx-1 text-white/30">|</span>
          <a
            data-testid="privacy-policy-link"
            href="https://uverify.io/privacy-policy"
            className="hover:text-white/90 transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <span className="mx-1 text-white/30">|</span>
          <a
            data-testid="impress-link"
            href="https://uverify.io/#impress"
            className="hover:text-white/90 transition-colors duration-200"
          >
            Impress
          </a>
        </div>
      </div>
      <div className="flex items-center justify-center mt-2 text-xs text-white/45">
        <a
          className="flex items-center justify-center hover:text-white/70 transition-colors duration-200"
          href="https://uverify.io/#team"
        >
          Created with <HeartIcon className="mx-1" />
          by UVerify © {date.getFullYear()} Fabian Bormann
        </a>
      </div>
    </footer>
  );
};

export default Footer;
