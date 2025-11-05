import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ApplyForLoan() {
  const [amount, setAmount] = useState("5000");
  const [terms, setTerms] = useState("12");

  // step 1 active
  const progress = 0.25; // 1 of 4 steps

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Card */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Calculate Loan</Text>
        <Text style={styles.cardSubtitle}>
          <Text style={{ color: "#ff5a5f", fontWeight: "bold" }}>Note:</Text> You have to select
          the amount of loan you desire. Choose the most convenient and affordable payment terms.
          You may pay a visit on your designated branch to apply for loan with any amount higher
          than 50,000.00. Then compute to see your monthly amortization. Once you are settled with
          the result of computation, you may now submit your loan by simply clicking the Apply For
          Loan button. Otherwise, click Clear to start anew.
        </Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.label}>Requested Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Terms of Loan</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={terms}
          onChangeText={setTerms}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.computeButton}>
            <Text style={styles.buttonText}>Compute</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>Completed 0 step out of 4</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: "#ff9800" }]}>Calculate Loan / Fill up Form</Text>
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
  container: {
    backgroundColor: "#f2f2f2",
    flexGrow: 1,
  },
  cardHeader: {
    margin: 15,
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 40,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#333",
    textAlign: "justify",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  computeButton: {
    flex: 1,
    backgroundColor: "#ff5a5f",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginRight: 5,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#999",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 50,
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff9800",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 10,
    textAlign: "center",
    flex: 1,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  legend: {
    fontSize: 12,
    fontWeight: "500",
  },
});
