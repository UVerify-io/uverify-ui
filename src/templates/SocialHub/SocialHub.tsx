import { JSX } from 'react';
import { UVerifyCertificate } from '@uverify/core';
import { SocialHubData, socials } from './common';

declare interface SocialHubProps {
  certificate?: UVerifyCertificate;
  socialHubData?: SocialHubData;
}

function SocialHub({ certificate, socialHubData }: SocialHubProps) {
  const socialHubButton = (
    text: string,
    icon: JSX.Element,
    account: string,
    urlPrefix?: string
  ) => {
    let link = '';
    if (typeof urlPrefix !== 'undefined') {
      if (
        account.startsWith(urlPrefix) ||
        account.replace('www.', '').startsWith(urlPrefix)
      ) {
        link = account;
      } else {
        link = urlPrefix + account;
      }
    }

    return (
      <a
        key={text.toLocaleLowerCase()}
        href={link}
        target="_blank"
        className="m-2 text-cyan-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-cyan-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
      >
        {icon}
        <p className="ml-2 text-xs font-bold">{text}</p>
      </a>
    );
  };

  if (typeof certificate === 'undefined') {
    return <></>;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {socialHubData?.github && socialHubData?.picture && (
        <img
          src={`https://avatars.githubusercontent.com/${socialHubData.github}`}
          className="w-40 h-40 rounded-full mt-2"
        />
      )}
      <h1 className="text-2xl font-bold mt-4">{socialHubData?.name}</h1>
      {socialHubData?.ada_handle && (
        <a
          className="text-green-400 text-lg text-bolder mt-1 mb-4"
          key="ada_handle"
          href={`https://cexplorer.io/${socialHubData.ada_handle}`}
          target="_blank"
        >
          {`${!socialHubData.ada_handle.startsWith('$') ? '$' : ''}${
            socialHubData.ada_handle
          }`}
        </a>
      )}
      <p className="mx-2 text-center text-cyan-400 text-md mt-1 mb-4">
        {socialHubData?.subtitle}
      </p>

      <div className="w-3/5 flex flex-row flex-wrap items-center justify-center mt-2">
        {socials.map((social) => {
          if (
            socialHubData &&
            social.key in socialHubData &&
            socialHubData[social.key] &&
            social.key !== 'ada_handle'
          ) {
            return socialHubButton(
              social.name,
              social.icon,
              socialHubData[social.key],
              social.urlPrefix
            );
          }
        })}
      </div>
    </div>
  );
}

export default SocialHub;
