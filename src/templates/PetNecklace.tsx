import {
  Template,
  UVerifyCertificate,
  UVerifyCertificateExtraData,
  UVerifyMetadata,
  ThemeSettings,
} from '@uverify/core';
import { timestampToDateTime } from '../utils/tools';
import { JSX } from 'react';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';
import { toast } from 'react-toastify';

const PawIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="11" cy="20" rx="6" ry="8" />
    <ellipse cx="25" cy="13" rx="6" ry="8" />
    <ellipse cx="39" cy="13" rx="6" ry="8" />
    <ellipse cx="53" cy="20" rx="6" ry="8" />
    <path d="M32 28C20 28 14 36 14 44C14 52 20 56 32 56C44 56 50 52 50 44C50 36 44 28 32 28Z" />
  </svg>
);

class PetNecklaceTemplate extends Template {
  public name = 'Pet Necklace';
  public theme: Partial<ThemeSettings> = {
    background: 'bg-emerald-950',
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
            start: 'rgb(16, 185, 129)',
            end: 'rgb(5, 150, 105)',
          },
        },
      },
      pagination: {
        border: {
          active: { color: 'border-emerald-500' },
          inactive: {
            color: 'border-emerald-900/50',
            hover: { color: 'border-emerald-500' },
          },
        },
        text: {
          active: { color: 'white', hover: { color: 'white' } },
          inactive: { color: 'white', hover: { color: 'white' } },
        },
        background: {
          active: { color: 'bg-emerald-600' },
          inactive: {
            color: 'bg-emerald-900/30',
            hover: { color: 'bg-emerald-600' },
          },
        },
      },
      identityCard: {
        border: {
          color: 'emerald',
          opacity: 60,
          hover: { color: 'emerald', opacity: 100 },
        },
        background: {
          color: 'emerald',
          opacity: 20,
          hover: { color: 'emerald', opacity: 40 },
        },
      },
      metadataViewer: {
        border: {
          color: 'emerald',
          opacity: 40,
          hover: { color: 'emerald', opacity: 80 },
        },
      },
    },
  };

  public layoutMetadata = {
    pet_name: 'The name of the pet',
    uv_url_owner_name: "The owner's full name",
    uv_url_phone: "The owner's phone number",
    species: 'Optional: e.g. Dog, Cat, Rabbit',
    breed: 'Optional: e.g. Golden Retriever',
    note: 'Optional message, e.g. "Please call if found!"',
  };

  public render(
    _hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    if (typeof certificate === 'undefined') {
      return <></>;
    }

    const config = useUVerifyConfig();
    const explorerUrlPrefix =
      config.cardanoNetwork === 'mainnet' ? '' : config.cardanoNetwork + '.';

    const isHash = (val: string) => /^[a-f0-9]{64}$/i.test(val);

    const petName = (metadata.pet_name ?? 'Unknown Pet') as string;
    const ownerName = (metadata['uv_url_owner_name'] ?? '') as string;
    const phone = (metadata['uv_url_phone'] ?? '') as string;
    const species = (metadata.species ?? '') as string;
    const breed = (metadata.breed ?? '') as string;
    const note = (metadata.note ?? '') as string;
    const date = timestampToDateTime(certificate.creationTime);

    const ownerNameResolved = ownerName !== '' && !isHash(ownerName);
    const phoneResolved = phone !== '' && !isHash(phone);
    const subtitle = [species, breed].filter(Boolean).join(' · ');

    return (
      <div className="min-h-screen w-full flex items-start sm:items-center justify-center p-0 sm:p-6 bg-emerald-950">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-none sm:rounded-[18px] flex flex-col min-h-screen sm:min-h-0">
          <div
            className="relative px-6 pt-8 pb-12"
            style={{
              background:
                'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(52,211,153,0.1) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                top: '-30px',
                right: '40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
              }}
            />
            <div className="relative flex items-start justify-between gap-4 mb-6">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(52,211,153,0.15)',
                  border: '1px solid rgba(52,211,153,0.3)',
                  color: '#6ee7b7',
                }}
              >
                <PawIcon className="w-3 h-3" />
                Pet ID
              </span>
            </div>
            <div className="relative">
              <h1
                className="text-4xl sm:text-5xl font-bold"
                style={{
                  fontFamily:
                    '"Garamond", "EB Garamond", "Palatino Linotype", Palatino, serif',
                  color: '#f0fdf4',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}
              >
                {petName}
              </h1>
              {subtitle && (
                <p className="text-sm mt-2" style={{ color: '#6ee7b7' }}>
                  {subtitle}
                </p>
              )}
              <div
                style={{
                  marginTop: '14px',
                  width: '40px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'linear-gradient(to right, #34d399, #059669)',
                }}
              />
            </div>
            <div
              className="absolute pointer-events-none"
              style={{ bottom: '-12px', right: '20px', opacity: 0.07 }}
            >
              <PawIcon className="w-32 h-32 text-white" />
            </div>
          </div>
          <div className="px-6 py-8 flex-1" style={{ background: '#ffffff' }}>
            {ownerName && (
              <div className="mb-5">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: '#94a3b8' }}
                >
                  Owner
                </p>
                {ownerNameResolved ? (
                  <p
                    className="text-lg font-semibold"
                    style={{ color: '#0f172a' }}
                  >
                    {ownerName}
                  </p>
                ) : (
                  <p className="text-sm italic" style={{ color: '#94a3b8' }}>
                    Identity is privacy-protected
                  </p>
                )}
              </div>
            )}
            {phone && (
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: '#059669' }}
                  >
                    Phone
                  </p>
                  {phoneResolved ? (
                    <p
                      className="text-base font-semibold"
                      style={{ color: '#0f172a' }}
                    >
                      {phone}
                    </p>
                  ) : (
                    <p className="text-sm italic" style={{ color: '#94a3b8' }}>
                      Privacy-protected · not revealed via this link
                    </p>
                  )}
                </div>
                {phoneResolved && (
                  <div className="flex gap-2 ml-3 shrink-0">
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: '#10b981', color: '#ffffff' }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"
                        />
                      </svg>
                      Call
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(phone);
                        toast.success('Phone number copied');
                      }}
                      className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{
                        border: '1px solid #bbf7d0',
                        color: '#059669',
                        background: 'transparent',
                      }}
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            )}
            {note && (
              <div
                className="rounded-xl px-4 py-3 mb-5"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: '#d97706' }}
                >
                  Note
                </p>
                <p className="text-sm" style={{ color: '#78350f' }}>
                  {note}
                </p>
              </div>
            )}
            <div className="pt-5" style={{ borderTop: '1px solid #e2e8f0' }}>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                style={{ color: '#94a3b8' }}
              >
                Registered
              </p>
              <p className="text-xs font-semibold" style={{ color: '#475569' }}>
                {date}
              </p>
              {certificate.transactionHash && (
                <a
                  href={`https://${explorerUrlPrefix}cexplorer.io/tx/${certificate.transactionHash}/contract#data`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#10b981' }}
                >
                  View on Block Explorer
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
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
        </div>
      </div>
    );
  }
}

export default PetNecklaceTemplate;
