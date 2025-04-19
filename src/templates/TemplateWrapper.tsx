import { JSX } from 'react';
import { UVerifyCertificate, UVerifyMetadata } from '../common/types';
import { Template, UVerifyCertificateExtraData } from './Template';

interface TemplateWrapperProps {
  template: Template;
  hash: string;
  metadata: UVerifyMetadata;
  certificate: UVerifyCertificate | undefined;
  pagination: JSX.Element;
  extra: UVerifyCertificateExtraData;
}

const TemplateWrapper = ({
  template,
  hash,
  metadata,
  certificate,
  pagination,
  extra,
}: TemplateWrapperProps) => {
  return template.render(hash, metadata, certificate, pagination, extra);
};

export default TemplateWrapper;
