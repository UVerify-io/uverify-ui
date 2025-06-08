import { useEffect, useState } from 'react';
import { getTemplates, Templates } from '../templates';

interface TemplateSelectorProps {
  onChange: (layout: string, metadata: { [key: string]: string }) => void;
  userAddress?: string;
  className?: string;
}

const TemplateSelector = ({
  onChange,
  userAddress,
  className,
}: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [templates, setTemplates] = useState<Templates>({});

  useEffect(() => {
    async function loadTemplates() {
      const loadedTemplates = await getTemplates();
      setTemplates(loadedTemplates);
    }
    loadTemplates();
  }, []);

  className = className ? ` ${className}` : '';

  return (
    <div className="relative w-1/2">
      <select
        className={
          'w-full block pl-2.5 py-2.5 pr-10 text-sm text-white bg-white/25 outline-hidden rounded border border-[#FFFFFF40] resize-none focus:bg-white/30 focus:shadow-center focus:shadow-white/50 appearance-none' +
          className
        }
        value={selectedTemplate}
        onChange={(event) => {
          setSelectedTemplate(event.target.value);
          onChange(
            event.target.value,
            templates[event.target.value].layoutMetadata
          );
        }}
      >
        {Object.keys(templates)
          .filter((template) => templates[template].isWhitelisted(userAddress))
          .map((template) => (
            <option key={template} value={template}>
              {templates[template].name}
            </option>
          ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
        <svg
          className="h-4 w-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default TemplateSelector;
