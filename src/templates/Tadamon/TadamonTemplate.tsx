import { Template, UVerifyCertificateExtraData } from '../Template';
import './tadamon.css';
import { UVerifyMetadata, UVerifyCertificate } from '../../common/types';
import { JSX } from 'react';
import tadamonLogo from './assets/tadamon.png';
import isfdLogo from './assets/ISFD.png';
import IsDBLogo from './assets/IsDB.png';
import undpLogo from './assets/UNDP.png';
import veridianCertificateLogo from './assets/veridian_certificate.svg';
import plantsLogo from './assets/bottom_logo.png';
import { CircularHash, formatDate } from './utils';

class TadamonTemplate extends Template {
  public name = 'Tadamon';

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

    return (
      <div className="rounded-[40px] px-12 bg-[#eeeff2] font-['Manrope',sans-serif] text-[#1f242b] flex w-3/4">
        <div className="grow py-12">
          <div className="flex flex-col items-start justify-between min-h-100">
            <img src={tadamonLogo} alt="Tadamon Logo" width={300} />
            <div className="flex flex-col items-start justify-center mt-16">
              <p className="text-xl text-[#4E5661]">
                {formatDate(extra.firstDateTime)}
              </p>
              <h1 className="text-5xl text-[##1F242B] font-bold mt-4">
                {csoName}
              </h1>
              <p className="text-xl text-[#4E5661] mt-4">has been awarded a</p>
              <h1 className="text-4xl text-[##1F242B] font-bold mt-4">
                CSO Certificate
              </h1>
            </div>

            <div className="flex items-start justify-center mt-16">
              <div className="flex flex-col items-start justify-center mr-8">
                <h3 className="text-md font-bold mb-1">
                  {formatDate(extra.firstDateTime)}
                </h3>
                <p className="text-xs mb-4">UNDP Sign Date</p>
                <p className="text-xs">{registrationCountry}</p>
              </div>
              <div className="flex flex-col items-start justify-center">
                <h3 className="text-md font-bold mb-1">
                  {formatDate(extra.firstDateTime)}
                </h3>
                <p className="text-xs mb-4">Beneficiary Sign Date</p>
                <p className="text-xs">
                  Certificate Hash: <CircularHash hash={hash} />
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between items-center relative grow py-12">
          <div className="flex items-start">
            <img src={isfdLogo} alt="ISFD Logo" className="h-12 mx-2" />
            <img src={IsDBLogo} alt="IsDB Logo" className="h-12 mx-2" />
            <img src={undpLogo} alt="UNDP Logo" className="h-12 mx-2" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <img
              src={veridianCertificateLogo}
              alt="Veridian Certificate Logo"
              className="h-50 mt-8 mb-2"
            />
            <a
              href={`https://${explorerUrlPrefix}cexplorer.io/tx/${
                certificate!.transaction_hash
              }`}
              target="_blank"
              className="text-center inline-flex items-center rounded-xl bg-[#1D4D49] px-9 py-3 text-[#F9FAFB] text-sm"
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
          <div className="flex grow"></div>
          <img
            src={plantsLogo}
            alt="Plants Logo"
            className="absolute bottom-0 w-3/5 max-w-[200px] transform scale-x-[-1]"
          />
        </div>
      </div>
    );
  }
}

export default TadamonTemplate;
