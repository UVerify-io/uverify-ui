declare interface TagProps {
  size?: 'sm' | 'md';
  label: string;
  color: 'blue' | 'pink' | 'cyan' | 'purple' | 'ice' | 'green';
  className?: string;
}

const Tag = ({ size, label, color, className }: TagProps) => {
  const variants = {
    blue: 'bg-blue-500/20 text-blue-200 border-blue-400/35',
    pink: 'bg-pink-500/20 text-pink-200 border-pink-400/35',
    cyan: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/35',
    purple: 'bg-purple-500/20 text-purple-200 border-purple-400/35',
    ice: 'bg-ice-500/20 text-ice-200 border-ice-400/35',
    green: 'bg-green-500/20 text-green-200 border-green-400/35',
  };

  className = typeof className === 'string' ? ' ' + className : '';

  if (typeof size === 'undefined' || size === 'md') {
    return (
      <span
        className={
          'select-none text-xs tracking-normal align-middle font-medium px-3 py-1 rounded-full border backdrop-blur-sm ' +
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
          'select-none text-[0.6rem] align-middle font-medium px-2 py-1 rounded-full border backdrop-blur-sm ' +
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
