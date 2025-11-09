import { icons } from '@/assets';
import Quadrant from '@/assets/svgs/quadrant';
import DailyHoroScope from '@/components/DailyHoroScope';
import { Image, Text, Touchable, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
} from 'react-native-svg';

const Home = () => {
  return (
    <SafeAreaView className='flex-1'>
      {/* First Quadrant  */}
      <View className='relative'>
        <View className='relative'>
          <Quadrant />
          <View className='absolute top-[50px] left-[15px] w-[125px] h-[100px] justify-center items-center'>
            <Text className='text-white font-semibold'>Hello Mohit</Text>
            <Text className='text-white text-xl font-bold mt-3 ml-[15px]'>
              Welcome To DhruvAI
            </Text>
          </View>
        </View>
        <TouchableOpacity className='absolute top-0 right-0 w-[110px] h-[100px] justify-center items-center'>
          <View>
            <Image source={icons.bell} className='w-10 h-10' />
            <View className='w-2 h-2 rounded-full bg-[#FFB900] absolute right-2' />
          </View>
        </TouchableOpacity>
      </View>
      <View className='px-4 mb-2'>
        <Text className='font-bold text-2xl'>Daily HoroScope</Text>
      </View>
      <DailyHoroScope />
    </SafeAreaView>
  );
};

export default Home;
