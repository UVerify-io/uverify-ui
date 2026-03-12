import {
  Template,
  UVerifyCertificate,
  UVerifyCertificateExtraData,
  UVerifyMetadata,
  ThemeSettings,
} from '@uverify/core';
import { timestampToDateTime } from '../utils/tools';
import DOMPurify from 'dompurify';
import { JSX } from 'react';
import uverifyIcon from '../assets/uverify.svg';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';

const ChainIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
    <rect x="0.5" y="0.5" width="5" height="5" rx="1" stroke="#6366f1" strokeWidth="1.1" />
    <rect x="9.5" y="0.5" width="5" height="5" rx="1" stroke="#6366f1" strokeWidth="1.1" />
    <rect x="0.5" y="9.5" width="5" height="5" rx="1" stroke="#6366f1" strokeWidth="1.1" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="#6366f1" strokeWidth="1.1" />
    <line x1="5.5" y1="3" x2="9.5" y2="3" stroke="#818cf8" strokeWidth="1.3" />
    <line x1="5.5" y1="12" x2="9.5" y2="12" stroke="#818cf8" strokeWidth="1.3" />
    <line x1="3" y1="5.5" x2="3" y2="9.5" stroke="#818cf8" strokeWidth="1.3" />
    <line x1="12" y1="5.5" x2="12" y2="9.5" stroke="#818cf8" strokeWidth="1.3" />
  </svg>
);

class DiplomaTemplate extends Template {
  public name = 'Diploma';
  public defaultUpdatePolicy = 'first' as const;
  public theme: Partial<ThemeSettings> = {
    background: 'bg-slate-950',
    colors: {
      ice: {
        50: '255, 255, 255',
        100: '255, 255, 255',
        200: '255, 255, 255',
        300: '0, 0, 0',
        400: '0, 0, 0',
        500: '0, 0, 0',
        600: '0, 0, 0',
        700: '0, 0, 0',
        800: '0, 0, 0',
        900: '0, 0, 0',
        950: '0, 0, 0',
      },
      green: {
        50: '255, 255, 255',
        100: '255, 255, 255',
        200: '255, 255, 255',
        300: '255, 255, 255',
        400: '0, 0, 0',
        500: '0, 0, 0',
        600: '0, 0, 0',
        700: '0, 0, 0',
        800: '0, 0, 0',
        900: '0, 0, 0',
        950: '0, 0, 0',
      },
      cyan: {
        50: '255, 255, 255',
        100: '255, 255, 255',
        200: '255, 255, 255',
        300: '255, 255, 255',
        400: '0, 0, 0',
        500: '0, 0, 0',
        600: '0, 0, 0',
        700: '0, 0, 0',
        800: '0, 0, 0',
        900: '0, 0, 0',
        950: '0, 0, 0',
      },
    },
    components: {
      fingerprint: {
        gradient: {
          color: {
            start: 'rgb(99, 102, 241)',
            end: 'rgb(55, 48, 163)',
          },
        },
      },
      pagination: {
        border: {
          active: { color: 'border-indigo-500' },
          inactive: { color: 'border-indigo-900/50', hover: { color: 'border-indigo-500' } },
        },
        text: {
          active: { color: 'white', hover: { color: 'white' } },
          inactive: { color: 'white', hover: { color: 'white' } },
        },
        background: {
          active: { color: 'bg-indigo-600' },
          inactive: { color: 'bg-indigo-900/30', hover: { color: 'bg-indigo-600' } },
        },
      },
      identityCard: {
        border: { color: 'indigo', opacity: 60, hover: { color: 'indigo', opacity: 100 } },
        background: { color: 'indigo', opacity: 20, hover: { color: 'indigo', opacity: 40 } },
      },
      metadataViewer: {
        border: { color: 'indigo', opacity: 40, hover: { color: 'indigo', opacity: 80 } },
      },
    },
  };

  public layoutMetadata = {
    issuer: 'The issuing institution name',
    uv_url_name: 'The recipient full name (stored as hash, revealed via URL param)',
    title: 'The certificate title / field of study',
    description:
      'Optional description. Defaults to a formal certification sentence.',
    pattern: 'Optional SVG pattern (rendered faintly in the header).',
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData
  ): JSX.Element {
    if (typeof certificate === 'undefined') {
      return <></>;
    }

    const config = useUVerifyConfig();
    const explorerUrlPrefix = config.cardanoNetwork === 'mainnet' ? '' : config.cardanoNetwork + '.';
    const issuer = metadata.issuer ?? 'Institution';
    // uv_url_name is stored as a SHA-256 hash on-chain; Certificate.tsx resolves
    // the plain value from the ?name= URL param and writes it back in-place.
    const recipient = (metadata['uv_url_name'] ?? metadata.name ?? 'Recipient') as string;
    const recipientIsHash = /^[a-f0-9]{64}$/i.test(recipient);
    const title = metadata.title ?? 'Certificate of Achievement';
    const description =
      typeof metadata.description === 'string' && metadata.description.trim() !== ''
        ? metadata.description
        : recipientIsHash
        ? `This certificate was awarded in the field of ${title} to a privacy-protected recipient. Open the shared verification link to reveal the recipient's identity.`
        : `This is to certify that ${recipient} has successfully completed all requirements and demonstrated exceptional commitment in the field of ${title}.`;
    const date = timestampToDateTime(certificate.creationTime);

    const customPattern =
      typeof metadata.pattern === 'string'
        ? DOMPurify.sanitize(
            metadata.pattern
              .replace(/fillOpacity/g, 'fillOpacity')
              .replace(/className/g, 'class'),
            { USE_PROFILES: { svg: true } }
          )
        : null;

    return (
      <div
        className="min-h-screen flex items-start sm:items-center justify-center p-0 sm:p-6"
        style={{ background: 'linear-gradient(145deg, #04060e 0%, #0c1020 55%, #04060e 100%)' }}
      >
        <div
          className="relative w-full max-w-5xl overflow-hidden rounded-none sm:rounded-[18px]"
          style={{
            boxShadow:
              '0 0 0 1px rgba(99,102,241,0.18), 0 32px 80px rgba(0,0,0,0.85), 0 0 100px rgba(55,48,163,0.1)',
          }}
        >
          {/* ── Header panel ── */}
          <div
            className="relative px-5 sm:px-16 pt-8 sm:pt-10 pb-10 sm:pb-12"
            style={{
              background:
                'linear-gradient(135deg, #0f172a 0%, #1a1760 55%, #160f3a 100%)',
            }}
          >
            {/* Subtle dot-grid texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(165,180,252,0.12) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            {/* Soft glow blob */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: '-40px',
                right: '60px',
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
              }}
            />

            {/* Optional custom SVG pattern */}
            {customPattern && (
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                dangerouslySetInnerHTML={{ __html: customPattern }}
              />
            )}

            {/* Top row: institution name + badge */}
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-xs font-semibold uppercase mb-2"
                  style={{ color: '#818cf8', letterSpacing: '0.22em' }}
                >
                  Certificate of Excellence
                </p>
                <h1
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: '#f1f5f9', letterSpacing: '-0.01em' }}
                >
                  {issuer}
                </h1>
              </div>
              <img src={uverifyIcon} width="56" height="65" alt="UVerify" style={{ opacity: 0.9 }} />
            </div>

            {/* Programme / field title */}
            <div className="relative mt-7">
              <p
                className="text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: '"Garamond", "EB Garamond", "Palatino Linotype", Palatino, serif',
                  color: '#e0e7ff',
                  lineHeight: 1.25,
                }}
              >
                {title}
              </p>
              {/* Indigo accent bar */}
              <div
                style={{
                  marginTop: '14px',
                  width: '44px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'linear-gradient(to right, #818cf8, #4f46e5)',
                }}
              />
            </div>
          </div>

          {/* ── Body panel ── */}
          <div
            className="px-5 sm:px-16 py-8 sm:py-12"
            style={{ background: '#ffffff' }}
          >
            {/* "Awarded to" label */}
            <p
              className="text-xs font-semibold uppercase mb-3"
              style={{ color: '#94a3b8', letterSpacing: '0.2em' }}
            >
              Awarded to
            </p>

            {/* Recipient name */}
            {recipientIsHash ? (
              <div>
                <p
                  className="text-sm italic mb-1"
                  style={{ color: '#94a3b8' }}
                >
                  Identity is privacy-protected
                </p>
                <p
                  className="text-xs font-mono"
                  style={{ color: '#64748b' }}
                >
                  {`${recipient.slice(0, 6)}...${recipient.slice(-5)}`}
                </p>
              </div>
            ) : (
              <h2
                className="text-2xl sm:text-5xl font-bold"
                style={{
                  fontFamily: '"Garamond", "EB Garamond", "Palatino Linotype", Palatino, serif',
                  color: '#0f172a',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                {recipient}
              </h2>
            )}

            {/* Name underline accent */}
            <div
              style={{
                marginTop: '10px',
                marginBottom: '24px',
                width: '56px',
                height: '2px',
                borderRadius: '2px',
                background: 'linear-gradient(to right, #6366f1, #a5b4fc)',
              }}
            />

            {/* Description */}
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: '#475569', maxWidth: '680px', marginBottom: '32px' }}
            >
              {description}
            </p>

            {/* Footer row */}
            <div
              className="flex flex-col sm:flex-row gap-6 pt-6 mb-6"
              style={{ borderTop: '1px solid #e2e8f0' }}
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: '#94a3b8', letterSpacing: '0.2em' }}
                >
                  Issued by
                </p>
                <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                  {issuer}
                </p>
              </div>
              <div className="sm:ml-auto sm:text-right">
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: '#94a3b8', letterSpacing: '0.2em' }}
                >
                  Date Issued
                </p>
                <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                  {date}
                </p>
              </div>
            </div>

            {/* Blockchain certificate ID */}
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div style={{ paddingTop: '2px' }}>
                <ChainIcon />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold uppercase mb-0.5"
                  style={{ color: '#94a3b8', letterSpacing: '0.18em' }}
                >
                  Blockchain Certificate ID
                </p>
                <p
                  className="text-xs font-mono break-all"
                  style={{ color: '#64748b' }}
                >
                  {hash}
                </p>
              </div>
            </div>

            {/* Block explorer link */}
            {certificate.transactionHash && (
              <a
                href={`https://${explorerUrlPrefix}cexplorer.io/tx/${certificate.transactionHash}/contract#data`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150"
                style={{ color: '#6366f1' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#4f46e5')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6366f1')}
              >
                View on Block Explorer
                <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default DiplomaTemplate;
