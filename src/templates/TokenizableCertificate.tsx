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

// ── Tokenization panel ────────────────────────────────────────────────────────

type NodeStatus = 'loading' | 'available' | 'redeemed' | 'unknown';
type MintState  = 'idle' | 'building' | 'signing' | 'submitting' | 'done' | 'error';

interface TokenizationPanelProps {
  certHash: string;
  backendUrl: string;
  mintingPolicyId?: string;
}

const TokenizationPanel = ({ certHash, backendUrl, mintingPolicyId }: TokenizationPanelProps) => {
  const [nodeStatus, setNodeStatus]   = useState<NodeStatus>('loading');
  const [isOwner,    setIsOwner]      = useState<boolean | null>(null);
  const [mintState,  setMintState]    = useState<MintState>('idle');
  const [mintError,  setMintError]    = useState('');

  const { isConnected, usedAddresses, enabledWallet } = useCardano();
  const walletAddress = usedAddresses?.[0];

  // Fetch node status; also ask backend whether the connected wallet is the owner.
  useEffect(() => {
    if (!certHash) { setNodeStatus('unknown'); return; }

    const url = walletAddress
      ? `${backendUrl}/api/v1/tokenizable/node/${certHash}?walletAddress=${walletAddress}`
      : `${backendUrl}/api/v1/tokenizable/node/${certHash}`;

    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setNodeStatus(data.status === 'Available' ? 'available' : 'redeemed');
        if (typeof data.isOwner === 'boolean') setIsOwner(data.isOwner);
      })
      .catch(() => setNodeStatus('unknown'));
  }, [certHash, backendUrl, walletAddress]);

  // Re-check ownership when wallet connection changes.
  useEffect(() => {
    if (!isConnected || !walletAddress || !certHash || nodeStatus === 'loading') return;

    fetch(`${backendUrl}/api/v1/tokenizable/node/${certHash}?walletAddress=${walletAddress}`)
      .then((r) => r.json())
      .then((data) => { if (typeof data.isOwner === 'boolean') setIsOwner(data.isOwner); })
      .catch(() => {});
  }, [isConnected, walletAddress]);

  const handleMint = async () => {
    if (!walletAddress || !enabledWallet) return;
    setMintState('building');
    setMintError('');

    try {
      // Ask the backend to build the unsigned mint transaction.
      const buildRes = await fetch(`${backendUrl}/api/v1/tokenizable/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateHash: certHash, issuerAddress: walletAddress }),
      });
      if (!buildRes.ok) throw new Error(await buildRes.text());
      const { unsignedTransaction } = await buildRes.json();

      // Sign the transaction with the connected wallet.
      setMintState('signing');
      const api = await (window as any).cardano[enabledWallet].enable();
      const witnessSet = await api.signTx(unsignedTransaction, true);

      // Submit the signed transaction.
      setMintState('submitting');
      const submitRes = await fetch(`${backendUrl}/api/v1/transaction/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: unsignedTransaction, witnessSet }),
      });
      if (!submitRes.ok) throw new Error(await submitRes.text());

      setMintState('done');
      setNodeStatus('redeemed');
    } catch (err: any) {
      setMintState('error');
      setMintError(err?.message ?? 'Unknown error');
    }
  };

  const explorerBase = backendUrl.includes('preprod')
    ? 'preprod.cexplorer.io'
    : backendUrl.includes('preview')
    ? 'preview.cexplorer.io'
    : 'cexplorer.io';

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <polygon points="8,1 15,14 1,14" stroke="rgba(251,191,36,0.8)" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
          <line x1="8" y1="6" x2="8" y2="10" stroke="rgba(251,191,36,0.8)" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="8" cy="12" r="0.7" fill="rgba(251,191,36,0.8)" />
        </svg>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(251,191,36,0.8)' }}>
          Tokenization Rights
        </p>
      </div>

      {/* ── Loading ── */}
      {nodeStatus === 'loading' && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'rgba(251,191,36,0.5)' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Checking status…</span>
        </div>
      )}

      {/* ── Unknown ── */}
      {nodeStatus === 'unknown' && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Tokenization status unavailable
          </span>
        </div>
      )}

      {/* ── Available ── */}
      {nodeStatus === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(251,191,36)', boxShadow: '0 0 6px rgba(251,191,36,0.7)' }} />
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Available — token not yet minted
            </span>
          </div>

          {mintingPolicyId && (
            <div className="rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(251,191,36,0.7)', border: '1px solid rgba(251,191,36,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>policy: </span>{mintingPolicyId}
            </div>
          )}

          {/* Wallet connection + mint */}
          {mintState === 'done' ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(34,197,94,0.9)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(34,197,94)' }} />
              Token minted successfully!
            </div>
          ) : !isConnected ? (
            <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Connect your wallet to check whether you are entitled to mint this token.
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <WalletIcon />
                Use the wallet button in the header to connect.
              </div>
            </div>
          ) : isOwner === false ? (
            <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(239,68,68,0.8)' }}>
                The connected wallet is not authorised to mint this token.
              </p>
            </div>
          ) : isOwner === true ? (
            <div className="space-y-3">
              <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <p className="text-xs" style={{ color: 'rgba(34,197,94,0.8)' }}>
                  Your wallet is authorised — you can mint this token.
                </p>
              </div>

              {mintState === 'error' && (
                <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.8)' }}>
                  {mintError || 'Minting failed. Please try again.'}
                </div>
              )}

              <button
                onClick={handleMint}
                disabled={mintState !== 'idle' && mintState !== 'error'}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: mintState === 'idle' || mintState === 'error'
                    ? 'rgba(251,191,36,0.9)'
                    : 'rgba(251,191,36,0.4)',
                  color: mintState === 'idle' || mintState === 'error'
                    ? 'rgba(0,0,0,0.9)'
                    : 'rgba(0,0,0,0.5)',
                  cursor: mintState === 'idle' || mintState === 'error' ? 'pointer' : 'not-allowed',
                }}
              >
                {mintState === 'building'   && 'Building transaction…'}
                {mintState === 'signing'    && 'Waiting for signature…'}
                {mintState === 'submitting' && 'Submitting…'}
                {(mintState === 'idle' || mintState === 'error') && 'Mint Token'}
              </button>
            </div>
          ) : (
            // isOwner is null — wallet connected but ownership not yet resolved
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.3)' }} />
              Verifying wallet…
            </div>
          )}
        </div>
      )}

      {/* ── Redeemed ── */}
      {nodeStatus === 'redeemed' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(34,197,94)', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Redeemed — token is in circulation
            </span>
          </div>

          {mintingPolicyId && (
            <>
              <div className="rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>policy: </span>{mintingPolicyId}
              </div>
              <div className="rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>token: </span>{certHash}
              </div>
              <a
                href={`https://${explorerBase}/policy/${mintingPolicyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: 'rgba(34,197,94,0.8)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(34,197,94)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(34,197,94,0.8)')}
              >
                View token on explorer <ExternalLinkIcon />
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── Template class ────────────────────────────────────────────────────────────

class TokenizableCertificateTemplate extends Template {
  public name = 'Tokenizable Certificate';
  public defaultUpdatePolicy = 'first' as const;

  /**
   * Extension identifiers that must be reachable at
   * `GET /api/v1/extension/{name}` before this template is shown.
   */
  public requiredBackendExtensions = ['tokenizable-certificate'];

  public theme = {
    background: 'bg-main-gradient',
    footer: { hide: false },
  };

  public layoutMetadata = {
    asset_name:              'Human-readable name of the certified asset',
    asset_class:             'Category (e.g. Real Estate, Art, Commodity, IP, Membership)',
    issuer_name:             'Issuing organisation or individual',
    ipfs_image:              'IPFS CID of the asset image (e.g. QmXxx…)',
    description:             'Description of the certified asset',
    valuation:               'Optional current valuation (numeric)',
    valuation_currency:      'Currency or unit of the valuation (e.g. USD, EUR, ADA)',
    jurisdiction:            'Legal or regulatory jurisdiction',
    asset_id:                'Unique identifier of the asset (e.g. registry number)',
    // Fields required by the Insert endpoint — filled in by the issuer:
    owner_pub_key_hash:      'Hex payment key hash of the wallet that will own the NFT',
    asset_name_hex:          'Hex-encoded base asset name for the NFT to be minted',
    init_utxo_tx_hash:       'Tx-hash of the init UTxO used to derive the policy ID',
    init_utxo_output_index:  'Output index of the init UTxO (usually 0)',
    // Written by the backend — not filled in by the issuer:
    minting_policy_id:       'Policy ID of the tokenizable_certificate validator (set by backend)',
  };

  /**
   * Custom transaction builder for this template.
   * Called by the Creation page instead of the standard `/api/v1/transaction/build` endpoint.
   * Resolves to the unsigned transaction CBOR hex, or throws on error.
   */
  public buildTransaction = async (params: BuildTransactionParams): Promise<string> => {
    const { address, hash, metadata, bootstrapTokenName, backendUrl, searchParams } = params;

    const initUtxoTxHash =
      (searchParams.get('tokenizableInitTxHash') ??
        (metadata.init_utxo_tx_hash as string | undefined) ??
        '') as string;
    const initUtxoOutputIndex = parseInt(
      searchParams.get('tokenizableInitOutputIndex') ??
        (metadata.init_utxo_output_index as string | undefined) ??
        '0',
      10,
    );
    const ownerPubKeyHash = (metadata.owner_pub_key_hash as string | undefined) ?? '';
    const assetNameHex    = (metadata.asset_name_hex    as string | undefined) ?? '';

    const response = await axios.post(
      `${backendUrl}/api/v1/extension/tokenizable-certificate/insert`,
      {
        inserterAddress:     address,
        key:                 hash,
        ownerPubKeyHash,
        assetName:           assetNameHex,
        initUtxoTxHash,
        initUtxoOutputIndex,
        bootstrapTokenName:  bootstrapTokenName ?? undefined,
      },
    );

    // Extension endpoint returns the hex tx directly as a string.
    return response.data as string;
  }

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

    const assetName       = (metadata.asset_name        ?? 'Unnamed Asset')   as string;
    const assetClass      = (metadata.asset_class       ?? '')                 as string;
    const issuerName      = (metadata.issuer_name       ?? 'Unknown Issuer')  as string;
    const ipfsCid         = (metadata.ipfs_image        ?? '')                 as string;
    const description     = (metadata.description       ?? '')                 as string;
    const valuation       = metadata.valuation                                  as string | number | null;
    const valuationCcy    = (metadata.valuation_currency ?? '')                 as string;
    const jurisdiction    = (metadata.jurisdiction      ?? '')                  as string;
    const assetId         = (metadata.asset_id          ?? '')                  as string;
    const mintingPolicyId = (metadata.minting_policy_id ?? '')                  as string;

    const imageUrl = ipfsCid ? `https://ipfs.io/ipfs/${ipfsCid}` : null;
    const date = timestampToDateTime(certificate.creationTime);
    const hasValuation = valuation !== null && valuation !== undefined && String(valuation).trim() !== '';

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
              background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(3,8,18,0.95) 60%)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start gap-5">
              {/* Asset image */}
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
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5" />
                    <path d="M3 16l5-5 4 4 3-3 6 6" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              {/* Title block */}
              <div className="flex-1 min-w-0">
                {assetClass && (
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1"
                    style={{ background: 'rgba(251,191,36,0.15)', color: 'rgba(251,191,36,0.9)', border: '1px solid rgba(251,191,36,0.25)' }}
                  >
                    {assetClass}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  {assetName}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Issued by{' '}
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>{issuerName}</span>
                  {jurisdiction && <> · {jurisdiction}</>}
                </p>
              </div>

              {/* Valuation badge (desktop) */}
              {hasValuation && (
                <div
                  className="flex-shrink-0 text-right rounded-xl px-4 py-3 hidden sm:block"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}
                >
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(251,191,36,0.6)' }}>
                    Valuation
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {String(valuation)}
                    {valuationCcy && (
                      <span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {valuationCcy}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Valuation (mobile) */}
            {hasValuation && (
              <div className="mt-4 sm:hidden">
                <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(251,191,36,0.6)' }}>
                  Valuation:{' '}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {String(valuation)} {valuationCcy}
                </span>
              </div>
            )}
          </div>

          {/* ── Body ── */}
          <div className="px-6 sm:px-10 py-8 space-y-6" style={{ background: 'rgba(3,8,18,0.97)' }}>
            {/* Description */}
            {description && (
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {description}
              </p>
            )}

            {/* Details grid */}
            {(assetId || jurisdiction) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assetId && (
                  <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Asset ID</p>
                    <p className="text-sm font-mono break-all" style={{ color: 'rgba(255,255,255,0.75)' }}>{assetId}</p>
                  </div>
                )}
                {jurisdiction && (
                  <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Jurisdiction</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{jurisdiction}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tokenization panel */}
            <TokenizationPanel
              certHash={hash}
              backendUrl={config.backendUrl}
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

export default TokenizableCertificateTemplate;
