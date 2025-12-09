import { useColorScheme } from '@/hooks/use-color-scheme';
import NetInfo from '@react-native-community/netinfo';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import CustomToastConfig from './customtoast';

// ------------------ Global API URL ---------------------------------------------
// global.API_URL = "https://devolamobile-api.manilateachersonline.com/"; // deployed
 global.API_URL = "http://172.16.20.32:45457/";
// -------------------------------------------------------------------------------

export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Offline / Back online detection
      if (!state.isConnected && isConnected) {
        Toast.show({
          type: "error" as const,
          text1: "No internet connection",
        });
      } else if (state.isConnected && !isConnected) {
        Toast.show({
          type: "success" as const,
          text1: "Back online",
        });
      }

      // Connected but no actual internet
      if (state.isConnected && state.isInternetReachable === false) {
        Toast.show({
          type: "error",
          text1: "Connected but no internet access",
        });
      }

      // Slow internet detection (cellularGeneration might not exist)
      if (
        state.isConnected &&
        state.details &&
        "cellularGeneration" in state.details &&
        typeof state.details.cellularGeneration === "string"
      ) {
        const slowTypes = ["2g", "slow-2g"];
        if (slowTypes.includes(state.details.cellularGeneration)) {
          Toast.show({
            type: "info" as const,
            text1: "Slow internet detected",
          });
        }
      }

      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, [isConnected]);

  const [ready, setReady] = useState(false);
  const slideAnim = useRef(new Animated.Value(50)).current; // start 50px below
  const textOpacity = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(0)).current; // 0 = no blur, 1 = full blur

  useEffect(() => {
    // Slide up icon
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      // Fade in text after slide
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // Start pulsating blur loop after text appears
        Animated.loop(
          Animated.sequence([
            Animated.timing(blurAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(blurAnim, {
              toValue: 0,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    });

    const timeout = setTimeout(() => setReady(true), 4000); // splash duration
    return () => clearTimeout(timeout);
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <Image
            source={require('@/assets/images/ola_splash.png')}
            style={{ width: 200, height: 200 }}
          />
          <Animated.Text style={[styles.text, { opacity: textOpacity }]}>
            OLA - MOBILE
          </Animated.Text>
        </Animated.View>

        {/* android version text */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Build v2.0.0</Text>
        </View>

        {/* Blur overlay */}
        <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: blurAnim }}>
          <BlurView intensity={100} style={{ flex: 1 }} />
        </Animated.View>
      </View>
    );
  }

  return (
    <>
      <PaperProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen
              name="login"
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="forgotpassword"
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="registration"
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="activation"
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>

      {/* Toast */}
      <Toast config={CustomToastConfig} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20, // below the image
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff5a5f',
  },
  versionContainer: {
  position: 'absolute',
  bottom: 30,
  width: '100%',
  alignItems: 'center',
},

versionText: {
  fontSize: 14,
  color: '#999',
},

});