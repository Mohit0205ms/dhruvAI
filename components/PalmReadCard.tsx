import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PalmReadCard = () => {
  return (
    <TouchableOpacity className='px-4 mt-4'>
      <View className='rounded-2xl overflow-hidden'>
        <LinearGradient colors={['#0F172A', '#1E3A8A']}>
          <View className='w-full rounded-2xl px-6 py-4 shadow-xl flex-row items-center'>
            <View className='mr-4'>
              <Text className='text-6xl'>✋</Text>
            </View>

            <View className='flex-1'>
              <Text className='text-white text-xl font-bold mb-1'>Palm Reading</Text>
              <Text className='text-gray-300 text-sm mb-2'>Unlock Your Life's Secrets</Text>
              <Text className='text-white text-base leading-relaxed'>
                Discover your destiny through ancient palmistry and mystical insights
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

export default PalmReadCard;
