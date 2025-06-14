import { useState } from 'react';

interface AccordionInfoProps {
  question: string;
  answer: string;
  InfoIcon?: React.ComponentType<{ className?: string }>;
}

export default function AccordionInfo({
  question,
  answer,
  InfoIcon,
}: AccordionInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 w-full max-w-md">
      <button
        type="button"
        className="flex items-center text-left text-xs font-normal hover:underline focus:outline-none justify-self-center"
        aria-expanded={open}
        aria-controls="accordion-content"
        onClick={() => setOpen((prev) => !prev)}
      >
        {InfoIcon && <InfoIcon className="w-3 h-3 me-2" />}
        {question}
        <span className="ml-2 transition-transform duration-100" aria-hidden>
          <svg
            className={`w-3 h-3 transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div
        id="accordion-content"
        className={`max-w-72 mt-2 p-4 border border-white rounded text-xs text-white
            ${open ? 'opacity-100' : 'opacity-0 hidden'}`}
      >
        {answer}
      </div>
    </div>
  );
}
