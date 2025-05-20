import { toast } from 'react-toastify';
import { FileIcon, getIcon, IconType } from '../components/Icons';
import { Template, UVerifyCertificateExtraData } from './Template';
import { timestampToDateTime } from '../utils/tools';
import Header from '../components/Header';
import Card from '../components/Card';
import MetadataViewer from '../components/MetadataViewer';
import IconButton from '../components/IconButton';
import IdentityCard from '../components/IdentityCard';
import { UVerifyMetadata, UVerifyCertificate } from '../common/types';
import { ThemeSettings } from '../utils/hooks';
import { JSX } from 'react';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';

class MonochromeTemplate extends Template {
  public name = 'Monochrome';
  public theme: Partial<ThemeSettings> = {
    background: 'bg-black',
    colors: {
      ice: {
        50: '255, 255, 255',
        100: '255, 255, 255',
        200: '255, 255, 255',
        300: '0, 0, 0',
        400: '0, 0, 0',
        500: '0, 0, 0',
        600: '0, 0, 0',
        700: '0, 0, 0',
        800: '0, 0, 0',
        900: '0, 0, 0',
        950: '0, 0, 0',
      },
      green: {
        50: '255, 255, 255',
        100: '255, 255, 255',
        200: '255, 255, 255',
        300: '255, 255, 255',
        400: '0, 0, 0',
        500: '0, 0, 0',
        600: '0, 0, 0',
        700: '0, 0, 0',
        800: '0, 0, 0',
        900: '0, 0, 0',
        950: '0, 0, 0',
      },
      cyan: {
        50: '255, 255, 255',
        100: '255, 255, 255',
        200: '255, 255, 255',
        300: '255, 255, 255',
        400: '0, 0, 0',
        500: '0, 0, 0',
        600: '0, 0, 0',
        700: '0, 0, 0',
        800: '0, 0, 0',
        900: '0, 0, 0',
        950: '0, 0, 0',
      },
    },
    components: {
      fingerprint: {
        gradient: {
          color: {
            start: 'rgb(255 255 255 / .4)',
            end: 'rgb(255 255  255 / .2)',
          },
        },
      },
      pagination: {
        border: {
          active: {
            color: 'border-black/75',
          },
          inactive: {
            color: 'border-black/30',
            hover: {
              color: 'border-black/25',
            },
          },
        },
        text: {
          active: {
            color: 'black',
            hover: {
              color: 'white',
            },
          },
          inactive: {
            color: 'white',
            hover: {
              color: 'white',
            },
          },
        },
        background: {
          active: {
            color: 'bg-white',
          },
          inactive: {
            color: 'bg-white',
            hover: {
              color: 'bg-black',
            },
          },
        },
      },
      identityCard: {
        border: {
          color: 'black',
          opacity: 60,
          hover: {
            color: 'black',
            opacity: 100,
          },
        },
        background: {
          color: 'black',
          opacity: 100,
          hover: {
            color: 'black',
            opacity: 100,
          },
        },
      },
      metadataViewer: {
        border: {
          color: 'black',
          opacity: 100,
          hover: {
            color: 'black',
            opacity: 100,
          },
        },
      },
    },
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    pagination: JSX.Element,
    extra: UVerifyCertificateExtraData
  ): JSX.Element {
    const config = useUVerifyConfig();
    let explorerUrlPrefix = config.cardanoNetwork + '.';
    if (config.cardanoNetwork === 'mainnet') {
      explorerUrlPrefix = '';
    }

    if (typeof certificate === 'undefined') {
      return <></>;
    }

    const description = (
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
          href={`https://${explorerUrlPrefix}cexplorer.io/tx/${certificate.transaction_hash}/contract#data`}
          target="_blank"
          className="my-2 text-center text-black inline-flex items-center rounded-xl bg-black px-4 py-2 font-medium text-white transition duration-200 hover:shadow-center hover:shadow-white-100/50"
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
    );

    const Icon = getIcon(IconType.Verification);

    return (
      <div className="flex flex-col text-center text-white max-w-(--breakpoint-sm) w-full pt-2 sm:pt-12 lg:max-w-(--breakpoint-md)">
        <Header title={hash} fingerprint />
        <Card className="mt-2 grow sm:mx-2 sm:mt-12 sm:grow-0 sm:mb-4 bg-white text-black border-0 sm:border-0">
          <div className="flex flex-col justify-center items-center">
            <Icon className="w-24 h-24" />
            <h2 className="text-xl font-extrabold uppercase my-4">
              You Can Trust the Issuer!
            </h2>
            {description}
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-col items-center justify-center mt-2 mb-5">
              <FileIcon className="w-12 h-12 my-2" />
              <div className="flex items-center">
                <p className="font-bold uppercase">
                  Certificate Contains Metadata
                </p>
                <IconButton
                  iconType={IconType.Copy}
                  className="ml-1 text-black"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(metadata));
                    toast.success('Copied to clipboard');
                  }}
                />
              </div>
            </div>
            <MetadataViewer json={metadata} />
          </div>
        </Card>
      </div>
    );
  }
}

export default MonochromeTemplate;
