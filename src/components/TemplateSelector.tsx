import { useEffect, useState } from 'react';
import { getTemplates, Templates } from '../templates';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';
import axios from 'axios';

interface TemplateSelectorProps {
  onChange: (layout: string, metadata: { [key: string]: string }, bootstrapTokenName?: string) => void;
  userAddress?: string;
  className?: string;
}

async function checkBootstrapAccess(backendUrl: string, address: string, tokenName: string): Promise<boolean> {
  try {
    const response = await axios.get(`${backendUrl}/api/v1/user/bootstrap-access`, {
      params: { address, tokenName },
    });
    return response.data === true;
  } catch {
    return false;
  }
}

const TemplateSelector = ({
  onChange,
  userAddress,
  className,
}: TemplateSelectorProps) => {
  const config = useUVerifyConfig();
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [visibleTemplates, setVisibleTemplates] = useState<Templates>({});

  useEffect(() => {
    async function loadAndFilterTemplates() {
      const loadedTemplates = await getTemplates({
        backendUrl: config.backendUrl,
        networkType: config.cardanoNetwork,
        searchParams: new URLSearchParams(window.location.search),
      });

      const filtered: Templates = {};
      for (const key of Object.keys(loadedTemplates)) {
        const template = loadedTemplates[key];

        if (!template.isWhitelisted(userAddress)) continue;

        const bootstrapWhitelist: string[] | undefined = (template as any).bootstrapWhitelist;
        if (bootstrapWhitelist && bootstrapWhitelist.length > 0) {
          if (!userAddress) continue;
          let hasAccess = false;
          for (const tokenName of bootstrapWhitelist) {
            if (await checkBootstrapAccess(config.backendUrl, userAddress, tokenName)) {
              hasAccess = true;
              break;
            }
          }
          if (!hasAccess) continue;
        }

        filtered[key] = template;
      }

      setVisibleTemplates(filtered);
    }
    loadAndFilterTemplates();
  }, [config, userAddress]);

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
          const key = event.target.value;
          setSelectedTemplate(key);
          const template = visibleTemplates[key];
          const bootstrapWhitelist: string[] | undefined = (template as any).bootstrapWhitelist;
          onChange(key, template.layoutMetadata, bootstrapWhitelist?.[0]);
        }}
      >
        {Object.keys(visibleTemplates).map((template) => (
          <option key={template} value={template}>
            {visibleTemplates[template].name}
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
