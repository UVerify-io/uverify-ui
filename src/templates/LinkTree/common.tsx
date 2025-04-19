import { JSX } from 'react';
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
} from '../../components/Icons';

export declare interface LinktreeData {
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
  adaHandle: string;
  email: string;
  itemName: string;
}

export type LinktreeKey = keyof LinktreeData;
export type Social = {
  key: LinktreeKey;
  name: string;
  icon: JSX.Element;
  urlPrefix?: string;
};

export const socials: Social[] = [
  {
    key: 'github',
    name: 'GitHub',
    icon: <GitHubIcon />,
    urlPrefix: 'https://github.com/',
  },
  { key: 'x', name: 'X', icon: <XIcon />, urlPrefix: 'https://x.com/' },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    icon: <LinkedInIcon />,
    urlPrefix: 'https://linkedin.com/in/',
  },
  {
    key: 'telegram',
    name: 'Telegram',
    icon: <ChatIcon />,
    urlPrefix: 'https://t.me/',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    icon: <InstagramIcon />,
    urlPrefix: 'https://instagram.com/',
  },
  {
    key: 'discord',
    name: 'Discord',
    icon: <DiscordIcon />,
    urlPrefix: 'https://discordapp.com/users/',
  },
  {
    key: 'reddit',
    name: 'Reddit',
    icon: <RedditIcon />,
    urlPrefix: 'https://reddit.com/u/',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: <YouTubeIcon />,
    urlPrefix: 'https://www.youtube.com/c/',
  },
  { key: 'website', name: 'Website', icon: <GlobeIcon /> },
  {
    key: 'email',
    name: 'Email',
    icon: <InfoIcon />,
    urlPrefix: 'mailto:',
  },
  {
    key: 'adaHandle',
    name: 'ADA Handle',
    icon: <InfoIcon />,
    urlPrefix: 'https://cexplorer.io/',
  },
];
