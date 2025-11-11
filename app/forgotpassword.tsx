"use client";

import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { encode as btoa } from "base-64";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function ForgotPassword() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [retrieveType, setRetrieveType] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseCode, setResponseCode] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [token, setToken] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const securityQuestions = [
    "In what town was your first job?",
    "What are the last five digits of your Social Security System (SSS) number?",
    "What was the name of the school/company where you had your first job?",
    "What was your childhood nickname?",
    "What was your favorite place to visit?",
  ];

  const resetForm = () => {
    setUsername("");
    setRetrieveType("");
    setLoading(false);
    setResponseCode("");
    setSecurityQuestion("");
    setSecurityAnswer("");
    setEmail("");
    setPin("");
    setShowPasswordForm(false);
    setToken("");
    setNewPass("");
    setConfirmPass("");
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const encodedUsername = btoa(username);

      // STEP 1: Username check
        if (!responseCode && !showPasswordForm) {
          if (!username || !retrieveType) {
            setLoading(false);
            return Toast.show({
              type: "error",
              text1: "Missing Information",
              text2: "Please fill all required fields.",
            });
          }

          const arType = retrieveType === "security" ? "0" : "1";

          const response = await axios.post(
            "http://172.16.20.32:45457/api/OLMS/AccountRecovery/Check/Username",
            {
              USERNAME: encodedUsername,
              ARTYPE: arType,
              DEVICEID: "1",
            },
            { headers: { "Content-Type": "application/json" } }
          );

          const result = response.data?.[0];
          console.log("Username Check Response:", result);

          if (result?.RESPONSE_CODE === "S_20") {
            Toast.show({ type: "success", text1: "Username exists" });
            setResponseCode("S_20");
          } else if (result?.RESPONSE_CODE === "T_19") {
            // Call OTP API immediately
            try {
              const otpRes = await axios.post(
                "http://172.16.20.32:45457/api/OLMS/AccountRecovery/Send/OTP",
                {
                  USERNAME: encodedUsername,
                  IPADDRESS: "1",
                  DEVICEID: "::1",
                },
                { headers: { "Content-Type": "application/json" } }
              );

              console.log("OTP Sent Response:", otpRes.data?.[0]);
              Toast.show({ type: "success", text1: "OTP sent successfully!" });
              setResponseCode("T_19"); // show OTP form
            } catch (error: unknown) {
          console.error("OTP Error:", error);

          let errorMessage = "Unknown error";
          if (error instanceof Error) {
            errorMessage = error.message;
          }

          Toast.show({
            type: "error",
            text1: "Failed to send OTP",
            text2: errorMessage,
          });
        }

        } else if (result?.RESPONSE_CODE === "M_2") {
          Toast.show({ type: "error", text1: "Username not found" });
        } else {
          Toast.show({
            type: "info",
            text1: "Response",
            text2: result?.RESPONSE_CODE || "Unknown response",
          });
        }
        return;
      }

      // STEP 2: Security question verification
      if (responseCode === "S_20" && !showPasswordForm) {
        if (!securityQuestion || !securityAnswer) {
          setLoading(false);
          return Toast.show({
            type: "error",
            text1: "Incomplete",
            text2: "Please answer your security question.",
          });
        }

        const secRes = await axios.post(
          "http://172.16.20.32:45457/api/OLMS/AccountRecovery/Check/Security",
          {
            USERNAME: encodedUsername,
            IPADDRESS: "1",
            SECURITYQUESTION: securityQuestion,
            SECURITYANSWER: securityAnswer,
            DEVICEID: "1",
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const secResult = secRes.data?.[0];
        console.log("Security Check Response:", secResult);

        switch (secResult?.RESPONSE_CODE) {
          case "T_2":
            Toast.show({ type: "success", text1: "Security answer verified!" });
            setToken(secResult?.TOKEN || "");
            setShowPasswordForm(true);
            break;
          case "S_23":
            Toast.show({ type: "error", text1: "Question mismatch" });
            break;
          case "S_25":
            Toast.show({ type: "error", text1: "Wrong answer" });
            break;
          default:
            Toast.show({
              type: "info",
              text1: "Response",
              text2: secResult?.RESPONSE_CODE || "Unknown response",
            });
        }
        return;
      }

      // STEP 3: Change password
      if (showPasswordForm && token) {
        if (!newPass || !confirmPass) {
          setLoading(false);
          return Toast.show({
            type: "error",
            text1: "Missing Fields",
            text2: "Please fill in both password fields.",
          });
        }

        if (newPass !== confirmPass) {
          setLoading(false);
          return Toast.show({
            type: "error",
            text1: "Password Mismatch",
            text2: "Passwords do not match.",
          });
        }

        const passRes = await axios.post(
          "http://172.16.20.32:45457/api/OLMS/AccountRecovery/ChangePassword",
          {
            LOCK: "1",
            USERNAME: encodedUsername,
            IPADDRESS: "1",
            NEWPASS: newPass,
            CONFIRMPASS: confirmPass,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const passResult = passRes.data?.[0];
        console.log("Password Change Response:", passResult);

        if (passResult?.RESPONSE_CODE === "A_32") {
          Toast.show({
            type: "success",
            text1: "Password changed successfully!",
          });
          resetForm();
          setResponseCode("");
          setTimeout(() => {
            router.replace("/login");
          }, 1500);
        } else {
          Toast.show({
            type: "error",
            text1: "Password change failed",
            text2: passResult?.RESPONSE_CODE || "Unknown error",
          });
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSecurityForm = () => (
    <View style={styles.formCard}>
      <View style={styles.fieldContainer}>
        <Text style={styles.floatingLabel}>Security Question</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={securityQuestion}
            onValueChange={setSecurityQuestion}
            style={styles.picker}
          >
            <Picker.Item label="Select a question..." value="" />
            {securityQuestions.map((q, idx) => (
              <Picker.Item key={idx} label={q} value={q} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.floatingLabel}>Your Answer</Text>
        <TextInput
          style={styles.input}
          value={securityAnswer}
          onChangeText={setSecurityAnswer}
          placeholder="Provide your answer"
          placeholderTextColor="rgba(0,0,0,0.4)"
        />
      </View>
    </View>
  );

  const renderPasswordForm = () => (
    <View style={styles.formCard}>
      <View style={styles.fieldContainer}>
        <Text style={styles.floatingLabel}>New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPass}
          onChangeText={setNewPass}
          placeholder="Enter new password"
          placeholderTextColor="rgba(0,0,0,0.4)"
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.floatingLabel}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPass}
          onChangeText={setConfirmPass}
          placeholder="Confirm new password"
          placeholderTextColor="rgba(0,0,0,0.4)"
        />
      </View>
    </View>
  );

  // OTP verification function
  const handleVerify = async () => {
    if (!email || !pin) {
      return Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please provide email and pin.",
      });
    }

    setLoading(true);

    try {
      const encodedUsername = btoa(username || "");

      const response = await axios.post(
        "http://172.16.20.32:45457/api/OLMS/AccountRecovery/Check/OTP",
        {
          Username: encodedUsername,
          EmailAddress: email, // match API field name
          IpAddress: "1",
          OTP: pin,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const result = response.data?.[0];
      console.log("OTP Verify Response:", result);

      if (result?.RESPONSE_CODE === "S_0") {
        Toast.show({ type: "success", text1: "OTP verified!" });
        setToken(result.TOKEN || "");
        setShowPasswordForm(true); // show password form
      } else {
        Toast.show({
          type: "error",
          text1: "OTP Verification Failed",
          text2: result?.RESPONSE_CODE || "Unknown response",
        });
      }
    } catch (error: any) {
      console.error("OTP Verify Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message || error?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  // OTP form component
  const renderOtpForm = () => (
    <View style={styles.formCard}>
      <View style={styles.fieldContainer}>
        <Text style={styles.floatingLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="rgba(0,0,0,0.4)"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.floatingLabel}>Pin Code</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          placeholder="Enter pin"
          placeholderTextColor="rgba(0,0,0,0.4)"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={[styles.sendCodeButton, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={handleVerify} // call external function
      >
        {loading ? (
          <ActivityIndicator color="#ff5a5f" />
        ) : (
          <Text style={styles.sendCodeButtonText}>Verify</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Having difficulty logging in?</Text>
        <Text style={styles.cardSubtitle}>
          Provide the necessary information for us to assist you.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.fieldContainer}>
          <Text style={styles.floatingLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.floatingLabel}>Retrieve Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={retrieveType}
              onValueChange={setRetrieveType}
              style={styles.picker}
            >
              <Picker.Item label="Select method..." value="" />
              <Picker.Item label="Security Question" value="security" />
              <Picker.Item label="PIN via Email/SMS" value="pin" />
            </Picker>
          </View>
        </View>

        {retrieveType && (
          <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
            <Text style={styles.resetButtonText}>Choose another option</Text>
          </TouchableOpacity>
        )}
      </View>

      {responseCode === "S_20" && !showPasswordForm && renderSecurityForm()}
      {responseCode === "T_19" && !showPasswordForm && renderOtpForm()}
      {showPasswordForm && renderPasswordForm()}

      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={handleSubmit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {showPasswordForm ? "Change Password" : "Submit"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f2f2f2",
    flexGrow: 1,
    paddingBottom: 40,
  },
  cardHeader: {
    margin: 15,
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 40,
    borderRadius: 12,
    marginBottom: 15,
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
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldContainer: {
    position: "relative",
    marginBottom: 15,
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
  submitButton: {
    backgroundColor: "#ff5a5f",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
    width: "90%",
    alignSelf: "center",
  },
  sendCodeButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ff5a5f",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
  },
  sendCodeButtonText: {
    color: "#ff5a5f",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    marginTop: 15,
    alignSelf: "center",
  },
  backButtonText: {
    color: "#ff5a5f",
    fontWeight: "bold",
    fontSize: 16,
  },
  resetButton: {
    marginTop: 5,
    alignSelf: "center",
  },
  resetButtonText: {
    color: "#ff5a5f",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
