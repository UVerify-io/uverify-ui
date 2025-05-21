import { Template, UVerifyCertificateExtraData } from '../Template';
import './tadamon.css';
import { UVerifyMetadata, UVerifyCertificate } from '../../common/types';
import { JSX } from 'react';
import tadamonLogo from './assets/tadamon.png';
import isfdLogo from './assets/ISFD.png';
import IsDBLogo from './assets/Isdb.png';
import undpLogo from './assets/UNDP.png';
import veridianCertificateLogo from './assets/veridian_certificate.svg';
import plantsLogo from './assets/bottom_logo.png';
import { CircularHash, formatDate } from './utils';
import { timestampToDateTime } from '../../utils/tools';

class TadamonTemplate extends Template {
  public name = 'Tadamon';
  public whitelist = [
    'addr_test1qpftcj63cky29z6xq69hm454c4ru0tyq89aqcm5kd65wzsevvxgywp50vfnt0raqf0p6y9rq07y4rsrc4fu3k528rc0q8gvagn',
  ];

  public theme = {
    background: 'bg-[#1f242b]',
    footer: {
      hide: true,
    },
  };

  public layoutMetadata = {
    cso_name: 'The name of the CSO',
    beneficiary_sign_date: 'The unix timestamp of the beneficiary signature',
    registration_country: 'The country of registration',
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    extra: UVerifyCertificateExtraData
  ): JSX.Element {
    let explorerUrlPrefix = import.meta.env.VITE_CARDANO_NETWORK + '.';
    if (import.meta.env.VITE_CARDANO_NETWORK === 'mainnet') {
      explorerUrlPrefix = '';
    }

    let csoName = metadata.cso_name || '';
    let registrationCountry = metadata.registration_country
      ? `Country of Registration: ${metadata.registration_country}`
      : '';

    let beneficiarySignDate = null;

    if (typeof metadata.beneficiary_sign_date === 'number') {
      beneficiarySignDate = formatDate(
        timestampToDateTime(metadata.beneficiary_sign_date)
      );
    } else if (
      typeof metadata.beneficiary_sign_date === 'string' &&
      /^\d+$/.test(metadata.beneficiary_sign_date)
    ) {
      beneficiarySignDate = formatDate(
        timestampToDateTime(parseInt(metadata.beneficiary_sign_date))
      );
    }

    return (
      <div className="rounded-[25px] sm:rounded-[40px] pt-12 px-12 bg-[#eeeff2] font-['Manrope',sans-serif] text-[#1f242b] w-10/12 md:w-3/4 max-w-[800px] mb-12 md:mb-0">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="flex w-full sm:w-2/3 justify-center sm:justify-start">
            <img src={tadamonLogo} alt="Tadamon Logo" width={200} />
          </div>
          <div className="flex w-[200px] sm:w-1/3 mt-4 sm:mt-0 items-center justify-between sm:justify-around">
            <img src={IsDBLogo} alt="IsDB Logo" className="h-12 mx-2" />
            <img src={isfdLogo} alt="ISFD Logo" className="h-12 mx-2" />
            <img src={undpLogo} alt="UNDP Logo" className="h-12 mx-2" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="flex w-[200px] md:w-2/3 flex-col items-center sm:items-start justify-between">
            <div className="flex flex-col items-start justify-center mt-8 sm:mt-16">
              <p className="text-lg text-[#4E5661]">
                {formatDate(extra.firstDateTime)}
              </p>
              <h1 className="text-4xl text-[##1F242B] font-bold mt-1">
                {csoName}
              </h1>
              <p className="text-lg text-[#4E5661] mt-4">has been awarded a</p>
              <h1 className="text-3xl font-semibold text-[##1F242B] mt-1">
                CSO Certificate
              </h1>
            </div>
          </div>

          <div className="flex w-full md:w-1/3 mt-8 flex-col justify-between relative grow">
            <img
              src={veridianCertificateLogo}
              alt="Veridian Certificate Logo"
              className="h-50 mb-2"
            />
            <a
              href={`https://${explorerUrlPrefix}cexplorer.io/tx/${
                certificate!.transaction_hash
              }`}
              target="_blank"
              className="text-center w-full inline-flex justify-center items-center rounded-xl bg-[#1D4D49] py-3 text-[#F9FAFB] text-xs"
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
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex w-full sm:w-2/3 mt-12">
            <div className="flex sm:grow flex-col md:flex-row items-start">
              <div className="flex flex-col sm:grow">
                <h3 className="text-md font-semibold mb-1">
                  {formatDate(extra.firstDateTime)}
                </h3>
                <p className="text-xs mb-4 sm:mb-8 font-medium">
                  UNDP Sign Date
                </p>
              </div>
              {beneficiarySignDate &&
                beneficiarySignDate !== 'Invalid date' && (
                  <div className="flex flex-col sm:grow">
                    <h3 className="text-md font-semibold mb-1">
                      {beneficiarySignDate}
                    </h3>
                    <p className="text-xs mb-4 sm:mb-8 font-medium">
                      Beneficiary Sign Date
                    </p>
                  </div>
                )}
            </div>
          </div>
          <div className="flex w-full sm:w-2/3 mb-12">
            <div className="flex flex-col md:flex-row sm:grow">
              <p className="text-xs sm:grow mt-4 md:mt-0">
                {registrationCountry}
              </p>
              <p className="text-xs sm:grow mt-4 md:mt-0">
                Certificate Hash: <CircularHash hash={hash} />
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center">
          <div className="flex w-2/3 hidden md:block"></div>
          <div className="flex w-full md:w-1/3 items-center justify-center">
            <img
              src={plantsLogo}
              alt="Plants Logo"
              className="md:absolute md:bottom-0 md:w-5/7 max-w-[200px] transform scale-x-[-1]"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default TadamonTemplate;
