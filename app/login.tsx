"use client";

import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { encode as btoa } from "base-64";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import MtmasIcon from "../assets/images/mtmas-icon.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Missing Information", "Please enter your username and password.");
      return;
    }

    try {
      const encodedUsername = btoa(username);
      const encodedPassword = btoa(password);

      const response = await axios.post(
        "http://172.16.20.32:45457/api/OLMS/User/Login",
        {
          USERNAME: encodedUsername,
          PASSWORD: encodedPassword,
          IPADDRESS: "",
          DEVICEID: "",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = response.data?.[0];

      if (result?.RESPONSE_CODE === "M_0") {
        Alert.alert("Success", "Login successful!");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", result?.RESPONSE_MESSAGE || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to connect to the server.");
    }
  };

  // Animation setup (moved to useEffect so it doesn't run on render)
  const waveOffset = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Top Image */}
          <Animated.View style={[styles.imageContainer, animatedStyle]}>
            <Image source={MtmasIcon} style={styles.image} resizeMode="contain" />
            <View style={styles.ribbon} />
            <Svg
              width={SCREEN_WIDTH}
              height={50}
              style={{ position: "absolute", bottom: 0 }}
              viewBox={`0 0 ${SCREEN_WIDTH} 50`}
            >
              <Path
                fill="#f2f2f2"
                d={`M0 30 Q${SCREEN_WIDTH / 4} 10 ${SCREEN_WIDTH / 2} 30 T${SCREEN_WIDTH} 30 V50 H0 Z`}
              />
            </Svg>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.bottomFormContainer, animatedStyle]}>
            <View>
              <Text style={styles.title}>Sign In</Text>

              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#ff5a5f" style={styles.icon} />
                <TextInput
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#ff5a5f" style={styles.icon} />
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity>
                <Text style={styles.forgot}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>

              <View style={styles.signUpContainer}>
                <Text>Don’t have an account? </Text>
                <TouchableOpacity>
                  <Text style={styles.signUpText}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "space-between" },
  imageContainer: { width: "100%", height: "50%", overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  ribbon: {
    position: "absolute",
    top: -20,
    left: 15,
    width: "160%",
    height: 70,
    backgroundColor: "#ff5a5f",
    transform: [{ rotate: "-130deg" }],
    opacity: 0.9,
  },
  bottomFormContainer: {
    backgroundColor: "#f2f2f2",
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5, color: "#555" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ff5a5f",
    marginBottom: 10,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: "#000",
    backgroundColor: "transparent",
  },
  forgot: { color: "#ff5a5f", textAlign: "right", marginBottom: 20 },
  loginButton: {
    backgroundColor: "#ff5a5f",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  signUpContainer: { flexDirection: "row", justifyContent: "center" },
  signUpText: { color: "#ff5a5f", fontWeight: "bold" },
});
