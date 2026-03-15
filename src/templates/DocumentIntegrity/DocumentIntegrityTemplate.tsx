import type { JSX } from 'react';
import {
  Template,
  type UVerifyCertificate,
  type UVerifyCertificateExtraData,
  type UVerifyMetadata,
} from '@uverify/core';
import DocumentIntegrityView from './DocumentIntegrityView';

class DocumentIntegrityTemplate extends Template {
  public name = 'Document Integrity';
  public defaultUpdatePolicy = 'first' as const;

  public layoutMetadata = {
    issuer: 'Name of the person or organization who certified this file',
    title: 'Document title shown to the verifier (e.g. "Master Thesis")',
    uv_url_filename: 'Expected filename — stored as hash on-chain, revealed via ?filename= URL param',
    location: 'URL or path where the verifier can obtain the file (e.g. "https://fileshare.example.com/thesis.zip")',
    file_size: 'File size in bytes (integer)',
    file_type: 'MIME type or human-readable format description (e.g. "application/zip")',
    file_hint: 'Optional note about the file (e.g. "ZIP archive, not password protected")',
    description: 'Custom verification instructions shown to the verifier. If omitted, auto-generated from filename & location.',
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    return (
      <DocumentIntegrityView
        hash={hash}
        metadata={metadata}
        certificate={certificate}
        _extra={extra}
      />
    );
  }
}

export default DocumentIntegrityTemplate;
