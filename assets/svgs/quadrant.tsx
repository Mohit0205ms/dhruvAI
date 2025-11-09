import Svg, {
  Path,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
} from 'react-native-svg';

const Quadrant = () => {
  return (
    <Svg width={210} height={210}>
      <Defs>
        <LinearGradient id='gradient'>
          <Stop offset='0%' stopColor='#0F172A' stopOpacity='1' />
          <Stop offset='100%' stopColor='#1E3A8A' stopOpacity='1' />
        </LinearGradient>
      </Defs>
      <Path d='M210,0 A210,210 0 0,1 0,210 L0,0 Z' fill='url(#gradient)' />
    </Svg>
  );
};

export default Quadrant;
