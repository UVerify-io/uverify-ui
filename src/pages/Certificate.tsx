import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { getTemplates, Templates } from '../templates';
import { timestampToDateTime } from '../utils/tools';
import { useUVerifyTheme } from '../utils/hooks';
import TemplateWrapper from '../templates/TemplateWrapper';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';
import { UVerifyCertificate, UVerifyMetadata } from '@uverify/core';

const Certificate = () => {
  const { hash, query } = useParams();
  const { applyTheme, restoreDefaults } = useUVerifyTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  const [firstDateTime, setFirstDateTime] = useState('');
  const [metadata, setMetadata] = useState({} as UVerifyMetadata);
  const [issuer, setIssuer] = useState('');
  const [certificates, setCertificates] = useState<UVerifyCertificate[]>([]);
  const [certificate, setCertificate] = useState<UVerifyCertificate>();
  const [templateId, setTemplateId] = useState('default');
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const config = useUVerifyConfig();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Templates>({});

  useEffect(() => {
    async function loadTemplates() {
      const loadedTemplates = await getTemplates();
      setTemplates(loadedTemplates);
    }
    loadTemplates();
  }, []);

  useEffect(() => {
    if (certificates.length === 0) {
      const response = axios.get(config.backendUrl + '/api/v1/verify/' + hash);
      response
        .then((res) => {
          if (res.status !== 200) return;
          if (res.data.length === 0) return;
          const certificateList: UVerifyCertificate[] = res.data;
          certificateList.sort((a, b) => a.creationTime - b.creationTime);
          setCertificates(certificateList);
          setFirstDateTime(
            timestampToDateTime(certificateList[0].creationTime),
          );
          setTotalPages(res.data.length);

          if (typeof query === 'undefined') {
            setPage(1);
            navigate(`/verify/${hash}/1`, { replace: true });
          } else if (typeof query === 'string') {
            if (query.length === 64) {
              const index = certificateList.findIndex(
                (item) => item.transactionHash === query,
              );
              if (index !== -1) {
                setPage(index + 1);
                navigate(`/verify/${hash}/${index + 1}`, { replace: true });
              } else {
                toast.error(
                  'Unable to resolve the deeplink: Transaction hash not found or does not match the provided data. Please exercise caution if someone sent you this URL.',
                );
                setPage(1);
                navigate(`/verify/${hash}/1`, { replace: true });
              }
            } else if (!isNaN(parseInt(query))) {
              setPage(parseInt(query));
            }
          }
        })
        .catch((error) => {
          if (error.response?.status === 404) return;
          setServerError(true);
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [query, config]);

  useEffect(() => {
    if (certificates.length > 0) {
      if (page > certificates.length) {
        setPage(certificates.length);
        return;
      }
      setCertificate(certificates[page - 1]);

      const certificateMetadata = JSON.parse(certificates[page - 1].metadata);
      setMetadata(certificateMetadata);

      if (
        config.serviceAccount === certificates[page - 1].issuer &&
        certificateMetadata.hasOwnProperty('original-issuer')
      ) {
        setIssuer(certificateMetadata['original-issuer']);
      } else {
        setIssuer(certificates[page - 1].issuer);
      }

      const metadataTemplateId =
        certificateMetadata['uverify_template_id'] === 'linktree'
          ? 'socialHub'
          : certificateMetadata['uverify_template_id'];

      if (
        certificateMetadata.hasOwnProperty('uverify_template_id') &&
        templates.hasOwnProperty(metadataTemplateId)
      ) {
        setTemplateId(metadataTemplateId);
        applyTheme(templates[metadataTemplateId].theme);
        return restoreDefaults;
      } else {
        setTemplateId('default');
        restoreDefaults();
      }
    }
  }, [page, certificates]);

  if (!hash) return <div>Invalid hash</div>;

  const template =
    templates[templateId === 'linktree' ? 'socialHub' : templateId];
  const hashedMultipleTimes = certificates.length > 1;

  const extra = {
    hashedMultipleTimes,
    firstDateTime,
    issuer,
    serverError,
    isLoading,
  };

  const pagination = (
    <Pagination
      page={page}
      totalPages={totalPages}
      setPage={(newPage) => {
        setPage(newPage);
        navigate(`/verify/${hash}/${newPage}`, { replace: true });
      }}
    />
  );

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-white flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-black/80 rounded-full animate-[bounce_1.5s_infinite_0ms]"></div>
          <div className="w-4 h-4 bg-black/80 rounded-full animate-[bounce_1.5s_infinite_200ms]"></div>
          <div className="w-4 h-4 bg-black/80 rounded-full animate-[bounce_1.5s_infinite_400ms]"></div>
        </div>
      </div>
    );
  }

  return (
    <TemplateWrapper
      key={templateId === 'linktree' ? 'socialHub' : templateId}
      template={template}
      hash={hash}
      metadata={metadata}
      certificate={certificate}
      pagination={pagination}
      extra={extra}
    />
  );
};

export default Certificate;
