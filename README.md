# 🌟 DhruvAI - Your Personal Vedic Astrology Companion

<div align="center">

![DhruvAI Logo](assets/images/icon.png)

**Unlock the mysteries of your destiny with AI-powered Vedic astrology insights**

[![Expo](https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

## ✨ About DhruvAI

DhruvAI is a comprehensive mobile astrology application that combines ancient Vedic wisdom with modern AI technology. Discover your life's blueprint through personalized horoscopes, palm readings, and spiritual guidance powered by machine learning and traditional astrological calculations.

## 🚀 Features

### 🏠 **Home Dashboard**
- Personalized welcome message with user's name
- Daily horoscope insights
- Quick access to all major features
- Beautiful gradient backgrounds with mystical themes

### 🔮 **Palm Reading**
- **Camera Integration**: Real-time palm scanning with guided positioning
- **AI Analysis**: Advanced image processing for palm line detection
- **Vedic Interpretation**: Detailed analysis of life lines, heart lines, and mounts
- **Comprehensive Reports**: Health, career, relationships, and spiritual insights
- **Local Notifications**: Mystical progress updates during analysis

### 💬 **AI Chat Assistant**
- **Gemini AI Integration**: Powered by Google's Gemini AI
- **Astrological Knowledge**: Context-aware responses based on birth charts
- **Personalized Guidance**: Tailored advice using your astrological profile
- **Real-time Conversations**: Interactive Q&A with your AI astrologer

### 👤 **Profile Management**
- **Birth Details**: Complete astrological profile setup
- **Moon Sign Calculation**: Automatic calculation using precise astronomical data
- **Data Privacy**: Secure local storage with Redux persist
- **Profile Editing**: Easy profile updates and management

### 🔔 **Smart Notifications**
- **Local Notifications**: Engaging alerts for palm reading progress
- **Permission Management**: Proper iOS/Android notification permissions
- **Mystical Messaging**: Spiritually themed notification content

### 📊 **Vedic Astrology Insights**
- **Birth Chart Analysis**: Complete Kundali generation
- **Planetary Positions**: Accurate astronomical calculations
- **Zodiac Compatibility**: Relationship and compatibility analysis
- **Vedic Remedies**: Traditional spiritual recommendations

## 🛠️ Tech Stack

### **Frontend**
- **React Native 0.81.5** - Cross-platform mobile development
- **Expo SDK 54** - Development platform and native modules
- **TypeScript** - Type-safe JavaScript
- **NativeWind** - Tailwind CSS for React Native

### **State Management**
- **Redux Toolkit** - Predictable state management
- **Redux Persist** - Persistent storage
- **Realm Database** - Local data persistence

### **AI & APIs**
- **Google Gemini AI** - Conversational AI assistant
- **Astro Calculator** - Astronomical calculations
- **Astronomy Engine** - Precise celestial positioning
- **Geoapify API** - Location services for birth places

### **UI/UX**
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **Ionicons** - Consistent iconography
- **React Native Gifted Chat** - Chat interface
- **React Native Reanimated** - Smooth animations

## 📱 Screenshots

<div align="center">

### Home Screen
![1](https://github.com/user-attachments/assets/3ddb3178-8b18-475f-af47-ba225c63462f)
![2](https://github.com/user-attachments/assets/c879fb42-4e08-49bb-9b5b-ca544eca6114)
![3](https://github.com/user-attachments/assets/94076a73-f822-40f2-889b-34f367b1423e)
![4](https://github.com/user-attachments/assets/6340aaab-dea0-4fc9-adb3-2ec000e70b68)
![5](https://github.com/user-attachments/assets/bff6dde8-6248-4605-a683-6deb57f51abc)
![6](https://github.com/user-attachments/assets/4d91d598-5fd0-4029-b9f9-a05574c6a4f0)
![7](https://github.com/user-attachments/assets/a22a2a0e-9a48-4a82-adc3-cd11d6bc27a0)
![8](https://github.com/user-attachments/assets/85df4a1d-52c5-458d-b4b5-4c3d35a7d724)
![9](https://github.com/user-attachments/assets/2bd07da5-bd0f-4871-a7f9-c17e1096c8f1)
![10](https://github.com/user-attachments/assets/f096790a-0462-4597-a769-f77b0de3e64b)


</div>

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dhruvai.git
   cd dhruvai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GEMINI_GENERATE_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   EXPO_PUBLIC_GET_KUNDALI=https://api.vedicastroapi.com/v3-json/horoscope/full-report
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go
   - **Web**: Press `w` in the terminal

## 📋 API Keys Setup

### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### Vedic Astro API (Optional)
1. Sign up at [Vedic Astro API](https://vedicastroapi.com)
2. Get your API key
3. Add it to your `.env` file

## 🏗️ Project Structure

```
dhruvAI/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── home.tsx       # Home dashboard
│   │   ├── chat.tsx       # AI chat interface
│   │   └── profile.tsx    # User profile management
│   ├── palm-reading.tsx   # Palm scanning interface
│   └── palm-reading-results.tsx # Analysis results
├── components/            # Reusable UI components
│   ├── DailyHoroScope.tsx # Daily horoscope card
│   ├── PalmReadCard.tsx   # Palm reading feature card
│   └── AskMeAnything.tsx  # AI chat feature card
├── hooks/                 # Custom React hooks
│   ├── useKundali.ts     # Kundali data management
│   └── useLocalNotification.ts # Notification handling
├── lib/                   # Utility libraries
│   └── astrology/         # Astrology calculations
├── store/                 # Redux store configuration
├── realm/                 # Database schemas
└── services/             # API integrations
```

## 🎯 Key Components

### **Palm Reading Flow**
1. **Permission Request** → Camera access for palm scanning
2. **Guided Capture** → Real-time positioning with golden frame overlay
3. **AI Processing** → Image analysis and line detection
4. **Vedic Interpretation** → Traditional astrological analysis
5. **Comprehensive Report** → Detailed insights across multiple life areas

### **AI Chat System**
- **Context Awareness**: Uses birth chart data for personalized responses
- **Multi-turn Conversations**: Maintains conversation history
- **Astrological Knowledge**: Trained on Vedic astrology principles
- **Fallback Handling**: Graceful error management

### **Notification System**
- **Progress Updates**: Mystical messages during palm analysis
- **Permission Handling**: Proper iOS/Android notification setup
- **Themed Content**: Spiritually resonant notification text

## 🔧 Development

### **Available Scripts**
```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
npm run lint       # Run ESLint
npm run reset-project # Reset to fresh Expo project
```

### **Building for Production**
```bash
# Build for EAS (Expo Application Services)
npx eas build --platform android
npx eas build --platform ios

# Submit to app stores
npx eas submit --platform android
npx eas submit --platform ios
```

## 🤝 Contributing

We welcome contributions to DhruvAI! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Use meaningful commit messages
- Test on both iOS and Android
- Ensure accessibility compliance
- Maintain code quality with ESLint

## 🙏 Acknowledgments

- **Vedic Astrology Community** - For preserving ancient wisdom
- **Google AI** - For Gemini AI capabilities
- **Expo Team** - For the amazing development platform
- **React Native Community** - For continuous innovation

---

<div align="center">

**Made with ❤️ for astrology enthusiasts worldwide**

⭐ Star this repo if you find it helpful!

</div>
