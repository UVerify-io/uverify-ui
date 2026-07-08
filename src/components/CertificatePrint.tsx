import QRCode from 'react-qr-code';
import { shortCodeFromHash } from '../utils/shortCode';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';

export const PrintDownloadButton = ({
  filename,
  className,
  label,
}: {
  filename: string;
  className?: string;
  label?: React.ReactNode;
}) => {
  const handleDownload = () => {
    const previousTitle = document.title;
    document.title = filename;
    window.print();
    document.title = previousTitle;
  };

  return (
    <button
      onClick={handleDownload}
      data-testid="print-download-button"
      aria-label="Download PDF"
      title="Download PDF"
      className={
        className ??
        'rounded-lg border border-indigo-300 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 print:hidden'
      }
    >
      {label ?? 'Download PDF'}
    </button>
  );
};

export const PrintQr = ({ hash }: { hash: string }) => {
  const config = useUVerifyConfig();
  const shortUrl = `${config.shortLinkDomain}/${shortCodeFromHash(hash)}${window.location.search}`;

  return (
    <div
      data-testid="print-qr"
      className="hidden print:flex flex-col items-center gap-1 pt-4"
    >
      <QRCode value={shortUrl} size={96} />
      <span className="text-xs text-black">{shortUrl}</span>
    </div>
  );
};
