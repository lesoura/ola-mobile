"use client";

import { getData } from "@/utils/storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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

export default function LoanConfirmation() {
  const router = useRouter();
  const { refid } = useLocalSearchParams<{ refid: string }>();

  const [otp, setOtp] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "cheque" | null>(null);
  const [loading, setLoading] = useState(false);

  const netProceedsValue =
  selectedMethod === "bank"
    ? "Bank Crediting"
    : "Cheque";

  useEffect(() => {
    sendOtp();
  }, []);

  const sendOtp = async () => {
  try {
    const storedUser = await getData("user");

    await axios.post(
      `${API_URL}api/OLMS/User/Loan/Resubmission/Authentication`,
      {
        USERNAME: storedUser.username,
        PASSWORD: "",
        IPADDRESS: "",
        DEVICEID: "1",
      },
      {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      }
    );

    Toast.show({
      type: "success",
      text1: "OTP sent",
    });
  } catch (err) {
    Toast.show({
      type: "error",
      text1: "Failed to send OTP",
    });
  }
};

  const handleConfirm = async () => {
    if (!otp || !selectedMethod) {
      Toast.show({
        type: "error",
        text1: "OTP and method are required",
      });
      return;
    }

    try {
      setLoading(true);

      const storedUser = await getData("user");
      if (!storedUser) throw new Error("No user found");

      // MAP UI → BACKEND DTO
      const body = {
        USERNAME: storedUser.username,
        IPADDRESS: "",
        DEVICEID: "1",

        REFID_LOAN: refid,
        OTP: otp,

        // backend expects STAT (NOT disbursement method)
        STAT: "CON",

        // optional fields (safe defaults since backend allows them)
        APPT_DATE: "1900-01-01 00:00:00",
        APPT_CODE: null,
        NETPROCEEDS: netProceedsValue,
      };

      const res = await axios.post(
        `${API_URL}api/OLMS/User/Loan/Resubmission/Verify`,
        body,
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        }
      );

      const code = res?.data?.[0]?.RESPONSE_CODE;

      // HANDLE BACKEND RESPONSES
      if (code?.startsWith("L_")) {
        Toast.show({ type: "success", text1: "Loan confirmed" });
        router.replace("/(tabs)");
        return;
      }

      if (code?.startsWith("S_")) {
        Toast.show({
          type: "error",
          text1: "OTP issue (SMS)",
        });
        return;
      }

      if (code?.startsWith("E_")) {
        Toast.show({
          type: "error",
          text1: "OTP expired / invalid",
        });
        return;
      }

      Toast.show({
        type: "error",
        text1: "Unexpected response",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Confirmation failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.topBackButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.topBackText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Ionicons name="document-text-outline" size={70} color="#ff5a5f" />
            <Text style={styles.mainLabel}>Loan Confirmation</Text>
            <Text style={styles.subLabel}>
              Enter OTP and confirm transaction
            </Text>
          </View>

          <View style={styles.form}>
            {/* OTP */}
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

            {/* METHOD (UI ONLY - NOT SENT TO API) */}
            <Text style={[styles.label, { marginTop: 20 }]}>
              Disbursement Method
            </Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedMethod === "bank" && styles.optionCardActive,
              ]}
              onPress={() => setSelectedMethod("bank")}
            >
              <MaterialIcons
                name="account-balance"
                size={24}
                color={selectedMethod === "bank" ? "#fff" : "#ff5a5f"}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedMethod === "bank" && { color: "#fff" },
                ]}
              >
                Bank Crediting
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedMethod === "cheque" && styles.optionCardActive,
              ]}
              onPress={() => setSelectedMethod("cheque")}
            >
              <MaterialIcons
                name="receipt-long"
                size={24}
                color={selectedMethod === "cheque" ? "#fff" : "#ff5a5f"}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedMethod === "cheque" && { color: "#fff" },
                ]}
              >
                Cheque Disbursement
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, loading && { opacity: 0.6 }]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? "Processing..." : "Confirm Loan"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 25 },

  headerContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  mainLabel: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  subLabel: { fontSize: 14, color: "#777", textAlign: "center" },

  form: { marginVertical: 20 },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#555",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ff5a5f",
    marginBottom: 15,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 10, color: "#000" },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ff5a5f",
    marginBottom: 12,
  },
  optionCardActive: {
    backgroundColor: "#ff5a5f",
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#ff5a5f",
  },

  confirmButton: {
    backgroundColor: "#ff5a5f",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

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
