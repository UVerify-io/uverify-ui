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
      blue: 'bg-blue-500/40 border-blue-400/40 hover:bg-blue-500/60 hover:shadow-center hover:shadow-blue-400/35',
      pink: 'bg-pink-500/40 border-pink-400/40 hover:bg-pink-500/60 hover:shadow-center hover:shadow-pink-400/35',
      cyan: 'bg-cyan-500/40 border-cyan-400/40 hover:bg-cyan-500/60 hover:shadow-center hover:shadow-cyan-400/35',
      purple:
        'bg-purple-500/40 border-purple-400/40 hover:bg-purple-500/60 hover:shadow-center hover:shadow-purple-400/35',
      ice: 'bg-ice-500/40 border-ice-400/40 hover:bg-ice-500/60 hover:shadow-center hover:shadow-ice-400/35',
      green:
        'bg-green-500/40 border-green-400/40 hover:bg-green-500/60 hover:shadow-center hover:shadow-green-400/35',
    },
    glass: {
      blue: 'bg-white/10 hover:bg-blue-500/35 hover:shadow-center hover:shadow-blue-400/30 hover:drop-shadow-center-sm',
      pink: 'bg-white/10 hover:bg-pink-500/35 hover:shadow-center hover:shadow-pink-400/30 hover:drop-shadow-center-sm',
      cyan: 'bg-white/10 hover:bg-cyan-500/35 hover:shadow-center hover:shadow-cyan-400/30 hover:drop-shadow-center-sm',
      purple:
        'bg-white/10 hover:bg-purple-500/35 hover:shadow-center hover:shadow-purple-400/30 hover:drop-shadow-center-sm',
      ice: 'bg-white/10 hover:bg-ice-500/35 hover:shadow-center hover:shadow-ice-400/30 hover:drop-shadow-center-sm',
      green:
        'bg-white/10 hover:bg-green-500/35 hover:shadow-center hover:shadow-green-400/30 hover:drop-shadow-center-sm',
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
          'cursor-pointer border text-center inline-flex items-center rounded-xl px-4 py-2 font-medium text-white backdrop-blur-sm transition duration-200 ' +
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
        'cursor-pointer border rounded-xl px-4 py-2 text-base font-medium text-white backdrop-blur-sm transition duration-200',
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
