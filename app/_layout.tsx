import { useColorScheme } from '@/hooks/use-color-scheme';
import NetInfo from '@react-native-community/netinfo';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import CustomToastConfig from './customtoast';

// ------------------ Global API URL ------------------
global.API_URL = "https://devolamobile-api.manilateachersonline.com/"; // deployed
// ----------------------------------------------------

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
