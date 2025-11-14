import InstructionsModal from '@/components/InstructionModal';
import { ToastContainer, useToast } from '@/components/Toast';
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
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

      // Set the captured image to display it
      setCapturedImage(`data:image/jpeg;base64,${photo.base64}`);
      showToast('✅ Palm captured! Review and confirm.', 'success', 2000);
    } catch (error) {
      console.error('Palm capture error:', error);
      showToast(
        'Failed to capture palm. Please try again.',
        'error',
        5000,
        'bottom',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDone = async () => {
    if (!capturedImage) return;

    setShowAnalysisModal(true);
    setIsProcessing(true);

    try {
      showToast('🔮 Analyzing your palm lines...', 'info', 3000);

      const response = await fetch('/(api)/palm/palmRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: capturedImage,
        }),
      });
      const result = await response.json();
      console.log('result: ', result);

      if (result.data) {
        showToast('✅ Palm reading complete!', 'success', 2000);
        setShowAnalysisModal(false);
        // Navigate to results screen with the palm reading data
        setTimeout(() => {
          router.push({
            pathname: '/palm-reading-results',
            params: { result: JSON.stringify(result.data) },
          });
        }, 500);
      } else {
        showToast(
          result.error || 'Failed to analyze palm reading',
          'error',
          5000,
          'bottom',
        );
        setShowAnalysisModal(false);
      }
    } catch (error) {
      console.error('Palm reading error:', error);
      showToast(
        'Failed to analyze palm. Please try again.',
        'error',
        5000,
        'bottom',
      );
      setShowAnalysisModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowAnalysisModal(false);
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
        {!capturedImage && (
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
        )}

        {/* Camera View or Captured Image */}
        <View className='flex-1'>
          {capturedImage ? (
            // Show captured image with Done/Retake buttons
            <View className='flex-1 bg-black'>
              {/* Back Button - Left Side */}
              <View className='absolute left-6 z-20'>
                <TouchableOpacity
                  onPress={handleRetake}
                  className='w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30'
                >
                  <Text className='text-white text-xl font-bold'>←</Text>
                </TouchableOpacity>
              </View>

              {/* Done Button - Top Right */}
              <View className='absolute right-6 z-20 rounded-2xl flex-row'>
                <TouchableOpacity
                  onPress={handleDone}
                  className='bg-white/20 border border-white/30 rounded-2xl px-4 py-2 shadow-lg mr-5'
                >
                  <Text className='text-white font-bold text-base'>✓ Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRetake}
                  className='bg-white/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20'
                >
                  <Text className='text-white font-bold text-base'>
                    ↻ Retake
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Captured Image */}
              <View className='flex-1 justify-center items-center bg-black pt-20 pb-32'>
                <Image
                  source={{ uri: capturedImage }}
                  style={{
                    width: '90%',
                    height: '100%',
                    resizeMode: 'contain',
                    borderRadius: 20,
                  }}
                  className='shadow-2xl'
                />
              </View>
            </View>
          ) : (
            // Show camera view
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
                    Place your right palm inside the golden frame and ensure
                    good lighting
                  </Text>
                </View>
              </LinearGradient>

              {/* Camera Overlay */}
              <View className='flex-1 justify-center items-center'>
                <View className='relative'>
                  {/* Outer glow effect */}
                  <View className='absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-xl scale-110' />

                  {/* Main frame */}
                  <View className='w-72 h-96 rounded-3xl border-4 border-white/90 justify-center items-center shadow-2xl bg-black/20 backdrop-blur-sm'>
                    {/* Corner indicators */}
                    <View className='absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-white/80 rounded-tl-lg' />
                    <View className='absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-white/80 rounded-tr-lg' />
                    <View className='absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-white/80 rounded-bl-lg' />
                    <View className='absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-white/80 rounded-br-lg' />

                    {/* Center guide */}
                    <View className='w-16 h-16 border-2 border-white/60 rounded-full items-center justify-center'>
                      <View className='w-8 h-8 border-2 border-white/80 rounded-full' />
                    </View>
                  </View>
                </View>
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
                      cameraReady && !isProcessing
                        ? 'bg-white/20'
                        : 'bg-gray-500/50'
                    }`}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size='large' color='#FFFFFF' />
                    ) : (
                      <View className='w-16 h-16 rounded-full bg-red-500 items-center justify-center' />
                    )}
                  </TouchableOpacity>

                  {/* Instructions */}
                  <Text className='text-white/80 text-sm text-center mt-4 px-4'>
                    Tap to capture • Ensure palm is clearly visible
                  </Text>
                </View>
              </LinearGradient>
            </CameraView>
          )}
        </View>

        {/* Analysis Modal */}
        <Modal
          visible={showAnalysisModal}
          transparent={true}
          animationType='slide'
          onRequestClose={() => setShowAnalysisModal(false)}
        >
          <View className='flex-1 bg-white/20 justify-center items-center px-6'>
            <View className='bg-gradient-to-br bg-black from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 items-center max-w-sm w-full shadow-2xl border border-purple-500/30'>
              {/* Mystic Background Effects */}
              <View className='absolute inset-0 rounded-3xl overflow-hidden'>
                <View className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10' />
                <View className='absolute -top-10 -right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl' />
                <View className='absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl' />
              </View>

              {/* Crystal Ball Animation */}
              <View className='relative mb-8 z-10'>
                <View className='w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full items-center justify-center shadow-2xl border-4 border-white/20'>
                  <ActivityIndicator size='large' color='#FFFFFF' />
                </View>
                <View className='absolute inset-0 items-center justify-center'>
                  <Text className='text-4xl'>🔮</Text>
                </View>
                {/* Pulsing rings */}
                <View className='absolute inset-0 rounded-full border-2 border-purple-300/50 animate-ping' />
                <View className='absolute inset-2 rounded-full border border-blue-300/30 animate-ping' style={{ animationDelay: '0.5s' }} />
              </View>

              {/* Title with glow effect */}
              <View className='mb-6 z-10'>
                <Text className='text-white text-2xl font-bold text-center mb-2 drop-shadow-lg'>
                  🔮 Mystic Analysis
                </Text>
                <Text className='text-purple-200 text-center text-sm'>
                  Unlocking the secrets of your palm...
                </Text>
              </View>

              {/* Progress Steps */}
              <View className='w-full mb-6 z-10'>
                <View className='flex-row justify-between mb-3'>
                  <Text className='text-purple-200 text-xs'>Scanning Lines</Text>
                  <Text className='text-purple-200 text-xs'>Analyzing Mounts</Text>
                  <Text className='text-purple-200 text-xs'>Reading Future</Text>
                </View>
                <View className='flex-row space-x-2'>
                  <View className='flex-1 h-2 bg-purple-600/50 rounded-full overflow-hidden'>
                    <LinearGradient
                      colors={['#9333EA', '#3B82F6'] as const}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className='h-full rounded-full animate-pulse'
                      style={{ width: '100%' }}
                    />
                  </View>
                  <View className='flex-1 h-2 bg-purple-600/30 rounded-full overflow-hidden'>
                    <LinearGradient
                      colors={['#9333EA', '#3B82F6'] as const}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className='h-full rounded-full animate-pulse'
                      style={{ width: '70%' }}
                    />
                  </View>
                  <View className='flex-1 h-2 bg-purple-600/20 rounded-full overflow-hidden'>
                    <LinearGradient
                      colors={['#9333EA', '#3B82F6'] as const}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className='h-full rounded-full animate-pulse'
                      style={{ width: '40%' }}
                    />
                  </View>
                </View>
              </View>

              {/* Main Message */}
              <Text className='text-white text-base text-center leading-6 mb-4 font-medium z-10'>
                Your palm is currently under mystical analysis. Please wait and
                don't close the app until your reading is complete.
              </Text>

              {/* Processing Status */}
              <View className='bg-white/10 rounded-2xl p-4 mb-4 z-10'>
                <Text className='text-purple-200 text-sm text-center'>
                  ✨ Processing palm lines and generating insights...
                </Text>
              </View>

              {/* Estimated Time */}
              <View className='flex-row items-center justify-center z-10'>
                <Text className='text-purple-300 text-sm mr-2'>⏱️</Text>
                <Text className='text-purple-300 text-sm'>
                  Estimated time: 15-30 seconds
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <ToastContainer />
    </>
  );
};

export default PalmReadingScreen;
