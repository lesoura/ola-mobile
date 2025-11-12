"use client";
import { getData } from "@/utils/storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function ApplyForLoan() {
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState("");
  const [amountOptions, setAmountOptions] = useState<number[]>([]);
  const [termOptions, setTermOptions] = useState<string[]>([]);
  const [monthlyAmort, setMonthlyAmort] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [computed, setComputed] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const progress = 0.25;

  useEffect(() => {
    const fetchUserAndRefs = async () => {
      const storedUser = await getData("user");
      if (!storedUser) return;
      setUser(storedUser);

      const body = { USERNAME: storedUser.username, REFID: "", DEVICEID: "::1" };
      try {
        const [amtRes, termRes] = await Promise.all([
          axios.post("http://172.16.20.32:45457/api/OLMS/Reference/Loan/Amount", body, { headers: { Authorization: `Bearer ${storedUser.token}` } }),
          axios.post("http://172.16.20.32:45457/api/OLMS/Reference/Loan/Term", body, { headers: { Authorization: `Bearer ${storedUser.token}` } }),
        ]);
        setAmountOptions(amtRes.data.map((a: any) => a.AMT));
        setAmount(amtRes.data[0]?.AMT?.toString() || "");
        setTermOptions(termRes.data.map((t: any) => t.TRM));
        setTerms(termRes.data[0]?.TRM || "");
      } catch (err) {
        console.error(err);
        Toast.show({ type: "error", text1: "Error fetching reference data" });
      } finally {
        setLoadingRefs(false);
      }
    };
    fetchUserAndRefs();
  }, []);

  const handleCompute = async () => {
    if (!user) {
      Toast.show({ type: "error", text1: "User not found", text2: "Please log in again." });
      return;
    }
    setLoading(true);
    try {
      const body = { PRINCIPAL: amount, TERMS: terms, USERNAME: user.username, DEVICEID: "::1" };
      const res = await axios.post(
        "http://172.16.20.32:45457/api/OLMS/Loan/Calculator",
        body,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const amortValue = res.data?.[0]?.Monthly_Amortization;
      if (amortValue) {
        setMonthlyAmort(amortValue.toString());
        setComputed(true);
        Toast.show({ type: "success", text1: "Computation Successful" });
      } else {
        Toast.show({ type: "error", text1: "Error", text2: "No amortization returned" });
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Unable to compute loan" });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setAmount(amountOptions[0]?.toString() || "");
    setTerms(termOptions[0] || "");
    setMonthlyAmort(null);
    setComputed(false);
    Toast.show({ type: "info", text1: "Cleared", text2: "Fields have been reset." });
  };

  const handleApplyLoan = () => {
    Toast.show({ type: "info", text1: "Apply for Loan", text2: "Proceeding to next step..." });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Calculate Loan</Text>
        <Text style={styles.cardSubtitle}>
          <Text style={{ color: "#ff5a5f", fontWeight: "bold" }}>Note:</Text> Select your desired
          loan amount and terms. For loans above ₱50,000, visit your branch. Compute to view your
          monthly amortization, then click Apply for Loan or Clear to reset.
        </Text>
      </View>

      <View style={{ marginHorizontal: 0 }}>
        {loadingRefs ? (
          <ActivityIndicator size="large" color="#ff5a5f" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.label}>Requested Amount</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={amount} onValueChange={(v) => setAmount(v)}>
                {amountOptions.map((val) => (
                  <Picker.Item key={val} label={`₱${val.toLocaleString()}`} value={val.toString()} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Terms of Loan</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={terms} onValueChange={(v) => setTerms(v)}>
                {termOptions.map((val) => (
                  <Picker.Item key={val} label={`${val} months`} value={val} />
                ))}
              </Picker>
            </View>

            {monthlyAmort && (
              <View style={styles.amortBox}>
                <Text style={styles.label}>Monthly Amortization</Text>
                <Text style={styles.amortValue}>₱{parseFloat(monthlyAmort).toLocaleString()}</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.computeButton, loading && { opacity: 0.7 }]}
                onPress={computed ? handleApplyLoan : handleCompute}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{computed ? "Apply for Loan" : "Compute"}</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>Completed 0 step out of 4</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: "#ff9800" }]}>
              Calculate Loan / Fill up Form
            </Text>
            <Text style={styles.progressLabel}>Approval</Text>
            <Text style={styles.progressLabel}>Confirm Loan</Text>
            <Text style={styles.progressLabel}>Credit / Release</Text>
          </View>
        </View>

        <View style={styles.legendRow}>
          <Text style={[styles.legend, { color: "#4caf50" }]}>● Completed</Text>
          <Text style={[styles.legend, { color: "#ff9800" }]}>● In-Progress</Text>
          <Text style={[styles.legend, { color: "#bbb" }]}>● Not Started</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f2f2f2", flexGrow: 1 },
  cardHeader: { margin: 15, backgroundColor: "#fff", padding: 20, marginTop: 40, borderRadius: 12, marginBottom: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 24, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 10 },
  cardSubtitle: { fontSize: 14, color: "#333", textAlign: "justify" },
  formCard: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#ddd", padding: 20, marginHorizontal: 15, marginBottom: 5 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5, color: "#000" },
  pickerContainer: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 15, overflow: "hidden", backgroundColor: "#fff" },
  amortBox: { backgroundColor: "#f9f9f9", borderRadius: 8, borderWidth: 1, borderColor: "#ddd", padding: 5, marginTop: 5, marginBottom: 20 },
  amortValue: { fontSize: 16, fontWeight: "bold", color: "#ff5a5f" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  computeButton: { flex: 1, backgroundColor: "#ff5a5f", paddingVertical: 14, borderRadius: 25, alignItems: "center", marginRight: 5 },
  clearButton: { flex: 1, backgroundColor: "#999", paddingVertical: 14, borderRadius: 25, alignItems: "center", marginLeft: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 50,
  },
  progressText: { textAlign: "center", fontSize: 14, fontWeight: "500", marginBottom: 10 },
  progressContainer: { marginBottom: 5 },
  progressBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#ff9800" },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabel: { fontSize: 10, textAlign: "center", flex: 1 },
  legendRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 5 },
  legend: { fontSize: 12, fontWeight: "500" },
});
