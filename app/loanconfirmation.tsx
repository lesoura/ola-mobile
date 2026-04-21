"use client";

import { getData } from "@/utils/storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function LoanConfirmation() {
  const router = useRouter();
  const { refid } = useLocalSearchParams<{ refid: string }>();

  const [otp, setOtp] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "cheque" | null>(null);
  const [loading, setLoading] = useState(false);

  const [appointmentDate, setAppointmentDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [proceedsOptions, setProceedsOptions] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  const netProceedsValue =
    selectedMethod === "bank"
      ? "Bank Crediting"
      : selectedMethod === "cheque"
      ? "Cheque"
      : null;

  useEffect(() => {
    sendOtp();
    fetchLoanType();
  }, []);

  // ================= OTP =================
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

      Toast.show({ type: "success", text1: "OTP sent" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to send OTP" });
    }
  };

  // ================= LoanType =================
  const fetchLoanType = async () => {
    try {
      const storedUser = await getData("user");

      const res = await axios.post(
        `${API_URL}api/OLMS/Reference/LoanType`,
        {
          USERNAME: storedUser.username,
          REFID: refid,
          DEVICEID: "1",
        },
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        }
      );

      const list = res.data?.Proceeds || [];
      const mapped = list.map((x: any) => x.Description.toLowerCase());

      setProceedsOptions(mapped);
    } catch (err) {
      console.log("LoanType error:", err);
    }
  };

  // ================= Appointment Validation =================
  const validateAppointment = async (date: Date) => {
    try {
      const storedUser = await getData("user");

      const formatted = `${date.toISOString().split("T")[0]}T09:00:00`;

      const res = await axios.post(
        `${API_URL}api/OLMS/Appointment/Validation`,
        {
          AppointmentDate: formatted,
          USERNAME: storedUser.username,
          IpAddress: "1",
          DEVICEID: "1",
        },
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        }
      );

      setTimeSlots(res.data?.TimeReferences || []);
      setSelectedSlot(null); // reset slot when date changes
    } catch (err) {
      console.log("Validation error:", err);
    }
  };

  // ================= Confirm =================
  const handleConfirm = async () => {
    if (
      !otp ||
      !selectedMethod ||
      (selectedMethod === "cheque" && (!appointmentDate || !selectedSlot))
    ) {
      Toast.show({
        type: "error",
        text1: "Complete all required fields",
      });
      return;
    }

    try {
      setLoading(true);

      const storedUser = await getData("user");

      const body = {
        USERNAME: storedUser.username,
        IPADDRESS: "",
        DEVICEID: "1",

        REFID_LOAN: refid,
        OTP: otp,

        STAT: "CON",

        APPT_DATE:
          selectedMethod === "cheque"
            ? `${appointmentDate.toISOString().split("T")[0]} 00:00:00`
            : "1900-01-01 00:00:00",

        APPT_CODE: selectedMethod === "cheque" ? selectedSlot?.Code : null,
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

      if (code?.startsWith("L_")) {
        Toast.show({ type: "success", text1: "Loan confirmed" });
        router.replace("/(tabs)");
        return;
      }

      if (code?.startsWith("S_")) {
        Toast.show({ type: "error", text1: "OTP issue" });
        return;
      }

      if (code?.startsWith("E_")) {
        Toast.show({ type: "error", text1: "OTP expired / invalid" });
        return;
      }

      Toast.show({ type: "error", text1: "Unexpected response" });
    } catch {
      Toast.show({ type: "error", text1: "Confirmation failed" });
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
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
              <MaterialIcons name="sms" size={20} color="#ff5a5f" />
              <TextInput
                placeholder="Enter OTP"
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
            </View>

            {/* METHODS */}
            <Text style={[styles.label, { marginTop: 20 }]}>
              Disbursement Method
            </Text>

            {proceedsOptions.includes("bank") && (
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedMethod === "bank" && styles.optionCardActive,
                ]}
                onPress={() => {
                  setSelectedMethod("bank");
                  setTimeSlots([]);
                }}
              >
                <MaterialIcons
                  name="account-balance"
                  size={24}
                  color={selectedMethod === "bank" ? "#fff" : "#ff5a5f"}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: selectedMethod === "bank" ? "#fff" : "#ff5a5f" },
                  ]}
                >
                  Bank Crediting
                </Text>
              </TouchableOpacity>
            )}

            {proceedsOptions.includes("cheque") && (
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
                    { color: selectedMethod === "cheque" ? "#fff" : "#ff5a5f" },
                  ]}
                >
                  Cheque
                </Text>
              </TouchableOpacity>
            )}

            {/* DATE */}
            {selectedMethod === "cheque" && (
              <>
                <Text style={[styles.label, { marginTop: 20 }]}>
                  Appointment Date
                </Text>

                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  style={styles.inputWrapper}
                >
                  <MaterialIcons name="calendar-today" size={20} color="#ff5a5f" />
                  <Text>
                    {appointmentDate.toISOString().split("T")[0]}
                  </Text>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={appointmentDate}
                    mode="date"
                    minimumDate={new Date()}
                    onChange={async (event, date) => {
                      setShowPicker(false);
                      if (date) {
                        setAppointmentDate(date);
                        await validateAppointment(date);
                      }
                    }}
                  />
                )}

                {/* TIME SLOTS */}
                {timeSlots.length > 0 && (
                  <>
                    <Text style={[styles.label, { marginTop: 20 }]}>
                      Time Slots
                    </Text>

                    {timeSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot.Code}
                        style={[
                          styles.optionCard,
                          selectedSlot?.Code === slot.Code &&
                            styles.optionCardActive,
                        ]}
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            {
                              color:
                                selectedSlot?.Code === slot.Code ? "#fff" : "#ff5a5f",
                            },
                          ]}
                        >
                          {slot.TimeSchedule}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </>
            )}
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

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 25
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  mainLabel: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginTop: 10 
  },
  subLabel: { 
    fontSize: 14, 
    color: "#777", 
    textAlign: "center" 
  },
  form: { 
    marginVertical: 20 
  },
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
  input: { 
    flex: 1, 
    paddingVertical: 10 
  },
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
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  topBackButton: {
    marginTop: 10,
  },
  topBackText: {
    color: "#ff5a5f",
    fontWeight: "bold",
    fontSize: 16,
  },
});