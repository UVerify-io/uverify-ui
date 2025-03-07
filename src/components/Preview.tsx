import { JSX } from 'react';
import { UVerifyCertificate } from '../common/types';
import { templates } from '../templates';
import { UVerifyCertificateExtraData } from '../templates/Template';
import { createPortal } from 'react-dom';

type PreviewProps = {
  isOpen: boolean;
  close: () => void;
  templateId: string;
  hash: string;
  metadata: Record<string, string | number | boolean | null>;
  certificate: UVerifyCertificate;
  pagination: JSX.Element;
  extra: UVerifyCertificateExtraData;
};

const Preview = ({
  isOpen,
  close,
  templateId,
  hash,
  metadata,
  certificate,
  pagination,
  extra,
}: PreviewProps) => {
  if (isOpen) {
    const template = templates[templateId];

    return createPortal(
      <div
        onClick={close}
        className={`flex ${template.theme.background} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full h-full`}
      >
        <div className="flex items-center justify-center relative h-full w-full">
          {template.render(hash, metadata, certificate, pagination, extra)}
          <div className="absolute inset-0 z-1">
            <div className="w-full h-full grid grid-cols-4 grid-rows-4">
              {Array.from({ length: 16 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center rotate-315 opacity-20"
                >
                  <p className="text-2xl font-semibold text-white whitespace-nowrap pointer-events-none">
                    This is a preview. Click to dismiss.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  } else {
    return null;
  }
};

export default Preview;
