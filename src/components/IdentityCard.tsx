import seedrandom from 'seedrandom';
import Identicon from './Identicon';
import Logo from '../assets/uverify.svg';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import { useUVerifyTheme } from '../utils/hooks';

declare interface IdentityCardProps {
  address: string;
  className?: string;
}

const IdentityCard = ({ address, className }: IdentityCardProps) => {
  if (!address) {
    return null;
  }

  const random = seedrandom(address);
  const { components } = useUVerifyTheme();
  const style = components.identityCard;

  const mainColors = ['ice', 'blue', 'green', 'cyan', 'pink', 'purple'];
  const getRandomColor = (colors: string[]) =>
    colors[Math.floor(random() * colors.length)];

  const getMatchingColor = (color: string) => {
    switch (color) {
      case 'ice':
        return getRandomColor(['ice', 'blue', 'green', 'cyan', 'purple']);
      case 'blue':
        return getRandomColor(mainColors);
      case 'green':
        return getRandomColor(['green', 'cyan']);
      case 'cyan':
        return getRandomColor(['ice', 'blue', 'green', 'cyan', 'purple']);
      case 'pink':
        return getRandomColor(['blue', 'pink', 'purple']);
      case 'purple':
        return getRandomColor(['ice', 'blue', 'cyan', 'purple', 'pink']);
    }
  };

  let primaryColor = getRandomColor(mainColors);
  let secondaryColor = getMatchingColor(primaryColor);

  if (secondaryColor === primaryColor) {
    secondaryColor = `${secondaryColor}-500`;
  } else {
    secondaryColor = `${secondaryColor}-400`;
  }

  primaryColor = `${primaryColor}-400`;

  const split = (input: string, chunkSize: number): string[] => {
    const result: string[] = [];
    for (let i = 0; i < input.length; i += chunkSize) {
      result.push(input.substring(i, i + chunkSize));
    }
    return result;
  };

  const background = `bg-${style?.background.color}`;
  const backgroundOpacity = `bg-opacity-${style?.background.opacity}`;
  const border = `border-${style?.border.color}`;
  const borderOpacity = `border-opacity-${style?.border.opacity}`;
  const hoverBackground = `hover:bg-${style?.background.hover.color}`;
  const hoverBackgroundOpacity = `hover:bg-opacity-${style?.background.hover.opacity}`;
  const hoverBorder = `hover:border-${style?.border.hover.color}`;
  const hoverBorderOpacity = `hover:border-opacity-${style?.border.hover.opacity}`;

  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText(address);
        toast.success('Address copied to clipboard!');
      }}
      className={twMerge(
        'bg-no-repeat cursor-pointer relative overflow-hidden w-80 h-48 rounded-xl p-4 text-white border transition duration-200 hover:shadow-center hover:shadow-white/50',
        background,
        border,
        hoverBackground,
        hoverBorder,
        backgroundOpacity,
        borderOpacity,
        hoverBackgroundOpacity,
        hoverBorderOpacity,
        className
      )}
    >
      <svg
        className="absolute bottom-0 left-0 z-10"
        viewBox="0 0 1425 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            stroke="#ffffff"
            d="M0,17.27l23.75,5.09C47.5,27.38,95,37.57,142.5,39.47s95-4.36,142.5-10.28,95-11.35,142.5-7.4,95,17.43,142.5,24,95,6.25,142.5,5.83,95-.9,142.5-3S950,43,997.5,42.92s95,3.12,142.5,2.88,95-4.11,142.5-3.62,95,5.51,118.75,8L1425,52.62v300.0H0Z"
            className={`fill-${primaryColor}/15`}
          ></path>
          <path
            stroke="#ffffff"
            d="M0,94.56l23.75-6.17C47.5,82.22,95,69.89,142.5,65.2s95-1.64,142.5,4.85S380,86.33,427.5,86.5,522.5,77,570,73.59s95-.66,142.5,1.81,95,4.6,142.5,3.78,95-4.6,142.5-6.58,95-1.89,142.5,1.24,95,9.45,142.5,13.15,95,4.85,118.75,5.35l23.75.57V300.0H0Z"
            className={`fill-${secondaryColor}/30`}
          ></path>
          <path
            stroke="#ffffff"
            d="M0,134,23.75,132C47.5,129.91,95,125.8,142.5,125.39s95,2.88,142.5,5.75,95,5.35,142.5,4,95-6.58,142.5-8.06,95,.66,142.5-.41,95-5.51,142.5-9.21,95-6.66,142.5-5.83,95,5.42,142.5,9.86,95,8.47,142.5,9.05,95-2.47,118.75-4L1425,125v300.0H0Z"
            className={`fill-${primaryColor}/15`}
          ></path>
          <path
            stroke="#ffffff"
            d="M0,178.42l23.75-1.64c23.75-1.65,71.25-4.94,118.75-5.59s95,1.23,142.5,2.71,95,2.63,142.5,4.11,95,3.45,142.5,2.88,95-3.54,142.5-8.8,95-12.58,142.5-13.57,95,4.53,142.5,8.23,95,5.67,142.5,4,95-6.91,142.5-9.79,95-3.37,118.75-3.7L1425,157v300.0H0Z"
            className={`fill-${secondaryColor}/30`}
          ></path>
        </g>
      </svg>
      <div className="absolute left-[-40px] bottom-[-10px] z-20">
        <Identicon address={address} />
      </div>
      <div className="flex flex-col">
        <div className="flex">
          <div className="w-5/12" />
          <div className="w-7/12 flex flex-col items-start justify-start">
            <div className="flex flex-row items-center justify-center mb-3">
              <img
                src={Logo}
                alt="UVerify Logo"
                className="w-8 h-8 mr-2 group-hover:drop-shadow-center"
              />
              <span className="text-sm font-extrabold">UVerify</span>
            </div>
            <span className="text-xs uppercase font-bold mb-4">
              Certificate Issuer
            </span>
            <div className="flex flex-wrap z-20">
              {split(address, 10).map((line, index) => (
                <span
                  key={index}
                  className="text-[0.65rem] font-mono mb-2 mr-2 tracking-widest"
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityCard;
