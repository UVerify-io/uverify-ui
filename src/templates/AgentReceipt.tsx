import {
  Template,
  UVerifyCertificate,
  UVerifyCertificateExtraData,
  UVerifyMetadata,
} from '@uverify/core';
import { timestampToDateTime } from '../utils/tools';
import { JSX } from 'react';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';
import uverifyIcon from '../assets/uverify.svg';

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return (
    str.slice(0, Math.floor(maxLen / 2) - 1) +
    '…' +
    str.slice(-(Math.ceil(maxLen / 2) - 2))
  );
}

function lcpLevelLabel(level: number): string {
  switch (level) {
    case 2:
      return 'Provable';
    case 3:
      return 'Signed';
    case 4:
      return 'Integrated';
    default:
      return `Level ${level}`;
  }
}

function lcpLevelColor(level: number): string {
  switch (level) {
    case 2:
      return '#60a5fa';
    case 3:
      return '#34d399';
    case 4:
      return '#a78bfa';
    default:
      return '#60a5fa';
  }
}

function deriveLcpLevel(
  acceptanceRequired: boolean,
  hasDisputeResolution: boolean,
  hasApi: boolean,
): number {
  if (hasDisputeResolution || hasApi) return 4;
  if (acceptanceRequired) return 3;
  return 2;
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

class AgentReceiptTemplate extends Template {
  public name = 'Agent Receipt';
  public defaultUpdatePolicy = 'first' as const;

  public layoutMetadata = {
    terms: 'HTTPS URL of the legal terms document (LCP: terms)',
    termsFormat:
      'Format of the terms document: markdown, json, pdf, plain, html (LCP: termsFormat) — optional',
    acceptanceRequired:
      'true — whether explicit acceptance was required; signals Level 3 (LCP: acceptanceRequired) — optional',
    transaction_id: 'Underlying commerce transaction ID',
    agent_name: 'Display name of the agent — optional',
    disputeResolution:
      'JSON: { method, jurisdiction, contact, clauseId, source, catalog } — signals Level 4 (LCP: disputeResolution) — optional',
    returns: 'URL of a returns or claims API/process (LCP: returns) — optional',
    contact: 'JSON: { legal, technical } (LCP: contact) — optional',
    api: 'URL of a legal context API — signals Level 4 (LCP: api) — optional',
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    if (typeof certificate === 'undefined') return <></>;

    const config = useUVerifyConfig();
    const explorerPrefix =
      config.cardanoNetwork === 'mainnet' ? '' : config.cardanoNetwork + '.';

    const termsUrl = (metadata.terms ?? '') as string;
    const termsFormat = (metadata.termsFormat ?? '') as string;
    const acceptanceRequired =
      String(metadata.acceptanceRequired ?? 'false').toLowerCase() === 'true';
    const transactionId = (metadata.transaction_id ?? '') as string;
    const agentName = (metadata.agent_name ?? '') as string;
    const api = (metadata.api ?? '') as string;

    const disputeResolution = (() => {
      try {
        return metadata.disputeResolution
          ? JSON.parse(metadata.disputeResolution as string)
          : null;
      } catch {
        return null;
      }
    })() as {
      method?: string;
      jurisdiction?: string;
      contact?: string;
      clauseId?: string;
      source?: string;
      catalog?: string;
    } | null;

    const lcpLevel = deriveLcpLevel(
      acceptanceRequired,
      !!disputeResolution,
      !!api,
    );
    const counterpartyDomain = domainFromUrl(termsUrl);
    const issuedDate = timestampToDateTime(certificate.creationTime);
    const levelColor = lcpLevelColor(lcpLevel);
    const levelLabel = lcpLevelLabel(lcpLevel);
    const hasDisputeInfo = !!disputeResolution;

    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: '#f0f4f8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            width: '100%',
            maxWidth: '860px',
            background:
              'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0d1a2e 100%)',
            position: 'relative',
            padding: '40px 48px 36px',
            overflow: 'hidden',
          }}
        >
          {/* Guilloche — two crossing sine-wave families, as used on banknotes and certificates */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 860 160"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Family A: horizontal sine waves */}
            {Array.from({ length: 30 }, (_, i) => {
              const y0 = 8 + i * 4.8;
              const period = 148;
              const amp = 6.5;
              const pts = Array.from({ length: 121 }, (__, j) => {
                const x = (j / 120) * 860;
                const y = y0 + amp * Math.sin((2 * Math.PI * x) / period);
                return `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              });
              return (
                <path
                  key={`a${i}`}
                  d={pts.join(' ')}
                  stroke="rgba(148,163,184,0.11)"
                  strokeWidth="0.55"
                  fill="none"
                />
              );
            })}
            {/* Family B: vertical sine waves — crossing creates the interference pattern */}
            {Array.from({ length: 22 }, (_, i) => {
              const x0 = 10 + i * 39;
              const period = 88;
              const amp = 9;
              const pts = Array.from({ length: 81 }, (__, j) => {
                const y = (j / 80) * 160;
                const x = x0 + amp * Math.sin((2 * Math.PI * y) / period);
                return `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              });
              return (
                <path
                  key={`b${i}`}
                  d={pts.join(' ')}
                  stroke="rgba(148,163,184,0.08)"
                  strokeWidth="0.55"
                  fill="none"
                />
              );
            })}
          </svg>

          <div style={{ position: 'relative' }}>
            {/* Top row: label + UVerify badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'rgba(99,179,237,0.75)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Agent Receipt · Legal Context Protocol
                </p>
                <h1
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#f1f5f9',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  {counterpartyDomain || 'Agent Transaction Receipt'}
                </h1>
                {agentName && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'rgba(148,163,184,0.75)',
                      marginTop: '5px',
                    }}
                  >
                    Agent: {agentName}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <img
                  src={uverifyIcon}
                  width="38"
                  height="38"
                  alt="UVerify"
                  style={{ opacity: 0.85 }}
                />
                <p
                  style={{
                    fontSize: '9px',
                    color: 'rgba(148,163,184,0.6)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  Blockchain Verified
                </p>
              </div>
            </div>

            {/* LCP level badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: `rgba(${lcpLevel === 1 ? '148,163,184' : lcpLevel === 2 ? '96,165,250' : lcpLevel === 3 ? '52,211,153' : '167,139,250'},0.1)`,
                border: `1px solid ${levelColor}40`,
              }}
            >
              {/* Level number ring */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${levelColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: levelColor,
                    lineHeight: 1,
                  }}
                >
                  {lcpLevel}
                </span>
              </div>
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: levelColor,
                    lineHeight: 1,
                  }}
                >
                  LCP Level {lcpLevel} — {levelLabel}
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'rgba(148,163,184,0.7)',
                    marginTop: '3px',
                  }}
                >
                  {acceptanceRequired
                    ? 'Explicit acceptance recorded'
                    : 'Acceptance implied by transaction'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Document body ── */}
        <div
          style={{
            width: '100%',
            maxWidth: '860px',
            background: '#ffffff',
            boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ── Three-column info row ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            {/* Counterparty */}
            <div
              style={{
                padding: '24px 28px',
                borderRight: '1px solid #e5e7eb',
                borderTop: `3px solid ${levelColor}`,
              }}
            >
              <p
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#6b7280',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Counterparty
              </p>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#111827',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {counterpartyDomain || '—'}
              </p>
            </div>

            {/* Transaction ID */}
            <div
              style={{
                padding: '24px 28px',
                borderRight: '1px solid #e5e7eb',
                borderTop: `3px solid ${levelColor}`,
              }}
            >
              <p
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#6b7280',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Transaction ID
              </p>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#111827',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  lineHeight: 1.5,
                }}
              >
                {transactionId ? truncate(transactionId, 36) : '—'}
              </p>
            </div>

            {/* Issued */}
            <div
              style={{
                padding: '24px 28px',
                borderTop: `3px solid ${levelColor}`,
              }}
            >
              <p
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#6b7280',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Issued
              </p>
              <p
                style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}
              >
                {issuedDate}
              </p>
              <div
                style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: acceptanceRequired
                    ? 'rgba(52,211,153,0.1)'
                    : '#f3f4f6',
                  border: `1px solid ${acceptanceRequired ? 'rgba(52,211,153,0.3)' : '#e5e7eb'}`,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  {acceptanceRequired ? (
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="#34d399"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <circle
                      cx="5"
                      cy="5"
                      r="3"
                      stroke="#9ca3af"
                      strokeWidth="1.4"
                    />
                  )}
                </svg>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: acceptanceRequired ? '#059669' : '#6b7280',
                  }}
                >
                  {acceptanceRequired ? 'Accepted' : 'Implicit'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Terms section ── */}
          <div
            style={{
              padding: '28px 32px',
              borderBottom: '1px solid #e5e7eb',
              background: '#fafbff',
            }}
          >
            <p
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#374151',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              Legal Terms
            </p>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {/* terms */}
              {termsUrl && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  >
                    <path
                      d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1zM1 7h12M7 1c-2 2-3 4-3 6s1 4 3 6M7 1c2 2 3 4 3 6s-1 4-3 6"
                      stroke="#6366f1"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '9px',
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        fontWeight: 600,
                        marginBottom: '3px',
                      }}
                    >
                      terms{termsFormat ? ` · ${termsFormat}` : ''}
                    </p>
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#374151',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        lineHeight: 1.6,
                      }}
                    >
                      {termsUrl}
                    </p>
                  </div>
                </div>
              )}

              {/* atrHash — the UVerify certificate hash IS the blockchain-anchored ATR hash */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                >
                  <rect
                    x="1"
                    y="3"
                    width="12"
                    height="8"
                    rx="1.5"
                    stroke="#6366f1"
                    strokeWidth="1.1"
                  />
                  <path
                    d="M4 6h6M4 8h4"
                    stroke="#6366f1"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '9px',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontWeight: 600,
                      marginBottom: '3px',
                    }}
                  >
                    atrHash (SHA-256 · anchored on Cardano)
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#374151',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      lineHeight: 1.6,
                    }}
                  >
                    {hash}
                  </p>
                </div>
              </div>

              {!termsUrl && (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                  }}
                >
                  No terms information recorded.
                </p>
              )}
            </div>
          </div>

          {/* ── Dispute resolution ── */}
          {hasDisputeInfo && (
            <div
              style={{
                padding: '28px 32px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#374151',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                Dispute Resolution
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px',
                }}
              >
                {disputeResolution?.jurisdiction && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '6px',
                      }}
                    >
                      jurisdiction
                    </p>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151',
                      }}
                    >
                      {disputeResolution.jurisdiction}
                    </p>
                  </div>
                )}
                {disputeResolution?.method && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '6px',
                      }}
                    >
                      method
                    </p>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151',
                      }}
                    >
                      {disputeResolution.method}
                    </p>
                  </div>
                )}
                {disputeResolution?.contact && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '6px',
                      }}
                    >
                      contact
                    </p>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151',
                        wordBreak: 'break-all',
                      }}
                    >
                      {disputeResolution.contact}
                    </p>
                  </div>
                )}
                {disputeResolution?.clauseId && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '6px',
                      }}
                    >
                      clauseId
                    </p>
                    <p
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#374151',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                      }}
                    >
                      {disputeResolution.clauseId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Blockchain record ── */}
          <div style={{ padding: '28px 32px', flex: 1 }}>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#6b7280',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Blockchain Record
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                marginBottom: '12px',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 15 15"
                fill="none"
                style={{ flexShrink: 0, marginTop: '2px' }}
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="5"
                  height="5"
                  rx="1"
                  stroke="#6366f1"
                  strokeWidth="1.1"
                />
                <rect
                  x="9.5"
                  y="0.5"
                  width="5"
                  height="5"
                  rx="1"
                  stroke="#6366f1"
                  strokeWidth="1.1"
                />
                <rect
                  x="0.5"
                  y="9.5"
                  width="5"
                  height="5"
                  rx="1"
                  stroke="#6366f1"
                  strokeWidth="1.1"
                />
                <rect
                  x="9.5"
                  y="9.5"
                  width="5"
                  height="5"
                  rx="1"
                  stroke="#6366f1"
                  strokeWidth="1.1"
                />
                <line
                  x1="5.5"
                  y1="3"
                  x2="9.5"
                  y2="3"
                  stroke="#6366f1"
                  strokeWidth="1.3"
                />
                <line
                  x1="5.5"
                  y1="12"
                  x2="9.5"
                  y2="12"
                  stroke="#6366f1"
                  strokeWidth="1.3"
                />
                <line
                  x1="3"
                  y1="5.5"
                  x2="3"
                  y2="9.5"
                  stroke="#6366f1"
                  strokeWidth="1.3"
                />
                <line
                  x1="12"
                  y1="5.5"
                  x2="12"
                  y2="9.5"
                  stroke="#6366f1"
                  strokeWidth="1.3"
                />
              </svg>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '9px',
                    color: '#9ca3af',
                    marginBottom: '3px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                  }}
                >
                  Receipt ID
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#374151',
                    wordBreak: 'break-all',
                    lineHeight: 1.6,
                  }}
                >
                  {hash}
                </p>
              </div>
            </div>

            {certificate.transactionHash && (
              <a
                href={`https://${explorerPrefix}cexplorer.io/tx/${certificate.transactionHash}/contract#data`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6366f1',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6366f1')}
              >
                View on Block Explorer
                <svg
                  width="12"
                  height="12"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: '14px 32px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
            }}
          >
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>
              LCP Level {lcpLevel} · ATR hash anchored on Cardano
              {counterpartyDomain ? ` · ${counterpartyDomain}` : ''}
            </p>
            <img
              src={uverifyIcon}
              width="16"
              height="16"
              alt="UVerify"
              style={{ opacity: 0.2 }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default AgentReceiptTemplate;
