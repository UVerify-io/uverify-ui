declare interface TagProps {
  size?: 'sm' | 'md';
  label: string;
  color: 'blue' | 'pink' | 'cyan' | 'purple' | 'ice' | 'green';
  className?: string;
}

const Tag = ({ size, label, color, className }: TagProps) => {
  const backgroundColor = `${color}-400`;
  const borderColor = `${color}-200`;
  const textColor = 'white';
  className = typeof className === 'string' ? ' ' + className : '';

  if (typeof size === 'undefined' || size === 'md') {
    return (
      <span
        className={
          `select-none text-xs tracking-normal align-middle font-medium px-3 py-1 rounded-full bg-${backgroundColor} text-${textColor} border border-${borderColor}/60 shadow-center shadow-${borderColor}/50` +
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
          `select-none text-[0.6rem] align-middle font-medium px-2 py-1 rounded-full bg-${backgroundColor} text-${textColor} border border-${borderColor}/60 shadow-center shadow-${borderColor}/50` +
          className
        }
      >
        {label}
      </span>
    );
  }
};
export default Tag;
