import DefaultTemplate from './Default';
import DiplomaTemplate from './Diploma';
import MonochromeTemplate from './Monochrome';
import ProductVerificationTemplate from './ProductVerification/ProductVerificationTemplate';
import { Template, UVerifyConfig } from '@uverify/core';

export type Templates = {
  [key: string]: Template;
};

export async function getTemplates(config: UVerifyConfig) {
  const coreTemplates: Templates = {
    default: new DefaultTemplate(config),
    monochrome: new MonochromeTemplate(config),
    diploma: new DiplomaTemplate(config),
    productVerification: new ProductVerificationTemplate(config),
  };

  let dynamicTemplates: Templates = {};
  try {
    const dynamicModule = await import('./dynamicTemplates');
    dynamicTemplates = dynamicModule.getDynamicTemplates(config);
  } catch (error) {
    console.warn(
      'dynamicTemplates.ts not found or failed to load. Using empty dynamicTemplates.',
      error,
    );
  }

  return { ...dynamicTemplates, ...coreTemplates };
}
