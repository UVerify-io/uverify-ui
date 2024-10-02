import React, { useCallback } from 'react';

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  className?: string;
}

const Dropzone = ({ onDrop, className }: DropzoneProps) => {
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      onDrop(files);
    },
    [onDrop]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  className = className ? ` ${className}` : '';

  return (
    <div
      className={'flex items-center justify-center w-full' + className}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-48 sm:h-32 border-2 border-white border-dashed rounded-lg cursor-pointer bg-white/25"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-white">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
        </div>
        <input
          id="dropzone-file"
          onChange={(event) =>
            onDrop(event.target.files ? Array.from(event.target.files) : [])
          }
          type="file"
          className="hidden"
        />
      </label>
    </div>
  );
};

export default Dropzone;
