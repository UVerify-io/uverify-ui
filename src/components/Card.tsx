import { twMerge } from 'tailwind-merge';

declare interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  type?: 'error' | 'warning' | 'default';
}

const Card = ({ title, description, children, className, type }: CardProps) => {
  let backgroundColor = 'bg-white/10';
  let borderColor = 'border-white/20';
  if (type === 'error') {
    backgroundColor = 'bg-pink-500/20';
    borderColor = 'border-pink-400/45';
  } else if (type === 'warning') {
    backgroundColor = 'bg-yellow-500/15';
    borderColor = 'border-yellow-400/40';
  }

  return (
    <div
      className={twMerge(
        `overflow-hidden text-white p-6 ${backgroundColor} sm:rounded-2xl border-t border-b sm:border ${borderColor} backdrop-blur-sm shadow-center`,
        className
      )}
    >
      {title && <h2 className="text-xl font-extrabold">{title}</h2>}
      {description && <p>{description}</p>}
      {children && children}
    </div>
  );
};

export default Card;
