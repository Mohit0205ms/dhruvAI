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
import { useState, useRef } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

const Auth = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = useRef<TextInput[]>([]);

  const insets = useSafeAreaInsets();
  const { loginWithEmail } = useLocalSearchParams();

  const handleVerifyOtp = () => {
    const otpString = otp.join('');
    if (otpString.length === 4) {
      // Here you would typically verify the OTP with your backend
      console.log('Verifying OTP:', otpString);
      // For now, just log it. You can add navigation or API call here
    } else {
      console.log('Please enter complete OTP');
    }
  };

  const handleResendOtp = () => {
    // Here you would typically resend the OTP
    console.log('Resending OTP...');
    // Reset OTP fields
    setOtp(['', '', '', '']);
    otpRefs.current[0]?.focus();
  };

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
                Verify Your Account
              </Text>
              <Text className='text-white mb-4'>
                {!loginWithEmail
                  ? 'A 4 digit code has been sent to your number.'
                  : 'A 4 digit code has been sent to Email Id.'}
              </Text>
              <View className='flex-row items-center mb-4'>
                <View className='flex-1 h-[1px] bg-white opacity-30' />
                <Text className='text-white mx-4 text-sm'>Enter OTP</Text>
                <View className='flex-1 h-[1px] bg-white opacity-30' />
              </View>
              <View className='flex-row justify-center mb-6'>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) otpRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(text) => {
                      if (text.length <= 1 && /^\d*$/.test(text)) {
                        const newOtp = [...otp];
                        newOtp[index] = text;
                        setOtp(newOtp);

                        // Auto-focus next input
                        if (text && index < 3) {
                          otpRefs.current[index + 1]?.focus();
                        }
                      }
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (
                        nativeEvent.key === 'Backspace' &&
                        !digit &&
                        index > 0
                      ) {
                        otpRefs.current[index - 1]?.focus();
                      }
                    }}
                    keyboardType='numeric'
                    maxLength={1}
                    className='w-12 h-12 border border-white rounded-lg text-white text-center text-xl font-semibold mx-3'
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.3)',
                      borderRadius: 8,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }}
                    selectTextOnFocus
                  />
                ))}
              </View>
              <TouchableOpacity
                className='bg-[#FFB900] rounded-lg py-3 px-6 mb-4'
                onPress={handleVerifyOtp}
              >
                <Text className='text-center font-semibold'>VERIFY OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity className='mb-4' onPress={handleResendOtp}>
                <Text className='text-white text-center text-sm'>
                  Didn't receive the code?{' '}
                  <Text className='text-[#FFB900]'>Resend OTP</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='flex-row items-center mb-4 border-[1px] border-white py-2 px-6 rounded-lg'
                onPress={() => {
                  router.back();
                }}
              >
                <Image
                  source={!loginWithEmail ? icons.mail : icons.mobile}
                  style={{ width: 30, height: 40 }}
                  className='mr-10'
                />
                <Text className='text-white align-center'>
                  {!loginWithEmail
                    ? 'Continue Mobile Number'
                    : 'Continue Email id'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Auth;
