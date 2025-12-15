import { zodiacSign } from '@/assets';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setUserDetails, completeProfile } from '@/store/userDetail';
import { useKundali } from '@/hooks/useKundali';
import { useLocalNotification } from '@/hooks/useLocalNotification';

interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  timeOfBirth: Date;
  moonSign: string;
}

interface GeoapifySuggestion {
  place_id?: string;
  properties: {
    formatted: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
}

// Custom hook for Geoapify autocomplete with debouncing
const useGeoapifyAutocomplete = () => {
  const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = async (searchText: string) => {
    if (!searchText.trim() || searchText.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const apiKey = 'bef61b72eed74037853c446e9b22b512'; // Using direct key from .env
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(searchText)}&limit=5&apiKey=${apiKey}`;

      console.log('Fetching suggestions for:', searchText, 'URL:', url); // Debug log

      const response = await fetch(url);

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data); // Debug log
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 500);
  };

  const selectSuggestion = (suggestion: GeoapifySuggestion) => {
    setSuggestions([]);
  };

  const clearSuggestions = () => setSuggestions([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    handleSearchChange,
    selectSuggestion,
    clearSuggestions,
  };
};

const DailyHoroScope = () => {
  const dispatch = useAppDispatch();
  const profileCompleted = useAppSelector(
    (state) => state.userDetail.profileCompleted,
  );
  const userMoonSign = useAppSelector((state) => state.userDetail.moonSign);
  const { saveKundali } = useKundali();
  const { triggerNotification } = useLocalNotification();

  // Function to map moon sign string to zodiac sign key
  const getZodiacSignKey = (moonSign: string): string => {
    return moonSign.toLowerCase();
  };

  // Get the correct zodiac sign icon based on moon sign
  const getZodiacSignIcon = (moonSign: string) => {
    const key = getZodiacSignKey(moonSign);
    return zodiacSign[key as keyof typeof zodiacSign] || zodiacSign.aries;
  };
  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    placeOfBirth: '',
    timeOfBirth: new Date(),
    moonSign: '',
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserProfile, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [corrdinates, setCorrdinates] = useState<{
    lat: number | null;
    lon: number | null;
  }>({
    lat: null,
    lon: null,
  });
  console.log('corrdinates: ', corrdinates);
  const autocomplete = useGeoapifyAutocomplete();

  // Function to fetch moon sign from local API
  const fetchMoonSign = async (
    date: Date,
    time: Date,
    latitude: number,
    longitude: number,
  ): Promise<string> => {
    try {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`; // HH:MM

      // For Expo Router API routes, use relative URL
      const url = `/horoScope/getMoonSign?dateStr=${encodeURIComponent(dateStr)}&timeStr=${encodeURIComponent(timeStr)}&latitude=${latitude}&longitude=${longitude}`;

      console.log('Fetching moon sign from API:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Moon sign API response:', data);

      // Extract moon sign from response
      if (data && data.moonSign) {
        return data.moonSign;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching moon sign:', error);
      throw error;
    }
  };

  const fetchKundali = async (
    date: Date,
    time: Date,
    latitude: number,
    longitude: number,
    moonSign: string,
  ) => {
    const url = process.env.EXPO_PUBLIC_GET_KUNDALI!;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = time.getHours();
    const minute = time.getMinutes();

    const data = {
      year: year,
      month: month,
      date: day,
      hours: hour,
      minutes: minute,
      seconds: 0,
      latitude: latitude,
      longitude: longitude,
      timezone: 5.5,
      settings: {
        observation_point: 'topocentric',
        ayanamsha: 'lahiri',
        language: 'en',
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sRVrLCcdYV5iTb6ELs4B91vcyyXmjaxZ5GaMMCNF',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("result: ", result);

      if (result.statusCode === 200) {
        // Save kundali data to Realm
        const kundaliId = await saveKundali({
          statusCode: result.statusCode,
          output: result.output, // This should contain the planets data
          userId: 'user123', // You can set this to a proper user ID
        });
        console.log('Kundali saved with ID:', kundaliId);
      }

      return result;
    } catch (error) {
      console.error('Error fetching kundali:', error);
      throw error;
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.placeOfBirth.trim()) {
      newErrors.placeOfBirth = 'Place of birth is required';
    }

    // Check if date is in the future
    if (profileData.dateOfBirth > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get valuable moon sign message
  const getMoonSignMessage = (moonSign: string): string => {
    const messages: Record<string, string> = {
      Aries: "🌙 Your Moon Sign is Aries! This fiery lunar influence ignites your emotional passion and instinctive courage. Aries Moon brings natural leadership, quick emotional responses, and an adventurous spirit that helps you pioneer new paths in relationships and personal growth.",
      Taurus: "🌙 Your Moon Sign is Taurus! This earthy lunar energy grounds your emotions in stability and sensuality. Taurus Moon gifts you with emotional security, patience, and an appreciation for life's simple pleasures, creating a foundation of trust and comfort in your relationships.",
      Gemini: "🌙 Your Moon Sign is Gemini! This airy lunar intelligence sharpens your mental and emotional adaptability. Gemini Moon blesses you with versatile communication, curiosity, and social grace, helping you navigate complex emotions through understanding and connection.",
      Cancer: "🌙 Your Moon Sign is Cancer! This watery lunar intuition deepens your emotional sensitivity and nurturing nature. Cancer Moon provides profound empathy, protective instincts, and intuitive wisdom, making you a natural healer and emotional anchor for loved ones.",
      Leo: "🌙 Your Moon Sign is Leo! This radiant lunar creativity illuminates your emotional warmth and generosity. Leo Moon empowers you with confident self-expression, loyalty, and creative passion, inspiring others through your authentic emotional brilliance.",
      Virgo: "🌙 Your Moon Sign is Virgo! This analytical lunar precision enhances your emotional intelligence and helpful nature. Virgo Moon gives you practical wisdom, attention to detail, and healing service, allowing you to nurture others through thoughtful care and understanding.",
      Libra: "🌙 Your Moon Sign is Libra! This balanced lunar harmony cultivates your diplomatic and fair-minded emotions. Libra Moon brings graceful relationships, aesthetic appreciation, and peaceful resolution, helping you create harmony in both personal and social spheres.",
      Scorpio: "🌙 Your Moon Sign is Scorpio! This intense lunar transformation deepens your emotional power and intuition. Scorpio Moon grants you profound insight, emotional resilience, and transformative healing abilities, revealing hidden truths and fostering deep connections.",
      Sagittarius: "🌙 Your Moon Sign is Sagittarius! This expansive lunar philosophy broadens your emotional horizons and optimism. Sagittarius Moon inspires you with adventurous spirit, philosophical wisdom, and generous enthusiasm, encouraging growth through exploration and learning.",
      Capricorn: "🌙 Your Moon Sign is Capricorn! This ambitious lunar structure builds your emotional discipline and responsibility. Capricorn Moon provides steady determination, practical wisdom, and goal-oriented focus, helping you achieve emotional stability and long-term success.",
      Aquarius: "🌙 Your Moon Sign is Aquarius! This innovative lunar consciousness expands your humanitarian and intellectual emotions. Aquarius Moon brings progressive thinking, community focus, and creative solutions, inspiring you to contribute to collective evolution and social change.",
      Pisces: "🌙 Your Moon Sign is Pisces! This compassionate lunar spirituality connects you to universal emotional currents. Pisces Moon blesses you with deep empathy, artistic sensitivity, and intuitive guidance, allowing you to heal through compassion and creative expression."
    };
    return messages[moonSign.toLowerCase()] || `🌙 Your Moon Sign is ${moonSign}! This sacred lunar influence shapes your emotional world and intuitive guidance, bringing unique gifts to your personality and relationships.`;
  };

  // Handle form submission
  const handleProfileSubmit = async () => {
    if (!validateForm()) return;

    if (corrdinates.lat === null || corrdinates.lon === null) {
      Alert.alert(
        'Error',
        'Please select a place of birth from the suggestions.',
      );
      return;
    }

    setIsSubmitting(true);

    // Show initial notification about calculating moon sign
    await triggerNotification({
      title: '🔮 Calculating Your Celestial Blueprint',
      body: 'We\'re analyzing the cosmic energies present at your birth to reveal your sacred Moon Sign. This ancient wisdom will unlock deep insights into your emotional nature and life purpose.',
      second: 1
    });

    try {
      // Fetch moon sign from API using coordinates
      const moonSign = await fetchMoonSign(
        profileData.dateOfBirth,
        profileData.timeOfBirth,
        corrdinates.lat,
        corrdinates.lon,
      );

      const kundali = await fetchKundali(
        profileData.dateOfBirth,
        profileData.timeOfBirth,
        corrdinates.lat,
        corrdinates.lon,
        moonSign,
      );

      setTimeout(async () => {
        await triggerNotification({
          title: `✨ ${moonSign} - Your Sacred Moon Sign Revealed!`,
          body: getMoonSignMessage(moonSign),
          second: 1,
        });
      }, 0);

      setProfileData((prev) => ({ ...prev, moonSign }));
      dispatch(
        setUserDetails({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          dateOfBirth: profileData.dateOfBirth.toISOString().split('T')[0], // Convert to string
          placeOfBirth: profileData.placeOfBirth,
          timeOfBirth: `${profileData.timeOfBirth.getHours().toString().padStart(2, '0')}:${profileData.timeOfBirth.getMinutes().toString().padStart(2, '0')}`, // Convert to string
          moonSign: moonSign,
          lat: corrdinates.lat,
          lon: corrdinates.lon,
        }),
      );
      dispatch(completeProfile());
      setShowProfileModal(false);
      // Reset form
      setProfileData({
        firstName: '',
        lastName: '',
        dateOfBirth: new Date(),
        placeOfBirth: '',
        timeOfBirth: new Date(),
        moonSign: '',
      });
    } catch (error) {
      console.error('Error during profile submission:', error);
      Alert.alert(
        'Error',
        'Failed to save profile or fetch moon sign. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date/time picker handlers
  const onDateChange = (event: any, selectedDate?: Date) => {
    // setShowDatePicker(false);
    if (Platform.OS === 'android') {
      // On Android, close picker when user confirms selection
      if (event.type === 'set') {
        setShowDatePicker(false);
      }
    }
    if (selectedDate) {
      setProfileData((prev) => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    // setShowTimePicker(false);
    if (Platform.OS === 'android') {
      // On Android, close picker when user confirms selection
      if (event.type === 'set') {
        setShowTimePicker(false);
      }
    }
    if (selectedTime) {
      setProfileData((prev) => ({ ...prev, timeOfBirth: selectedTime }));
    }
  };

  // Handle place input and update profile data
  const handlePlaceInputChange = (text: string) => {
    autocomplete.handleSearchChange(text);
    setProfileData((prev) => ({ ...prev, placeOfBirth: text }));
  };

  const handleSuggestionSelect = (suggestion: GeoapifySuggestion) => {
    console.log('suggestion: ', suggestion);
    const placeName = suggestion.properties.formatted;
    autocomplete.selectSuggestion(suggestion);
    setProfileData((prev) => ({ ...prev, placeOfBirth: placeName }));
    setCorrdinates({
      lat: suggestion?.properties?.lat!,
      lon: suggestion?.properties?.lon!,
    });
  };

  console.log('autocomplete: ', autocomplete);

  return (
    <>
      {profileCompleted ? (
        <View className='px-4'>
          <View className='rounded-2xl overflow-hidden relative'>
            <TouchableOpacity>
              <LinearGradient colors={['#0F172A', '#1E3A8A']}>
                <View className='w-full rounded-2xl px-6 shadow-xl flex-row items-center'>
                  <View className='mr-4'>
                    <Image
                      source={getZodiacSignIcon(userMoonSign)}
                      className='w-20 h-20 rounded-full shadow-lg'
                      style={{ tintColor: '#FFD700' }}
                    />
                  </View>

                  <View className='flex-1 backdrop-blur-sm rounded-xl p-4'>
                    <Text className='text-white text-2xl font-bold mb-2'>
                      {userMoonSign || 'Aries'}
                    </Text>
                    <Text className='text-gray-300 text-sm mb-4'>
                      October 11, 2025
                    </Text>
                    <Text className='text-white text-base leading-relaxed'>
                      Seek out new experiences today; they could lead to
                      personal growth
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View className='absolute top-4 right-4'>
              <TouchableOpacity
                onPress={() => setShowProfileModal(true)}
                className='bg-white/20 backdrop-blur-md rounded-full p-2'
              >
                <Text className='text-white text-xs'>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View className='px-4'>
          <View className='rounded-2xl overflow-hidden relative'>
            <LinearGradient colors={['#0F172A', '#1E3A8A']}>
              <View className='w-full rounded-2xl px-6 shadow-xl flex-row items-center'>
                <View className='mr-4'>
                  <Image
                    source={zodiacSign.aries}
                    className='w-20 h-20 rounded-full shadow-lg opacity-40'
                    style={{ tintColor: '#FFD700' }}
                  />
                </View>

                <View className='flex-1 backdrop-blur-sm rounded-xl p-4'>
                  <Text className='text-white/40 text-2xl font-bold mb-2'>
                    Aries
                  </Text>
                  <Text className='text-gray-500/60 text-sm mb-4'>
                    October 11, 2025
                  </Text>
                  <Text className='text-white/30 text-base leading-relaxed'>
                    Seek out new experiences today; they could lead to personal
                    growth
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Blur Overlay */}
            <View className='absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl items-center justify-center'>
              <TouchableOpacity
                onPress={() => setShowProfileModal(true)}
                className='bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl px-8 py-4 shadow-lg'
              >
                <Text className='text-white font-bold text-lg'>
                  Complete Your Profile
                </Text>
                <Text className='text-white/80 text-sm text-center mt-1'>
                  Set up your birth details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Profile Setup Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 50,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              width: '100%',
              maxWidth: 400,
              minHeight: 600,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <KeyboardAvoidingView
              behavior='padding'
              keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
              style={{ flex: 1 }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, padding: 20 }}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingBottom: Platform.OS === 'ios' ? 60 : 40,
                }}
              >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#1F2937',
                      marginBottom: 8,
                    }}
                  >
                    🌟{' '}
                    {profileCompleted
                      ? 'Update Your Profile'
                      : 'Complete Your Profile'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#6B7280',
                      textAlign: 'center',
                      lineHeight: 20,
                    }}
                  >
                    {profileCompleted
                      ? 'Update your birth details to refresh your personalized horoscope insights'
                      : 'Enter your birth details to unlock personalized horoscope insights'}
                  </Text>
                </View>

                {/* First Name */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 8,
                    }}
                  >
                    First Name *
                  </Text>
                  <TextInput
                    value={profileData.firstName}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({ ...prev, firstName: text }))
                    }
                    placeholder='Enter your first name'
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#1F2937',
                    }}
                    placeholderTextColor='#9CA3AF'
                  />
                  {errors.firstName && (
                    <Text
                      style={{ fontSize: 14, color: '#EF4444', marginTop: 4 }}
                    >
                      {errors.firstName}
                    </Text>
                  )}
                </View>

                {/* Last Name */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 8,
                    }}
                  >
                    Last Name *
                  </Text>
                  <TextInput
                    value={profileData.lastName}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({ ...prev, lastName: text }))
                    }
                    placeholder='Enter your last name'
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#1F2937',
                    }}
                    placeholderTextColor='#9CA3AF'
                  />
                  {errors.lastName && (
                    <Text
                      style={{ fontSize: 14, color: '#EF4444', marginTop: 4 }}
                    >
                      {errors.lastName}
                    </Text>
                  )}
                </View>

                {/* Date of Birth */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 8,
                    }}
                  >
                    Date of Birth *
                  </Text>
                  {showDatePicker ? (
                    <View
                      style={{
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        padding: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <DateTimePicker
                        testID='dateTimePicker'
                        value={profileData.dateOfBirth}
                        mode={'date'}
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()} // Can't select future dates
                        textColor='black'
                        style={{ paddingHorizontal: 10 }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        style={{
                          backgroundColor: '#F59E0B',
                          borderRadius: 8,
                          paddingVertical: 12,
                          paddingHorizontal: 24,
                          marginTop: 16,
                        }}
                      >
                        <Text
                          style={{
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: 'white',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color:
                            profileData.dateOfBirth.getTime() ===
                            new Date().getTime()
                              ? '#9CA3AF'
                              : '#1F2937',
                        }}
                      >
                        {profileData.dateOfBirth.getTime() ===
                        new Date().getTime()
                          ? 'Select Date'
                          : profileData.dateOfBirth.toDateString()}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {errors.dateOfBirth && (
                    <Text
                      style={{ fontSize: 14, color: '#EF4444', marginTop: 4 }}
                    >
                      {errors.dateOfBirth}
                    </Text>
                  )}
                </View>

                {/* Place of Birth */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 8,
                    }}
                  >
                    Place of Birth *
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      value={profileData.placeOfBirth}
                      onChangeText={handlePlaceInputChange}
                      placeholder='Start typing a city name...'
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: 16,
                        color: '#1F2937',
                      }}
                      placeholderTextColor='#9CA3AF'
                      autoCapitalize='none'
                      autoCorrect={false}
                    />
                    {autocomplete.isLoading && (
                      <View
                        style={{ position: 'absolute', right: 12, top: 12 }}
                      >
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>
                          Loading...
                        </Text>
                      </View>
                    )}
                    {autocomplete.suggestions.length > 0 && (
                      <ScrollView
                        style={{
                          position: 'absolute',
                          top: '100%',
                          marginTop: 4,
                          zIndex: 10,
                          backgroundColor: 'white',
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 12,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          maxHeight: 192,
                          width: '100%',
                        }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                      >
                        {autocomplete.suggestions.map((item, index) => (
                          <TouchableOpacity
                            key={item.place_id || index}
                            onPress={() => {
                              handleSuggestionSelect(item);
                            }}
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 12,
                              borderBottomWidth:
                                index < autocomplete.suggestions.length - 1
                                  ? 1
                                  : 0,
                              borderBottomColor: '#F3F4F6',
                            }}
                          >
                            <Text style={{ fontSize: 14, color: '#1F2937' }}>
                              {item.properties.formatted}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  {errors.placeOfBirth && (
                    <Text
                      style={{ fontSize: 14, color: '#EF4444', marginTop: 4 }}
                    >
                      {errors.placeOfBirth}
                    </Text>
                  )}
                </View>

                {/* Time of Birth */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 8,
                    }}
                  >
                    Time of Birth
                  </Text>
                  {showTimePicker ? (
                    <View
                      style={{
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        padding: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <DateTimePicker
                        testID='timeTimePicker'
                        value={profileData.timeOfBirth}
                        mode={'time'}
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onTimeChange}
                        textColor='black'
                        style={{ paddingHorizontal: 10 }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowTimePicker(false)}
                        style={{
                          backgroundColor: '#F59E0B',
                          borderRadius: 8,
                          paddingVertical: 12,
                          paddingHorizontal: 24,
                          marginTop: 16,
                        }}
                      >
                        <Text
                          style={{
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowTimePicker(true)}
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: 'white',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color:
                            profileData.timeOfBirth.getTime() ===
                            new Date().getTime()
                              ? '#9CA3AF'
                              : '#1F2937',
                        }}
                      >
                        {profileData.timeOfBirth.getTime() ===
                        new Date().getTime()
                          ? 'Select Time'
                          : `${profileData.timeOfBirth.getHours().toString().padStart(2, '0')}:${profileData.timeOfBirth.getMinutes().toString().padStart(2, '0')}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowDatePicker(false);
                      setShowTimePicker(false);
                      setShowProfileModal(false);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#E5E7EB',
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                    }}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'semibold',
                        color: '#374151',
                        textAlign: 'center',
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleProfileSubmit}
                    style={{
                      flex: 1,
                      backgroundColor: '#F59E0B',
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                      }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Profile'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Privacy Note */}
                <Text
                  style={{
                    fontSize: 12,
                    color: '#6B7280',
                    textAlign: 'center',
                    marginTop: 16,
                    lineHeight: 16,
                  }}
                >
                  Your birth details are used only for astrological calculations
                  and are kept private and secure.
                </Text>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DailyHoroScope;
