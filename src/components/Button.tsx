import { IconType, getIcon } from './Icons';

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

  const backgroundColor = variant === 'glass' ? 'white' : `${color}-400`;
  const hoverBackgroundColor =
    variant === 'glass' ? `${color}-200` : backgroundColor;
  const shadowColor = `${color}-100`;
  let opacity = '75';

  if (variant === 'glass') {
    opacity = '30';
  } else if (variant === 'contained') {
    opacity = '90';
  }

  const labelColor = 'white';
  const LoadingIcon = getIcon(IconType.Loading);

  if (icon) {
    const Icon = getIcon(icon);
    iconClassName =
      typeof iconClassName === 'string' ? ' ' + iconClassName : '';

    if (disabled) {
      return (
        <button
          type="button"
          className={
            `border border-white/20 text-center inline-flex items-center rounded-xl bg-${backgroundColor}/15 px-4 py-2 font-medium text-white/40 cursor-not-allowed` +
            className
          }
        >
          <Icon className={'w-4 h-4 me-2' + iconClassName} />
          {label}
        </button>
      );
    }

    let activeStyle = ` hover:bg-${backgroundColor}`;
    if (variant !== 'contained') {
      activeStyle += ` hover:shadow-center hover:shadow-${shadowColor}/50`;
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
          `border border-[#FFFFFF40] text-center inline-flex items-center rounded-xl bg-${backgroundColor}/${opacity} px-4 py-2 font-medium text-white transition duration-200` +
          (state === 'loading' ? ' cursor-wait' : activeStyle) +
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
        className={
          `border border-white/20 rounded-xl bg-${backgroundColor}/15 px-4 py-2 text-base font-medium text-white/40 cursor-not-allowed` +
          className
        }
      >
        {label}
      </button>
    );
  }

  let activeStyle = ` hover:bg-${hoverBackgroundColor}`;
  if (variant !== 'contained') {
    activeStyle += ` hover:shadow-center hover:shadow-${shadowColor}/50 hover:drop-shadow-center-sm`;
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
        `border border-[#FFFFFF40] rounded-xl bg-${backgroundColor}/${opacity} px-4 py-2 text-base font-medium text-white transition ${
          variant === 'glass' ? 'hover:text-' + labelColor : ''
        } duration-200` +
        (state === 'loading' ? ' cursor-wait' : activeStyle) +
        className
      }
    >
      {state === 'loading' && (
        <LoadingIcon className={'w-4 h-4 me-2' + iconClassName} />
      )}
      {label}
    </button>
  );
};

export default Button;
