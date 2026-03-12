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

function formatLabel(key: string): string {
  return key
    .replace(/^a_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

class LaboratoryReportTemplate extends Template {
  public name = 'Laboratory Report';
  public defaultUpdatePolicy = 'first' as const;

  public layoutMetadata = {
    issuer: 'Issuing laboratory or institution',
    uv_url_name: 'Subject name (stored as hash, revealed via URL param)',
    uv_url_report_id: 'Report ID (stored as hash, revealed via URL param)',
    auditable: 'false',
    contact: 'Contact email or institution for the full report',
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

    const issuer = (metadata.issuer ?? 'Laboratory') as string;
    const rawName = (metadata['uv_url_name'] ?? metadata.name ?? '') as string;
    const nameIsHash = /^[a-f0-9]{64}$/i.test(rawName);
    const subjectName = nameIsHash ? null : rawName || null;

    const rawReportId = (metadata['uv_url_report_id'] ?? metadata.report_id ?? '') as string;
    const reportIdIsHash = /^[a-f0-9]{64}$/i.test(rawReportId);
    const reportId = reportIdIsHash ? null : rawReportId || null;

    const isAuditable = String(metadata.auditable ?? 'false').toLowerCase() === 'true';
    const contact = (metadata.contact ?? '') as string;
    const date = timestampToDateTime(certificate.creationTime);

    const labValues = Object.entries(metadata)
      .filter(([key]) => key.startsWith('a_'))
      .map(([key, value]) => ({ label: formatLabel(key), value: String(value ?? '') }));

    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: '#f5f6f8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0',
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div style={{ width: '100%', height: '4px', background: 'linear-gradient(to right, #0d9488, #0891b2, #0d9488)' }} />

        {/* Report document */}
        <div
          style={{
            width: '100%',
            maxWidth: '860px',
            background: '#ffffff',
            minHeight: 'calc(100vh - 4px)',
            padding: '0',
            boxShadow: '0 0 40px rgba(0,0,0,0.06)',
          }}
        >
          {/* ── Document header ── */}
          <div style={{ padding: '40px 48px 32px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              {/* Left: institution info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '3px', height: '28px', background: '#0d9488', borderRadius: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#0d9488', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Laboratory Analysis Report
                    </p>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>
                      {issuer}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Right: UVerify badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                <img src={uverifyIcon} width="36" height="36" alt="UVerify" style={{ opacity: 0.7 }} />
                <p style={{ fontSize: '9px', color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Blockchain Verified</p>
              </div>
            </div>

            {/* Meta row: subject / report ID / date */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginTop: '24px' }}>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '4px' }}>Subject</p>
                {subjectName ? (
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{subjectName}</p>
                ) : (
                  <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>Privacy-protected</p>
                )}
              </div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '4px' }}>Report ID</p>
                {reportId ? (
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>{reportId}</p>
                ) : (
                  <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>Not disclosed</p>
                )}
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '4px' }}>Date of Report</p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{date}</p>
              </div>
            </div>
          </div>

          {/* ── Measured values ── */}
          <div style={{ padding: '32px 48px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#374151', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Measured Values
            </p>

            {labValues.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px 10px 0', fontSize: '10px', color: '#6b7280', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      Parameter
                    </th>
                    <th style={{ textAlign: 'right', padding: '10px 0 10px 16px', fontSize: '10px', color: '#6b7280', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {labValues.map(({ label, value }, i) => (
                    <tr
                      key={label}
                      style={{ borderBottom: i < labValues.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                    >
                      <td style={{ padding: '12px 16px 12px 0', color: '#374151', fontWeight: 500 }}>
                        {label}
                      </td>
                      <td style={{ padding: '12px 0 12px 16px', color: '#111827', fontWeight: 700, textAlign: 'right', fontFamily: 'monospace', fontSize: '15px' }}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>
                  No measurement values recorded.
                </p>
                <p style={{ color: '#d1d5db', fontSize: '12px', marginTop: '6px' }}>
                  Add fields with the <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px', fontStyle: 'normal' }}>a_</code> prefix (e.g. <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px', fontStyle: 'normal' }}>a_glucose</code>)
                </p>
              </div>
            )}

            {/* ── Auditable notice ── */}
            {isAuditable && (
              <div
                style={{
                  marginTop: '28px',
                  padding: '16px 20px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderLeft: '4px solid #f59e0b',
                  borderRadius: '4px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" stroke="#d97706" strokeWidth="1.8" fill="rgba(253,230,138,0.4)" />
                  <path d="M9 12l2 2 4-4" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '5px' }}>
                    Auditable Public Subset
                  </p>
                  <p style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.65 }}>
                    The values shown here represent a transparent, publicly available subset of the full laboratory report. The complete report may be available upon request.
                    {contact && (
                      <> Contact <strong>{contact}</strong> for access.</>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* ── Divider ── */}
            <div style={{ borderTop: '1px dashed #e5e7eb', margin: '32px 0' }} />

            {/* ── Blockchain section ── */}
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Blockchain Record
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <rect x="0.5" y="0.5" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.1" />
                  <rect x="9.5" y="0.5" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.1" />
                  <rect x="0.5" y="9.5" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.1" />
                  <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.1" />
                  <line x1="5.5" y1="3" x2="9.5" y2="3" stroke="#0d9488" strokeWidth="1.3" />
                  <line x1="5.5" y1="12" x2="9.5" y2="12" stroke="#0d9488" strokeWidth="1.3" />
                  <line x1="3" y1="5.5" x2="3" y2="9.5" stroke="#0d9488" strokeWidth="1.3" />
                  <line x1="12" y1="5.5" x2="12" y2="9.5" stroke="#0d9488" strokeWidth="1.3" />
                </svg>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '9px', color: '#9ca3af', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>Certificate ID</p>
                  <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all', lineHeight: 1.6 }}>{hash}</p>
                </div>
              </div>

              {certificate.transactionHash && (
                <a
                  href={`https://${explorerPrefix}cexplorer.io/tx/${certificate.transactionHash}/contract#data`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', fontWeight: 600, color: '#0d9488', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0f766e')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#0d9488')}
                >
                  View on Block Explorer
                  <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: '16px 48px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f9fafb',
            }}
          >
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>
              Verified on Cardano blockchain · Issued by {issuer}
            </p>
            <img src={uverifyIcon} width="18" height="18" alt="UVerify" style={{ opacity: 0.25 }} />
          </div>
        </div>
      </div>
    );
  }
}

export default LaboratoryReportTemplate;
