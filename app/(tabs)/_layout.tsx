import { HapticTab } from "@/components/haptic-tab";
import CenterButton from "@/components/ui/center-button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const initialTab = Array.isArray(params.initialTab) ? params.initialTab[0] : params.initialTab || "index";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName={initialTab}
        screenOptions={{
          tabBarActiveTintColor: "#ff5a5f",
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="security"
          options={{
            href: null,           // Hide route from the tab bar
            headerShown: false,
          }}
        />
         <Tabs.Screen
          name="help"
          options={{
            href: null,           // Hide route from the tab bar
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="applyforloan"
          options={{
            href: null,           // Hide route from the tab bar
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-circle" size={28} color={color} />
            ),
          }}
        />

      </Tabs>

      <View style={styles.centerButtonContainer}>
        <CenterButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
