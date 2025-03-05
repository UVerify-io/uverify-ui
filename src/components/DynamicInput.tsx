import React, { use, useEffect, useRef, useState } from 'react';

declare interface DynamicInputProps {
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  onFocus?: (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  onBlur?: (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  placeholder?: string;
  className?: string;
}

const DynamicInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  className,
}: DynamicInputProps) => {
  const testMultiline = (value: string, placeholder?: string) =>
    value.includes('\n') ||
    value.length > 50 ||
    (placeholder?.length && placeholder.length > 50);

  const [isMultiline, setIsMultiline] = useState(
    testMultiline(value, placeholder)
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const value = event.target.value;
    setIsMultiline(testMultiline(value, placeholder));

    onChange(event);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    } else if (textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isMultiline]);

  return (
    <div className="flex w-3/5 flex-col mr-1">
      {isMultiline ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            event.target.style.height = 'auto';
            event.target.style.height = event.target.scrollHeight + 'px';
            handleChange(event);
          }}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder || 'Value'}
          className={`p-2 ${className}`}
          rows={3}
          style={{ resize: 'none', overflow: 'hidden', height: 'auto' }}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder || 'Value'}
          className={className}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
    </div>
  );
};

export default DynamicInput;
