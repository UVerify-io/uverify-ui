import { Template, UVerifyCertificateExtraData } from './Template';
import { UVerifyMetadata, UVerifyCertificate } from '../common/types';
import { ThemeSettings } from '../utils/hooks';
import { timestampToDateTime } from '../utils/tools';
import DOMPurify from 'dompurify';
import { JSX } from 'react';

class DiplomaTemplate extends Template {
  public name = 'Diploma';
  public theme: Partial<ThemeSettings> = {
    background: 'bg-blue-600',
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
            color: 'bg-black',
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

  public layoutMetadata = {
    issuer: 'The issuer name',
    name: 'The recipient name',
    title: 'The title of the certificate',
    description:
      'Optional description. Default is a sentence includinf the recipient name and the title.',
    pattern: 'Optional SVG pattern. Default is a diagonal lines pattern.',
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
      description: metadata.description || (
        <>
          {'This is to certify that ' +
            metadata.name +
            '. has been recognized for outstanding contributions and exemplary performance in the field of '}
          <h3 className="my-4 sm:my-8 text-2xl font-bold">{metadata.title}</h3>
        </>
      ),
      date: timestampToDateTime(certificate.creationTime),
      certificateNumber: hash,
    };

    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center sm:p-8">
        <div className="relative w-full sm:w-3/4 bg-blue-500 text-white sm:rounded-lg shadow-lg p-6 sm:p-12 border-x-0 sm:border-x-4 border-y-4 border-white">
          {typeof metadata.pattern === 'string' ? (
            <div
              className="hidden absolute inset-0 bg-blue-600 opacity-20 pointer-events-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  metadata.pattern
                    .replace(new RegExp('fillOpacity', 'g'), 'fillOpacity')
                    .replace(new RegExp('className', 'g'), 'class'),
                  {
                    USE_PROFILES: { svg: true },
                  }
                ),
              }}
            ></div>
          ) : (
            <div className="absolute inset-0 bg-blue-900 opacity-20 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="a"
                    width="35.584"
                    height="30.585"
                    patternTransform="rotate(170)scale(2)"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      width="100%"
                      height="100%"
                      fill="#fff"
                      fillOpacity=".47"
                    />
                    <path
                      fillOpacity=".2"
                      d="M36.908 9.243c-5.014 0-7.266 3.575-7.266 7.117 0 3.376 2.45 5.726 5.959 5.726 1.307 0 2.45-.463 3.244-1.307.744-.811 1.125-1.903 1.042-3.095-.066-.811-.546-1.655-1.274-2.185-.596-.447-1.639-.894-3.162-.546a.87.87 0 0 0-.662 1.06c.1.48.58.777 1.06.661.695-.149 1.274-.066 1.705.249.364.265.546.645.562.893.05.679-.165 1.308-.579 1.755-.446.48-1.125.744-1.936.744-2.55 0-4.188-1.538-4.188-3.938 0-2.466 1.44-5.347 5.495-5.347 2.897 0 6.008 1.888 6.388 6.058.166 1.804.067 5.147-2.598 7.034a1 1 0 0 0-.142.122c-1.311.783-2.87 1.301-4.972 1.301-4.088 0-6.123-1.952-8.275-4.021-2.317-2.218-4.7-4.518-9.517-4.518-4.094 0-6.439 1.676-8.479 3.545.227-1.102.289-2.307.17-3.596-.496-5.263-4.567-7.662-8.159-7.662-5.015 0-7.265 3.574-7.265 7.116 0 3.377 2.45 5.727 5.958 5.727 1.307 0 2.449-.463 3.243-1.308.745-.81 1.126-1.903 1.043-3.095-.066-.81-.546-1.654-1.274-2.184-.596-.447-1.639-.894-3.161-.546a.87.87 0 0 0-.662 1.06.866.866 0 0 0 1.059.66c.695-.148 1.275-.065 1.705.25.364.264.546.645.563.893.05.679-.166 1.307-.58 1.754-.447.48-1.125.745-1.936.745-2.549 0-4.188-1.539-4.188-3.939 0-2.466 1.44-5.345 5.495-5.345 2.897 0 6.008 1.87 6.389 6.057.163 1.781.064 5.06-2.504 6.96-1.36.864-2.978 1.447-5.209 1.447-4.088 0-6.124-1.952-8.275-4.021-2.317-2.218-4.7-4.518-9.516-4.518v1.787c4.088 0 6.123 1.953 8.275 4.022 2.317 2.218 4.7 4.518 9.516 4.518 4.8 0 7.2-2.3 9.517-4.518 2.151-2.069 4.187-4.022 8.275-4.022s6.124 1.953 8.275 4.022c2.318 2.218 4.701 4.518 9.517 4.518 4.8 0 7.2-2.3 9.516-4.518 2.152-2.069 4.188-4.022 8.276-4.022s6.123 1.953 8.275 4.022c2.317 2.218 4.7 4.518 9.517 4.518v-1.788c-4.088 0-6.124-1.952-8.275-4.021-2.318-2.218-4.701-4.518-9.517-4.518-4.103 0-6.45 1.683-8.492 3.556.237-1.118.304-2.343.184-3.656-.497-5.263-4.568-7.663-8.16-7.663"
                    />
                    <path
                      fillOpacity=".2"
                      d="M23.42 41.086a.9.9 0 0 1-.729-.38.883.883 0 0 1 .215-1.242c2.665-1.887 2.764-5.23 2.599-7.034-.38-4.187-3.492-6.058-6.389-6.058-4.055 0-5.495 2.88-5.495 5.346 0 2.4 1.639 3.94 4.188 3.94.81 0 1.49-.265 1.936-.745.414-.447.63-1.076.58-1.755-.017-.248-.2-.629-.547-.893-.43-.315-1.026-.398-1.704-.249a.87.87 0 0 1-1.06-.662.87.87 0 0 1 .662-1.059c1.523-.348 2.566.1 3.161.546.729.53 1.209 1.374 1.275 2.185.083 1.191-.298 2.284-1.043 3.095-.794.844-1.936 1.307-3.244 1.307-3.508 0-5.958-2.35-5.958-5.726 0-3.542 2.25-7.117 7.266-7.117 3.591 0 7.663 2.4 8.16 7.663.347 3.79-.828 6.868-3.344 8.656a.82.82 0 0 1-.53.182zm0-30.585a.9.9 0 0 1-.729-.38.883.883 0 0 1 .215-1.242c2.665-1.887 2.764-5.23 2.599-7.034-.381-4.187-3.493-6.058-6.389-6.058-4.055 0-5.495 2.88-5.495 5.346 0 2.4 1.639 3.94 4.188 3.94.81 0 1.49-.266 1.936-.746.414-.446.629-1.075.58-1.754-.017-.248-.2-.629-.547-.894-.43-.314-1.026-.397-1.705-.248A.87.87 0 0 1 17.014.77a.87.87 0 0 1 .662-1.06c1.523-.347 2.566.1 3.161.547.729.53 1.209 1.374 1.275 2.185.083 1.191-.298 2.284-1.043 3.095-.794.844-1.936 1.307-3.244 1.307-3.508 0-5.958-2.35-5.958-5.726 0-3.542 2.25-7.117 7.266-7.117 3.591 0 7.663 2.4 8.16 7.663.347 3.79-.828 6.868-3.344 8.656a.82.82 0 0 1-.53.182zm29.956 1.572c-4.8 0-7.2-2.3-9.517-4.518-2.151-2.069-4.187-4.022-8.275-4.022S29.46 5.486 27.31 7.555c-2.317 2.218-4.7 4.518-9.517 4.518-4.8 0-7.2-2.3-9.516-4.518C6.124 5.486 4.088 3.533 0 3.533s-6.124 1.953-8.275 4.022c-2.317 2.218-4.7 4.518-9.517 4.518-4.8 0-7.2-2.3-9.516-4.518-2.152-2.069-4.188-4.022-8.276-4.022V1.746c4.8 0 7.2 2.3 9.517 4.518 2.152 2.069 4.187 4.022 8.275 4.022s6.124-1.953 8.276-4.022C-7.2 4.046-4.816 1.746 0 1.746c4.8 0 7.2 2.3 9.517 4.518 2.151 2.069 4.187 4.022 8.275 4.022s6.124-1.953 8.275-4.022c2.318-2.218 4.7-4.518 9.517-4.518 4.8 0 7.2 2.3 9.517 4.518 2.151 2.069 4.187 4.022 8.275 4.022s6.124-1.953 8.275-4.022c2.317-2.218 4.7-4.518 9.517-4.518v1.787c-4.088 0-6.124 1.953-8.275 4.022-2.317 2.234-4.717 4.518-9.517 4.518"
                    />
                  </pattern>
                </defs>
                <rect
                  width="800%"
                  height="800%"
                  fill="url(#a)"
                  transform="translate(-60 -58)"
                />
              </svg>
            </div>
          )}

          <div className="relative z-10 text-center">
            <h1 className="text-xl sm:text-3xl font-bold tracking-widest mb-4">
              {certificateData.title}
            </h1>
            <hr className="border-t-2 border-white w-1/2 mx-auto mb-6" />
            <p className="text-lg mb-4">This certificate is presented to</p>
            <h2 className="text-2xl sm:text-5xl font-bold mb-6">
              {certificateData.recipient}
            </h2>
            <div className="sm:text-lg">{certificateData.description}</div>
            <p className="sm:text-lg mb-2">Awarded on {certificateData.date}</p>
            <p className="mt-4 sm:mt-8 mb-2 text-sm font-extrabold">
              Certificate Number:
            </p>
            <p className="sm:text-lg mb-8 break-all">
              {certificateData.certificateNumber}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default DiplomaTemplate;
