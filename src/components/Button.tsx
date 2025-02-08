import { IconType, LoadingIcon, getIcon } from './Icons';
import { twMerge } from 'tailwind-merge';

declare interface ButtonProps {
  label: string;
  color: 'blue' | 'pink' | 'cyan' | 'purple' | 'ice' | 'green';
  variant?: 'default' | 'glass' | 'contained';
  onClick?: Function;
  className?: string;
  icon?: IconType;
  iconClassName?: string;
  state?: 'enabled' | 'loading' | 'disabled';
  disabled?: boolean;
}

const Button = ({
  label,
  color,
  variant,
  onClick,
  className,
  icon,
  iconClassName,
  state,
  disabled,
}: ButtonProps) => {
  className = typeof className === 'string' ? ' ' + className : '';
  variant = variant || 'default';

  const variants = {
    contained: {
      blue: 'bg-blue-400 hover:bg-blue-200',
      pink: 'bg-pink-400 hover:bg-pink-200',
      cyan: 'bg-cyan-400 hover:bg-cyan-200',
      purple: 'bg-purple-400 hover:bg-purple-200',
      ice: 'bg-ice-400 hover:bg-ice-200',
      green: 'bg-green-400 hover:bg-green-200',
    },
    default: {
      blue: 'bg-blue-400/75 hover:bg-blue-400 hover:shadow-center hover:shadow-blue-100/50',
      pink: 'bg-pink-400/75 hover:bg-pink-400 hover:shadow-center hover:shadow-pink-100/50',
      cyan: 'bg-cyan-400/75 hover:bg-cyan-400 hover:shadow-center hover:shadow-cyan-100/50',
      purple:
        'bg-purple-400/75 hover:bg-purple-400 hover:shadow-center hover:shadow-purple-100/50',
      ice: 'bg-ice-400/75 hover:bg-ice-400 hover:shadow-center hover:shadow-ice-100/50',
      green:
        'bg-green-400/75 hover:bg-green-400 hover:shadow-center hover:shadow-green-100/50',
    },
    glass: {
      blue: 'bg-white/30 hover:bg-blue-200 hover:shadow-center hover:shadow-blue-100/50 hover:drop-shadow-center-sm',
      pink: 'bg-white/30 hover:bg-pink-200 hover:shadow-center hover:shadow-pink-100/50 hover:drop-shadow-center-sm',
      cyan: 'bg-white/30 hover:bg-cyan-200 hover:shadow-center hover:shadow-cyan-100/50 hover:drop-shadow-center-sm',
      purple:
        'bg-white/30 hover:bg-purple-200 hover:shadow-center hover:shadow-purple-100/50 hover:drop-shadow-center-sm',
      ice: 'bg-white/30 hover:bg-ice-200 hover:shadow-center hover:shadow-ice-100/50 hover:drop-shadow-center-sm',
      green:
        'bg-white/30 hover:bg-green-200 hover:shadow-center hover:shadow-green-100/50 hover:drop-shadow-center-sm',
    },
    disabled: {
      blue: 'bg-blue-400/15',
      pink: 'bg-pink-400/15',
      cyan: 'bg-cyan-400/15',
      purple: 'bg-purple-400/15',
      ice: 'bg-ice-400/15',
      green: 'bg-green-400/15',
    },
  };

  if (icon) {
    const Icon = getIcon(icon);
    iconClassName =
      typeof iconClassName === 'string' ? ' ' + iconClassName : '';

    if (disabled) {
      return (
        <button
          type="button"
          className={
            'border border-white/20 text-center inline-flex items-center rounded-xl px-4 py-2 font-medium text-white/40 cursor-not-allowed ' +
            variants['disabled'][color] +
            className
          }
        >
          <Icon className={'w-4 h-4 me-2' + iconClassName} />
          {label}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          if (typeof onClick === 'function' && state !== 'loading') {
            onClick();
          }
        }}
        className={
          'cursor-pointer border border-[#FFFFFF40] text-center inline-flex items-center rounded-xl px-4 py-2 font-medium text-white transition duration-200 ' +
          variants[variant][color] +
          (state === 'loading' ? ' cursor-wait' : '') +
          className
        }
      >
        {state === 'loading' ? (
          <LoadingIcon className={'w-4 h-4 me-2' + iconClassName} />
        ) : (
          <Icon className={'w-4 h-4 me-2' + iconClassName} />
        )}
        {label}
      </button>
    );
  }

  if (disabled) {
    return (
      <button
        type="button"
        className={twMerge(
          variants.disabled[color],
          `border border-white/20 rounded-xl px-4 py-2 text-base font-medium text-white/40 cursor-not-allowed`,
          className
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof onClick === 'function' && state !== 'loading') {
          onClick();
        }
      }}
      className={twMerge(
        variants[variant][color],
        'cursor-pointer border border-[#FFFFFF40] rounded-xl px-4 py-2 text-base font-medium text-white transition duration-200',
        state === 'loading' && ' cursor-wait',
        className
      )}
    >
      {state === 'loading' && (
        <LoadingIcon className={'w-4 h-4 me-2' + iconClassName} />
      )}
      {label}
    </button>
  );
};

export default Button;
