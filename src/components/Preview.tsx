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
        className={`${template.theme.background} overflow-y overflow-x-hidden absolute top-0 left-0 z-50 w-full min-h-full h-full`}
      >
        <div className="flex items-center justify-center relative top-0 h-full w-full">
          {template.render(
            hash,
            JSON.parse(metadata),
            certificate,
            pagination,
            extra
          )}

          <div className="fixed inset-0 flex items-start justify-center z-10">
            <span className="text-white text-2xl md:text-4xl p-4 bg-black/30 w-full text-center font-bold uppercase backdrop-blur-xl">
              This is a preview.
              <br /> Click to dismiss.
            </span>
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
