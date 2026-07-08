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

export interface SocialShareInput {
  url: string;
  text: string;
}

export interface SocialShareLinks {
  x: string;
  bluesky: string;
  whatsapp: string;
  facebook: string;
  email: string;
}

export function buildSocialShareUrls(input: SocialShareInput): SocialShareLinks {
  const encodedUrl = encodeURIComponent(input.url);
  const encodedText = encodeURIComponent(input.text);
  const encodedTextWithUrl = encodeURIComponent(`${input.text} ${input.url}`);
  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodedTextWithUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTextWithUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodedText}&body=${encodedTextWithUrl}`,
  };
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
