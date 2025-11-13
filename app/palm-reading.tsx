import InstructionsModal from '@/components/InstructionModal';
import { ToastContainer, useToast } from '@/components/Toast';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const PalmReadingScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showInstructions, setShowInstructions] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) {
      showToast('Camera is not ready yet', 'warning', 4000, 'bottom');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    showToast('📸 Capturing your palm...', 'info', 2000);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: false,
      });
      console.log('photo taken: ', photo);

      showToast('🔮 Analyzing your palm lines...', 'info', 3000);

      let base64Data: string = photo.base64!;

      const response = await fetch('/(api)/palm/palmRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: `data:image/jpeg;base64,${base64Data}`,
        }),
      });
      const result = await response.json();
      console.log('result: ', result);

      if (result.data) {
        showToast('✅ Palm reading complete!', 'success', 2000);
        // Navigate to results screen with the palm reading data
        setTimeout(() => {
          router.push({
            pathname: '/palm-reading-results',
            params: { result: JSON.stringify(result.data) },
          });
        }, 500);
      } else {
        showToast(result.error || 'Failed to analyze palm reading', 'error', 5000, 'bottom');
      }
    } catch (error) {
      console.error('Palm reading error:', error);
      showToast('Failed to capture or analyze palm. Please try again.', 'error', 5000, 'bottom');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return (
      <LinearGradient
        colors={['#6366F1', '#8B5CF6'] as const}
        className='flex-1 justify-center items-center'
      >
        <View className='bg-white/10 rounded-2xl p-8 items-center'>
          <Text className='text-2xl mb-2'>🔮</Text>
          <Text className='text-white text-lg font-semibold'>
            Preparing Camera...
          </Text>
          <Text className='text-white/80 text-sm text-center mt-2'>
            Setting up for your palm reading
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient
        colors={['#6366F1', '#8B5CF6'] as const}
        className='flex-1 justify-center items-center px-6'
      >
        <View className='bg-white/10 rounded-3xl p-8 items-center max-w-sm'>
          <Text className='text-4xl mb-4'>📸</Text>
          <Text className='text-white text-2xl font-bold text-center mb-3'>
            Camera Access Needed
          </Text>
          <Text className='text-white/90 text-base text-center mb-8 leading-6'>
            To reveal the mysteries written in your palm, we need camera access
            to capture a clear photo of your hand.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className='bg-white rounded-2xl py-4 px-8 shadow-lg'
          >
            <Text className='text-purple-600 font-bold text-lg'>
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <SafeAreaView className='flex-1 bg-black'>
        <InstructionsModal
          visible={showInstructions}
          onClose={() => setShowInstructions(false)}
        />

        {/* Header */}
        <LinearGradient
          // colors={['#6366F1', '#8B5CF6'] as const}
          colors={['#0F172A', '#1E3A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className='px-6 py-4 shadow-lg'
        >
          <View className='flex-row items-center justify-between'>
            <TouchableOpacity
              onPress={() => router.back()}
              className='w-10 h-10 rounded-full bg-white/20 items-center justify-center'
            >
              <Text className='text-xl text-white font-bold'>←</Text>
            </TouchableOpacity>

            <View className='flex-1 items-center'>
              <Text className='text-xl font-bold text-white text-center'>
                Palm Reading
              </Text>
              <Text className='text-sm text-white/80 text-center mt-0.5'>
                Capture Your Destiny
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowInstructions(true)}
              className='w-10 h-10 rounded-full bg-white/20 items-center justify-center'
            >
              <Text className='text-lg text-white'>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Camera View */}
        <View className='flex-1'>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing='back'
            onCameraReady={handleCameraReady}
          >
            {/* Top Instructions */}
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent'] as const}
              className='absolute top-0 left-0 right-0 pt-6 pb-8'
            >
              <View className='px-6'>
                <Text className='text-white text-lg font-semibold text-center mb-2'>
                  📸 Position Your Palm
                </Text>
                <Text className='text-white/90 text-sm text-center leading-5'>
                  Place your right palm inside the golden frame and ensure good
                  lighting
                </Text>
              </View>
            </LinearGradient>

            {/* Camera Overlay */}
            <View className='flex-1 justify-center items-center'>
              <View className='w-72 h-96 rounded-3xl border-4 border-white/80 justify-center items-center shadow-2xl' />
            </View>

            {/* Bottom Controls */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)'] as const}
              className='absolute bottom-0 left-0 right-0 pb-12 pt-8'
            >
              <View className='items-center px-6'>
                {/* Capture Button */}
                <TouchableOpacity
                  onPress={takePicture}
                  disabled={!cameraReady || isProcessing}
                  className={`w-24 h-24 rounded-full border-4 border-white justify-center items-center shadow-2xl ${
                    cameraReady && !isProcessing ? 'bg-white/20' : 'bg-gray-500/50'
                  }`}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  ) : (
                    <View className='w-16 h-16 rounded-full bg-red-500 items-center justify-center'/>
                  )}
                </TouchableOpacity>

                {/* Instructions */}
                <Text className='text-white/80 text-sm text-center mt-4 px-4'>
                  Tap to capture • Ensure palm is clearly visible
                </Text>
              </View>
            </LinearGradient>
          </CameraView>
        </View>
      </SafeAreaView>
      <ToastContainer />
    </>
  );
};

export default PalmReadingScreen;
