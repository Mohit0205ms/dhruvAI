import { useState, useCallback, useEffect, useRef } from 'react';
import { Text, View, Platform, TouchableOpacity, Alert } from 'react-native';
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
  Composer,
} from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { askMeAnythingPrompt } from '@/constants/prompts';
import { useAppSelector } from '@/hooks/redux';
import { useKundali } from '@/hooks/useKundali';
import { PlanetData } from '@/realm/kundaliSchema';

const renderBubble = (props: any) => {
  console.log('props: ', props.currentMessage.user);
  const { profileCompleted = true } = props.currentMessage.user;
  if (!profileCompleted) {
    return (
      <View className='mx-3 my-1'>
        <View className='bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 shadow-sm'>
          <View className='flex-row items-center mb-2'>
            <Ionicons
              name='warning'
              size={20}
              color='#F59E0B'
              className='mr-2'
            />
            <Text className='text-yellow-800 font-medium text-base'>
              Profile Incomplete
            </Text>
          </View>
          <Text className='text-yellow-700 text-sm mb-3 leading-5'>
            Please complete your profile to get personalized astrological
            insights.
          </Text>
          <TouchableOpacity
            className='bg-yellow-500 active:bg-yellow-600 rounded-xl py-2 px-4 self-start'
            onPress={() => router.push('/profile')} // Navigate to profile completion
          >
            <Text className='text-white font-semibold text-sm'>
              Complete Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: '#007AFF', // Your brand color for sent messages
          borderRadius: 20,
          padding: 8,
        },
        left: {
          backgroundColor: '#E5E5EA', // Light gray for received messages
          borderRadius: 20,
          padding: 8,
        },
      }}
      textStyle={{
        right: {
          color: '#FFFFFF', // White text for sent messages
          fontSize: 16,
        },
        left: {
          color: '#000000', // Black text for received messages
          fontSize: 16,
        },
      }}
      containerStyle={{
        right: {
          marginBottom: 8,
          marginRight: 12,
        },
        left: {
          marginBottom: 8,
          marginLeft: -30,
        },
      }}
    />
  );
};

const Chat = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [kundali, setKundali] = useState<Record<string, PlanetData> | null>();
  const insets = useSafeAreaInsets();
  const { getAllKundalis } = useKundali();
  const hasInitialized = useRef(false);

  const tabbarHeight = 50;
  const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 });
  const keyboardVerticalOffset =
    insets.bottom + tabbarHeight + keyboardTopToolbarHeight;

  const {
    firstName,
    lastName,
    email,
    phone: userPhoneNumber,
    dateOfBirth,
    placeOfBirth,
    timeOfBirth,
    gender,
    moonSign,
    profileCompleted,
    lat: latitude,
    lon: longitude,
  } = useAppSelector((state) => state.userDetail);

  const uploadUserDetail = useCallback(async () => {
    console.log(process.env.EXPO_PUBLIC_GEMINI_GENERATE_URL);
    setIsTyping(true);
    const userDetailMessage = {
      _id: Date.now(),
      text: `
👤 *Your Profile Details*

• Name: ${firstName} ${lastName}
• Date of Birth: ${dateOfBirth}
• Time of Birth: ${timeOfBirth}
• Place of Birth: ${placeOfBirth}
• Moon Sign: ${moonSign}
${profileCompleted ? '✅ Profile Completed' : '⚠️ Profile Incomplete'}
  `,
      createdAt: new Date(),
      user: {
        _id: 2,
        // name: 'AstroBot',
        profileCompleted: profileCompleted,
      },
    };

    const kundalis = getAllKundalis();
    if (kundalis.length === 0) {
      console.log('No kundali data found');
      return;
    }

    const birthChartData = kundalis[0].output;
    setKundali(birthChartData);
    console.log('birthChartData: ', birthChartData);

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_GEMINI_GENERATE_URL}?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'model',
              parts: [{ text: askMeAnythingPrompt }],
            },
            {
              role: 'user',
              parts: [
                {
                  text: 'Here is my birth chart JSON, store it internally and use it for all future responses:',
                },
                { text: JSON.stringify(birthChartData) },
              ],
            },
          ],
        }),
      },
    );
    const data = await response.json();
    console.log('response: ', data);
    const greetingMessage = {
      _id: Date.now(),
      text: 'Thanks for sharing details. How i can help you',
      createdAt: new Date(),
      user: {
        _id: 2,
      },
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [greetingMessage, userDetailMessage]),
    );
    setIsTyping(false);
  }, [
    firstName,
    lastName,
    dateOfBirth,
    timeOfBirth,
    placeOfBirth,
    moonSign,
    profileCompleted,
    getAllKundalis,
  ]);

  useEffect(() => {
    // Initialize messages only once
    setMessages([
      {
        _id: 1,
        text: 'Hi Dear',
        createdAt: new Date(),
        user: {
          _id: 2,
          // name: 'AstroBot'
        },
      },
    ]);
    uploadUserDetail();
  }, []);

  // Temporarily disabled to test if this is causing the input issue
  // useEffect(() => {
  //   if (!hasInitialized.current) {
  //     hasInitialized.current = true;
  //     uploadUserDetail();
  //   }
  // }, []);

  const onSend = useCallback(async (messages: IMessage[]) => {
    console.log('messages: ', messages[0].text);
    try {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages),
      );
      setIsTyping(true);
      const reply = await fetch(
        `${process.env.EXPO_PUBLIC_GEMINI_GENERATE_URL}?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'model',
                parts: [{ text: askMeAnythingPrompt }],
              },
              {
              role: 'user',
              parts: [
                {
                  text: 'Here is my birth chart JSON, store it internally and use it for all future responses:',
                },
                { text: JSON.stringify(kundali) },
              ],
              },
              {
                role: 'user',
                parts: [{ text: messages?.[0]?.text }],
              },
            ],
          }),
        },
      );
      const res = await reply.json();
      console.log('chat reply: ', res);
      const answer = res?.candidates?.[0]?.content?.parts?.[0]?.text;
      const message = {
        _id: Date.now(),
        text: answer,
        createdAt: new Date(),
        user: {
          _id: 2,
          // name: 'AstroBot'
        },
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [message]),
      );
      setIsTyping(false);
    } catch (err) {
      console.log(err);
      setIsTyping(false);
    }
  }, []);

  const clearChat = () => {
    Alert.alert('Clear Chat', 'Are you sure you want to clear all messages?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => setMessages([]),
      },
    ]);
  };

  return (
    <View className='flex-1'>
      {/* Custom Navbar */}
      <View
        className='flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200'
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity onPress={() => router.back()} className='p-2'>
          <Ionicons name='arrow-back' size={24} color='#333' />
        </TouchableOpacity>

        <Text className='text-lg font-semibold text-gray-800'>
          Ask Me Anything
        </Text>

        <TouchableOpacity onPress={clearChat} className='p-2'>
          <Ionicons name='trash-outline' size={24} color='#FF3B30' />
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
        }}
        isTyping={isTyping}
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
        colorScheme={'light'}
        renderBubble={renderBubble}
        textInputProps={{
          editable: profileCompleted,
          placeholder: profileCompleted ? 'Ask any question' : 'Input disabled',
        }}
      />
    </View>
  );
};

export default Chat;
