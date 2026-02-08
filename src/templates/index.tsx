import DefaultTemplate from './Default';
import DiplomaTemplate from './Diploma';
import SocialHubTemplate from './SocialHub/SocialHubTemplate';
import MonochromeTemplate from './Monochrome';
import TadamonTemplate from './Tadamon/TadamonTemplate';
import ProductVerificationTemplate from './ProductVerification/ProductVerificationTemplate';
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
  productVerification: new ProductVerificationTemplate(),
};

export async function getTemplates() {
  let dynamicTemplates: Templates = {};
  try {
    const dynamicModule = await import('./dynamicTemplates');
    dynamicTemplates = dynamicModule.dynamicTemplates || {};
  } catch (error) {
    console.warn(
      'dynamicTemplates.ts not found or failed to load. Using empty dynamicTemplates.',
      error,
    );
  }

  return { ...dynamicTemplates, ...coreTemplates };
}
