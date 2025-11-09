import { zodiacSign } from '@/assets';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DailyHoroScope = () => {
  return (
    <TouchableOpacity className='px-4'>
      <View className='rounded-2xl overflow-hidden'>
        <LinearGradient colors={['#0F172A', '#1E3A8A']}>
          <View className='w-full rounded-2xl px-6 shadow-xl flex-row items-center'>
            <View className='mr-4'>
              <Image
                source={zodiacSign.leo}
                className='w-20 h-20 rounded-full shadow-lg'
              />
            </View>

            <View className='flex-1 backdrop-blur-sm rounded-xl p-4'>
              <Text className='text-white text-2xl font-bold mb-2'>Aries</Text>
              <Text className='text-gray-300 text-sm mb-4'>October 11, 2025</Text>
              <Text className='text-white text-base leading-relaxed'>
                Seek out new experiences today; they could lead to personal growth
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

export default DailyHoroScope;
