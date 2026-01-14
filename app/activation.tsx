"use client";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { encode as btoa } from "base-64";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import CustomModalConfig from "./customconfirmation";

export default function Activation() {
  const router = useRouter();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const encodedUsername = btoa(credential);
  const encodedPassword = btoa(password);
  const [showModal, setShowModal] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);

  useEffect(() => {
  if (resendCooldown <= 0) return;

  const interval = setInterval(() => {
    setResendCooldown(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleActivate = async () => {
    if (!credential.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter your contact/email and password.",
      });
      return;
    }

    setLoading(true);

    try {
      // Get token from AsyncStorage (saved in Registration Step 1)
      const token = await AsyncStorage.getItem("registrationToken");
      if (!token) {
      Toast.show({ type: "error", text1: "Registration token missing" });
      setLoading(false);
      return;
      }

      if (!otpSent) {
        const emailRes = await axios.post(
          `${API_URL}api/OLMS/User/Registration/EmailVerification`,
          {
            USERNAME: encodedUsername,
            PASSWORD: encodedPassword,
            IPADDRESS: "1",
            DEVICEID: "::1",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const emailData = emailRes.data?.[0];
        if (!emailData || !emailData.RCS) {
          Toast.show({ type: "error", text1: "Failed to send OTP" });
          setLoading(false);
          return;
        }

        Toast.show({ type: "success", text1: "OTP sent to your email/SMS" });
        setOtpSent(true);

        setOtpSentTime(Date.now()); // store timestamp of first successful OTP
        setResendCooldown(15 * 60); // 15 minutes in seconds

      } else {
        if (!otp.trim()) {
          Toast.show({ type: "error", text1: "Please enter OTP" });
          setLoading(false);
          return;
        }

        // 2. Verify OTP with same Bearer token
        const smsRes = await axios.post(
          `${API_URL}api/OLMS/User/Registration/SMSVerification`,
          {
            USERNAME: encodedUsername,
            PASSWORD: encodedPassword,
            IPADDRESS: "1",
            DEVICEID: "::1",
            OTP: otp,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const smsData = smsRes.data?.[0];
        if (smsData?.RESPONSE_CODE?.startsWith("RO_")) {
          Toast.show({ type: "success", text1: "Activation successful" });
          router.replace("/login");
        } else {
          Toast.show({ type: "error", text1: smsData?.RESPONSE_MESSAGE || "Activation failed" });
        }
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Activation failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
  if (resendCooldown > 0) return; // prevent resend during cooldown

  try {
    const token = await AsyncStorage.getItem("registrationToken");
    if (!token) {
      Toast.show({ type: "error", text1: "Registration token missing" });
      return;
    }

    const resendRes = await axios.post(
      `${API_URL}api/OLMS/User/Registration/OTP/Resend`,
      {
        USERNAME: encodedUsername,
        PASSWORD: encodedPassword,
        IPADDRESS: "1",
        DEVICEID: "::1",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const resendData = resendRes.data?.[0];

    if (!resendData || !resendData.RCS) {
      Toast.show({ type: "error", text1: "Failed to resend OTP" });
      return;
    }

    Toast.show({ type: "success", text1: "OTP resent successfully" });

    // Start 15-minute cooldown
    setResendCooldown(15 * 60); // 15 minutes in seconds

  } catch (err) {
    console.error(err);
    Toast.show({ type: "error", text1: "Resend failed" });
  }
};

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {showModal && (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
              {CustomModalConfig.default({
                title: "Reminder",
                message: "Account activation is valid only for 15 minutes after registration.",
                onConfirm: () => setShowModal(false),
                onCancel: () => router.replace("/login"),
              })}
            </View>
          )}

          <TouchableOpacity style={styles.topBackButton} onPress={() => router.back()}>
            <Text style={styles.topBackText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContainer}>
            <Ionicons name="checkmark-circle-outline" size={70} color="#ff5a5f" />
            <Text style={styles.mainLabel}>Account Activation</Text>
            <Text style={styles.subLabel}>Provide your credentials below</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Contact Number or Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#ff5a5f" style={styles.icon} />
              <TextInput
                placeholder="Enter contact or email"
                placeholderTextColor="#999"
                style={styles.input}
                value={credential}
                onChangeText={setCredential}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#ff5a5f" style={styles.icon} />
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#ff5a5f" />
              </TouchableOpacity>
            </View>

           {otpSent && (
            <>
              <Text style={styles.label}>OTP</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="sms" size={20} color="#ff5a5f" style={styles.icon} />
                <TextInput
                  placeholder="Enter OTP"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                />
              </View>

              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={resendCooldown > 0}
                style={{ marginTop: 10 }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: resendCooldown > 0 ? "#aaa" : "#ff5a5f",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          </View>

          <TouchableOpacity
            style={[styles.activateButton, loading && { opacity: 0.7 }]}
            onPress={handleActivate}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.activateButtonText}>{otpSent ? "Verify OTP" : "Send OTP"}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 25 },
  headerContainer: { alignItems: "center", marginTop: 60, marginBottom: 40 },
  mainLabel: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  subLabel: { fontSize: 14, color: "#777" },
  form: { marginVertical: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5, color: "#555" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ff5a5f",
    marginBottom: 15,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 10, color: "#000" },
  activateButton: {
    backgroundColor: "#ff5a5f",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  activateButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
   topBackButton: {
    marginTop: 10,
    marginLeft: -10,
  },
  topBackText: {
    color: "#ff5a5f",
    fontWeight: "bold",
    fontSize: 16,
  },
});
