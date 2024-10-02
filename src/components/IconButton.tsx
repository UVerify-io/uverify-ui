import { IconType, getIcon } from './Icons';

declare interface IconButtonProps {
  iconType: IconType;
  onClick?: Function;
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const IconButton = ({
  iconType,
  onClick,
  className,
  size,
  href,
}: IconButtonProps) => {
  const Icon = getIcon(iconType);
  className = className ? ' ' + className : '';

  let padding = 'p-3';
  if (size === 'sm') {
    padding = 'p-2.5';
  }

  if (typeof href === 'string') {
    return (
      <a
        href={href}
        target="_blank"
        className={
          `rounded-full text-center border border-transparent inline-flex items-center ${padding} font-medium text-white transition duration-200 hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]` +
          className
        }
      >
        <Icon className={'w-4 h-4'} />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof onClick === 'function') {
          onClick();
        }
      }}
      className={
        `rounded-full text-center border border-transparent inline-flex items-center ${padding} font-medium text-white transition duration-200 hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]` +
        className
      }
    >
      <Icon className={'w-4 h-4'} />
    </button>
  );
};

export default IconButton;
