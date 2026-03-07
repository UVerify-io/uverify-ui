import Button from '../components/Button';
import { IconType } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/uverify.svg';
import { getCardanoNetworkIndicator } from '../utils/cardano';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';

const Landing = () => {
  const navigate = useNavigate();
  const config = useUVerifyConfig();
  const networkIndicator = getCardanoNetworkIndicator(config);

  return (
    <div className="text-center text-white max-w-(--breakpoint-md) mt-12 px-6 sm:px-0 min-h-full">
      <img
        src={Logo}
        alt="UVerify Logo"
        className="w-32 h-32 mx-auto sm:w-48 sm:h-48 animate-logo-glow"
      />
      <h1 className="mt-6 mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl">
        UVerify {networkIndicator}
      </h1>
      <span className="inline-flex items-center mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-ice-400/35 bg-ice-600/20 text-ice-200 backdrop-blur-sm">
        Where Trust Meets Technology
      </span>
      <p className="mb-8 text-lg font-light text-white/75 lg:text-xl sm:px-16">
        Building trust with immutable data. UVerify empowers everyone to verify
        the authenticity of their data without a central authority
      </p>
      <div className="flex justify-center flex-col sm:flex-row items-center gap-4">
        <Button
          className="px-8 py-4 font-bold text-lg min-w-[150px] text-center"
          color="cyan"
          data-testid="verify-button"
          label="Verify"
          onClick={() => navigate('/verify')}
          icon={IconType.RightArrow}
        />
        <Button
          className="px-8 py-4 font-bold text-lg min-w-[150px] text-center"
          color="green"
          data-testid="create-button"
          label="Create"
          onClick={() => navigate('/create')}
          icon={IconType.RightArrow}
        />
      </div>
    </div>
  );
};

export default Landing;
