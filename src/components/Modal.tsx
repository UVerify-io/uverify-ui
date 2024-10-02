import { createPortal } from 'react-dom';
import { IconType } from './Icons';
import IconButton from './IconButton';

declare interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClose: Function;
}

const Modal = ({ title, children, isOpen, size, onClose }: ModalProps) => {
  const width = size || 'md';

  return createPortal(
    <div
      className={`${
        isOpen ? 'flex' : 'hidden'
      } bg-main-gradient overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 sm:justify-center sm:items-center w-full md:inset-0 h-full`}
    >
      <div
        className={`relative sm:p-4 h-full w-full sm:w-auto sm:h-auto sm:max-w-${width} sm:max-h-full`}
      >
        <div className="relative overflow-hidden h-full sm:h-auto text-white p-6 bg-white/30 sm:rounded-lg sm:border sm:border-[#FFFFFF55] backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between rounded-t">
            <h3 className="text-lg font-semibold">{title}</h3>
            <IconButton iconType={IconType.Close} onClick={() => onClose()} />
          </div>
          <div className="border-b border-white mt-2 mb-2"></div>
          <div className="flex p-4 items-center flex-col">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
