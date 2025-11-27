"use client";

import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from 'react-native-toast-message';

export default function Registration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const [accountNo, setAccountNo] = useState("");
  const [employeeNo, setEmployeeNo] = useState("");
  const [divisionNo, setDivisionNo] = useState("");
  const [stationNo, setStationNo] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const steps = [
    "Work-Related Information",
    "Personal Information",
    "Other Personal Information",
    "User Authentication",
  ];

  const handleNext = async () => {
    if (isLoading) return;

    // Step 1 validation
    if (!accountNo || !employeeNo || !divisionNo || !stationNo || !email || !mobile) {
      Toast.show({
        type: "error",
        text1: "Please fill out all required fields",
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      ACCNO: accountNo,
      EMPNO: employeeNo,
      DIVNO: divisionNo,
      STANO: stationNo,
      NUM: mobile,
      EMAIL: email,
    };

    try {
      const res = await fetch(`${API_URL}api/OLMS/User/Registration/Validation/WRI`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data?.[0]?.RESPONSE_CODE === "R_0") {
        const token = data[0].TOKEN;
        setRegistrationToken(token);
        setCurrentStep(prev => prev + 1);
        Toast.show({
          type: "success",
          text1: "Step 1 completed successfully",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Validation failed",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-format passbook number as "2-413-12-312312"
  const formatPassbook = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 12); // max 12 digits
    let formatted = "";
    if (digits.length > 0) formatted += digits[0];
    if (digits.length > 1) formatted += "-" + digits.slice(1, 4);
    if (digits.length > 4) formatted += "-" + digits.slice(4, 6);
    if (digits.length > 6) formatted += "-" + digits.slice(6);
    return formatted;
  };

  const handleNextStep2 = async (password: string, confirmPassword: string) => {
    if (isLoading) return;
      if (!firstName || !middleName || !lastName || !birthDate || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Please fill out all required fields",
      });
      return;
    }

    // Step 2 validation
    if (!birthDate || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Please fill out all required fields",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      ACCNO: accountNo,
      EMPNO: employeeNo,
      DIVNO: divisionNo,
      STANO: stationNo,
      BIRTHDATE: birthDate.toISOString().split("T")[0],
      USERNAME: email,
    };

    try {
      const res = await fetch(`${API_URL}api/OLMS/User/Registration/Validation/PI`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${registrationToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data?.[0]?.RESPONSE_CODE === "R_0" || data?.[0]?.RESPONSE_CODE === "R_17") {
        setCurrentStep(prev => prev + 1);
        Toast.show({
          type: "success",
          text1: "Step completed successfully",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Validation failed",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back to previous page */}
      <TouchableOpacity style={styles.topBackButton} onPress={() => router.back()}>
        <Text style={styles.topBackText}>← Back</Text>
      </TouchableOpacity>

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Registration</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressWrapper}>
        {steps.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressStep,
              idx <= currentStep && styles.activeStep,
            ]}
          />
        ))}
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.cardTitle}>{steps[currentStep]}</Text>

        {currentStep === 0 && (
          <>
            <Text style={styles.label}>Account Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="badge" size={20} color="#ff5a5f" style={styles.icon} />
              <TextInput
                placeholder="_-___-__-______"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                style={styles.input}
                value={accountNo}
                onChangeText={text => setAccountNo(formatPassbook(text))}
              />
            </View>

            <Text style={styles.label}>Employee Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="badge" size={20} color="#ff5a5f" style={styles.icon} />
              <TextInput
                placeholder="Enter your employee number"
                placeholderTextColor="#999"
                style={styles.input}
                value={employeeNo}
                onChangeText={setEmployeeNo}
              />
            </View>

            <Text style={styles.label}>Division Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="domain" size={20} color="#ff5a5f" style={styles.icon} />
              <TextInput
                placeholder="Enter your division number"
                placeholderTextColor="#999"
                style={styles.input}
                value={divisionNo}
                onChangeText={setDivisionNo}
              />
            </View>

            <Text style={styles.label}>Station Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="location-on" size={20} color="#ff5a5f" style={styles.icon} />
              <TextInput
                placeholder="Enter your station number"
                placeholderTextColor="#999"
                style={styles.input}
                value={stationNo}
                onChangeText={setStationNo}
              />
            </View>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#ff5a5f" style={styles.icon} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#999"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={20} color="#ff5a5f" style={styles.icon} />
              <TextInput
                placeholder="Enter your mobile number"
                placeholderTextColor="#999"
                style={styles.input}
                value={mobile}
                onChangeText={setMobile}
              />
            </View>
          </>
        )}

        {currentStep === 1 && (
        <>
          <Text style={styles.label}>Account Number</Text>
          <View style={[styles.inputWrapper, styles.disabledInputWrapper]}>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={accountNo} // from step 1
              editable={false}
            />
          </View>

          <Text style={styles.label}>First Name *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <Text style={styles.label}>Middle Name *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your middle name"
              value={middleName}
              onChangeText={setMiddleName}
            />
          </View>

          <Text style={styles.label}>Last Name *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

         <Text style={styles.label}>Date of Birth *</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.inputWrapper}>
            <Text>{birthDate.toISOString().split('T')[0]}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setBirthDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Username</Text>
          <View style={[styles.inputWrapper, styles.disabledInputWrapper]}>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email} // from step 1
              editable={false}
            />
          </View>

          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Text style={styles.label}>Confirm Password *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </>
      )}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep((prev) => prev - 1)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < steps.length - 1 && (
          <TouchableOpacity
            style={[styles.nextButton, isLoading && { opacity: 0.6 }]}
            onPress={() => {
              if (currentStep === 0) {
                handleNext(); // step 1
              } else if (currentStep === 1) {
                handleNextStep2(password, confirmPassword); // step 2
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? "Validating..." : "Next"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f2f2f2",
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 15,
  },
  topBackButton: {
    marginTop: 40,
  },
  topBackText: {
    color: "#ff5a5f",
    fontWeight: "bold",
    fontSize: 16,
  },
  pageHeader: {
    marginTop: 20,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  progressWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
    gap: 8,
  },
  progressStep: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ddd",
  },
  activeStep: {
    backgroundColor: "#ff5a5f",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
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
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: "#000",
    backgroundColor: "transparent",
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: "#ff5a5f",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    borderColor: "#ff5a5f",
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  backButtonText: {
    color: "#ff5a5f",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledInputWrapper: {
  backgroundColor: "#eee", // greyed background
  borderBottomColor: "#ccc",
  },
  disabledInput: {
    fontWeight: "bold",
    color: "#555", // dark grey text
  },
});
