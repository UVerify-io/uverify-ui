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

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatLabel(key: string): string {
  return key
    .replace(/^(mat_|cert_|repair_|eol_)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function lighten(hex: string, amount = 0.9): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

const ChainIcon = ({ color }: { color: string }) => (
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
      stroke={color}
      strokeWidth="1.1"
    />
    <rect
      x="9.5"
      y="0.5"
      width="5"
      height="5"
      rx="1"
      stroke={color}
      strokeWidth="1.1"
    />
    <rect
      x="0.5"
      y="9.5"
      width="5"
      height="5"
      rx="1"
      stroke={color}
      strokeWidth="1.1"
    />
    <rect
      x="9.5"
      y="9.5"
      width="5"
      height="5"
      rx="1"
      stroke={color}
      strokeWidth="1.1"
    />
    <line x1="5.5" y1="3" x2="9.5" y2="3" stroke={color} strokeWidth="1.3" />
    <line x1="5.5" y1="12" x2="9.5" y2="12" stroke={color} strokeWidth="1.3" />
    <line x1="3" y1="5.5" x2="3" y2="9.5" stroke={color} strokeWidth="1.3" />
    <line x1="12" y1="5.5" x2="12" y2="9.5" stroke={color} strokeWidth="1.3" />
  </svg>
);

// ─── Section wrapper ─────────────────────────────────────────────────────────

const Section = ({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: JSX.Element | (JSX.Element | null | false)[];
}) => (
  <div style={{ marginBottom: '28px' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px',
      }}
    >
      <div
        style={{
          width: '3px',
          height: '14px',
          background: accent,
          borderRadius: '2px',
          flexShrink: 0,
        }}
      />
      <p
        style={{
          fontSize: '9px',
          fontWeight: 700,
          color: '#6b7280',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </p>
    </div>
    {children}
  </div>
);

// ─── Template ────────────────────────────────────────────────────────────────

class DigitalProductPassportTemplate extends Template {
  public name = 'Digital Product Passport';

  public layoutMetadata = {
    // ── Identity
    name: 'Product name',
    issuer: 'Manufacturer / issuing organisation',
    model: 'Model number or product line',
    gtin: 'Global Trade Item Number (barcode / GTIN)',
    uv_url_serial: 'Serial number (stored as hash, revealed via URL param)',
    origin: 'Country / place of manufacture',
    manufactured: 'Date of manufacture (e.g. 2024-06-15)',
    contact: 'Manufacturer contact (email or URL)',
    // ── Visuals
    brand_color: 'Hex accent color for the passport (e.g. #1a56db)',
    logo_url: 'Logo image URL (https://…)',
    image_cid: 'Product image IPFS CID (rendered via public gateway)',
    image_url: 'Product image URL (alternative to image_cid)',
    // ── Sustainability
    carbon_footprint: 'Product carbon footprint (e.g. 1.2 kg CO₂e)',
    recycled_content: 'Recycled material percentage (e.g. 35%)',
    energy_class: 'Energy efficiency class (e.g. A++)',
    // ── Repair & lifecycle
    warranty: 'Warranty period (e.g. 2 years)',
    spare_parts: 'Spare parts availability (e.g. Available until 2032)',
    repair_info: 'Repair guide URL or description',
    // ── End of life
    recycling: 'Recycling / disposal instructions',
    // ── Dynamic prefixes (shown as tables / tag lists)
    // mat_<name>  → Material composition entry  (e.g. mat_steel: 85%)
    // cert_<name> → Certification               (e.g. cert_ce: CE Marking)
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

    // ── Colors ──────────────────────────────────────────────────────────────
    const rawColor = (metadata.brand_color ?? '#1a56db') as string;
    const accent = isValidHex(rawColor) ? rawColor : '#1a56db';
    const accentLight = lighten(accent, 0.92);
    const accentMid = hexToRgba(accent, 0.08);
    const accentBorder = hexToRgba(accent, 0.22);

    // ── Identity ─────────────────────────────────────────────────────────────
    const productName = (metadata.name ?? 'Product') as string;
    const issuer = (metadata.issuer ?? '') as string;
    const model = (metadata.model ?? '') as string;
    const gtin = (metadata.gtin ?? '') as string;
    const rawSerial = (metadata['uv_url_serial'] ??
      metadata.serial ??
      '') as string;
    const serial = /^[a-f0-9]{64}$/i.test(rawSerial) ? null : rawSerial || null;
    const origin = (metadata.origin ?? '') as string;
    const manufactured = (metadata.manufactured ?? '') as string;
    const contact = (metadata.contact ?? '') as string;

    // ── Visuals ──────────────────────────────────────────────────────────────
    const logoUrl = (metadata.logo_url ?? '') as string;
    const imageCid = (metadata.image_cid ?? '') as string;
    const imageUrl = imageCid
      ? `https://ipfs.io/ipfs/${imageCid}`
      : ((metadata.image_url ?? '') as string);

    // ── Sustainability ───────────────────────────────────────────────────────
    const carbon = (metadata.carbon_footprint ?? '') as string;
    const recycled = (metadata.recycled_content ?? '') as string;
    const energy = (metadata.energy_class ?? '') as string;

    // ── Repair ───────────────────────────────────────────────────────────────
    const warranty = (metadata.warranty ?? '') as string;
    const spareParts = (metadata.spare_parts ?? '') as string;
    const repairInfo = (metadata.repair_info ?? '') as string;

    // ── End of life ──────────────────────────────────────────────────────────
    const recycling = (metadata.recycling ?? '') as string;

    // ── Dynamic tables ───────────────────────────────────────────────────────
    const materials = Object.entries(metadata)
      .filter(([k]) => k.startsWith('mat_'))
      .map(([k, v]) => ({ label: formatLabel(k), value: String(v ?? '') }));

    const certifications = Object.entries(metadata)
      .filter(([k]) => k.startsWith('cert_'))
      .map(([k, v]) => ({ label: formatLabel(k), value: String(v ?? '') }));

    const date = timestampToDateTime(certificate.creationTime);

    // ── Shared styles ─────────────────────────────────────────────────────────
    const labelStyle: React.CSSProperties = {
      fontSize: '9px',
      fontWeight: 700,
      color: '#9ca3af',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      marginBottom: '3px',
    };
    const valueStyle: React.CSSProperties = {
      fontSize: '13px',
      fontWeight: 600,
      color: '#111827',
    };

    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: '#f0f2f5',
          fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ background: accent }}>
          <div
            style={{
              padding: '32px 32px 36px',
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start',
            }}
          >
            {/* Left: logo + product info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{
                    maxHeight: '40px',
                    maxWidth: '160px',
                    objectFit: 'contain',
                    marginBottom: '16px',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.9,
                  }}
                />
              ) : (
                <p
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: hexToRgba('#ffffff', 0.55),
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                  }}
                >
                  Digital Product Passport
                </p>
              )}
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: '8px',
                }}
              >
                {productName}
              </h1>
              {issuer && (
                <p
                  style={{
                    fontSize: '13px',
                    color: hexToRgba('#ffffff', 0.7),
                    fontWeight: 500,
                    marginBottom: '16px',
                  }}
                >
                  {issuer}
                </p>
              )}
              {/* Quick chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {model && (
                  <span
                    style={{
                      background: hexToRgba('#ffffff', 0.15),
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {model}
                  </span>
                )}
                {origin && (
                  <span
                    style={{
                      background: hexToRgba('#ffffff', 0.15),
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '20px',
                    }}
                  >
                    {origin}
                  </span>
                )}
                {energy && (
                  <span
                    style={{
                      background: hexToRgba('#ffffff', 0.2),
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Energy {energy}
                  </span>
                )}
              </div>
            </div>

            {/* Right: product image + UVerify badge */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '12px',
                flexShrink: 0,
              }}
            >
              <img
                src={uverifyIcon}
                width="22"
                height="22"
                alt="UVerify"
                style={{ opacity: 0.55 }}
              />
              {imageUrl && (
                <div
                  style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: hexToRgba('#ffffff', 0.1),
                    border: `1px solid ${hexToRgba('#ffffff', 0.18)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={productName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '32px 24px 48px',
          }}
        >
          {/* ── Product identity card ─────────────────────────────────── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '24px 28px',
              marginBottom: '20px',
              border: `1px solid ${accentBorder}`,
              boxShadow: `0 0 0 4px ${accentMid}`,
            }}
          >
            <Section title="Product Identity" accent={accent}>
              {[
                <div
                  key="grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '18px',
                  }}
                >
                  {gtin && (
                    <div>
                      <p style={labelStyle}>GTIN / Barcode</p>
                      <p
                        style={{
                          ...valueStyle,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      >
                        {gtin}
                      </p>
                    </div>
                  )}
                  {serial && (
                    <div>
                      <p style={labelStyle}>Serial Number</p>
                      <p
                        style={{
                          ...valueStyle,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      >
                        {serial}
                      </p>
                    </div>
                  )}
                  {manufactured && (
                    <div>
                      <p style={labelStyle}>Date of Manufacture</p>
                      <p style={valueStyle}>{manufactured}</p>
                    </div>
                  )}
                  {origin && (
                    <div>
                      <p style={labelStyle}>Place of Origin</p>
                      <p style={valueStyle}>{origin}</p>
                    </div>
                  )}
                  {issuer && (
                    <div>
                      <p style={labelStyle}>Manufacturer</p>
                      <p style={valueStyle}>{issuer}</p>
                    </div>
                  )}
                  {contact && (
                    <div>
                      <p style={labelStyle}>Contact</p>
                      <p
                        style={{
                          ...valueStyle,
                          fontSize: '12px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {contact}
                      </p>
                    </div>
                  )}
                  <div>
                    <p style={labelStyle}>Passport Issued</p>
                    <p style={valueStyle}>{date}</p>
                  </div>
                </div>,
              ]}
            </Section>
          </div>

          {/* ── Two-column: sustainability + materials ──────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            {/* Sustainability */}
            {(carbon || recycled || energy) && (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  padding: '24px 28px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Section title="Sustainability & Environment" accent={accent}>
                  {[
                    <div
                      key="sus"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      {carbon && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '12px',
                            borderBottom: '1px solid #f3f4f6',
                          }}
                        >
                          <div>
                            <p style={labelStyle}>Carbon Footprint</p>
                            <p style={valueStyle}>{carbon}</p>
                          </div>
                          <span style={{ fontSize: '22px' }}>♻️</span>
                        </div>
                      )}
                      {recycled && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '12px',
                            borderBottom: energy ? '1px solid #f3f4f6' : 'none',
                          }}
                        >
                          <div>
                            <p style={labelStyle}>Recycled Content</p>
                            <p style={valueStyle}>{recycled}</p>
                          </div>
                          <div style={{ width: '60px' }}>
                            <div
                              style={{
                                height: '6px',
                                background: '#f3f4f6',
                                borderRadius: '3px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: recycled.replace('%', '') + '%',
                                  background: accent,
                                  borderRadius: '3px',
                                  maxWidth: '100%',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {energy && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <p style={labelStyle}>Energy Efficiency</p>
                            <p style={valueStyle}>Class {energy}</p>
                          </div>
                          <span
                            style={{
                              background: '#166534',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '13px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                            }}
                          >
                            {energy}
                          </span>
                        </div>
                      )}
                    </div>,
                  ]}
                </Section>
              </div>
            )}

            {/* Material composition */}
            {materials.length > 0 && (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  padding: '24px 28px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Section title="Material Composition" accent={accent}>
                  {[
                    <table
                      key="mat"
                      style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${accent}` }}>
                          <th
                            style={{
                              textAlign: 'left',
                              paddingBottom: '8px',
                              fontSize: '9px',
                              color: '#9ca3af',
                              fontWeight: 700,
                              letterSpacing: '0.16em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Material
                          </th>
                          <th
                            style={{
                              textAlign: 'right',
                              paddingBottom: '8px',
                              fontSize: '9px',
                              color: '#9ca3af',
                              fontWeight: 700,
                              letterSpacing: '0.16em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Content
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map(({ label, value }, i) => (
                          <tr
                            key={label}
                            style={{
                              borderBottom:
                                i < materials.length - 1
                                  ? '1px solid #f9fafb'
                                  : 'none',
                            }}
                          >
                            <td
                              style={{
                                padding: '9px 0',
                                fontSize: '13px',
                                color: '#374151',
                                fontWeight: 500,
                              }}
                            >
                              {label}
                            </td>
                            <td
                              style={{
                                padding: '9px 0',
                                fontSize: '13px',
                                color: '#111827',
                                fontWeight: 700,
                                textAlign: 'right',
                                fontFamily: 'monospace',
                              }}
                            >
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>,
                  ]}
                </Section>
              </div>
            )}
          </div>

          {/* ── Two-column: repair + end-of-life ───────────────────────── */}
          {(warranty || spareParts || repairInfo || recycling) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              {(warranty || spareParts || repairInfo) && (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '24px 28px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Section title="Repair & Lifecycle" accent={accent}>
                    {[
                      <div
                        key="repair"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                        }}
                      >
                        {warranty && (
                          <div>
                            <p style={labelStyle}>Warranty</p>
                            <p style={valueStyle}>{warranty}</p>
                          </div>
                        )}
                        {spareParts && (
                          <div>
                            <p style={labelStyle}>Spare Parts Availability</p>
                            <p style={valueStyle}>{spareParts}</p>
                          </div>
                        )}
                        {repairInfo && (
                          <div>
                            <p style={labelStyle}>Repair Guide</p>
                            {repairInfo.startsWith('http') ? (
                              <a
                                href={repairInfo}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: '13px',
                                  color: accent,
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  wordBreak: 'break-all',
                                }}
                              >
                                {repairInfo}
                              </a>
                            ) : (
                              <p
                                style={{
                                  fontSize: '13px',
                                  color: '#374151',
                                  lineHeight: 1.55,
                                }}
                              >
                                {repairInfo}
                              </p>
                            )}
                          </div>
                        )}
                      </div>,
                    ]}
                  </Section>
                </div>
              )}

              {recycling && (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '24px 28px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Section title="End-of-Life & Recycling" accent={accent}>
                    {[
                      <div
                        key="eol"
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '24px',
                            lineHeight: 1,
                            flexShrink: 0,
                          }}
                        >
                          ♻
                        </span>
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#374151',
                            lineHeight: 1.65,
                          }}
                        >
                          {recycling}
                        </p>
                      </div>,
                    ]}
                  </Section>
                </div>
              )}
            </div>
          )}

          {/* ── Certifications ─────────────────────────────────────────── */}
          {certifications.length > 0 && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '24px 28px',
                marginBottom: '20px',
                border: '1px solid #e5e7eb',
              }}
            >
              <Section title="Certifications & Compliance" accent={accent}>
                {[
                  <div
                    key="certs"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}
                  >
                    {certifications.map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 18px',
                          border: `1px solid ${accentBorder}`,
                          borderRadius: '8px',
                          background: accentLight,
                          minWidth: '90px',
                          textAlign: 'center',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: accent,
                            marginBottom: '3px',
                          }}
                        >
                          {label}
                        </p>
                        {value && value !== 'true' && (
                          <p
                            style={{
                              fontSize: '10px',
                              color: '#6b7280',
                              lineHeight: 1.3,
                            }}
                          >
                            {value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>,
                ]}
              </Section>
            </div>
          )}

          {/* ── Blockchain record ──────────────────────────────────────── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '24px 28px',
              border: `1px solid ${accentBorder}`,
              marginBottom: '20px',
            }}
          >
            <Section title="Blockchain Verification" accent={accent}>
              {[
                <div key="chain">
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                    }}
                  >
                    <ChainIcon color={accent} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ ...labelStyle, marginBottom: '4px' }}>
                        Unique Product Identifier
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
                        fontSize: '11px',
                        fontWeight: 700,
                        color: accent,
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Verify on Cardano Block Explorer
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
                </div>,
              ]}
            </Section>
          </div>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px',
            }}
          >
            <p style={{ fontSize: '10px', color: '#9ca3af' }}>
              Digital Product Passport · Verified on Cardano · Issued by{' '}
              {issuer || 'Manufacturer'}
            </p>
            <img
              src={uverifyIcon}
              width="18"
              height="18"
              alt="UVerify"
              style={{ opacity: 0.25 }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DigitalProductPassportTemplate;
