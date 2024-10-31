import IconButton from './IconButton';
import { HeartIcon, IconType } from './Icons';

declare interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  className = className ? ' ' + className : '';
  const date = new Date();

  return (
    <footer className={'flex flex-col items-center p-1 text-white' + className}>
      <div>
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
      <div className="flex items-center justify-center my-1 text-xs">
        Created with{' '}
        <a
          className="flex items-center justify-center my-1 text-xs mr-2"
          href="https://uverify.io/#team"
        >
          <HeartIcon className="mx-1" /> by UVerify ©{date.getFullYear()}
        </a>
        <a
          className="flex items-center justify-center my-1 pl-2 text-xs border-l border-white"
          href="https://uverify.io/#impress"
        >
          Impress
        </a>
      </div>
    </footer>
  );
};

export default Footer;
