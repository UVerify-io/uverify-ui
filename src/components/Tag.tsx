import { twMerge } from 'tailwind-merge';

declare interface TagProps {
  size?: 'sm' | 'md';
  label: string;
  color: 'blue' | 'pink' | 'cyan' | 'purple' | 'ice' | 'green';
  className?: string;
}

const Tag = ({ size, label, color, className }: TagProps) => {
  const variants = {
    blue: 'bg-blue-400 text-white border-blue-200/60 shadow-blue-200/50',
    pink: 'bg-pink-400 text-white border-pink-200/60 shadow-pink-200/50',
    cyan: 'bg-cyan-400 text-white border-cyan-200/60 shadow-cyan-200/50',
    purple:
      'bg-purple-400 text-white border-purple-200/60 shadow-purple-200/50',
    ice: 'bg-ice-400 text-white border-ice-200/60 shadow-ice-200/50',
    green: 'bg-green-400 text-white border-green-200/60 shadow-green-200/50',
  };

  className = typeof className === 'string' ? ' ' + className : '';

  if (typeof size === 'undefined' || size === 'md') {
    return (
      <span
        className={
          'select-none text-xs tracking-normal align-middle font-medium px-3 py-1 rounded-full shadow-center border ' +
          variants[color] +
          className
        }
      >
        {label}
      </span>
    );
  } else {
    return (
      <span
        className={
          'select-none text-[0.6rem] align-middle font-medium px-2 py-1 rounded-full border shadow-center ' +
          variants[color] +
          className
        }
      >
        {label}
      </span>
    );
  }
};
export default Tag;
