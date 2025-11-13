import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface InstructionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/70 px-4">
        <LinearGradient
          colors={['#0F172A', '#1E3A8A','#8B5CF6'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24, // rounded-3xl equivalent
            marginHorizontal: 16, // mx-4
            maxWidth: 384, // max-w-sm
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
          className="border border-white/20"
        >
          <View className="p-8">
            {/* Header */}
            <View className="items-center mb-6">
              <Text className="text-4xl mb-3">🔮</Text>
              <Text className="text-2xl font-bold text-white text-center mb-2">
                Sacred Palm Reading
              </Text>
              <Text className="text-white/80 text-sm text-center">
                Ancient Wisdom • Modern Technology
              </Text>
            </View>

            {/* Instructions */}
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-80">
              <View className="space-y-4">
                <View className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-2">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-yellow-300 text-lg mr-3">💡</Text>
                    <Text className="text-white font-semibold">Lighting</Text>
                  </View>
                  <Text className="text-white/90 text-sm leading-5">
                    Ensure bright, even lighting. Avoid shadows on your palm for accurate analysis.
                  </Text>
                </View>

                <View className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-2">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-yellow-300 text-lg mr-3">📱</Text>
                    <Text className="text-white font-semibold">Positioning</Text>
                  </View>
                  <Text className="text-white/90 text-sm leading-5">
                    Place your right palm inside the golden frame. Keep your hand steady and flat.
                  </Text>
                </View>

                <View className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-2">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-yellow-300 text-lg mr-3">🖐️</Text>
                    <Text className="text-white font-semibold">Palm Orientation</Text>
                  </View>
                  <Text className="text-white/90 text-sm leading-5">
                    Show the front of your palm with fingers slightly spread apart naturally.
                  </Text>
                </View>

                <View className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-2">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-yellow-300 text-lg mr-3">🎯</Text>
                    <Text className="text-white font-semibold">Focus</Text>
                  </View>
                  <Text className="text-white/90 text-sm leading-5">
                    Center your palm in the frame. Ensure all lines and mounts are clearly visible.
                  </Text>
                </View>

                <View className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-2">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-yellow-300 text-lg mr-3">✨</Text>
                    <Text className="text-white font-semibold">Quality</Text>
                  </View>
                  <Text className="text-white/90 text-sm leading-5">
                    Clean palm without jewelry or dirt. High-quality photos yield better insights.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Vedic Wisdom */}
            <View className="bg-white/10 rounded-2xl p-4 mt-6 mb-6 border border-white/10">
              <Text className="text-yellow-200 text-center text-sm italic leading-5">
                &ldquo;The lines on your palm are like chapters in the book of your life,
                each telling a story written by the universe itself.&rdquo;
              </Text>
              <Text className="text-yellow-300 text-center text-xs mt-2">
                — Ancient Vedic Wisdom
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={onClose}
              className="bg-white rounded-2xl py-4 px-6 shadow-lg"
            >
              <Text className="text-purple-600 text-center font-bold text-lg">
                🪐 Begin Reading
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default InstructionsModal;
