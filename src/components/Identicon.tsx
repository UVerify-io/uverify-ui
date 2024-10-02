import Peep, {
  AccessoryType,
  BustPoseType,
  FaceType,
  FacialHairType,
  HairType,
  SittingPoseType,
  StandingPoseType,
} from 'react-peeps';
import seedrandom from 'seedrandom';

declare interface IdenticonProps {
  address?: string;
  className?: string;
}

const Identicon = ({ address, className }: IdenticonProps) => {
  if (!address) {
    return null;
  }

  const random = seedrandom(address);
  const accessories = [
    'Eyepatch',
    'GlassRoundThick',
    'SunglassClubmaster',
    'SunglassWayfarer',
    'GlassAviator',
    'GlassButterfly',
    'GlassButterflyOutline',
    'GlassClubmaster',
    'GlassRound',
  ];
  const accessory = accessories[Math.floor(random() * accessories.length)];

  const bodies = [
    'BlazerBlackTee',
    'Shirt',
    'ButtonShirt',
    'Dress',
    'Gaming',
    'Geek',
    'Hoodie',
    'PointingUp',
    'Selena',
    'Thunder',
    'Turtleneck',
    'ArmsCrossed',
    'Coffee',
    'Device',
    'DotJacket',
    'Explaining',
    'FurJacket',
    'Killer',
    'Paper',
    'PocketShirt',
    'PoloSweater',
    'ShirtCoat',
    'ShirtFilled',
    'SportyShirt',
    'StripedShirt',
    'Sweater',
    'SweaterDots',
    'Whatever',
    'Bike',
    'ClosedLegBW',
    'ClosedLegWB',
    'CrossedLegs',
    'HandsBackBW',
    'HandsBackWB',
    'MediumBW',
    'MediumWB',
    'OneLegUpBW',
    'OneLegUpWB',
    'WheelChair',
    'BlazerBW',
    'BlazerPantsBW',
    'BlazerPantsWB',
    'BlazerWB',
    'CrossedArmsBW',
    'CrossedArmsWB',
    'EasingBW',
    'EasingWB',
    'PointingFingerBW',
    'PointingFingerWB',
    'PolkaDots',
    'RestingBW',
    'RestingWB',
    'RoboDanceBW',
    'RoboDanceOutline',
    'RoboDanceWB',
    'ShirtBW',
    'ShirtPantsBW',
    'ShirtPantsWB',
    'ShirtWB',
    'WalkingBW',
    'WalkingFilled',
    'WalkingWB',
    'Doc',
    'DocProtectiveClothe',
    'DocStethoscope',
  ];
  const body = bodies[Math.floor(random() * bodies.length)];

  const faces = [
    'Angry',
    'Blank',
    'Calm',
    'Cheeky',
    'Concerned',
    'Contempt',
    'Cute',
    'Driven',
    'EatingHappy',
    'EyesClosed',
    'OldAged',
    'Serious',
    'Smile',
    'Solemn',
    'Suspicious',
    'Tired',
    'VeryAngry',
    'Awe',
    'ConcernedFear',
    'Cyclops',
    'Explaining',
    'Fear',
    'Hectic',
    'LoveGrin',
    'LoveGrinTeeth',
    'Monster',
    'Rage',
    'SmileBig',
    'SmileLol',
    'SmileTeeth',
    'CalmNM',
    'SmileNM',
    'CheersNM',
  ];
  const face = faces[Math.floor(random() * faces.length)];

  const hairs = [
    'Afro',
    'Bald',
    'BaldSides',
    'BaldTop',
    'Bangs',
    'BangsFilled',
    'Bear',
    'Bun',
    'BunCurly',
    'Buns',
    'FlatTop',
    'FlatTopLong',
    'HatHip',
    'Long',
    'LongAfro',
    'LongBangs',
    'LongCurly',
    'Medium',
    'MediumBangs',
    'MediumBangsFilled',
    'MediumLong',
    'MediumShort',
    'MediumStraight',
    'Mohawk',
    'MohawkDino',
    'Pomp',
    'ShavedRight',
    'ShavedSides',
    'ShavedWavy',
    'Short',
    'ShortCurly',
    'ShortMessy',
    'ShortScratch',
    'ShortVolumed',
    'ShortWavy',
    'BantuKnots',
    'Beanie',
    'BunFancy',
    'CornRows',
    'CornRowsFilled',
    'GrayBun',
    'GrayMedium',
    'GrayShort',
    'Hijab',
    'MediumShade',
    'Turban',
    'Twists',
    'TwistsVolumed',
    'DocBouffant',
    'DocSurgery',
    'DocShield',
  ];
  const hair = hairs[Math.floor(random() * hairs.length)];

  const facialHairs = [
    'None',
    'Chin',
    'Full',
    'FullMajestic',
    'FullMedium',
    'Goatee',
    'GoateeCircle',
    'Dali',
    'Handlebars',
    'Imperial',
    'Painters',
    'PaintersFilled',
    'Swashbuckler',
    'MoustacheThin',
    'Yosemite',
    'GrayFull',
    'MajesticHandlebars',
  ];
  const facialHair = facialHairs[Math.floor(random() * facialHairs.length)];
  const styles = {
    peepStyle: {
      width: 180,
      height: 180,
      justifyContent: 'flex-start',
      alignSelf: 'flex-end',
    },
    showcaseWrapper: {
      display: 'flex',
      justifyContent: 'center',
      height: '-webkit-fill-available',
    },
  };

  return (
    <div className={className}>
      <Peep
        style={styles.peepStyle}
        accessory={accessory as AccessoryType}
        body={body as BustPoseType | SittingPoseType | StandingPoseType}
        face={face as FaceType}
        hair={hair as HairType}
        facialHair={facialHair as FacialHairType}
        strokeColor="#ffffff"
        backgroundColor="transparent"
        viewBox={{ x: '0', y: '-60', width: '800', height: '1200' }}
      />
    </div>
  );
};

export default Identicon;
