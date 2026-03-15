import DefaultTemplate from './Default';
import DiplomaTemplate from './Diploma';
import MonochromeTemplate from './Monochrome';
import ProductVerificationTemplate from './ProductVerification/ProductVerificationTemplate';
import PetNecklaceTemplate from './PetNecklace';
import LaboratoryReportTemplate from './LaboratoryReport';
import DigitalProductPassportTemplate from './DigitalProductPassport';
import CertificateOfInsuranceTemplate from './CertificateOfInsurance';
import DocumentIntegrityTemplate from './DocumentIntegrity/DocumentIntegrityTemplate';
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
    petNecklace: new PetNecklaceTemplate(config),
    laboratoryReport: new LaboratoryReportTemplate(config),
    digitalProductPassport: new DigitalProductPassportTemplate(config),
    certificateOfInsurance: new CertificateOfInsuranceTemplate(config),
    documentIntegrity: new DocumentIntegrityTemplate(config),
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
