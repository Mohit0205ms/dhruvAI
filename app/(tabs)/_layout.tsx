import { icons } from '@/assets';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: () => <Image source={icons.home} className='w-8 h-8' />,
        }}
      />
      <Tabs.Screen
        name='chat'
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarIcon: () => <Image source={icons.chat} className='w-8 h-8' />,
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: () => (
            <Image source={icons.profile} className='w-8 h-8' />
          ),
        }}
      />
    </Tabs>
  );
}
