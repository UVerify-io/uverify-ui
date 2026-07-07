export interface LinkedInCertificateInput {
  name: string;
  organizationName: string;
  issueYear: number;
  issueMonth: number;
  certUrl: string;
  certId: string;
}

export function buildLinkedInAddToProfileUrl(
  input: LinkedInCertificateInput,
): string {
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: input.name,
    organizationName: input.organizationName,
    issueYear: String(input.issueYear),
    issueMonth: String(input.issueMonth),
    certUrl: input.certUrl,
    certId: input.certId,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildEmbedSnippet(
  shortUrl: string,
  imageUrl: string,
  title: string,
): string {
  return [
    `<a href="${escapeHtml(shortUrl)}" target="_blank" rel="noopener">`,
    `  <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" width="300" style="border-radius:12px" />`,
    `</a>`,
  ].join('\n');
}
