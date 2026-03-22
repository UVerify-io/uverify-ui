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

async function checkBackendExtension(backendUrl: string, extensionName: string): Promise<boolean> {
  try {
    const response = await axios.get(`${backendUrl}/api/v1/extension/${extensionName}`);
    return response.status === 200;
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

        const requiredExtensions = template.requiredBackendExtensions;
        if (requiredExtensions && requiredExtensions.length > 0) {
          let allEnabled = true;
          for (const extensionName of requiredExtensions) {
            if (!(await checkBackendExtension(config.backendUrl, extensionName))) {
              allEnabled = false;
              break;
            }
          }
          if (!allEnabled) continue;
        }

        filtered[key] = template;
      }

      setVisibleTemplates(filtered);
    }
    loadAndFilterTemplates();
  }, [config, userAddress]);

  className = className ? ` ${className}` : '';

  return (
    <div className="flex flex-col w-1/2 gap-1">
    <div className="relative w-full">
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
    <a
      href="https://docs.uverify.io/templates/building-a-template"
      target="_blank"
      rel="noreferrer"
      className="text-xs text-white/45 hover:text-white/75 transition-colors duration-200 underline underline-offset-2 text-left"
    >
      + Add your own template
    </a>
    </div>
  );
};

export default TemplateSelector;
