interface TextAreaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
}

const TextArea = ({ value, onChange, className, rows }: TextAreaProps) => {
  className = className ? ` ${className}` : '';
  rows = rows ? rows : 4;

  return (
    <textarea
      rows={rows}
      className={
        'block pl-2.5 py-2.5 pr-4 w-full text-sm text-white bg-white/10 outline-hidden rounded-xl border border-white/30 resize-none focus:bg-white/15 focus:border-white/50 focus:shadow-center focus:shadow-white/30 transition-colors duration-200' +
        className
      }
      value={value}
      onChange={onChange}
    ></textarea>
  );
};

export default TextArea;
