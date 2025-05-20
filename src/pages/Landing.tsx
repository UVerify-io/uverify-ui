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
        className="w-32 h-32 mx-auto sm:w-48 sm:h-48"
      />
      <h1 className="mt-6 mb-2 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl">
        UVerify {networkIndicator}
      </h1>
      <h2 className="mb-6 text-xl font-bold uppercase">
        Where Trust Meets Technology
      </h2>
      <p className="mb-6 text-lg font-normal lg:text-xl sm:px-16 ">
        Building trust with immutable data. UVerify isn't a storage — it's a
        tool empowering everyone to verify your data
      </p>
      <div className="flex justify-center flex-col sm:flex-row items-center">
        <Button
          className="px-8 py-4 font-bold text-lg sm:mr-8 mb-4 sm:mb-0 min-w-[150px] text-center"
          color="cyan"
          data-testid="verify-button"
          label="Verify"
          onClick={() => navigate('/verify')}
          icon={IconType.RightArrow}
        />
        <Button
          className="px-8 py-4 font-bold text-lg min-w-[150px] text-center"
          color="ice"
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
