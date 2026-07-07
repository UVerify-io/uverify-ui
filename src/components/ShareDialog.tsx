import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  linkedInUrl: string;
  embedSnippet: string;
}

const ShareDialog = ({
  isOpen,
  onClose,
  shortUrl,
  linkedInUrl,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md"
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
