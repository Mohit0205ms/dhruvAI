import { icons, images } from '@/assets';
import {
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

const Auth = () => {
  const [loginWithEmail, setLoginWithEmail] = useState(false);

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className='flex-1'>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Image source={images.loginWithNumber} className='w-full h-1/2' />
        <View className='flex-1 justify-center items-center'>
          <Text className='text-lg mb-4'>Welcome to DhruvAI</Text>
        </View>

        <View
          className='flex-1'
          style={{
            flex: 1,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            minHeight: 410,
          }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <LinearGradient
              colors={['#0F172A', '#1E3A8A']}
              className='w-full h-full p-4'
              style={{
                height: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                marginBottom: insets.bottom,
              }}
            >
              <Text className='text-white text-xl font-semibold mb-4'>
                Hi Welcome!
              </Text>
              <Text className='text-white mb-4'>
                {!loginWithEmail
                  ? 'Submit Your Mobile Number'
                  : 'Submit Your Email Id'}
              </Text>
              <View className='flex-row items-center mb-4'>
                <View className='flex-1 h-[1px] bg-white opacity-30' />
                <Text className='text-white mx-4 text-sm'>
                  Log in or Sign up
                </Text>
                <View className='flex-1 h-[1px] bg-white opacity-30' />
              </View>
              <TextInput
                placeholder={
                  !loginWithEmail
                    ? 'Enter Your Mobile Number'
                    : 'Enter Your Email Id'
                }
                keyboardType='phone-pad'
                className='border border-white rounded-lg p-3 mb-4 text-white placeholder-white'
                placeholderTextColor='rgba(255,255,255,0.7)'
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
              />
              <TouchableOpacity
                className='bg-[#FFB900] rounded-lg py-3 px-6 mb-4'
                onPress={() => router.navigate('/(auth)/verifyWithOTP')}
              >
                <Text className='text-center font-semibold'>SEND OTP</Text>
              </TouchableOpacity>
              <View className='flex-row items-center mb-4'>
                <View className='flex-1 h-[1px] bg-white opacity-30' />
                <Text className='text-white mx-4 text-sm'>Or</Text>
                <View className='flex-1 h-[1px] bg-white opacity-30' />
              </View>
              <TouchableOpacity
                className='flex-row items-center mb-4 border-[1px] border-white py-2 px-6 rounded-lg'
                onPress={() => {
                  if (!loginWithEmail) {
                    setLoginWithEmail(true);
                  } else {
                    setLoginWithEmail(false);
                  }
                }}
              >
                <Image
                  source={!loginWithEmail ? icons.mail : icons.mobile}
                  style={{ width: 30, height: 40 }}
                  className='mr-10'
                />
                <Text className='text-white'>
                  {!loginWithEmail
                    ? 'Continue with Email id'
                    : 'Continue with Mobile Number'}
                </Text>
              </TouchableOpacity>
              <Text className='text-white text-sm'>
                By signing up, you agree to our{' '}
                <Text className='text-[#FFB900]'>Terms of Use</Text> and{' '}
                <Text className='text-[#FFB900]'>Privacy Policy</Text>
              </Text>
            </LinearGradient>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Auth;
