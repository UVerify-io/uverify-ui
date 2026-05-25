import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';

type Props = {
  issuerPaymentCredential: string;
  credentialType?: string;
  className?: string;
};

type CredentialResponse = {
  authHash: string;
  credentialType: string;
  keriAid: string;
  txHash: string;
  active: boolean;
  keriVerified: boolean;
  acdc: Record<string, unknown> | null;
};

const IssuerIdentityBadge = ({
  issuerPaymentCredential,
  credentialType = 'identity',
  className,
}: Props) => {
  const config = useUVerifyConfig();
  const [credential, setCredential] = useState<CredentialResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issuerPaymentCredential || !config.backendUrl) return;
    setLoading(true);
    axios
      .get<CredentialResponse>(
        `${config.backendUrl}/api/v1/credential/${issuerPaymentCredential}?type=${credentialType}`,
      )
      .then((res) => {
        if (res.status === 200) {
          setCredential(res.data);
        }
      })
      .catch(() => {
        // 404 means no credential — render nothing
      })
      .finally(() => setLoading(false));
  }, [issuerPaymentCredential, credentialType, config.backendUrl]);

  if (loading) {
    return (
      <div
        className={className}
        style={{
          display: 'inline-block',
          width: '120px',
          height: '22px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.08)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    );
  }

  if (!credential) return null;

  const entityName =
    credential.acdc?.entityName ??
    credential.acdc?.legalName ??
    credential.acdc?.name ??
    null;

  const displayLabel = entityName
    ? String(entityName)
    : credential.credentialType !== 'identity'
      ? credential.credentialType
      : null;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px 3px 7px',
        borderRadius: '999px',
        border: credential.keriVerified
          ? '1px solid rgba(16,185,129,0.45)'
          : '1px solid rgba(250,204,21,0.4)',
        background: credential.keriVerified
          ? 'rgba(16,185,129,0.12)'
          : 'rgba(250,204,21,0.10)',
        fontSize: '12px',
        fontWeight: 600,
        color: credential.keriVerified ? '#34d399' : '#fbbf24',
        whiteSpace: 'nowrap',
        cursor: 'default',
      }}
      title={
        credential.keriVerified
          ? 'Identity verified via KERI/ACDC chain'
          : 'KERIA agent unreachable — credential not yet verified'
      }
    >
      {credential.keriVerified ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5.5" stroke="#34d399" strokeWidth="1" />
          <path
            d="M3.5 6l2 2 3-3"
            stroke="#34d399"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5.5" stroke="#fbbf24" strokeWidth="1" />
          <path
            d="M6 3.5v3M6 8.5v.5"
            stroke="#fbbf24"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {displayLabel ?? (credential.keriVerified ? 'Verified' : 'Unverified')}
    </span>
  );
};

export default IssuerIdentityBadge;
