import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { RecentlyViewedProvider } from './src/context/RecentlyViewedContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { PushNotificationProvider } from './src/context/PushNotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen, { hasSeenOnboarding } from './src/screens/OnboardingScreen';
import { getColors } from './src/theme/colors';

/**
 * Inner shell that consumes theme and forces full re-mount with key={isDark}
 * so every StyleSheet.create() re-runs with the updated COLORS values.
 */
function ThemedApp({ showOnboarding, setShowOnboarding }) {
  const { isDark } = useTheme();
  const COLORS = getColors();

  return (
    <React.Fragment key={isDark ? 'dark' : 'light'}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />
      <AuthProvider>
        <LanguageProvider>
          <CartProvider>
            <FavoritesProvider>
              <RecentlyViewedProvider>
                <NotificationProvider>
                  <PushNotificationProvider>
                    {showOnboarding ? (
                      <OnboardingScreen onFinish={() => setShowOnboarding(false)} />
                    ) : (
                      <AppNavigator />
                    )}
                  </PushNotificationProvider>
                </NotificationProvider>
              </RecentlyViewedProvider>
            </FavoritesProvider>
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </React.Fragment>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(null); // null = loading

  useEffect(() => {
    hasSeenOnboarding().then((seen) => setShowOnboarding(!seen));
  }, []);

  // Still checking AsyncStorage
  if (showOnboarding === null) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp
            showOnboarding={showOnboarding}
            setShowOnboarding={setShowOnboarding}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
