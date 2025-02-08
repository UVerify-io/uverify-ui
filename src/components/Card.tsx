import { twMerge } from 'tailwind-merge';

declare interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  type?: 'error' | 'warning' | 'default';
}

const Card = ({ title, description, children, className, type }: CardProps) => {
  let backgroundColor = 'bg-white/30';
  let borderColor = 'border-[#FFFFFF55]';
  if (type === 'error') {
    backgroundColor = 'bg-pink-400/50';
    borderColor = 'border-pink-500/60';
  } else if (type === 'warning') {
    backgroundColor = 'bg-yellow-300/50';
    borderColor = 'border-yellow-400/60';
  }

  return (
    <div
      className={twMerge(
        `overflow-hidden text-white p-6 ${backgroundColor} sm:rounded-lg border-t border-b sm:border ${borderColor} backdrop-blur-xs shadow-xs`,
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
