import { UVerifyCertificate } from '@uverify/core';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * How multiple submissions of the same hash are handled.
 *
 * append      — all submissions shown via pagination (default)
 * first       — always show the first submission only
 * override    — always show the latest submission only
 * restricted  — only the policy owner (first issuer) can add new entries
 * whitelist   — only addresses in uverify_update_whitelist can add new entries
 * accumulate  — subsequent authorized submissions can only add new metadata
 *               keys, never overwrite existing ones
 * frozen      — no further submissions are recognised (display only)
 *
 * The owner (first issuer, or uverify_owner from first metadata) may submit
 * subsequent certificates with uverify_* control keys to change the policy,
 * transfer ownership, or freeze the record.
 */
export type UpdatePolicy =
  | 'append'
  | 'first'
  | 'override'
  | 'restricted'
  | 'whitelist'
  | 'accumulate'
  | 'frozen';

export type ResolvedPolicy = {
  mode: UpdatePolicy;
  /** Bech32 address of the policy owner (first issuer by default). */
  owner: string;
  /** Addresses authorised to add entries (used by 'whitelist' mode). */
  whitelist: string[];
};

export const POLICY_OPTIONS: Array<{
  mode: UpdatePolicy;
  label: string;
  description: string;
}> = [
  {
    mode: 'append',
    label: 'All versions',
    description: 'Every re-submission adds a new page (default)',
  },
  {
    mode: 'first',
    label: 'Locked to first',
    description: 'Only the original submission is ever displayed',
  },
  {
    mode: 'override',
    label: 'Always latest',
    description: 'New submissions silently replace the current view',
  },
  {
    mode: 'restricted',
    label: 'Issuer only',
    description: 'Only the original issuer wallet may add new entries',
  },
  {
    mode: 'whitelist',
    label: 'Approved addresses',
    description: 'Only a declared list of wallets may add new entries',
  },
  {
    mode: 'accumulate',
    label: 'Additive only',
    description: 'Authorised updates may only add new metadata keys, never change existing ones',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseMeta(raw: string | undefined): Record<string, unknown> {
  try {
    return JSON.parse(raw ?? '{}') as Record<string, unknown>;
  } catch {
    return {};
  }
}

function parseAddressList(value: unknown): string[] {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── Resolution ──────────────────────────────────────────────────────────────

/**
 * Derives the effective update policy by aggregating all on-chain submissions.
 * Only submissions from the current policy owner can change the policy.
 */
export function resolvePolicy(certificates: UVerifyCertificate[]): ResolvedPolicy {
  if (certificates.length === 0) {
    return { mode: 'append', owner: '', whitelist: [] };
  }

  const firstMeta = parseMeta(certificates[0].metadata);

  let mode = (firstMeta.uverify_update_policy ?? 'append') as UpdatePolicy;
  let owner = String(firstMeta.uverify_owner ?? certificates[0].issuer ?? '');
  let whitelist = parseAddressList(firstMeta.uverify_update_whitelist);

  // Walk subsequent submissions. The owner controls everything; whitelisted
  // addresses may only change the display mode (uverify_policy). Whitelist
  // state is tracked temporally so that authorization is evaluated against
  // the whitelist as it existed at the time of each submission.
  for (const cert of certificates.slice(1)) {
    const meta = parseMeta(cert.metadata);
    const isOwner = cert.issuer === owner;

    if (isOwner) {
      if (meta.uverify_policy) {
        mode = meta.uverify_policy as UpdatePolicy;
      }
      if (meta.uverify_transfer_ownership) {
        owner = String(meta.uverify_transfer_ownership);
      }
      if (meta.uverify_whitelist_add) {
        const adds = parseAddressList(meta.uverify_whitelist_add);
        whitelist = [...new Set([...whitelist, ...adds])];
      }
      if (meta.uverify_whitelist_remove) {
        const removes = parseAddressList(meta.uverify_whitelist_remove);
        whitelist = whitelist.filter((a) => !removes.includes(a));
      }
      if (meta.uverify_freeze === 'true' || meta.uverify_freeze === true) {
        mode = 'frozen';
      }
    } else if (whitelist.includes(cert.issuer)) {
      // Whitelisted addresses may change the display mode only.
      if (meta.uverify_policy) {
        mode = meta.uverify_policy as UpdatePolicy;
      }
    }
  }

  return { mode, owner, whitelist };
}

// ─── Application ─────────────────────────────────────────────────────────────

/**
 * Filters and/or merges certificates according to the resolved policy.
 * Returns the list of certificates that should be presented to the viewer.
 */
export function applyPolicy(
  certificates: UVerifyCertificate[],
  policy: ResolvedPolicy,
): UVerifyCertificate[] {
  if (certificates.length <= 1) return certificates;

  const isAuthorised = (cert: UVerifyCertificate): boolean =>
    cert.issuer === policy.owner || policy.whitelist.includes(cert.issuer);

  switch (policy.mode) {
    case 'first':
    case 'frozen':
      return [certificates[0]];

    case 'override':
      // Show only the latest submission, but skip policy-control-only updates
      // from the owner (those that only contain uverify_* keys).
      for (let i = certificates.length - 1; i >= 0; i--) {
        const meta = parseMeta(certificates[i].metadata);
        const keys = Object.keys(meta).filter((k) => !k.startsWith('uverify_'));
        if (keys.length > 0 || i === 0) return [certificates[i]];
      }
      return [certificates[0]];

    case 'restricted':
      return certificates.filter(
        (cert, i) => i === 0 || cert.issuer === policy.owner,
      );

    case 'whitelist': {
      // Evaluate each cert against the whitelist state at the time of its
      // submission so that historical certs remain visible even after the owner
      // later adds or removes addresses.
      const firstMeta = parseMeta(certificates[0].metadata);
      let currentWhitelist = parseAddressList(firstMeta.uverify_update_whitelist);
      const displayed: UVerifyCertificate[] = [certificates[0]];

      for (let i = 1; i < certificates.length; i++) {
        const cert = certificates[i];
        if (cert.issuer === policy.owner) {
          const meta = parseMeta(cert.metadata);
          if (meta.uverify_whitelist_add) {
            const adds = parseAddressList(meta.uverify_whitelist_add);
            currentWhitelist = [...new Set([...currentWhitelist, ...adds])];
          }
          if (meta.uverify_whitelist_remove) {
            const removes = parseAddressList(meta.uverify_whitelist_remove);
            currentWhitelist = currentWhitelist.filter((a) => !removes.includes(a));
          }
          displayed.push(cert);
        } else if (currentWhitelist.includes(cert.issuer)) {
          displayed.push(cert);
        }
      }

      return displayed;
    }

    case 'accumulate': {
      // Build a single merged certificate from all authorised submissions.
      // Authorised updates can only ADD new keys, never overwrite existing ones.
      const base = { ...certificates[0] };
      const baseMeta = parseMeta(base.metadata);

      for (const cert of certificates.slice(1)) {
        if (!isAuthorised(cert)) continue;
        const meta = parseMeta(cert.metadata);
        for (const [key, value] of Object.entries(meta)) {
          if (!key.startsWith('uverify_') && !(key in baseMeta)) {
            baseMeta[key] = value;
          }
        }
      }

      return [{ ...base, metadata: JSON.stringify(baseMeta) }];
    }

    case 'append':
    default:
      return certificates;
  }
}
