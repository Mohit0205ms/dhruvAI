import React, { useState, useRef } from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface PalmReadingResult {
  analysisId: string;
  timestamp: string;
  confidence: number;
  handShape: string;
  handSize: string;
  skinTexture: string;
  lifeLine: {
    strength: string;
    length: number;
    curvature: number;
    clarity: number;
    interpretation: string;
    vedicSignificance: string;
    score: number;
  };
  heartLine: {
    strength: string;
    length: number;
    curvature: number;
    clarity: number;
    interpretation: string;
    vedicSignificance: string;
    score: number;
  };
  headLine: {
    strength: string;
    length: number;
    curvature: number;
    clarity: number;
    interpretation: string;
    vedicSignificance: string;
    score: number;
  };
  fateLine: {
    presence: boolean;
    analysis?: {
      strength: string;
      length: number;
      curvature: number;
      clarity: number;
      interpretation: string;
      vedicSignificance: string;
      score: number;
    };
  };
  marriageLine: {
    count: number;
    quality: string;
    interpretation: string;
  };
  sunLine: {
    presence: boolean;
    analysis?: any;
  };
  mercuryLine: {
    presence: boolean;
    analysis?: any;
  };
  mounts: {
    venus: any;
    mars: any;
    jupiter: any;
    saturn: any;
    mercury: any;
    moon: any;
    sun: any;
  };
  fingers: any;
  personality: any;
  health: any;
  career: any;
  relationships: any;
  spirituality: any;
  vedicInsights: any;
  recommendations: any;
  version: string;
  modelUsed: string;
  processingTime: number;
}

const PalmReadingResultsScreen = () => {
  const router = useRouter();
  const { result } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const flatListRef = useRef<FlatList>(null);

  let palmData: PalmReadingResult;
  try {
    palmData = JSON.parse(result as string);
  } catch (error) {
    Alert.alert('Error', 'Invalid palm reading data');
    router.back();
    return null;
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '👋' },
    { key: 'personality', label: 'Personality', icon: '🧠' },
    { key: 'health', label: 'Health', icon: '❤️' },
    { key: 'career', label: 'Career', icon: '💼' },
    { key: 'relationships', label: 'Love', icon: '💕' },
    { key: 'spirituality', label: 'Spirit', icon: '🕉️' },
    { key: 'recommendations', label: 'Guidance', icon: '📚' },
  ];

  const handleTabPress = (tabKey: string, index: number) => {
    setActiveTab(tabKey);

    // Calculate center position for the selected tab
    const tabWidth = 90; // Approximate width of each tab
    const screenCenter = width / 2;
    const tabCenter = tabWidth / 2;
    const targetOffset = index * (tabWidth + 8) - screenCenter + tabCenter + 16; // 8 is margin, 16 is padding

    flatListRef.current?.scrollToOffset({
      offset: Math.max(0, targetOffset),
      animated: true,
    });
  };

  const ProgressBar = ({ value, max = 100, colors = ['#3B82F6', '#1D4ED8'] }: {
    value: number;
    max?: number;
    colors?: readonly [string, string, ...string[]];
  }) => (
    <View className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: `${Math.min((value / max) * 100, 100)}%`,
          height: '100%',
          borderRadius: 6,
        }}
      />
    </View>
  );

  const ScoreCard = ({ title, score, description, colors = ['#3B82F6', '#1D4ED8'], icon }: {
    title: string;
    score: number;
    description: string;
    colors?: readonly [string, string, ...string[]];
    icon?: string;
  }) => (
    <LinearGradient
      colors={['#FFFFFF', '#F8FAFC'] as const}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-2xl p-6 mb-4 shadow-lg border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            {icon && <Text className="text-2xl mr-3">{icon}</Text>}
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
          </View>
          <Text className="text-gray-600 text-sm leading-5">{description}</Text>
        </View>
        <View className="ml-4">
          <LinearGradient
            colors={colors}
            className="w-16 h-16 rounded-full items-center justify-center shadow-md"
          >
            <Text className="text-white text-xl font-bold">{score}</Text>
          </LinearGradient>
        </View>
      </View>
      <ProgressBar value={score} colors={colors} />
      <Text className="text-xs text-gray-500 mt-2 text-center">Score out of 100</Text>
    </LinearGradient>
  );

  const LineAnalysisCard = ({ title, line, icon }: { title: string; line: any; icon: string }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-center mb-3">
        <Text className="text-2xl mr-3">{icon}</Text>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
          <Text className="text-sm text-gray-500 capitalize">{line.strength} • Score: {line.score}/100</Text>
        </View>
      </View>
      <Text className="text-gray-700 mb-3">{line.interpretation}</Text>
      <View className="bg-blue-50 rounded-lg p-3">
        <Text className="text-sm font-medium text-blue-800 mb-1">Vedic Significance</Text>
        <Text className="text-sm text-blue-700">{line.vedicSignificance}</Text>
      </View>
    </View>
  );

  const MountCard = ({ name, mount, planet }: { name: string; mount: any; planet: string }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-lg font-semibold text-gray-800">{name}</Text>
          <Text className="text-sm text-gray-500">{planet}</Text>
        </View>
        <Text className="text-lg">{mount.score}/100</Text>
      </View>
      <Text className="text-gray-700 text-sm mb-2">{mount.influence}</Text>
      <View className="flex-row flex-wrap">
        {mount.characteristics.map((trait: string, index: number) => (
          <Text key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mr-2 mb-1">
            {trait}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderOverview = () => (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 mb-6">
          <Text className="text-black text-2xl font-bold text-center mb-2">Your Palm Reading</Text>
          <Text className="text-black/80 text-center text-sm">
            Analysis ID: {palmData.analysisId.split('_')[1]}
          </Text>
          <Text className="text-black/80 text-center text-sm">
            Confidence: {Math.round(palmData.confidence * 100)}%
          </Text>
        </View>

        {/* Key Scores */}
        <Text className="text-xl font-bold text-gray-800 mb-4">Key Life Indicators</Text>
        <ScoreCard
          title="Life Force (Prana)"
          score={palmData.lifeLine.score}
          description={palmData.lifeLine.interpretation}
          colors={['#10B981', '#059669']}
          icon="💚"
        />
        <ScoreCard
          title="Emotional Balance"
          score={palmData.heartLine.score}
          description={palmData.heartLine.interpretation}
          colors={['#F59E0B', '#D97706']}
          icon="❤️"
        />
        <ScoreCard
          title="Mental Capacity"
          score={palmData.headLine.score}
          description={palmData.headLine.interpretation}
          colors={['#8B5CF6', '#7C3AED']}
          icon="🧠"
        />

        {/* Vedic Summary */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Vedic Profile</Text>
          <View className="space-y-2">
            <Text className="text-gray-700">🌟 Ruling Planet: {palmData.vedicInsights.rulingPlanet}</Text>
            <Text className="text-gray-700">🌀 Element: {palmData.vedicInsights.element}</Text>
            <Text className="text-gray-700">⚕️ Dosha: {palmData.vedicInsights.dosha}</Text>
            <Text className="text-gray-700">🔮 Chakra: {palmData.vedicInsights.chakraAlignment}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</Text>
          <View className="space-y-2">
            {palmData.recommendations.immediate.slice(0, 3).map((rec: string, index: number) => (
              <Text key={index} className="text-gray-700">• {rec}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderPersonality = () => (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-6">Your Personality</Text>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Overall Personality</Text>
          <Text className="text-gray-700 leading-6">{palmData.personality.overall}</Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Dominant Guna</Text>
          <Text className="text-2xl mb-2">
            {palmData.personality.dominantGuna === 'sattva' ? '🧘' :
             palmData.personality.dominantGuna === 'rajas' ? '⚡' : '🌙'}
          </Text>
          <Text className="text-gray-700 capitalize">{palmData.personality.dominantGuna}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {palmData.personality.dominantGuna === 'sattva' ? 'Harmony, wisdom, and spiritual growth' :
             palmData.personality.dominantGuna === 'rajas' ? 'Action, ambition, and transformation' :
             'Stability, patience, and material focus'}
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Character Traits</Text>
          <View className="flex-row flex-wrap">
            {palmData.personality.traits.map((trait: string, index: number) => (
              <Text key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                {trait}
              </Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Strengths</Text>
          <View className="space-y-2">
            {palmData.personality.strengths.map((strength: string, index: number) => (
              <Text key={index} className="text-green-700">✓ {strength}</Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Areas for Growth</Text>
          <View className="space-y-2">
            {palmData.personality.weaknesses.map((weakness: string, index: number) => (
              <Text key={index} className="text-orange-700">• {weakness}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderHealth = () => (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-6">Health Insights</Text>

        <ScoreCard
          title="Overall Health"
          score={palmData.health.overall}
          description={`Based on your life line analysis (${palmData.lifeLine.strength} strength)`}
          colors={['#10B981', '#059669']}
          icon="🏥"
        />

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Physical Health</Text>
          <View className="space-y-2">
            {palmData.health.physical.map((item: string, index: number) => (
              <Text key={index} className="text-gray-700">• {item}</Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Mental Health</Text>
          <View className="space-y-2">
            {palmData.health.mental.map((item: string, index: number) => (
              <Text key={index} className="text-gray-700">• {item}</Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Health Recommendations</Text>
          <View className="space-y-2">
            {palmData.health.recommendations.map((rec: string, index: number) => (
              <Text key={index} className="text-green-700">💊 {rec}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderCareer = () => (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-6">Career Insights</Text>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Suitable Careers</Text>
          <View className="flex-row flex-wrap">
            {palmData.career.suitableCareers.map((career: string, index: number) => (
              <Text key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                {career}
              </Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Professional Strengths</Text>
          <View className="space-y-2">
            {palmData.career.strengths.map((strength: string, index: number) => (
              <Text key={index} className="text-blue-700">💪 {strength}</Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Career Challenges</Text>
          <View className="space-y-2">
            {palmData.career.challenges.map((challenge: string, index: number) => (
              <Text key={index} className="text-orange-700">⚠️ {challenge}</Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Planetary Influences</Text>
          <Text className="text-gray-700">{palmData.career.planetaryInfluences}</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderRelationships = () => (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-6">Relationship Insights</Text>

        <ScoreCard
          title="Relationship Compatibility"
          score={palmData.relationships.compatibility}
          description="Overall capacity for harmonious relationships"
          colors={['#EC4899', '#DB2777']}
          icon="💕"
        />

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Relationship Style</Text>
          <Text className="text-gray-700">{palmData.relationships.relationshipStyle}</Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Marriage Line Analysis</Text>
          <Text className="text-gray-700 mb-2">
            {palmData.marriageLine.count} marriage line(s) - {palmData.marriageLine.quality} quality
          </Text>
          <Text className="text-sm text-gray-600">{palmData.marriageLine.interpretation}</Text>
        </View>

        {palmData.relationships.challenges.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Relationship Challenges</Text>
            <View className="space-y-2">
              {palmData.relationships.challenges.map((challenge: string, index: number) => (
                <Text key={index} className="text-orange-700">• {challenge}</Text>
              ))}
            </View>
          </View>
        )}

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Recommendations</Text>
          <View className="space-y-2">
            {palmData.relationships.recommendations.map((rec: string, index: number) => (
              <Text key={index} className="text-pink-700">💕 {rec}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderSpirituality = () => (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-6">Spiritual Profile</Text>

        <ScoreCard
          title="Kundalini Energy"
          score={palmData.spirituality.kundalini}
          description="Spiritual energy awakening potential"
          colors={['#8B5CF6', '#7C3AED']}
          icon="🕉️"
        />

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Chakra Balance</Text>
          {Object.entries(palmData.spirituality.chakraBalance).map(([chakra, score]) => (
            <View key={chakra} className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-700 capitalize">{chakra} Chakra</Text>
                <Text className="text-gray-700">{score as number}/100</Text>
              </View>
              <ProgressBar value={score as number} colors={['#8B5CF6', '#7C3AED']} />
            </View>
          ))}
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Spiritual Path</Text>
          <Text className="text-gray-700">{palmData.spirituality.spiritualPath} Yoga</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {palmData.spirituality.spiritualPath === 'Karma Yoga' ? 'Path of selfless service and righteous action' :
             palmData.spirituality.spiritualPath === 'Jnana Yoga' ? 'Path of knowledge and wisdom' :
             'Path of devotion and love'}
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Recommended Practices</Text>
          <View className="space-y-2">
            {palmData.spirituality.practices.map((practice: string, index: number) => (
              <Text key={index} className="text-purple-700">🕉️ {practice}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderRecommendations = () => (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-6">Your Guidance</Text>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Immediate Actions</Text>
          <View className="space-y-2">
            {palmData.recommendations.immediate.map((rec: string, index: number) => (
              <Text key={index} className="text-red-700">🔥 {rec}</Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Short-term Goals (1-3 months)</Text>
          <View className="space-y-2">
            {palmData.recommendations.shortTerm.map((rec: string, index: number) => (
              <Text key={index} className="text-blue-700">📅 {rec}</Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Long-term Vision</Text>
          <View className="space-y-2">
            {palmData.recommendations.longTerm.map((rec: string, index: number) => (
              <Text key={index} className="text-green-700">🎯 {rec}</Text>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Spiritual Practices</Text>
          <View className="space-y-2">
            {palmData.recommendations.spiritual.map((rec: string, index: number) => (
              <Text key={index} className="text-purple-700">🙏 {rec}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'personality': return renderPersonality();
      case 'health': return renderHealth();
      case 'career': return renderCareer();
      case 'relationships': return renderRelationships();
      case 'spirituality': return renderSpirituality();
      case 'recommendations': return renderRecommendations();
      default: return renderOverview();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        // colors={['#6366F1', '#8B5CF6'] as const}
        colors={['#0F172A', '#1E3A8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-6 py-4 shadow-lg"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center"
          >
            <Text className="text-3xl text-white font-bold self-center">←</Text>
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-white text-center">
              Palm Reading Results
            </Text>
            <Text className="text-sm text-white/80 text-center mt-0.5">
              Vedic Palmistry Analysis
            </Text>
          </View>

          <View className="w-10 h-10" />
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View className="h-12 mb-3 mt-3">
        <FlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 2 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handleTabPress(item.key, index)}
              className={`flex-row items-center px-2 py-1 mx-1 rounded-full ${
                activeTab === item.key ? 'bg-blue-500' : 'bg-gray-100'
              }`}
            >
              <Text className="mr-1 text-xs">{item.icon}</Text>
              <Text className={`text-xs font-medium ${
                activeTab === item.key ? 'text-white' : 'text-gray-700'
              }`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

export default PalmReadingResultsScreen;
