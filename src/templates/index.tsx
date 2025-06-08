import DefaultTemplate from './Default';
import DiplomaTemplate from './Diploma';
import SocialHubTemplate from './SocialHub/SocialHubTemplate';
import MonochromeTemplate from './Monochrome';
import TadamonTemplate from './Tadamon/TadamonTemplate';
import { Template } from '@uverify/core';
import { dynamicTemplates } from './dynamicTemplates';

export type Templates = {
  [key: string]: Template;
};

const coreTemplates: Templates = {
  default: new DefaultTemplate(),
  monochrome: new MonochromeTemplate(),
  diploma: new DiplomaTemplate(),
  socialHub: new SocialHubTemplate(),
  tadamon: new TadamonTemplate(),
};

export const templates: Templates = { ...dynamicTemplates, ...coreTemplates };
