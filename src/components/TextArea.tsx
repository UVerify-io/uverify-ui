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
        'block pl-2.5 py-2.5 pr-4 w-full text-sm text-white bg-white/25 outline-hidden rounded-lg border border-white/75 resize-none focus:bg-white/30 focus:shadow-center focus:shadow-white/50' +
        className
      }
      value={value}
      onChange={onChange}
    ></textarea>
  );
};

export default TextArea;
