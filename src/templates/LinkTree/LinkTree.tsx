import { JSX } from 'react';
import { UVerifyCertificate } from '../../common/types';
import { LinktreeData, socials } from './common';

declare interface LinkTreeProps {
  certificate?: UVerifyCertificate;
  linkTreeData?: LinktreeData;
}

function LinkTree({ certificate, linkTreeData }: LinkTreeProps) {
  const linkTreeButton = (
    text: string,
    icon: JSX.Element,
    account: string,
    urlPrefix?: string
  ) => (
    <a
      key={text.toLocaleLowerCase()}
      href={account ? urlPrefix + account : ''}
      target="_blank"
      className="m-2 text-cyan-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-cyan-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
    >
      {icon}
      <p className="ml-2 text-xs font-bold">{text}</p>
    </a>
  );

  if (typeof certificate === 'undefined') {
    return <></>;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {linkTreeData?.github && linkTreeData?.picture && (
        <img
          src={`https://avatars.githubusercontent.com/${linkTreeData.github}`}
          className="w-40 h-40 rounded-full mt-2"
        />
      )}
      <h1 className="text-2xl font-bold mt-4">{linkTreeData?.name}</h1>
      <p className="mx-2 text-center text-cyan-400 text-md mt-1 mb-4">
        {linkTreeData?.subtitle}
      </p>

      <div className="w-3/5 flex flex-row flex-wrap items-center justify-center mt-2">
        {socials.map((social) => {
          if (
            linkTreeData &&
            social.key in linkTreeData &&
            linkTreeData[social.key]
          ) {
            return linkTreeButton(
              social.name,
              social.icon,
              linkTreeData[social.key],
              social.urlPrefix
            );
          }
        })}
      </div>
    </div>
  );
}

export default LinkTree;
