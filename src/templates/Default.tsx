import { toast } from 'react-toastify';
import { FileIcon, getIcon, IconType } from '../components/Icons';
import { Template, UVerifyCertificateExtraData } from './Template';
import { timestampToDateTime } from '../utils/tools';
import LoadingIndicator from '../components/LoadingIndicator';
import Header from '../components/Header';
import Card from '../components/Card';
import MetadataViewer from '../components/MetadataViewer';
import IconButton from '../components/IconButton';
import IdentityCard from '../components/IdentityCard';
import { UVerifyMetadata, UVerifyCertificate } from '../common/types';

class DefaultTemplate extends Template {
  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    pagination: JSX.Element,
    extra: UVerifyCertificateExtraData
  ): JSX.Element {
    const isVerified = certificate !== undefined;
    const description = isVerified ? (
      <>
        <p>
          {`This document has not been altered since we froze its fingerprint ${
            extra.hashedMultipleTimes && 'for the first time '
          } on`}
        </p>
        <p className="font-bold uppercase my-4">{extra.firstDateTime}</p>
        <p className="text-justify w-3/4 pb-4">
          If this date aligns with your expectations for when the document
          should not have been modified, you can have complete confidence in the
          integrity of this document and the reliability of the issuer.
        </p>

        {extra.hashedMultipleTimes && (
          <>
            <p className="text-justify w-3/4 pb-4">
              The same file or text has been frozen several times. Although the
              hash hasn't changed, you can use the page navigation bar to view
              the metadata, issuer, and date specific to each freeze event.
              Additionally, you can use the dropdown to filter by issuer.
            </p>
            {pagination}
            <p className="font-bold uppercase my-4">
              {timestampToDateTime(certificate.creation_time)}
            </p>
          </>
        )}

        <a
          href={`https://preprod.cexplorer.io/tx/${certificate.transaction_hash}/contract#data`}
          target="_blank"
          className="my-2 border border-white/30 text-center inline-flex items-center rounded-xl bg-white/30 px-4 py-2 font-medium text-white transition duration-200 hover:bg-white/40 hover:shadow-center hover:shadow-blue-100/50"
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
        <IdentityCard address={extra.issuer} className="my-2" />
      </>
    ) : extra.serverError ? (
      <>
        <p className="font-bold uppercase my-4">What does this mean for you?</p>
        <p className="text-justify w-3/4 pb-4">
          It's most likely an issue with UVerify rather than the information,
          but proceed with caution.
        </p>
        <p className="text-justify w-3/4 pb-4">
          Currently you will not be able to verify the integrity of this
          document. Please try again later or reach out to the UVerify team, if
          the issue persists.
        </p>
      </>
    ) : (
      <>
        <p className="font-bold uppercase my-4">What does this mean for you?</p>
        <p className="text-center w-3/4 pb-4">
          Be careful when proceeding with this information.
        </p>
        <p className="text-justify w-3/4 pb-4">
          This document or the text data has not been verified in the past, or
          the content has been altered over time, changing its fingerprint.
          Please reach out to the issuer and ask for the original document or
          data.
        </p>
      </>
    );

    let cardType: 'default' | 'warning' | 'error' = 'default';

    if (extra.serverError) {
      cardType = 'warning';
    } else if (!isVerified) {
      cardType = 'error';
    }

    const Icon = isVerified
      ? getIcon(IconType.Verification)
      : getIcon(IconType.Warning);

    const headline = isVerified
      ? 'You Can Trust the Issuer!'
      : extra.serverError
      ? 'UVerify Service is Currently Unavailable'
      : 'Be Careful! Unknown Data Ahead!';

    return (
      <div className="flex flex-col text-center text-white max-w-(--breakpoint-sm) w-full pt-2 sm:pt-12 lg:max-w-(--breakpoint-md)">
        <Header title={hash} fingerprint />
        {extra.isLoading ? (
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
  }
}

export default DefaultTemplate;
