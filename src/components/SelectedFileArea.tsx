declare interface SelectedFileAreaProps {
  selectedFile: File;
  onRemove?: () => void;
}

const SelectedFileArea = ({
  selectedFile,
  onRemove,
}: SelectedFileAreaProps) => {
  return (
    <div className="h-48 sm:h-32 bg-white/25 border-2 border-white border-dashed rounded-lg flex flex-col items-center justify-center w-full min-h-[140px]">
      <span
        id="badge-dismiss-default"
        className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-sm shadow-center shadow-white/50"
      >
        {selectedFile.name}
        <button
          type="button"
          className="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-xs hover:bg-blue-200 hover:text-blue-900"
          data-dismiss-target="#badge-dismiss-default"
          aria-label="Remove"
          onClick={() => {
            typeof onRemove === 'function' && onRemove();
          }}
        >
          <svg
            className="w-2 h-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </span>
    </div>
  );
};

export default SelectedFileArea;
