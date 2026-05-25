import {
  Template,
  type ThemeSettings,
  type UVerifyCertificate,
  type UVerifyCertificateExtraData,
  type UVerifyMetadata,
} from '@uverify/core';
import { JSX } from 'react';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';
import uverifyIcon from '../assets/uverify.svg';
import { timestampToDateTime } from '../utils/tools';

const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
  identity: 'Identity Credential',
};

function credentialTypeLabel(ct: string): string {
  return CREDENTIAL_TYPE_LABELS[ct] ?? ct;
}

function KeriBadge({ verified }: { verified: boolean | null }) {
  if (verified === null) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: '999px',
          background: 'rgba(250,204,21,0.15)',
          border: '1px solid rgba(250,204,21,0.4)',
          fontSize: '11px',
          fontWeight: 600,
          color: '#fbbf24',
          letterSpacing: '0.04em',
        }}
      >
        <span>⧗</span> Pending verification
      </span>
    );
  }
  if (verified) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: '999px',
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.4)',
          fontSize: '11px',
          fontWeight: 600,
          color: '#34d399',
          letterSpacing: '0.04em',
        }}
      >
        <span>✓</span> KERI Verified
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '999px',
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.35)',
        fontSize: '11px',
        fontWeight: 600,
        color: '#f87171',
        letterSpacing: '0.04em',
      }}
    >
      <span>⚠</span> KERIA agent unreachable
    </span>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        padding: '14px 0',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span
        style={{
          fontSize: '9px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function IdentityAuthView({
  hash,
  metadata,
  certificate,
  extra,
}: {
  hash: string;
  metadata: UVerifyMetadata;
  certificate: UVerifyCertificate | undefined;
  extra: UVerifyCertificateExtraData;
}) {
  const config = useUVerifyConfig();
  const explorerPrefix =
    config.cardanoNetwork === 'mainnet' ? '' : config.cardanoNetwork + '.';

  const credentialType = (metadata['ct'] ?? '') as string;
  const aid = (metadata['i'] ?? '') as string;
  const schema = (metadata['s'] ?? '') as string;
  const oobi = (metadata['o'] ?? '') as string;
  const lifecycleType = (metadata['t'] ?? 'AUTH') as string;

  const isRevoke = lifecycleType === 'REVOKE';
  const targetHash = (metadata['th'] ?? '') as string;
  const date = certificate ? timestampToDateTime(certificate.creationTime) : '';

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    overflow: 'hidden',
    backdropFilter: 'blur(12px)',
  };

  if (extra.isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={cardStyle}>
        {/* Header strip */}
        <div
          style={{
            background: isRevoke
              ? 'linear-gradient(90deg, rgba(239,68,68,0.25), rgba(239,68,68,0.10))'
              : 'linear-gradient(90deg, rgba(16,185,129,0.25), rgba(99,102,241,0.15))',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: isRevoke ? '#f87171' : '#34d399',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                marginBottom: '4px',
              }}
            >
              {isRevoke ? 'Credential Revocation' : credentialTypeLabel(credentialType)}
            </p>
            <p
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.01em',
              }}
            >
              {isRevoke ? 'Revocation Notice' : 'Verified Credential'}
            </p>
          </div>
          <img
            src={uverifyIcon}
            width="36"
            height="36"
            alt="UVerify"
            style={{ opacity: 0.55 }}
          />
        </div>

        {/* Body */}
        <div style={{ padding: '8px 28px 24px' }}>
          {isRevoke ? (
            <>
              <FieldRow label="Revoked credential hash" value={targetHash} />
              <FieldRow label="Credential type" value={credentialType} />
            </>
          ) : (
            <>
              <FieldRow label="Credential type" value={credentialTypeLabel(credentialType)} />
              {aid && <FieldRow label="KERI AID" value={aid} />}
              {schema && <FieldRow label="ACDC schema" value={schema} />}
              {oobi && <FieldRow label="OOBI endpoint" value={oobi} />}
            </>
          )}
          <FieldRow label="Issuer (Cardano payment credential)" value={extra.issuer} />
          {date && (
            <FieldRow label="Registered on" value={date} />
          )}

          {/* KERI verification badge — only for AUTH certs */}
          {!isRevoke && (
            <div style={{ marginTop: '20px' }}>
              <KeriBadge verified={null} />
              <p
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.35)',
                  marginTop: '10px',
                  lineHeight: 1.6,
                }}
              >
                Verification status is resolved when this credential is displayed
                in context of a product or document certificate.
              </p>
            </div>
          )}

          {/* Blockchain link */}
          {certificate?.transactionHash && (
            <div style={{ marginTop: '24px' }}>
              <a
                href={`https://${explorerPrefix}cexplorer.io/tx/${certificate.transactionHash}/contract#data`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#60a5fa',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                View on Block Explorer →
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 28px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.08em',
            }}
          >
            Certificate ID: {hash.slice(0, 16)}…
          </p>
          <p
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.08em',
            }}
          >
            UVerify · Cardano
          </p>
        </div>
      </div>
    </div>
  );
}

class IdentityAuthTemplate extends Template {
  public name = 'IdentityAuth';
  public defaultUpdatePolicy = 'first' as const;
  public theme: Partial<ThemeSettings> = {};

  public layoutMetadata = {
    t: 'Lifecycle type: AUTH or REVOKE',
    ct: 'Credential type (e.g. identity, ISO9001, ISO22000, CE_Marking)',
    i: 'KERI Autonomic Identifier (AID)',
    s: 'ACDC leaf credential schema ID',
    o: 'OOBI endpoint for KEL discovery',
    p: 'KERI proof: sign "cardano:<yourPaymentCredential>" with your AID',
    th: 'Target AUTH cert hash (REVOKE only)',
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    return (
      <IdentityAuthView
        hash={hash}
        metadata={metadata}
        certificate={certificate}
        extra={extra}
      />
    );
  }
}

export default IdentityAuthTemplate;
