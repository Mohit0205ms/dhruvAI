import { icons, zodiacSign } from '@/assets';
import Quadrant from '@/assets/svgs/quadrant';
import { useAppSelector } from '@/hooks/redux';
import { Image, Text, TouchableOpacity, View, Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect, useRef } from 'react';
import { setUserDetails, completeProfile, resetUserDetails } from '@/store/userDetail';
import { useDispatch } from 'react-redux';
import { useKundali } from '@/hooks/useKundali';

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

const Profile = () => {
  const dispatch = useDispatch();
  const { saveKundali } = useKundali();

  const {
    firstName,
    lastName,
    dateOfBirth,
    placeOfBirth,
    timeOfBirth,
    moonSign,
    profileCompleted,
    lat,
    lon,
  } = useAppSelector((state) => state.userDetail);

  const autocomplete = useGeoapifyAutocomplete();

  // Modal and form state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
    placeOfBirth: placeOfBirth || '',
    timeOfBirth: timeOfBirth ? new Date(`2000-01-01T${timeOfBirth}`) : new Date(),
    moonSign: moonSign || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof profileData, string>>>({});
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lon: number | null }>({
    lat: lat || null,
    lon: lon || null,
  });

  // Function to map moon sign string to zodiac sign key
  const getZodiacSignKey = (moonSign: string): string => {
    return moonSign.toLowerCase();
  };

  // Get the correct zodiac sign icon based on moon sign
  const getZodiacSignIcon = (moonSign: string) => {
    const key = getZodiacSignKey(moonSign);
    return zodiacSign[key as keyof typeof zodiacSign] || zodiacSign.aries;
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof profileData, string>> = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.placeOfBirth.trim()) {
      newErrors.placeOfBirth = 'Place of birth is required';
    }

    if (profileData.dateOfBirth > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleProfileSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // For demo purposes, use default coordinates if not available
      const lat = coordinates.lat || 28.6139; // Default to Delhi coordinates
      const lon = coordinates.lon || 77.2090;

      // Fetch moon sign from API
      const moonSignResult = await fetchMoonSign(
        profileData.dateOfBirth,
        profileData.timeOfBirth,
        lat,
        lon,
      );

      // Fetch kundali
      await fetchKundali(
        profileData.dateOfBirth,
        profileData.timeOfBirth,
        lat,
        lon,
        moonSignResult
      );

      // Update Redux store
      dispatch(
        setUserDetails({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          dateOfBirth: profileData.dateOfBirth.toISOString().split('T')[0],
          placeOfBirth: profileData.placeOfBirth,
          timeOfBirth: `${profileData.timeOfBirth.getHours().toString().padStart(2, '0')}:${profileData.timeOfBirth.getMinutes().toString().padStart(2, '0')}`,
          moonSign: moonSignResult,
          lat,
          lon,
        }),
      );
      dispatch(completeProfile());

      setShowProfileModal(false);
      Alert.alert('Success', 'Your profile has been updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // API functions (similar to DailyHoroScope)
  const fetchMoonSign = async (date: Date, time: Date, latitude: number, longitude: number): Promise<string> => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

      const url = `/horoScope/getMoonSign?dateStr=${encodeURIComponent(dateStr)}&timeStr=${encodeURIComponent(timeStr)}&latitude=${latitude}&longitude=${longitude}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      return data.moonSign || 'Unknown';
    } catch (error) {
      console.error('Error fetching moon sign:', error);
      return 'Unknown';
    }
  };

  const fetchKundali = async (date: Date, time: Date, latitude: number, longitude: number, moonSign: string) => {
    const url = process.env.EXPO_PUBLIC_GET_KUNDALI!;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = time.getHours();
    const minute = time.getMinutes();

    const data = {
      year, month, date: day, hours: hour, minutes: minute, seconds: 0,
      latitude, longitude, timezone: 5.5,
      settings: { observation_point: 'topocentric', ayanamsha: 'lahiri', language: 'en' },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sRVrLCcdYV5iTb6ELs4B91vcyyXmjaxZ5GaMMCNF' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.statusCode === 200) {
      await saveKundali({ statusCode: result.statusCode, output: result.output, userId: 'user123' });
    }
    return result;
  };

  // Handle clear profile
  const handleClearProfile = () => {
    Alert.alert(
      'Clear Profile',
      'Are you sure you want to erase all your profile data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Profile',
          style: 'destructive',
          onPress: () => {
            dispatch(resetUserDetails());
            Alert.alert('Success', 'Your profile has been cleared.');
          }
        }
      ]
    );
  };

  // Date/time picker handlers
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android' && event.type === 'set') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setProfileData((prev) => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android' && event.type === 'set') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setProfileData((prev) => ({ ...prev, timeOfBirth: selectedTime }));
    }
  };

  const ProfileField = ({
    icon,
    label,
    value,
    placeholder = 'Not set'
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    placeholder?: string;
  }) => (
    <View className='flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100'>
      <View className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 items-center justify-center mr-4'>
        <Ionicons name={icon} size={20} color='#6366F1' />
      </View>
      <View className='flex-1'>
        <Text className='text-gray-500 text-sm font-medium mb-1'>{label}</Text>
        <Text className={`text-base ${value ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
          {value || placeholder}
        </Text>
      </View>
    </View>
  );

  return (
    <View className='flex-1 bg-gray-50'>
      {/* Header Section */}
      <View className='relative'>
        <View className='relative'>
          <Quadrant />
          <View className='absolute top-[50px] left-[15px] w-[200px] h-[80px] justify-center'>
            <Text className='text-white font-semibold text-lg'>Hello {firstName || ''}</Text>
            <Text className='text-white text-xl font-bold mt-2 ml-[15px]'>
              Your Profile
            </Text>
          </View>
        </View>
        <TouchableOpacity className='absolute top-0 right-0 w-[80px] h-[80px] justify-center items-center'>
          <View className='w-12 h-12 rounded-full bg-white/30 backdrop-blur-md items-center justify-center border border-white/20'>
            <Ionicons name='settings-outline' size={24} color='#1F2937' />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className='flex-1 px-4' showsVerticalScrollIndicator={false}>
        {/* Profile Completion Status */}
        <View className='mt-4 mb-4'>
          <View className='rounded-xl overflow-hidden shadow-sm'>
            <LinearGradient colors={profileCompleted ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}>
              <View className='p-4 items-center'>
                <View className='flex-row items-center mb-2'>
                  <Ionicons
                    name={profileCompleted ? 'checkmark-circle' : 'time-outline'}
                    size={20}
                    color='white'
                  />
                  <Text className='text-white text-base font-semibold ml-2'>
                    {profileCompleted ? 'Profile Complete' : 'Profile Incomplete'}
                  </Text>
                </View>
                <Text className='text-white/90 text-center text-xs leading-4'>
                  {profileCompleted
                    ? 'Ready for personalized insights'
                    : 'Complete to unlock features'
                  }
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Zodiac Sign Display */}
        {profileCompleted && moonSign && (
          <View className='mb-4'>
            <View className='rounded-xl overflow-hidden shadow-lg'>
              <LinearGradient colors={['#0F172A', '#1E3A8A']}>
                <View className='p-4 items-center'>
                  <View className='w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 items-center justify-center mb-3 shadow-md'>
                    <Image
                      source={getZodiacSignIcon(moonSign)}
                      className='w-10 h-10'
                      style={{ tintColor: 'white' }}
                    />
                  </View>
                  <Text className='text-white text-2xl font-bold mb-2'>
                    {moonSign}
                  </Text>
                  <Text className='text-white/80 text-center text-sm'>
                    Your Moon Sign
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Personal Information Section */}
        <View className='mb-6'>
          <Text className='text-xl font-bold text-gray-900 mb-4'>Personal Information</Text>
          <ProfileField
            icon='person-outline'
            label='Full Name'
            value={`${firstName || ''} ${lastName || ''}`.trim()}
          />
        </View>

        {/* Astrological Details Section */}
        <View className='mb-6'>
          <Text className='text-xl font-bold text-gray-900 mb-4'>Astrological Details</Text>
          <ProfileField
            icon='calendar-outline'
            label='Date of Birth'
            value={dateOfBirth}
          />
          <ProfileField
            icon='time-outline'
            label='Time of Birth'
            value={timeOfBirth}
          />
          <ProfileField
            icon='location-outline'
            label='Place of Birth'
            value={placeOfBirth}
          />
          <ProfileField
            icon='moon-outline'
            label='Moon Sign'
            value={moonSign}
          />
        </View>

        {/* Action Buttons */}
        <View className='mb-8 space-y-4 gap-5'>
          {/* Edit Profile Button - Redesigned */}
          <TouchableOpacity
            onPress={() => setShowProfileModal(true)}
            className='rounded-2xl shadow-lg overflow-hidden'
            style={{
              shadowColor: '#7C3AED',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={['#7C3AED', '#A855F7', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className='py-5 px-6'
            >
              <View className='flex-row items-center justify-center'>
                <Ionicons name='create-outline' size={24} color='white' />
                <Text className='text-white font-bold text-center text-lg ml-3'>
                Edit Profile
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Clear Profile Button */}
          {profileCompleted && (
            <TouchableOpacity
              onPress={handleClearProfile}
              className='bg-red-50 border-2 border-red-200 rounded-2xl py-4 px-6 shadow-sm'
            >
              <View className='flex-row items-center justify-center'>
                <Ionicons name='trash-outline' size={20} color='#DC2626' />
                <Text className='text-red-600 font-semibold text-center text-base ml-2'>
                  Clear Profile Data
                </Text>
              </View>
              <Text className='text-red-500 text-xs text-center mt-1'>
                Permanently erase all profile information
              </Text>
            </TouchableOpacity>
          )}

          {/* Account Settings Button */}
          <TouchableOpacity className='bg-white border-2 border-gray-200 rounded-2xl py-4 px-6 shadow-sm'>
            <View className='flex-row items-center justify-center'>
              <Ionicons name='settings-outline' size={20} color='#6B7280' />
              <Text className='text-gray-700 font-semibold text-center text-base ml-2'>
                Account Settings
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View className='h-8' />
      </ScrollView>

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
                      onChangeText={(text) => {
                        autocomplete.handleSearchChange(text);
                        setProfileData((prev) => ({ ...prev, placeOfBirth: text }));
                      }}
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
                              const placeName = item.properties.formatted;
                              autocomplete.selectSuggestion(item);
                              setProfileData((prev) => ({ ...prev, placeOfBirth: placeName }));
                              setCoordinates({
                                lat: item?.properties?.lat!,
                                lon: item?.properties?.lon!,
                              });
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
    </View>
  );
};

export default Profile;
