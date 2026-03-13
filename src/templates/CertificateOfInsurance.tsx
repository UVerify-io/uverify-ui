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

function formatCoverageLabel(key: string): string {
  return key
    .replace(/^cov_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

class CertificateOfInsuranceTemplate extends Template {
  public name = 'Certificate of Insurance';
  public defaultUpdatePolicy = 'restricted' as const;

  public layoutMetadata = {
    issuer: 'Issuing insurance company name',
    producer: 'Insurance broker or agent name (optional)',
    uv_url_insured: 'Name of the insured (stored as hash on-chain, revealed via URL param)',
    uv_url_insured_address: 'Address of the insured (stored as hash on-chain, revealed via URL param, optional)',
    policy_number: 'Policy reference number',
    effective_date: 'Policy start date (ISO format, e.g. 2025-01-01)',
    expiration_date: 'Policy end date (ISO format, e.g. 2026-01-01) — drives VALID/EXPIRED badge',
    uv_url_certificate_holder: 'Name of the certificate holder (stored as hash on-chain, revealed via URL param, optional)',
    uv_url_certificate_holder_address: 'Address of the certificate holder (stored as hash on-chain, revealed via URL param, optional)',
    additional_insured: 'true or false — whether certificate holder is an additional insured',
    waiver_of_subrogation: 'true or false — whether a waiver of subrogation applies',
    // Coverage limits: use cov_* prefix
    // e.g. cov_general_liability, cov_workers_compensation, cov_auto_liability, cov_umbrella
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData
  ): JSX.Element {
    if (typeof certificate === 'undefined') return <></>;

    const config = useUVerifyConfig();
    const explorerPrefix = config.cardanoNetwork === 'mainnet' ? '' : config.cardanoNetwork + '.';

    const issuer = (metadata.issuer ?? 'Insurance Company') as string;
    const producer = (metadata.producer ?? '') as string;
    const rawInsured = (metadata['uv_url_insured'] ?? '') as string;
    const insured = /^[a-f0-9]{64}$/i.test(rawInsured) ? null : rawInsured || null;
    const rawInsuredAddress = (metadata['uv_url_insured_address'] ?? '') as string;
    const insuredAddress = /^[a-f0-9]{64}$/i.test(rawInsuredAddress) ? null : rawInsuredAddress || null;
    const policyNumber = (metadata.policy_number ?? '') as string;
    const effectiveDateRaw = (metadata.effective_date ?? '') as string;
    const expirationDateRaw = (metadata.expiration_date ?? '') as string;
    const rawHolder = (metadata['uv_url_certificate_holder'] ?? '') as string;
    const certificateHolder = /^[a-f0-9]{64}$/i.test(rawHolder) ? null : rawHolder || null;
    const rawHolderAddress = (metadata['uv_url_certificate_holder_address'] ?? '') as string;
    const certificateHolderAddress = /^[a-f0-9]{64}$/i.test(rawHolderAddress) ? null : rawHolderAddress || null;
    const additionalInsured = String(metadata.additional_insured ?? 'false').toLowerCase() === 'true';
    const waiverOfSubrogation = String(metadata.waiver_of_subrogation ?? 'false').toLowerCase() === 'true';

    const issuedDate = timestampToDateTime(certificate.creationTime);
    const effectiveDate = effectiveDateRaw ? formatDate(effectiveDateRaw) : null;
    const expirationDate = expirationDateRaw ? formatDate(expirationDateRaw) : null;

    // Validity status
    const expDate = expirationDateRaw ? new Date(expirationDateRaw) : null;
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const isExpired = expDate ? expDate < now : false;
    const isExpiringSoon = expDate
      ? !isExpired && expDate.getTime() - now.getTime() < thirtyDays
      : false;

    let statusLabel = '';
    let statusColor = '#2563eb';
    let statusBadgeBg = 'rgba(255,255,255,0.08)';
    let statusBadgeBorder = 'rgba(255,255,255,0.15)';
    let statusIcon: JSX.Element = <></>;

    if (expDate) {
      if (isExpired) {
        statusLabel = 'EXPIRED';
        statusColor = '#f87171';
        statusBadgeBg = 'rgba(239,68,68,0.15)';
        statusBadgeBorder = 'rgba(239,68,68,0.35)';
        statusIcon = (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#f87171" strokeWidth="1.5" />
            <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      } else if (isExpiringSoon) {
        statusLabel = 'EXPIRING SOON';
        statusColor = '#fbbf24';
        statusBadgeBg = 'rgba(251,191,36,0.12)';
        statusBadgeBorder = 'rgba(251,191,36,0.3)';
        statusIcon = (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L2 17h16L10 2z" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round" />
            <line x1="10" y1="8" x2="10" y2="12" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="10" cy="14.5" r="0.8" fill="#fbbf24" />
          </svg>
        );
      } else {
        statusLabel = 'VALID';
        statusColor = '#4ade80';
        statusBadgeBg = 'rgba(74,222,128,0.12)';
        statusBadgeBorder = 'rgba(74,222,128,0.3)';
        statusIcon = (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#4ade80" strokeWidth="1.5" />
            <path d="M6 10l3 3 5-5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      }
    }

    const coverages = Object.entries(metadata)
      .filter(([key]) => key.startsWith('cov_'))
      .map(([key, value]) => ({
        label: formatCoverageLabel(key),
        limit: String(value ?? ''),
      }));

    const showHolderSection =
      certificateHolder !== undefined ||
      rawHolder !== '' ||
      metadata.additional_insured !== undefined ||
      metadata.waiver_of_subrogation !== undefined;

    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: '#f0f4ff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ── Dark header ── */}
        <div
          style={{
            width: '100%',
            maxWidth: '860px',
            background: 'linear-gradient(135deg, #0c1425 0%, #1a2d52 55%, #0c1425 100%)',
            position: 'relative',
            padding: '40px 48px 36px',
          }}
        >
          {/* Abstract ribbon wave texture — two crossing bands of many thin parallel lines */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            preserveAspectRatio="none"
            viewBox="0 0 860 160"
          >
            {(() => {
              // Two ribbon bands each defined by a cubic bezier spine.
              // Every line in a band is the spine shifted vertically by i*step.
              const bands = [
                // Band A: sweeps from lower-left → rises through center → trails off upper-right
                { spine: [-20, 115, 200, 155, 430, 10, 600, 70, 760, 20, 880, 25], count: 25, step: 3.7 },
                // Band B: sweeps from upper-left → dips through center → trails off lower-right
                { spine: [-20, 30, 200, -10, 430, 145, 600, 90, 760, 140, 880, 135], count: 25, step: 3.7 },
              ];

              return bands.flatMap(({ spine, count, step }, bi) =>
                Array.from({ length: count }, (_, i) => {
                  const off = (i - count / 2) * step;
                  // spine: [x0,y0, cx1,cy1, cx2,cy2, x3,y3, cx4,cy4, x4,y4]
                  const [x0,y0, cx1,cy1, cx2,cy2, x3,y3, cx3,cy3, x4,y4] = spine;
                  const d = `M ${x0} ${y0+off} C ${cx1} ${cy1+off} ${cx2} ${cy2+off} ${x3} ${y3+off} S ${cx3} ${cy3+off} ${x4} ${y4+off}`;
                  // Fade opacity toward outer edges of band
                  const t = Math.abs((i - count / 2) / (count / 2));
                  const opacity = 0.13 * (1 - t * 0.55);
                  return (
                    <path
                      key={`${bi}-${i}`}
                      d={d}
                      stroke="white"
                      strokeOpacity={opacity}
                      strokeWidth="0.75"
                      fill="none"
                    />
                  );
                })
              );
            })()}
          </svg>
            {/* Top row: label + UVerify */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
              <div>
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'rgba(147,197,253,0.8)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Certificate of Insurance
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
                  {issuer}
                </h1>
                {producer && (
                  <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.8)', marginTop: '4px' }}>
                    via {producer}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <img src={uverifyIcon} width="38" height="38" alt="UVerify" style={{ opacity: 0.85 }} />
                <p style={{ fontSize: '9px', color: 'rgba(148,163,184,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Blockchain Verified
                </p>
              </div>
            </div>

            {/* Status badge — large, prominent */}
            {statusLabel && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: statusBadgeBg,
                  border: `1px solid ${statusBadgeBorder}`,
                }}
              >
                {statusIcon}
                <div>
                  <p
                    style={{
                      fontSize: '17px',
                      fontWeight: 800,
                      color: statusColor,
                      letterSpacing: '0.08em',
                      lineHeight: 1,
                    }}
                  >
                    {statusLabel}
                  </p>
                  {expirationDate && (
                    <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.7)', marginTop: '3px' }}>
                      {isExpired ? 'Expired' : 'Active until'} {expirationDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

        {/* ── Document body ── */}
        <div style={{ width: '100%', maxWidth: '860px', background: '#ffffff', boxShadow: '0 4px 40px rgba(0,0,0,0.08)', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ── Three-party info cards ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            {/* Insured */}
            <div
              style={{
                padding: '24px 28px',
                borderRight: '1px solid #e5e7eb',
                borderTop: '3px solid #2563eb',
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
                Insured
              </p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', lineHeight: 1.35 }}>
                {insured ?? <span style={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400 }}>protected</span>}
              </p>
              {insuredAddress && (
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px', lineHeight: 1.5 }}>
                  {insuredAddress}
                </p>
              )}
            </div>

            {/* Policy number */}
            <div
              style={{
                padding: '24px 28px',
                borderRight: '1px solid #e5e7eb',
                borderTop: '3px solid #2563eb',
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
                Policy Number
              </p>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#111827',
                  fontFamily: 'monospace',
                  letterSpacing: '0.02em',
                  wordBreak: 'break-all',
                }}
              >
                {policyNumber || '—'}
              </p>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                Notarized {issuedDate}
              </p>
            </div>

            {/* Policy period */}
            <div
              style={{
                padding: '24px 28px',
                borderTop: `3px solid ${isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#2563eb'}`,
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
                Policy Period
              </p>
              {effectiveDate && (
                <div style={{ marginBottom: '6px' }}>
                  <p style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '1px' }}>From</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{effectiveDate}</p>
                </div>
              )}
              {expirationDate && (
                <div>
                  <p style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '1px' }}>To</p>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isExpired ? '#ef4444' : isExpiringSoon ? '#d97706' : '#374151',
                    }}
                  >
                    {expirationDate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Coverages ── */}
          <div style={{ padding: '32px 32px 28px', borderBottom: '1px solid #e5e7eb', background: '#fafbff' }}>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#374151',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                paddingLeft: '4px',
              }}
            >
              Coverage Limits
            </p>

            {coverages.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                {coverages.map(({ label, limit }) => (
                  <div
                    key={label}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px 18px',
                      borderBottom: '3px solid #2563eb',
                    }}
                  >
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        color: '#0f172a',
                        fontFamily: 'monospace',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {limit.startsWith('$') ? limit : `$${limit}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  border: '1px dashed #d1d5db',
                  borderRadius: '8px',
                }}
              >
                <p style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic' }}>
                  No coverage limits specified.
                </p>
                <p style={{ color: '#d1d5db', fontSize: '11px', marginTop: '4px' }}>
                  Add fields with the <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px', fontStyle: 'normal' }}>cov_</code> prefix (e.g. <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px', fontStyle: 'normal' }}>cov_general_liability</code>)
                </p>
              </div>
            )}
          </div>

          {/* ── Certificate holder ── */}
          {showHolderSection && (
            <div
              style={{
                padding: '28px 32px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                gap: '32px',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              {rawHolder !== '' && (
                <div style={{ flex: 1, minWidth: '200px' }}>
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
                    Certificate Holder
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                    {certificateHolder ?? <span style={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400 }}>protected</span>}
                  </p>
                  {certificateHolderAddress && (
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', lineHeight: 1.5 }}>
                      {certificateHolderAddress}
                    </p>
                  )}
                  {!certificateHolderAddress && rawHolderAddress !== '' && (
                    <p style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', marginTop: '4px' }}>
                      protected
                    </p>
                  )}
                </div>
              )}

              {/* Flags */}
              {(metadata.additional_insured !== undefined || metadata.waiver_of_subrogation !== undefined) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                  {metadata.additional_insured !== undefined && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: additionalInsured ? '#eff6ff' : '#f9fafb',
                        border: `1px solid ${additionalInsured ? '#bfdbfe' : '#e5e7eb'}`,
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          background: additionalInsured ? '#2563eb' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {additionalInsured && (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: additionalInsured ? '#1d4ed8' : '#9ca3af' }}>
                        Additional Insured
                      </span>
                    </div>
                  )}

                  {metadata.waiver_of_subrogation !== undefined && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: waiverOfSubrogation ? '#eff6ff' : '#f9fafb',
                        border: `1px solid ${waiverOfSubrogation ? '#bfdbfe' : '#e5e7eb'}`,
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          background: waiverOfSubrogation ? '#2563eb' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {waiverOfSubrogation && (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: waiverOfSubrogation ? '#1d4ed8' : '#9ca3af' }}>
                        Waiver of Subrogation
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Blockchain section ── */}
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
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                <rect x="0.5" y="0.5" width="5" height="5" rx="1" stroke="#2563eb" strokeWidth="1.1" />
                <rect x="9.5" y="0.5" width="5" height="5" rx="1" stroke="#2563eb" strokeWidth="1.1" />
                <rect x="0.5" y="9.5" width="5" height="5" rx="1" stroke="#2563eb" strokeWidth="1.1" />
                <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="#2563eb" strokeWidth="1.1" />
                <line x1="5.5" y1="3" x2="9.5" y2="3" stroke="#2563eb" strokeWidth="1.3" />
                <line x1="5.5" y1="12" x2="9.5" y2="12" stroke="#2563eb" strokeWidth="1.3" />
                <line x1="3" y1="5.5" x2="3" y2="9.5" stroke="#2563eb" strokeWidth="1.3" />
                <line x1="12" y1="5.5" x2="12" y2="9.5" stroke="#2563eb" strokeWidth="1.3" />
              </svg>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '9px', color: '#9ca3af', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                  Certificate ID
                </p>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all', lineHeight: 1.6 }}>
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
                  color: '#2563eb',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1d4ed8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#2563eb')}
              >
                View on Block Explorer
                <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
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
              Verified on Cardano blockchain · Issued by {issuer}
            </p>
            <img src={uverifyIcon} width="16" height="16" alt="UVerify" style={{ opacity: 0.2 }} />
          </div>
        </div>
      </div>
    );
  }
}

export default CertificateOfInsuranceTemplate;
