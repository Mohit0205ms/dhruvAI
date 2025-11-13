import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top' | 'bottom';

interface ToastProps {
  message: string;
  type: ToastType;
  position?: ToastPosition;
  duration?: number;
  onHide?: () => void;
}

interface ToastConfig {
  backgroundColor: readonly [string, string, ...string[]];
  textColor: string;
  icon: string;
}

const toastConfigs: Record<ToastType, ToastConfig> = {
  success: {
    backgroundColor: ['#10B981', '#059669'] as const,
    textColor: '#FFFFFF',
    icon: '✅',
  },
  error: {
    backgroundColor: ['#EF4444', '#DC2626'] as const,
    textColor: '#FFFFFF',
    icon: '❌',
  },
  warning: {
    backgroundColor: ['#F59E0B', '#D97706'] as const,
    textColor: '#FFFFFF',
    icon: '⚠️',
  },
  info: {
    backgroundColor: ['#3B82F6', '#2563EB'] as const,
    textColor: '#FFFFFF',
    icon: 'ℹ️',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, position = 'top', duration = 3000, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(position === 'top' ? -100 : 100));

  const config = toastConfigs[type];

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className={`absolute ${position === 'top' ? 'top-12' : 'bottom-12'} left-4 right-4 z-50`}
    >
      <LinearGradient
        colors={config.backgroundColor}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-2xl p-4 shadow-lg border border-white/20"
      >
        <View className="flex-row items-center">
          <Text className="text-lg mr-3">{config.icon}</Text>
          <Text
            className="flex-1 text-sm font-medium leading-5"
            style={{ color: config.textColor }}
          >
            {message}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Toast Manager - Singleton pattern for scalability
class ToastManager {
  private static instance: ToastManager;
  private toasts: { id: string; component: React.ReactElement }[] = [];
  private listeners: ((toasts: { id: string; component: React.ReactElement }[]) => void)[] = [];

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  show(message: string, type: ToastType = 'info', duration: number = 3000, position: ToastPosition = 'top'): string {
    const id = Date.now().toString();
    const toastComponent = (
      <Toast
        key={id}
        message={message}
        type={type}
        position={position}
        duration={duration}
        onHide={() => this.hide(id)}
      />
    );

    this.toasts.push({ id, component: toastComponent });
    this.notifyListeners();

    return id;
  }

  hide(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: { id: string; component: React.ReactElement }[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

export const toastManager = ToastManager.getInstance();

// Hook for using toast in components
export const useToast = () => {
  const [toasts, setToasts] = useState<{ id: string; component: React.ReactElement }[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const showToast = (message: string, type: ToastType = 'info', duration: number = 3000, position: ToastPosition = 'top') => {
    return toastManager.show(message, type, duration, position);
  };

  const hideToast = (id: string) => {
    toastManager.hide(id);
  };

  return { toasts, showToast, hideToast };
};

// Toast Container Component
export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <View className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      {toasts.map(toast => (
        <View key={toast.id} className="pointer-events-auto">
          {toast.component}
        </View>
      ))}
    </View>
  );
};

export default Toast;
