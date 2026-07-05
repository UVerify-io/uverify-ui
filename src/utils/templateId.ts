export const TEMPLATE_ID_KEY = 'uv_tid';
export const LEGACY_TEMPLATE_ID_KEY = 'uverify_template_id';

const TEMPLATE_VALUE_ALIASES: Record<string, string> = {
  linktree: 'socialHub',
};

function asTemplateId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function resolveTemplateId(metadata: {
  [key: string]: unknown;
}): string | undefined {
  const raw =
    asTemplateId(metadata[TEMPLATE_ID_KEY]) ??
    asTemplateId(metadata[LEGACY_TEMPLATE_ID_KEY]);
  if (raw === undefined) return undefined;
  return TEMPLATE_VALUE_ALIASES[raw] ?? raw;
}
