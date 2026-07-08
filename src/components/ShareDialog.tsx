import { ReactElement, useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { SocialShareLinks } from '../utils/share';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  linkedInUrl: string;
  socialLinks: SocialShareLinks;
  embedSnippet: string;
}

const SOCIAL_BUTTONS: {
  key: keyof SocialShareLinks;
  label: string;
  color: string;
  icon: ReactElement;
}[] = [
  {
    key: 'x',
    label: 'Share on X',
    color: '#ffffff',
    icon: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
  {
    key: 'bluesky',
    label: 'Share on Bluesky',
    color: '#0085ff',
    icon: (
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
    ),
  },
  {
    key: 'whatsapp',
    label: 'Share on WhatsApp',
    color: '#25d366',
    icon: (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    ),
  },
  {
    key: 'facebook',
    label: 'Share on Facebook',
    color: '#1877f2',
    icon: (
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    ),
  },
  {
    key: 'email',
    label: 'Share via email',
    color: '#e2e8f0',
    icon: (
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67zM22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z" />
    ),
  },
];

const ShareDialog = ({
  isOpen,
  onClose,
  shortUrl,
  linkedInUrl,
  socialLinks,
  embedSnippet,
}: ShareDialogProps) => {
  const [copied, setCopied] = useState<'link' | 'embed' | 'failed' | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
    };
  }, []);

  const copy = async (text: string, marker: 'link' | 'embed') => {
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(marker);
    } catch {
      setCopied('failed');
    }
    resetTimeout.current = setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="share-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm print:hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 p-6 shadow-center backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-white">
          Share this certificate
        </h2>
        <div className="mb-4 flex justify-center rounded-xl bg-white p-3">
          <QRCode value={shortUrl} size={144} />
        </div>
        <div className="mb-3 flex items-center gap-2">
          <input
            readOnly
            value={shortUrl}
            data-testid="share-short-url"
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm text-white/90"
          />
          <button
            onClick={() => copy(shortUrl, 'link')}
            className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-white/20"
          >
            {copied === 'link' ? 'Copied' : copied === 'failed' ? 'Copy failed' : 'Copy'}
          </button>
        </div>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="share-linkedin"
          className="mb-3 block w-full rounded-lg bg-[#0a66c2] px-3 py-2 text-center text-sm font-medium text-white"
        >
          Add to LinkedIn profile
        </a>
        <div className="mb-3 flex justify-center gap-2">
          {SOCIAL_BUTTONS.map((social) => (
            <a
              key={social.key}
              href={socialLinks[social.key]}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`share-${social.key}`}
              aria-label={social.label}
              title={social.label}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition duration-200 hover:bg-white/20"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={social.color}
                aria-hidden="true"
              >
                {social.icon}
              </svg>
            </a>
          ))}
        </div>
        <button
          onClick={() => copy(embedSnippet, 'embed')}
          data-testid="share-embed"
          className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm text-white/75 hover:text-white"
        >
          {copied === 'embed' ? 'Embed code copied' : copied === 'failed' ? 'Copy failed' : 'Copy embed code'}
        </button>
      </div>
    </div>
  );
};

export default ShareDialog;
