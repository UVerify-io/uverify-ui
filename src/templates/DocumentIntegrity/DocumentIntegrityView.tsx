import { useState, useCallback, JSX } from 'react';
import { sha256 } from 'js-sha256';
import {
  UVerifyCertificate,
  UVerifyCertificateExtraData,
  UVerifyMetadata,
} from '@uverify/core';
import { timestampToDateTime } from '../../utils/tools';
import { useUVerifyConfig } from '../../utils/UVerifyConfigProvider';
import uverifyIcon from '../../assets/uverify.svg';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes.toLocaleString()} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB (${bytes.toLocaleString()} bytes)`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB (${bytes.toLocaleString()} bytes)`;
}

type VerifyState = 'idle' | 'hashing' | 'match' | 'mismatch';

const FileTag = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      padding: '8px 14px',
      minWidth: '120px',
    }}
  >
    <p
      style={{
        fontSize: '9px',
        fontWeight: 700,
        color: '#94a3b8',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        marginBottom: '3px',
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: '13px',
        color: '#0f172a',
        fontWeight: 500,
        wordBreak: 'break-all',
      }}
    >
      {value}
    </p>
  </div>
);

const ShieldIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z"
      stroke="#60a5fa"
      strokeWidth="1.8"
      fill="rgba(96,165,250,0.15)"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="#60a5fa"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChainIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 15 15"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <rect
      x="0.5"
      y="0.5"
      width="5"
      height="5"
      rx="1"
      stroke="#2563eb"
      strokeWidth="1.1"
    />
    <rect
      x="9.5"
      y="0.5"
      width="5"
      height="5"
      rx="1"
      stroke="#2563eb"
      strokeWidth="1.1"
    />
    <rect
      x="0.5"
      y="9.5"
      width="5"
      height="5"
      rx="1"
      stroke="#2563eb"
      strokeWidth="1.1"
    />
    <rect
      x="9.5"
      y="9.5"
      width="5"
      height="5"
      rx="1"
      stroke="#2563eb"
      strokeWidth="1.1"
    />
    <line x1="5.5" y1="3" x2="9.5" y2="3" stroke="#2563eb" strokeWidth="1.3" />
    <line
      x1="5.5"
      y1="12"
      x2="9.5"
      y2="12"
      stroke="#2563eb"
      strokeWidth="1.3"
    />
    <line x1="3" y1="5.5" x2="3" y2="9.5" stroke="#2563eb" strokeWidth="1.3" />
    <line
      x1="12"
      y1="5.5"
      x2="12"
      y2="9.5"
      stroke="#2563eb"
      strokeWidth="1.3"
    />
  </svg>
);

interface DocumentIntegrityViewProps {
  hash: string;
  metadata: UVerifyMetadata;
  certificate: UVerifyCertificate | undefined;
  _extra: UVerifyCertificateExtraData;
}

function DocumentIntegrityView({
  hash,
  metadata,
  certificate,
}: DocumentIntegrityViewProps): JSX.Element {
  const config = useUVerifyConfig();
  const explorerPrefix =
    config.cardanoNetwork === 'mainnet' ? '' : config.cardanoNetwork + '.';

  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (typeof certificate === 'undefined') return <></>;

  const issuer = (metadata.issuer ?? 'Unknown') as string;
  const title = (metadata.title ?? 'Document') as string;
  const date = timestampToDateTime(certificate.creationTime);

  const rawFilename = (metadata['uv_url_filename'] ?? '') as string;
  const filenameIsHash = /^[a-f0-9]{64}$/i.test(rawFilename);
  const expectedFilename = filenameIsHash ? null : rawFilename || null;

  const location = (metadata.location ?? '') as string;
  const fileSize =
    metadata.file_size != null ? Number(metadata.file_size) : null;
  const fileType = (metadata.file_type ?? '') as string;
  const fileHint = (metadata.file_hint ?? '') as string;

  const customDescription = (metadata.description ?? '') as string;
  const fileLabel = expectedFilename ? `"${expectedFilename}"` : 'the file';
  const locationPart = location
    ? ` The file is available at: ${location}.`
    : '';
  const autoDescription = `You received this link because someone shared ${fileLabel} with you.${locationPart} To verify that no one has tampered with it, drop the file into the area below — the fingerprint will be compared against the blockchain record.`;
  const description = customDescription || autoDescription;

  const processFile = useCallback(
    (file: File) => {
      setDroppedFile(file);
      setVerifyState('hashing');
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const fileHash = sha256(new Uint8Array(buffer));
        setVerifyState(fileHash === hash ? 'match' : 'mismatch');
      };
      reader.readAsArrayBuffer(file);
    },
    [hash],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile],
  );

  const handleReset = useCallback(() => {
    setDroppedFile(null);
    setVerifyState('idle');
  }, []);

  // ── Drop zone appearance ──
  let dropzoneBorder = '2px dashed #cbd5e1';
  let dropzoneBg = '#f8fafc';
  if (isDragOver) {
    dropzoneBorder = '2px dashed #2563eb';
    dropzoneBg = '#eff6ff';
  } else if (verifyState === 'match') {
    dropzoneBorder = '2px solid #16a34a';
    dropzoneBg = '#f0fdf4';
  } else if (verifyState === 'mismatch') {
    dropzoneBorder = '2px solid #dc2626';
    dropzoneBg = '#fef2f2';
  }

  const dropzoneHintNode = expectedFilename ? (
    <>
      Drop the{' '}
      <span
        style={{
          fontFamily: 'monospace',
          background: '#e0e7ff',
          color: '#3730a3',
          borderRadius: '4px',
          padding: '1px 6px',
        }}
      >
        {expectedFilename}
      </span>{' '}
      file here or click to browse
    </>
  ) : (
    <>Drop your file here or click to browse</>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#f0f4f8',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: '4px',
          background: 'linear-gradient(to right, #1e3a5f, #2563eb, #1e3a5f)',
        }}
      />

      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        {/* ── Header ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '32px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <ShieldIcon />
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#60a5fa',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                Document Integrity Certificate
              </p>
            </div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#f1f5f9',
                lineHeight: 1.25,
                marginBottom: '6px',
              }}
            >
              {title}
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Certified by{' '}
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                {issuer}
              </span>
              &ensp;·&ensp;{date}
            </p>
          </div>
          <img
            src={uverifyIcon}
            width="40"
            height="46"
            alt="UVerify"
            style={{
              flexShrink: 0,
              animation: 'logo-glow 6s ease-in-out infinite',
            }}
          />
        </div>

        {/* ── Body ── */}
        <div
          style={{
            background: '#ffffff',
            padding: '32px 40px',
            minHeight: 'calc(100vh - 4px - 110px)',
          }}
        >
          {/* Instructions banner */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderLeft: '4px solid #2563eb',
              borderRadius: '6px',
              padding: '16px 20px',
              marginBottom: '28px',
            }}
          >
            <p style={{ fontSize: '13px', color: '#1e40af', lineHeight: 1.75 }}>
              {description}
            </p>
          </div>

          {/* ── Drop zone / verification area ── */}
          <div style={{ marginBottom: '32px' }}>
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
              Verify Your File
            </p>

            {verifyState === 'idle' || verifyState === 'hashing' ? (
              <label
                htmlFor="doc-integrity-file"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  minHeight: '140px',
                  border: dropzoneBorder,
                  borderRadius: '10px',
                  background: dropzoneBg,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  padding: '24px 16px',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              >
                {verifyState === 'hashing' ? (
                  <>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #bfdbfe',
                        borderTopColor: '#2563eb',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        marginBottom: '12px',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#2563eb',
                        fontWeight: 600,
                      }}
                    >
                      Computing fingerprint…
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '4px',
                      }}
                    >
                      {droppedFile?.name}
                    </p>
                  </>
                ) : (
                  <>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{
                        marginBottom: '10px',
                        color: isDragOver ? '#2563eb' : '#94a3b8',
                      }}
                    >
                      <path
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="17 8 12 3 7 8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="12"
                        y1="3"
                        x2="12"
                        y2="15"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isDragOver ? '#1d4ed8' : '#374151',
                        marginBottom: '4px',
                      }}
                    >
                      {dropzoneHintNode}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Any file type · No upload — processed locally in your
                      browser
                    </p>
                  </>
                )}
                <input
                  id="doc-integrity-file"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileInput}
                />
              </label>
            ) : verifyState === 'match' ? (
              <div
                style={{
                  border: '2px solid #16a34a',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  padding: '24px 28px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="#16a34a"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#15803d',
                        marginBottom: '4px',
                      }}
                    >
                      File Integrity Confirmed
                    </p>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#166534',
                        lineHeight: 1.65,
                      }}
                    >
                      The fingerprint of <strong>{droppedFile?.name}</strong>{' '}
                      matches the blockchain record exactly. This file has not
                      been tampered with.
                    </p>
                    {droppedFile && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '10px',
                          marginTop: '14px',
                        }}
                      >
                        <FileTag label="Filename" value={droppedFile.name} />
                        <FileTag
                          label="Size"
                          value={formatFileSize(droppedFile.size)}
                        />
                        {droppedFile.type && (
                          <FileTag label="Type" value={droppedFile.type} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    marginTop: '16px',
                    fontSize: '12px',
                    color: '#16a34a',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Verify a different file
                </button>
              </div>
            ) : (
              <div
                style={{
                  border: '2px solid #dc2626',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  padding: '24px 28px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 9v4M12 17h.01"
                        stroke="#dc2626"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                        stroke="#dc2626"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#b91c1c',
                        marginBottom: '4px',
                      }}
                    >
                      Fingerprint Mismatch
                    </p>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#991b1b',
                        lineHeight: 1.65,
                      }}
                    >
                      The fingerprint of <strong>{droppedFile?.name}</strong>{' '}
                      does not match the blockchain record. The file may have
                      been modified, or this is not the correct file.
                    </p>
                    {droppedFile && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '10px',
                          marginTop: '14px',
                        }}
                      >
                        <FileTag
                          label="Dropped file"
                          value={droppedFile.name}
                        />
                        <FileTag
                          label="Size"
                          value={formatFileSize(droppedFile.size)}
                        />
                        {droppedFile.type && (
                          <FileTag label="Type" value={droppedFile.type} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    marginTop: '16px',
                    fontSize: '12px',
                    color: '#b91c1c',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Try a different file
                </button>
              </div>
            )}
          </div>

          {/* Expected file metadata */}
          <div style={{ marginBottom: '32px' }}>
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
              Expected File
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {expectedFilename && (
                <FileTag label="Filename" value={expectedFilename} />
              )}
              {fileSize != null && fileSize > 0 && (
                <FileTag label="Size" value={formatFileSize(fileSize)} />
              )}
              {fileType && <FileTag label="Type" value={fileType} />}
              {fileHint && <FileTag label="Note" value={fileHint} />}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  minWidth: '120px',
                  flexBasis: '100%',
                }}
              >
                <p
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    marginBottom: '3px',
                  }}
                >
                  Expected Fingerprint (SHA-256)
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#0f172a',
                    fontWeight: 500,
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {hash}
                </p>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ borderTop: '1px dashed #e2e8f0', margin: '32px 0' }} />

          {/* ── Blockchain record ── */}
          <div>
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
              style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
            >
              <div style={{ marginTop: '2px' }}>
                <ChainIcon />
              </div>
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
                  Certificate / File Fingerprint (SHA-256)
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
                  marginTop: '12px',
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
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: '14px 40px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>
            Verified on Cardano blockchain · Certified by {issuer}
          </p>
          <img
            src={uverifyIcon}
            width="16"
            height="18"
            alt="UVerify"
            style={{ opacity: 0.22 }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes logo-glow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(34,211,238,0.4)) drop-shadow(0 0 18px rgba(34,211,238,0.15)); }
          50%       { filter: drop-shadow(0 0 14px rgba(34,211,238,0.9)) drop-shadow(0 0 36px rgba(34,211,238,0.4)); }
        }
      `}</style>
    </div>
  );
}

export default DocumentIntegrityView;
