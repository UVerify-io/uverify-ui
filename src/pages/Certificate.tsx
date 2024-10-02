import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Header from '../components/Header';
import { FileIcon, IconType, getIcon } from '../components/Icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingIndicator from '../components/LoadingIndicator';
import MetadataViewer from '../components/MetadataViewer';
import Pagination from '../components/Pagination';
import { UVerifyCertificate } from '../common/types';
import IdentityCard from '../components/IdentityCard';
import { toast } from 'react-toastify';
import IconButton from '../components/IconButton';

const Certificate = () => {
  const { hash, query } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [firstDateTime, setFirstDateTime] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [metadata, setMetadata] = useState(
    {} as Record<string, string | number | boolean | null>
  );
  const [issuer, setIssuer] = useState('');
  const [certificates, setCertificates] = useState<UVerifyCertificate[]>([]);
  const [transactionHash, setTransactionHash] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const timestampToDateTime = (timestamp: number) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'UTC',
      timeZoneName: 'short',
    };

    return new Date(timestamp).toLocaleString('en-GB', options);
  };

  useEffect(() => {
    if (certificates.length === 0) {
      const response = axios.get(
        import.meta.env.VITE_BACKEND_URL + '/api/v1/verify/' + hash
      );
      response
        .then((res) => {
          if (res.status !== 200) return;
          if (res.data.length === 0) return;
          const certificateList: UVerifyCertificate[] = res.data;
          certificateList.sort((a, b) => a.creationTime - b.creationTime);
          setCertificates(certificateList);
          setIsVerified(true);
          setFirstDateTime(
            timestampToDateTime(certificateList[0].creationTime)
          );
          setTotalPages(res.data.length);

          if (typeof query === 'undefined') {
            setPage(1);
            navigate(`/verify/${hash}/1`, { replace: true });
          } else if (typeof query === 'string') {
            if (query.length === 64) {
              const index = certificateList.findIndex(
                (certificate) => certificate.transactionHash === query
              );
              if (index !== -1) {
                setPage(index + 1);
                navigate(`/verify/${hash}/${index + 1}`, { replace: true });
              } else {
                toast.error(
                  'Unable to resolve the deeplink: Transaction hash not found or does not match the provided data. Please exercise caution if someone sent you this URL.'
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
  }, [query]);

  useEffect(() => {
    if (certificates.length > 0) {
      const certificate = certificates[page - 1];
      setDateTime(timestampToDateTime(certificate.creationTime));
      setTransactionHash(certificate.transactionHash);
      const certificateMetadata = JSON.parse(certificate.metadata);
      setMetadata(certificateMetadata);

      if (
        import.meta.env.VITE_SERVICE_ACCOUNT === certificate.issuer &&
        certificateMetadata.hasOwnProperty('original-issuer')
      ) {
        setIssuer(certificateMetadata['original-issuer']);
      } else {
        setIssuer(certificate.issuer);
      }
    }
  }, [page, certificates]);

  if (!hash) return <div>Invalid hash</div>;

  const Icon = isVerified
    ? getIcon(IconType.Verification)
    : getIcon(IconType.Warning);

  const headline = isVerified
    ? 'You Can Trust the Issuer!'
    : serverError
    ? 'UVerify Service is Currently Unavailable'
    : 'Be Careful! Unknown Data Ahead!';

  const isFrozenMultipleTimes = certificates.length > 1;
  const description = isVerified ? (
    <>
      <p>
        {`This document has not been altered since we froze its fingerprint ${
          isFrozenMultipleTimes && 'for the first time '
        } on`}
      </p>
      <p className="font-bold uppercase my-4">{firstDateTime}</p>
      <p className="text-justify w-3/4 pb-4">
        If this date aligns with your expectations for when the document should
        not have been modified, you can have complete confidence in the
        integrity of this document and the reliability of the issuer.
      </p>

      {isFrozenMultipleTimes && (
        <>
          <p className="text-justify w-3/4 pb-4">
            The same file or text has been frozen several times. Although the
            hash hasn't changed, you can use the page navigation bar to view the
            metadata, issuer, and date specific to each freeze event.
            Additionally, you can use the dropdown to filter by issuer.
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={(newPage) => {
              setPage(newPage);
              navigate(`/verify/${hash}/${newPage}`, { replace: true });
            }}
          />
          <p className="font-bold uppercase my-4">{dateTime}</p>
        </>
      )}

      <a
        href={`https://preprod.cexplorer.io/tx/${transactionHash}/contract#data`}
        target="_blank"
        className="my-2 border border-[#FFFFFF40] text-center inline-flex items-center rounded-xl bg-white/30 px-4 py-2 font-medium text-white transition duration-200 hover:bg-white/40 hover:shadow-center hover:shadow-blue-100/50"
      >
        View on Block Explorer
        <svg
          className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 10"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 5h12m0 0L9 1m4 4L9 9"
          />
        </svg>
      </a>
      <IdentityCard address={issuer} className="my-2" />
    </>
  ) : serverError ? (
    <>
      <p className="font-bold uppercase my-4">What does this mean for you?</p>
      <p className="text-justify w-3/4 pb-4">
        It's most likely an issue with UVerify rather than the information, but
        proceed with caution.
      </p>
      <p className="text-justify w-3/4 pb-4">
        Currently you will not be able to verify the integrity of this document.
        Please try again later or reach out to the UVerify team, if the issue
        persists.
      </p>
    </>
  ) : (
    <>
      <p className="font-bold uppercase my-4">What does this mean for you?</p>
      <p className="text-center w-3/4 pb-4">
        Be careful when proceeding with this information.
      </p>
      <p className="text-justify w-3/4 pb-4">
        This document or the text data has not been verified in the past, or the
        content has been altered over time, changing its fingerprint. Please
        reach out to the issuer and ask for the original document or data.
      </p>
    </>
  );

  let cardType: 'default' | 'warning' | 'error' = 'default';

  if (serverError) {
    cardType = 'warning';
  } else if (!isVerified) {
    cardType = 'error';
  }

  return (
    <div className="flex flex-col text-center text-white max-w-screen-sm w-full pt-2 sm:pt-12 lg:max-w-screen-md">
      <Header title={hash} fingerprint />
      {isLoading ? (
        <LoadingIndicator className="mt-28" />
      ) : (
        <Card
          className="mt-2 grow sm:mx-2 sm:mt-12 sm:grow-0 sm:mb-4"
          type={cardType}
        >
          <div className="flex flex-col justify-center items-center">
            <Icon className="w-24 h-24 text-white" />
            <h2 className="text-xl font-extrabold uppercase my-4">
              {headline}
            </h2>
            {description}
          </div>
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="flex flex-col justify-center">
              <div className="flex flex-col items-center justify-center mt-2 mb-5">
                <FileIcon className="w-12 h-12 my-2" />
                <div className="flex items-center">
                  <p className="font-bold uppercase">
                    Certificate Contains Metadata
                  </p>
                  <IconButton
                    iconType={IconType.Copy}
                    className="ml-1"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(metadata));
                      toast.success('Copied to clipboard');
                    }}
                  />
                </div>
              </div>
              <MetadataViewer json={metadata} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Certificate;
