import { icons } from "@/assets";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const AskMeAnything = () => {
  return (
    <TouchableOpacity className='px-4 mt-5'>
      <View className='rounded-2xl overflow-hidden'>
        <LinearGradient colors={['#0F172A', '#1E3A8A']}>
          <View className='w-full rounded-2xl px-6 shadow-xl flex-row items-center'>
            <View className='mr-4'>
              <Image
                source={icons.robot}
                className='w-20 h-20 rounded-full shadow-lg'
              />
            </View>

            <View className='flex-1 backdrop-blur-sm rounded-xl p-4'>
              <Text className='text-white text-2xl font-bold mb-2'>Ask Me Anything</Text>
              <Text className='text-gray-300 text-sm mb-4'>Get instant answers</Text>
              <Text className='text-white text-base leading-relaxed'>
                Ask DhruvAI anything about your day, love, career or health
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  )
}

export default AskMeAnything;
