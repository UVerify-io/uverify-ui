import { JSX } from 'react';
import { templates } from '../templates';
import { createPortal } from 'react-dom';
import { UVerifyCertificate, UVerifyCertificateExtraData } from '@uverify/core';

type PreviewProps = {
  isOpen: boolean;
  close: () => void;
  templateId: string;
  hash: string;
  metadata: string;
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
        className={`${template.theme.background} fixed inset-0 z-50 w-full overflow-y-auto`}
      >
        <div className="sticky inset-0 flex items-start justify-center z-100">
          <span className="text-white text-2xl md:text-4xl p-4 bg-black/30 w-full text-center font-bold uppercase backdrop-blur-xl">
            This is a preview.
            <br /> Click to dismiss.
          </span>
        </div>
        <div className="min-h-screen w-full flex flex-col">
          <div className="flex items-center justify-center relative top-0 h-full w-full pointer-events-none">
            {template.render(
              hash,
              JSON.parse(metadata),
              certificate,
              pagination,
              extra
            )}
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
