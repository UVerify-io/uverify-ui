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
          href="https://discord.gg/Dvqkynn6xc"
          iconType={IconType.DiscordIcon}
        />
        <IconButton href="https://x.com/UVer1fy" iconType={IconType.XIcon} />
        <IconButton
          href="mailto:hello@uverify.io"
          iconType={IconType.EmailIcon}
        />
      </div>
      <div className="flex items-center justify-center my-1 text-xs">
        Created with <HeartIcon className="mx-1" /> by UVerify ©
        {date.getFullYear()}
      </div>
    </footer>
  );
};

export default Footer;
