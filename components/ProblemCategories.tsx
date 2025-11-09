import { Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { icons } from '@/assets';

const problemCategories = [
  {
    id: 'career',
    title: 'Career',
    subtitle: 'Professional guidance',
    emoji: '💼',
    icon: null, // Will be added when icons are provided
  },
  {
    id: 'relationship',
    title: 'Relationships',
    subtitle: 'Love & connections',
    emoji: '❤️',
    icon: null,
  },
  {
    id: 'health',
    title: 'Health',
    subtitle: 'Wellness advice',
    emoji: '🏥',
    icon: null,
  },
  {
    id: 'finance',
    title: 'Finance',
    subtitle: 'Money matters',
    emoji: '💰',
    icon: null,
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Learning support',
    emoji: '📚',
    icon: null,
  },
  {
    id: 'mental',
    title: 'Mental Health',
    subtitle: 'Emotional support',
    emoji: '🧠',
    icon: null,
  },
  {
    id: 'family',
    title: 'Family',
    subtitle: 'Family matters',
    emoji: '👨‍👩‍👧‍👦',
    icon: null,
  },
  {
    id: 'stress',
    title: 'Stress',
    subtitle: 'Relaxation tips',
    emoji: '😌',
    icon: null,
  },
];

const ProblemCategories = () => {
  return (
    <View className='px-4 mt-5'>
      <Text className='font-bold text-2xl mb-4 text-black'>What can I help you with?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {problemCategories.map((category) => (
          <TouchableOpacity key={category.id} className='mr-4'>
            <View className='rounded-3xl overflow-hidden w-44 shadow-2xl shadow-blue-500/20'>
              <LinearGradient
                colors={['#0F172A', '#1E3A8A', '#0F172A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className='border border-blue-500/20'
              >
                <View className='p-6 items-center justify-center h-[160px]'>
                  {/* Icon/Emoji display */}
                  <View className='w-16 h-16 rounded-full bg-blue-500/20 items-center justify-center mb-4'>
                    {icons[category.id as keyof typeof icons] ? (
                      <Image
                        source={icons[category.id as keyof typeof icons]}
                        className='w-10 h-10'
                        resizeMode='contain'
                      />
                    ) : (
                      <Text className='text-3xl'>{category.emoji}</Text>
                    )}
                  </View>

                  <Text className='text-white text-xl font-bold text-center mb-2'>
                    {category.title}
                  </Text>
                  <Text className='text-blue-200 text-sm text-center leading-5'>
                    {category.subtitle}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ProblemCategories;
