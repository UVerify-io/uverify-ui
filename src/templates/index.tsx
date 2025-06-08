import DefaultTemplate from './Default';
import DiplomaTemplate from './Diploma';
import SocialHubTemplate from './SocialHub/SocialHubTemplate';
import MonochromeTemplate from './Monochrome';
import TadamonTemplate from './Tadamon/TadamonTemplate';
import { Template } from '@uverify/core';

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

let dynamicTemplates: Templates = {};
try {
  const dynamicModule = await import('./dynamicTemplates');
  dynamicTemplates = dynamicModule.dynamicTemplates || {};
} catch (error) {
  console.warn(
    'dynamicTemplates.ts not found or failed to load. Using empty dynamicTemplates.',
    error
  );
}

export const templates: Templates = { ...dynamicTemplates, ...coreTemplates };
