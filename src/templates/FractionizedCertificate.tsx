import { useEffect, useState } from 'react';
import {
  BuildTransactionParams,
  Template,
  UVerifyCertificate,
  UVerifyCertificateExtraData,
  UVerifyMetadata,
} from '@uverify/core';
import { timestampToDateTime } from '../utils/tools';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';
import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet';
import { JSX } from 'react';
import axios from 'axios';

// ── Icons ─────────────────────────────────────────────────────────────────────

const ChainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    <path d="M5.5 8.5a3 3 0 0 0 4.243 0l2-2a3 3 0 0 0-4.243-4.243l-1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8.5 5.5a3 3 0 0 0-4.243 0l-2 2a3 3 0 0 0 4.243 4.243l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2 10L10 2M10 2H6M10 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WalletIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1 7h13" stroke="currentColor" strokeWidth="1.3" />
    <path d="M4 1.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="10.5" cy="10.5" r="1" fill="currentColor" />
  </svg>
);

// ── Claim panel ───────────────────────────────────────────────────────────────

interface NodeStatus {
  exists: boolean;
  totalAmount: number;
  remainingAmount: number;
  exhausted: boolean;
  claimants: string[];
  assetName: string;
}

type ClaimState = 'idle' | 'building' | 'signing' | 'submitting' | 'done' | 'error';

interface ClaimPanelProps {
  certHash: string;
  backendUrl: string;
  initUtxoTxHash: string;
  initUtxoOutputIndex: number;
  mintingPolicyId?: string;
}

const ClaimPanel = ({
  certHash,
  backendUrl,
  initUtxoTxHash,
  initUtxoOutputIndex,
  mintingPolicyId,
}: ClaimPanelProps) => {
  const [nodeStatus,  setNodeStatus]  = useState<NodeStatus | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [amount,      setAmount]      = useState(1);
  const [claimState,  setClaimState]  = useState<ClaimState>('idle');
  const [claimError,  setClaimError]  = useState('');

  const { isConnected, usedAddresses, enabledWallet } = useCardano();
  const walletAddress = usedAddresses?.[0];

  useEffect(() => {
    if (!certHash || !initUtxoTxHash) { setLoading(false); return; }

    fetch(`${backendUrl}/api/v1/extension/fractionized-certificate/status/${certHash}?initUtxoTxHash=${initUtxoTxHash}&initUtxoOutputIndex=${initUtxoOutputIndex}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setNodeStatus(data.exists ? data : null);
        setAmount(1);
      })
      .catch(() => setNodeStatus(null))
      .finally(() => setLoading(false));
  }, [certHash, backendUrl, initUtxoTxHash, initUtxoOutputIndex]);

  const isAllowed = nodeStatus
    ? nodeStatus.claimants.length === 0
    : false;

  const handleClaim = async () => {
    if (!walletAddress || !enabledWallet || !nodeStatus) return;
    setClaimState('building');
    setClaimError('');

    try {
      const buildRes = await fetch(`${backendUrl}/api/v1/extension/fractionized-certificate/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimerAddress: walletAddress,
          key: certHash,
          amount,
          initUtxoTxHash,
          initUtxoOutputIndex,
        }),
      });
      if (!buildRes.ok) throw new Error(await buildRes.text());
      const unsignedTransaction = await buildRes.text();

      setClaimState('signing');
      const api = await (window as any).cardano[enabledWallet].enable();
      const witnessSet = await api.signTx(unsignedTransaction, true);

      setClaimState('submitting');
      const submitRes = await fetch(`${backendUrl}/api/v1/transaction/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: unsignedTransaction, witnessSet }),
      });
      if (!submitRes.ok) throw new Error(await submitRes.text());

      setClaimState('done');
      setNodeStatus((prev) =>
        prev ? { ...prev, remainingAmount: prev.remainingAmount - amount, exhausted: prev.remainingAmount - amount === 0 } : prev,
      );
    } catch (err: any) {
      setClaimState('error');
      setClaimError(err?.message ?? 'Unknown error');
    }
  };

  const explorerBase = backendUrl.includes('preprod')
    ? 'preprod.cexplorer.io'
    : backendUrl.includes('preview')
    ? 'preview.cexplorer.io'
    : 'cexplorer.io';

  const accentColor = 'rgba(52,211,153,1)';
  const accentSoft  = 'rgba(52,211,153,0.8)';
  const accentFaint = 'rgba(52,211,153,0.12)';
  const accentBorder = 'rgba(52,211,153,0.25)';

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: accentFaint, border: `1px solid ${accentBorder}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke={accentSoft} strokeWidth="1.3" />
          <path d="M5 8.5l2 2 4-4" stroke={accentSoft} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentSoft }}>
          Claim Tokens
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: accentSoft }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Checking status…</span>
        </div>
      )}

      {!loading && nodeStatus === null && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Claim status unavailable — node not found on-chain.
        </p>
      )}

      {!loading && nodeStatus && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span>Remaining</span>
              <span style={{ color: nodeStatus.exhausted ? 'rgba(239,68,68,0.8)' : accentSoft }}>
                {nodeStatus.remainingAmount} / {nodeStatus.totalAmount}
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${(nodeStatus.remainingAmount / nodeStatus.totalAmount) * 100}%`,
                  background: nodeStatus.exhausted ? 'rgba(239,68,68,0.7)' : accentColor,
                }}
              />
            </div>
          </div>

          {/* Exhausted */}
          {nodeStatus.exhausted && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(239,68,68,0.8)' }} />
              <span className="text-sm" style={{ color: 'rgba(239,68,68,0.9)' }}>All tokens have been claimed.</span>
            </div>
          )}

          {/* Access policy */}
          {!nodeStatus.exhausted && (
            <>
              {nodeStatus.claimants.length === 0 ? (
                <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                  Open access — any wallet may claim.
                </div>
              ) : (
                <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Allowed claimants</p>
                  <div className="space-y-1">
                    {nodeStatus.claimants.map((c) => (
                      <p key={c} className="font-mono break-all" style={{ color: 'rgba(255,255,255,0.65)' }}>{c}</p>
                    ))}
                  </div>
                </div>
              )}

              {mintingPolicyId && (
                <div className="rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: 'rgba(0,0,0,0.3)', color: accentSoft, border: `1px solid ${accentBorder}` }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>policy: </span>{mintingPolicyId}
                </div>
              )}

              {claimState === 'done' ? (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(34,197,94,0.9)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(34,197,94)' }} />
                  {amount} token{amount !== 1 ? 's' : ''} claimed successfully!
                </div>
              ) : !isConnected ? (
                <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Connect your wallet to claim tokens from this certificate.
                  </p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <WalletIcon />
                    Use the wallet button in the header to connect.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Amount input */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>Amount</label>
                    <input
                      type="number"
                      min={1}
                      max={nodeStatus.remainingAmount}
                      value={amount}
                      onChange={(e) => setAmount(Math.max(1, Math.min(nodeStatus.remainingAmount, parseInt(e.target.value) || 1)))}
                      disabled={claimState !== 'idle' && claimState !== 'error'}
                      className="flex-1 rounded-lg px-3 py-1.5 text-sm font-mono text-right"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.85)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {claimState === 'error' && (
                    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.8)' }}>
                      {claimError || 'Claim failed. Please try again.'}
                    </div>
                  )}

                  <button
                    onClick={handleClaim}
                    disabled={(claimState !== 'idle' && claimState !== 'error') || (!isAllowed && nodeStatus.claimants.length > 0)}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: claimState === 'idle' || claimState === 'error' ? accentColor : 'rgba(52,211,153,0.35)',
                      color: claimState === 'idle' || claimState === 'error' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.45)',
                      cursor: claimState === 'idle' || claimState === 'error' ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {claimState === 'building'   && 'Building transaction…'}
                    {claimState === 'signing'    && 'Waiting for signature…'}
                    {claimState === 'submitting' && 'Submitting…'}
                    {(claimState === 'idle' || claimState === 'error') && `Claim ${amount} token${amount !== 1 ? 's' : ''}`}
                  </button>

                  {nodeStatus.claimants.length > 0 && !isAllowed && (
                    <p className="text-xs text-center" style={{ color: 'rgba(239,68,68,0.7)' }}>
                      The connected wallet is not on the claimants list.
                    </p>
                  )}
                </div>
              )}

              {mintingPolicyId && claimState === 'done' && (
                <a
                  href={`https://${explorerBase}/policy/${mintingPolicyId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: accentSoft }}
                >
                  View token on explorer <ExternalLinkIcon />
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── Template class ────────────────────────────────────────────────────────────

class FractionizedCertificateTemplate extends Template {
  public name = 'Fractionized Certificate';
  public defaultUpdatePolicy = 'first' as const;

  public requiredBackendExtensions = ['fractionized-certificate'];

  public theme = {
    background: 'bg-main-gradient',
    footer: { hide: false },
  };

  public layoutMetadata = {
    asset_name:             'Human-readable name of the certified asset',
    asset_class:            'Category (e.g. Carbon Credit, Commodity, Membership)',
    issuer_name:            'Issuing organisation or individual',
    ipfs_image:             'IPFS CID of the asset image (e.g. QmXxx…)',
    description:            'Description of the fractionized asset',
    total_amount:           'Total number of tokens available for claiming',
    asset_name_hex:         'Hex-encoded asset name for the fungible token to be minted',
    init_utxo_tx_hash:      'Tx-hash of the init UTxO used to derive the policy ID',
    init_utxo_output_index: 'Output index of the init UTxO (usually 0)',
    claimants:              'Comma-separated hex payment key hashes allowed to claim (leave empty for open access)',
    minting_policy_id:      'Policy ID of the fractionized_certificate validator (set by backend)',
  };

  public buildTransaction = async (params: BuildTransactionParams): Promise<string> => {
    const { address, hash, metadata, bootstrapTokenName, backendUrl, searchParams } = params;

    const initUtxoTxHash =
      (searchParams.get('fractionizedInitTxHash') ??
        (metadata.init_utxo_tx_hash as string | undefined) ??
        '') as string;
    const initUtxoOutputIndex = parseInt(
      searchParams.get('fractionizedInitOutputIndex') ??
        (metadata.init_utxo_output_index as string | undefined) ??
        '0',
      10,
    );
    const totalAmount = parseInt((metadata.total_amount as string | undefined) ?? '1', 10);
    const assetNameHex = (metadata.asset_name_hex as string | undefined) ?? '';
    const claimantsRaw = (metadata.claimants as string | undefined) ?? '';
    const claimants = claimantsRaw
      ? claimantsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const response = await axios.post(
      `${backendUrl}/api/v1/extension/fractionized-certificate/insert`,
      {
        inserterAddress:     address,
        key:                 hash,
        totalAmount,
        claimants,
        assetName:           assetNameHex,
        initUtxoTxHash,
        initUtxoOutputIndex,
        bootstrapTokenName:  bootstrapTokenName ?? undefined,
      },
    );

    return response.data as string;
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    if (!certificate) return <></>;

    const config = useUVerifyConfig();
    const explorerPrefix =
      config.cardanoNetwork === 'mainnet' ? '' : config.cardanoNetwork + '.';

    const assetName      = (metadata.asset_name      ?? 'Unnamed Asset')  as string;
    const assetClass     = (metadata.asset_class     ?? '')                as string;
    const issuerName     = (metadata.issuer_name     ?? 'Unknown Issuer') as string;
    const ipfsCid        = (metadata.ipfs_image      ?? '')                as string;
    const description    = (metadata.description     ?? '')                as string;
    const totalAmount    = (metadata.total_amount    ?? '')                as string;
    const mintingPolicyId = (metadata.minting_policy_id ?? '')             as string;

    const initUtxoTxHash = (metadata.init_utxo_tx_hash ?? '') as string;
    const initUtxoOutputIndex = parseInt((metadata.init_utxo_output_index ?? '0') as string, 10);

    const imageUrl = ipfsCid ? `https://ipfs.io/ipfs/${ipfsCid}` : null;
    const date = timestampToDateTime(certificate.creationTime);

    return (
      <div
        className="min-h-screen flex items-start sm:items-center justify-center p-0 sm:p-6"
        style={{ background: 'linear-gradient(145deg, #030812 0%, #071020 55%, #030812 100%)' }}
      >
        <div
          className="w-full max-w-4xl overflow-hidden rounded-none sm:rounded-2xl"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 24px 64px rgba(0,0,0,0.8)' }}
        >
          {/* ── Header ── */}
          <div
            className="px-6 sm:px-10 pt-8 pb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.10) 0%, rgba(3,8,18,0.95) 60%)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start gap-5">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={assetName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" />
                    <path d="M7 12h10M12 7v10" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {assetClass && (
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1"
                    style={{ background: 'rgba(52,211,153,0.12)', color: 'rgba(52,211,153,0.9)', border: '1px solid rgba(52,211,153,0.25)' }}
                  >
                    {assetClass}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  {assetName}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Issued by <span style={{ color: 'rgba(255,255,255,0.8)' }}>{issuerName}</span>
                </p>
              </div>

              {totalAmount && (
                <div
                  className="flex-shrink-0 text-right rounded-xl px-4 py-3 hidden sm:block"
                  style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)' }}
                >
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(52,211,153,0.6)' }}>
                    Total Supply
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {totalAmount}
                    <span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>tokens</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-6 sm:px-10 py-8 space-y-6" style={{ background: 'rgba(3,8,18,0.97)' }}>
            {description && (
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {description}
              </p>
            )}

            <ClaimPanel
              certHash={hash}
              backendUrl={config.backendUrl}
              initUtxoTxHash={initUtxoTxHash}
              initUtxoOutputIndex={initUtxoOutputIndex}
              mintingPolicyId={mintingPolicyId}
            />

            {/* Provenance footer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Issued</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{date}</p>
                </div>

                <div
                  className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div style={{ paddingTop: '1px', color: 'rgba(255,255,255,0.3)' }}>
                    <ChainIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Certificate ID
                    </p>
                    <p className="text-xs font-mono break-all" style={{ color: 'rgba(255,255,255,0.5)' }}>{hash}</p>
                  </div>
                </div>
              </div>

              {certificate.transactionHash && (
                <a
                  href={`https://${explorerPrefix}cexplorer.io/tx/${certificate.transactionHash}/contract#data`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs mt-4 uppercase tracking-wider transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  View on block explorer <ExternalLinkIcon />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FractionizedCertificateTemplate;
