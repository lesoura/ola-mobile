"use client";
import { saveData } from "@/utils/storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { encode as btoa } from "base-64";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  withTiming
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import MtmasIcon from "../assets/images/mtmas-icon.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // <-- added
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter your username and password.",
      });
      return;
    }

    setLoading(true); // disable button

    try {
      const encodedUsername = btoa(username);
      const encodedPassword = btoa(password);

      const response = await axios.post(
        `${API_URL}api/OLMS/User/Login`,
        {
          USERNAME: encodedUsername,
          PASSWORD: encodedPassword,
          IPADDRESS: "",
          DEVICEID: "",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const result = response.data?.[0];

      if (result?.RESPONSE_CODE === "M_0") {
        // save user data
        await saveData("user", {
          firstname: result.FIRSTNAME,
          role: result.USER_ROLE,
          token: result.TOKEN,
          email: result.EMAIL_ADDRESS,
          contact: result.CONTACT_NUMBER,
          username: encodedUsername,
          password: encodedPassword
        });

        // call FTP reference endpoint
        try {
          const ftpResponse = await axios.post(
            `${API_URL}api/OLMS/Reference/FTP`,
            {
              USERNAME: encodedUsername,
              REFID: "",
              DEVICEID: "::1"
            },
            {
              headers: {
                Authorization: `Bearer ${result.TOKEN}`,
                "Content-Type": "application/json"
              }
            }
          );

          console.log("FTP Reference Response:", ftpResponse.data);
          // save FTP reference locally
          await saveData("ftpRef", ftpResponse.data[0]);
        } catch (ftpError) {
          console.error("FTP Reference call failed:", ftpError);
        }

        Toast.show({
          type: "success",
          text1: "Login successful!",
        });

        router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2:
            result?.RESPONSE_MESSAGE === "NotExisting"
              ? "Account does not exist"
              : result?.RESPONSE_MESSAGE || "Invalid credentials",
        });
        setLoading(false); // re-enable on fail
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to connect to the server.",
      });
      setLoading(false); // re-enable on error
    }
  };

  // animation setup
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
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
          {/* Logo */}
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
                  secureTextEntry={!showPassword}  // <-- toggle here
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#ff5a5f"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => router.push("/forgotpassword")}>
                <Text style={styles.forgot}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                style={[styles.loginButton, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signUpContainer}>
                <Text>Don’t have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/registration")}>
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
