import IconButton from './IconButton';
import { HeartIcon, IconType } from './Icons';

declare interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  className = className ? ' ' + className : '';
  const date = new Date();

  return (
    <footer
      className={'flex flex-col items-center p-1 text-white ' + className}
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
        <IconButton href="https://x.com/UVer1fy" iconType={IconType.XIcon} />
        <IconButton
          href="https://www.linkedin.com/company/uverify-io"
          iconType={IconType.LinkedInIcon}
        />
        <IconButton
          href="https://github.com/UVerify-io"
          iconType={IconType.GitHubIcon}
        />
      </div>
      <div className="text-xs flex flex-col justify-center items-center">
        <div>
          <a href="https://uverify.io/#terms-of-use">Terms of Use</a>
          <span className="mx-1">|</span>
          <a href="https://uverify.io/#privacy-policy">Privacy Policy</a>
          <span className="mx-1">|</span>
          <a href="https://uverify.io/#impress">Impress</a>
        </div>
      </div>
      <div className="flex items-center justify-center mt-2 text-xs">
        <a
          className="flex items-center justify-center"
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
