import { Template, UVerifyCertificateExtraData } from './Template';
import { UVerifyMetadata, UVerifyCertificate } from '../common/types';
import { ThemeSettings } from '../utils/hooks';
import { timestampToDateTime } from '../utils/tools';
import DOMPurify from 'dompurify';

class DiplomaTemplate extends Template {
  public theme: Partial<ThemeSettings> = {
    background: 'bg-blue-900',
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
            color: 'black',
            opacity: 75,
          },
          inactive: {
            color: 'black',
            opacity: 30,
            hover: {
              color: '[#00000040]',
              opacity: 100,
            },
          },
        },
        text: {
          active: {
            color: 'white',
            hover: {
              color: 'white',
            },
          },
          inactive: {
            color: 'black',
            hover: {
              color: 'white',
            },
          },
        },
        background: {
          active: {
            color: 'black',
            opacity: 100,
          },
          inactive: {
            color: 'white',
            opacity: 100,
            hover: {
              color: 'black',
              opacity: 100,
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
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData
  ): JSX.Element {
    if (typeof certificate === 'undefined') {
      return <></>;
    }

    const certificateData = {
      title: metadata.issuer,
      recipient: metadata.name,
      description: (
        <>
          {'This is to certify that ' +
            metadata.name +
            '. has been recognized for outstanding contributions and exemplary performance in the field of '}
          <h3 className="font-bold">{metadata.title}</h3>
        </>
      ),
      date: timestampToDateTime(certificate.creation_time),
      certificateNumber: hash,
    };

    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-8">
        <div className="relative w-[900px] bg-blue-800 text-white rounded-lg shadow-lg p-12 border-4 border-white">
          {typeof metadata.pattern === 'string' ? (
            <div
              className="absolute inset-0 bg-blue-900 opacity-20 pointer-events-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  metadata.pattern
                    .replace(new RegExp('fillOpacity', 'g'), 'fill-opacity')
                    .replace(new RegExp('className', 'g'), 'class'),
                  {
                    USE_PROFILES: { svg: true },
                  }
                ),
              }}
            ></div>
          ) : (
            <div className="absolute inset-0 bg-blue-900 opacity-20 pointer-events-none">
              <svg
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
              >
                <path
                  fill="white"
                  fillOpacity="0.2"
                  d="M0,160 C120,200 240,120 360,160 C480,200 600,280 720,240 C840,200 960,120 1080,160 C1200,200 1320,280 1440,240 L1440,320 L0,320 Z"
                ></path>
                <path
                  fill="white"
                  fillOpacity="0.1"
                  d="M0,240 C120,280 240,200 360,240 C480,280 600,360 720,320 C840,280 960,200 1080,240 C1200,280 1320,360 1440,320 L1440,320 L0,320 Z"
                ></path>
                <path
                  fill="white"
                  fillOpacity="0.05"
                  d="M0,320 C120,360 240,280 360,320 C480,360 600,440 720,400 C840,360 960,280 1080,320 C1200,360 1320,440 1440,400 L1440,320 L0,320 Z"
                ></path>
              </svg>
            </div>
          )}

          {/* Certificate Content */}
          <div className="relative z-10 text-center">
            <h1 className="text-3xl font-bold tracking-widest mb-4">
              {certificateData.title}
            </h1>
            <hr className="border-t-2 border-white w-1/2 mx-auto mb-6" />
            <p className="text-lg mb-4">This certificate is presented to</p>
            <h2 className="text-5xl font-bold mb-6">
              {certificateData.recipient}
            </h2>
            <p className="text-lg mb-8">{certificateData.description}</p>
            <p className="text-lg mb-2">Awarded on {certificateData.date}</p>
            <p className="text-lg mb-8">
              Certificate NO: {certificateData.certificateNumber}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default DiplomaTemplate;
