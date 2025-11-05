"use client";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Help() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const sections = [
    {
      title: "Submitted",
      description:
        "Your loan application has been submitted to branch office for Processing, Evaluation, and Approval.",
      steps: [
        "Keep in mind the Reference ID of your loan.",
        "You will receive a notification either via email or through this website application for updates.",
        "Your loan application status will change into 'Approved' or 'Pending' depending on the evaluation result.",
      ],
    },
    {
      title: "Pending",
      description:
        "Your loan application has been approved but needs your re-confirmation for the reason that the approved loan amount differs from your requested amount and/or new terms of loan was given.",
      steps: [
        "View the details of your loan application and confirm approved amount and/or terms.",
        "Once confirmation took place, loan status will automatically change into 'Approved'. Check Approved.",
      ],
    },
    {
      title: "Approved",
      description: "Your loan application has been approved.",
      steps: [
        "View the details of your loan application and confirm loan to select loan proceeds type.",
        "Choose between 'Bank Crediting' or 'Cheque'.",
      ],
    },
    {
      title: "Confirmed",
      description:
        "You have selected a loan proceed type and confirmed your loan application. It has been submitted to branch office for releasing.",
      steps: [
        "If Bank Crediting is selected:\n- You will receive a notification either via email, mobile, or on this website application.\n- Your loan application status will change into 'Credited' once loan has been credited in to your bank account.",
        "If Cheque is selected:\n- You need to view then download a copy of loan application form.\n- Bring loan application form with you on selected appointment date.\n- You will receive a notification either via email or on this website application.\n- Instructions to claim your cheque will be indicated on the notification.\n- Your loan application status will change into 'Released' once you picked-up and received your cheque in branch office.",
      ],
    },
    {
      title: "Credited",
      description: "Your loan has been credited in your bank account.",
      steps: ["No further actions needed."],
    },
    {
      title: "Released",
      description: "Your loan has been released and received by you in branch office.",
      steps: ["No further actions needed."],
    },
    {
      title: "Cancelled",
      description:
        "You cancelled your loan application. Or it has been auto cancelled by the system if exceeds the validity period of confirmed loan application.",
      steps: ["No further actions needed."],
    },
    {
      title: "Disapproved",
      description:
        "Manager of Branch office disapproved your loan application. Reason for disapproval will be indicated on Remarks column.",
      steps: ["No further actions needed."],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Loan Status</Text>
        <Text style={styles.cardSubtitle}>
          <Text style={{ color: "#ff5a5f", fontWeight: "bold" }}>Note:</Text> Details below serve as
          guidelines on the definition of loan statuses that you may encounter on 'List of Availed
          Loans' page, along with next action steps and expectations.
        </Text>
      </View>

      {/* Collapsible Cards */}
      {sections.map((section, index) => (
        <View key={index} style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeaderRow}
            onPress={() => toggleSection(index)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>{section.title}</Text>
            <Ionicons
              name={activeIndex === index ? "chevron-up" : "chevron-down"}
              size={20}
              color="#ff5a5f"
            />
          </TouchableOpacity>

          {activeIndex === index && (
            <View style={styles.cardBody}>
              <Text style={styles.description}>{section.description}</Text>
              <Text style={styles.nextStepsTitle}>Next Steps</Text>
              {section.steps.map((step, stepIndex) => (
                <Text key={stepIndex} style={styles.stepText}>
                  • {step}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  cardHeader: {
    margin: 15,
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 40,
    borderRadius: 12,
    marginBottom: 20,
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  cardLabel: { fontSize: 16, fontWeight: "bold", color: "#000" },
  cardBody: { paddingHorizontal: 15, paddingBottom: 15 },
  description: { fontSize: 14, color: "#333", marginBottom: 8, textAlign: "justify" },
  nextStepsTitle: { fontSize: 14, fontWeight: "bold", color: "#ff5a5f", marginTop: 8 },
  stepText: { fontSize: 13, color: "#333", marginTop: 3, lineHeight: 18 },
});
