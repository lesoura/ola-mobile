import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import CustomToastConfig from './customtoast';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Provider as PaperProvider } from 'react-native-paper';

   // ------------------ Global API URL ------------------
   global.API_URL = "https://devolamobile-api.manilateachersonline.com/"; // deployed
 // global.API_URL = "http://172.16.20.32:45457/"; // local
// ----------------------------------------------------

   // ------------------ Authors ------------------
  // API - Mike Moraga (Lord, Master, Teacher, Mentor, Wizard, Senior, MILF Magnet, Aura Farmer, & Clit Destroyer Via Infinite Loop)
 // UI - Marvirt (Pogi)
// ----------------------------------------------------

export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

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

      {/* ✅ Move Toast outside of Stack/Layout */}
      <Toast config={CustomToastConfig} />
    </>
  );
}
