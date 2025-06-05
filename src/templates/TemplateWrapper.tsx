import { JSX } from 'react';
import {
  Template,
  UVerifyCertificate,
  UVerifyCertificateExtraData,
  UVerifyMetadata,
} from '@uverify/core';

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
