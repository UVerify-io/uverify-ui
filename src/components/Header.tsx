import Logo from '../assets/uverify.svg';
import { useNavigate } from 'react-router-dom';
import Fingerprint from './Fingerprint';
import { getCardanoNetworkIndicator } from '../utils/cardano';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';

declare interface HeaderProps {
  title: string;
  fingerprint?: boolean;
}

const Header = ({ title, fingerprint }: HeaderProps) => {
  const navigate = useNavigate();
  const config = useUVerifyConfig();

  const RightArrow = (
    <svg
      className="text-white group-hover:drop-shadow-center"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m9 5 7 7-7 7"
      />
    </svg>
  );

  return (
    <header className="flex items-center">
      <div
        onClick={() => navigate('/')}
        className="flex items-center cursor-pointer group min-w-[92px] min-[410px]:min-w-[164px]"
      >
        <img
          src={Logo}
          alt="UVerify Logo"
          className="w-12 h-12 ml-2 mr-1 group-hover:drop-shadow-center"
        />
        <h1 className="text-xl font-extrabold group-hover:drop-shadow-center hidden min-[410px]:block">
          UVerify
        </h1>
        <div style={{ minWidth: 32 }}>{RightArrow}</div>
      </div>

      {fingerprint ? (
        <>
          <h2
            onClick={() => navigate('/verify')}
            className="cursor-pointer text-sm sm:text-md font-bold uppercase text-ellipsis overflow-hidden hover:drop-shadow-center"
          >
            Verify Data
          </h2>
          <div style={{ minWidth: 32 }}>{RightArrow}</div>
          <Fingerprint hash={title} />
          {getCardanoNetworkIndicator(config, 'sm', 'mr-2')}
        </>
      ) : (
        <div className="flex items-center justify-center">
          <h2 className="select-none text-sm sm:text-md font-bold uppercase me-1 max-w-32">
            {title}
          </h2>
          {getCardanoNetworkIndicator(config, 'sm', 'ml-2')}
        </div>
      )}
    </header>
  );
};

export default Header;
