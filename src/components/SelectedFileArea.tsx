declare interface SelectedFileAreaProps {
  selectedFile: File;
  onRemove?: () => void;
}

const SelectedFileArea = ({
  selectedFile,
  onRemove,
}: SelectedFileAreaProps) => {
  return (
    <div className="h-48 sm:h-32 bg-white/10 border-2 border-white/40 border-dashed rounded-xl flex flex-col items-center justify-center w-full min-h-[140px]">
      <span
        id="badge-dismiss-default"
        className="inline-flex items-center px-3 py-1.5 me-2 text-sm font-medium text-white bg-white/20 rounded-lg border border-white/30 shadow-center shadow-white/20 backdrop-blur-sm"
      >
        {selectedFile.name}
        <button
          type="button"
          className="inline-flex items-center p-1 ms-2 text-sm text-white/60 bg-transparent rounded-xs hover:bg-white/20 hover:text-white"
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
