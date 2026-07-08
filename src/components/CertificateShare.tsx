import { useState } from 'react';
import { UVerifyCertificate, UVerifyMetadata } from '@uverify/core';
import ShareDialog from './ShareDialog';
import { shortCodeFromHash } from '../utils/shortCode';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';
import {
  buildLinkedInAddToProfileUrl,
  buildEmbedSnippet,
  buildSocialShareUrls,
} from '../utils/share';

interface CertificateShareProps {
  hash: string;
  metadata: UVerifyMetadata;
  certificate?: UVerifyCertificate;
  templateId: string;
  title?: string;
  organizationName?: string;
  imageUrl?: string;
  className?: string;
  label?: React.ReactNode;
}

const CertificateShare = ({
  hash,
  metadata,
  certificate,
  templateId,
  title,
  organizationName,
  imageUrl,
  className,
  label,
}: CertificateShareProps) => {
  const config = useUVerifyConfig();
  const [shareOpen, setShareOpen] = useState(false);

  const shortUrl = `${config.shortLinkDomain}/${shortCodeFromHash(hash)}${window.location.search}`;
  const certificateTitle =
    title ?? (typeof metadata.title === 'string' ? metadata.title : 'Certificate');
  const issuerName =
    organizationName ??
    (typeof metadata.issuer === 'string' ? metadata.issuer : 'UVerify');
  const issued = certificate ? new Date(certificate.creationTime) : new Date();
  const linkedInUrl = buildLinkedInAddToProfileUrl({
    name: certificateTitle,
    organizationName: issuerName,
    issueYear: issued.getFullYear(),
    issueMonth: issued.getMonth() + 1,
    certUrl: shortUrl,
    certId: shortCodeFromHash(hash),
  });
  const embedSnippet = buildEmbedSnippet(
    shortUrl,
    imageUrl ?? `${window.location.origin}/og/${templateId}.png`,
    certificateTitle,
  );
  const socialLinks = buildSocialShareUrls({
    url: shortUrl,
    text: `${certificateTitle} — verified on-chain by ${issuerName}`,
  });

  return (
    <>
      <button
        onClick={() => setShareOpen(true)}
        data-testid="share-button"
        aria-label="Share certificate"
        title="Share"
        className={
          className ??
          'fixed bottom-6 right-6 z-40 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-white/20 print:hidden'
        }
      >
        {label ?? 'Share'}
      </button>
      <ShareDialog
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shortUrl={shortUrl}
        linkedInUrl={linkedInUrl}
        socialLinks={socialLinks}
        embedSnippet={embedSnippet}
      />
    </>
  );
};

export default CertificateShare;
