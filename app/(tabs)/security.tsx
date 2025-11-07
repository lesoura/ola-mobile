"use client";

import { getData } from "@/utils/storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function SecurityScreen() {
  const [question1, setQuestion1] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [loading, setLoading] = useState(false);

  const questions = [
    "In what town was your first job?",
    "What are the last five digits of your social security system (SSS) number?",
    "What was the name of the school/company where you had your first job?",
    "What was your childhood nickname?",
    "What was your favorite place to visit?",
  ];

  const renderQuestionPicker = (label: string, selectedValue: string, setSelectedValue: (value: string) => void, disabledValue: string) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.floatingLabel}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={selectedValue} onValueChange={setSelectedValue} style={styles.picker}>
          <Picker.Item label="Select a question..." value="" />
          {questions.map((q, idx) => (
            <Picker.Item
              key={idx}
              label={q}
              value={q}
              enabled={q !== disabledValue}
              color={q === disabledValue ? "rgba(0,0,0,0.3)" : "#000"}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderInputField = (label: string, value: string, setValue: (text: string) => void, placeholder: string) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.floatingLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="rgba(0,0,0,0.4)"
      />
    </View>
  );

  const handleSave = async () => {
    if (!question1 || !question2 || !answer1 || !answer2) {
      return Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please select both questions and provide answers.",
      });
    }

    setLoading(true);
    try {
      const storedUser = await getData("user");
      if (!storedUser?.username || !storedUser?.token) throw new Error("User not authenticated");

      const body = {
        USERNAME: storedUser.username,
        IPADDRESS: "1",
        QUESTION1: question1,
        ANSWER1: answer1,
        QUESTION2: question2,
        ANSWER2: answer2,
        DEVICEID: "1"
      };

      const response = await axios.post(
        "http://172.16.20.32:45457/api/OLMS/AccountRecovery/EstablishedQA",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.token}`
          }
        }
      );

      const result = response.data?.[0];
      console.log("QA Response:", result);

      if (result?.RESPONSE_CODE === "E_20") {
        Toast.show({
          type: "error",
          text1: "SQ already Exists",
          text2: "",
        });
      } else if (result?.RESPONSE_CODE === "E_35") {
        Toast.show({
          type: "success",
          text1: "Security Questions Saved",
          text2: "",
        });
      } else {
        // fallback for unexpected responses
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result?.RESPONSE_MESSAGE || "Unexpected response from server.",
        });
      }
    } catch (error: any) {
      console.error("Error saving QA:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message || error.message || "Failed to save questions.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Secure Your Account</Text>
        <Text style={styles.cardSubtitle}>
          <Text style={{ color: "#ff5a5f", fontWeight: "bold" }}>Note:</Text> You have to assign two (2) unique questions with corresponding answers. Save once you are settled with Q and A. This will be utilized during Account Recovery if in case you forgot your password.
        </Text>
      </View>

      <View style={styles.formCard}>
        {renderQuestionPicker("Security Question 1", question1, setQuestion1, question2)}
        {renderInputField("Your Answer", answer1, setAnswer1, "Please provide your answer here")}
        {renderQuestionPicker("Security Question 2", question2, setQuestion2, question1)}
        {renderInputField("Your Answer", answer2, setAnswer2, "Please provide your answer here")}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={handleSave}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>

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
    marginBottom: 30,
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
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldContainer: {
    position: "relative",
    marginBottom: 20,
  },
  floatingLabel: {
    position: "absolute",
    top: -8,
    left: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 5,
    fontSize: 12,
    color: "#000",
    fontWeight: "bold",
    zIndex: 1,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#000",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#000",
  },
  saveButton: {
    backgroundColor: "#ff5a5f",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 50,
    width: "90%",
    alignSelf: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
