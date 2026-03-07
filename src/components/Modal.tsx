import { createPortal } from 'react-dom';
import { IconType } from './Icons';
import IconButton from './IconButton';

declare interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  onClose: Function;
  background?: string;
}

const Modal = ({
  title,
  children,
  isOpen,
  size,
  onClose,
  background,
}: ModalProps) => {
  const width = size || 'md';

  let containerClasses = `relative sm:p-4 h-full w-full sm:w-auto sm:h-auto sm:max-w-${width} sm:max-h-full`;
  let innerClasses = `relative overflow-hidden h-full sm:h-auto text-white p-6 ${
    !background ? 'bg-white/10' : ''
  } sm:rounded-2xl sm:border sm:border-white/15 backdrop-blur-sm shadow-center`;
  if (size === 'full') {
    containerClasses = 'relative h-full w-full';
    innerClasses = `relative h-full text-white p-6 ${
      !background ? 'bg-white/10' : ''
    } backdrop-blur-sm`;
  }

  if (!background) {
    background = 'bg-main-gradient';
  }

  return createPortal(
    <div
      className={`${
        isOpen ? 'flex' : 'hidden'
      } ${background} inset-0 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 sm:justify-center sm:items-center w-full md:inset-0 h-full`}
    >
      <div className={containerClasses}>
        <div className={innerClasses}>
          <div className="flex items-center justify-between rounded-t">
            <h3 className="text-lg font-semibold">{title}</h3>
            <IconButton iconType={IconType.Close} onClick={() => onClose()} />
          </div>
          <div className="border-b border-white/15 mt-2 mb-4"></div>
          <div className="flex p-4 items-center flex-col">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
