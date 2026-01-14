"use client";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function LoanConfirmation() {
  const router = useRouter();

  // UI state only (no functions wired)
  const [otp, setOtp] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "cheque" | null>(null);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.topBackButton} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.topBackText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Ionicons name="document-text-outline" size={70} color="#ff5a5f" />
            <Text style={styles.mainLabel}>Loan Confirmation</Text>
            <Text style={styles.subLabel}>
              Enter OTP to confirm and choose disbursement
            </Text>
          </View>

          <View style={styles.form}>
            {/* OTP FIELD */}
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

            {/* DISBURSEMENT METHOD */}
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
            style={styles.confirmButton}
            onPress={() => router.replace("/(tabs)")}
            >
        <Text style={styles.confirmButtonText}>Confirm Loan</Text>
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
