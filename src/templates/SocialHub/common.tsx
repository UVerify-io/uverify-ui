import { JSX } from 'react';
import {
  ChatIcon,
  DiscordIcon,
  EmailIcon,
  GitHubIcon,
  GlobeIcon,
  InfoIcon,
  InstagramIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
  YouTubeIcon,
} from '../../components/Icons';

export declare interface SocialHubData {
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
  ada_handle: string;
  email: string;
  itemName: string;
}

export type SocialHubKey = keyof SocialHubData;
export type Social = {
  key: SocialHubKey;
  name: string;
  description: string;
  icon: JSX.Element;
  urlPrefix?: string;
};

export const socials: Social[] = [
  {
    key: 'github',
    name: 'GitHub',
    icon: <GitHubIcon />,
    urlPrefix: 'https://github.com/',
    description: 'githubuser',
  },
  {
    key: 'x',
    description: 'johndoe',
    name: 'X',
    icon: <XIcon />,
    urlPrefix: 'https://x.com/',
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    icon: <LinkedInIcon />,
    urlPrefix: 'https://linkedin.com/in/',
    description: 'john-doe-12345',
  },
  {
    key: 'telegram',
    name: 'Telegram',
    description: 'johndoe',
    icon: <ChatIcon />,
    urlPrefix: 'https://t.me/',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    description: 'johndoe',
    icon: <InstagramIcon />,
    urlPrefix: 'https://instagram.com/',
  },
  {
    key: 'discord',
    name: 'Discord',
    description: 'johndoe#1234',
    icon: <DiscordIcon />,
    urlPrefix: 'https://discordapp.com/users/',
  },
  {
    key: 'reddit',
    name: 'Reddit',
    description: 'johndoe',
    icon: <RedditIcon />,
    urlPrefix: 'https://reddit.com/u/',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    description: 'MyChannelName',
    icon: <YouTubeIcon />,
    urlPrefix: 'https://www.youtube.com/c/',
  },
  {
    key: 'website',
    description: 'https://app.uverify.io',
    name: 'Website',
    icon: <GlobeIcon />,
  },
  {
    key: 'email',
    name: 'Email',
    description: 'john@doe.com',
    icon: <EmailIcon />,
    urlPrefix: 'mailto:',
  },
  {
    key: 'ada_handle',
    name: 'ADA Handle',
    description: 'johndoe',
    icon: <InfoIcon />,
    urlPrefix: 'https://cexplorer.io/',
  },
];
