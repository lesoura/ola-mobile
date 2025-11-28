"use client";

import { TERMS_TEXT } from "@/terms";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as CryptoJS from "crypto-js";
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
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [subdivision, setSubdivision] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
        // Save it to AsyncStorage
        await AsyncStorage.setItem("registrationToken", token);
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

  const encodePassword = (password: string, salt: string) => {
    // Step 1: combine salt + password
    const combined = salt + password;

    // Step 2: SHA1 hash (UTF-16 LE)
    const sha1Hash = CryptoJS.SHA1(CryptoJS.enc.Utf16LE.parse(combined));

    // Step 3: Base64 encode
    const base64 = CryptoJS.enc.Base64.stringify(sha1Hash);

    // Step 4: MD5 hash
    const md5Hash = CryptoJS.MD5(base64);

    // Step 5: Convert MD5 bytes to BitConverter-style hex with dashes
    const words = md5Hash.words;
    const hexArray: string[] = [];
    for (let i = 0; i < words.length; i++) {
      // words are 32-bit, so split into 4 bytes
      for (let b = 3; b >= 0; b--) {
        const byte = (words[i] >> (8 * b)) & 0xff;
        hexArray.push(byte.toString(16).padStart(2, '0').toUpperCase());
      }
    }
    return hexArray.join('-');
  };

  const handleNextStep3 = async () => {
    if (isLoading) return;

    if (!street || !barangay || !city || !province) {
      Toast.show({
        type: "error",
        text1: "Please fill out all required fields",
      });
      return;
    }

    // Generate a random PASSWORD_CODE for the server
    const passwordCode = generateSalt(12); // e.g., "Lk9WBtfoq9Xg"

    // Encode passwords using the PASSWORD_CODE as salt
    const encodedPassword = encodePassword(password, passwordCode);
    const encodedCPassword = encodePassword(confirmPassword, passwordCode);

    setIsLoading(true);

    const payload = {
      ACCNO: accountNo,
      EMPNO: employeeNo,
      DIVNO: divisionNo,
      STANO: stationNo,
      EMAIL: 'marvirtlester.mb@gmail.com',
      NUMBER: mobile,
      FIRSTNAME: firstName,
      MIDDLENAME: middleName,
      LASTNAME: lastName,
      DATEOFBIRTH: birthDate.toISOString().split("T")[0],
      USERNAME: email,
      PASSWORD: encodedPassword,
      C_PASSWORD: encodedCPassword,
      PASSWORD_CODE: passwordCode, // send random code separately
      HOUSENO: houseNo,
      STREET: street,
      SUBDIVISION: subdivision,
      BARANGAY: barangay,
      CITY: city,
      PROVINCE: province,
      ZIPCODE: zipCode,
      IPADDRESS: '1',
    };

    // Log payload for debugging
    console.log("Registration payload:", payload);

    try {
      const res = await fetch(`${API_URL}api/OLMS/User/Registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${registrationToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // Log API response
      console.log("Registration API response:", data);

      if (data?.[0]?.RESPONSE_CODE === "E_0") {
        setCurrentStep(prev => prev + 1);
        Toast.show({
          type: "success",
          text1: data?.[0]?.RESPONSE_MESSAGE ?? "Registration successful",
        });
        router.push("/activation");
        return;
      } else {
        Toast.show({
          type: "error",
          text1: data?.[0]?.RESPONSE_MESSAGE ?? "Validation failed",
        });
      }
    } catch (err) {
      console.error("Registration API error:", err);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Random salt generator
  const generateSalt = (length: number) => {
    const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <MaterialIcons
                name={showPass ? "visibility" : "visibility-off"}
                size={20}
                color="#ff5a5f"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              secureTextEntry={!showConfirmPass}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
              <MaterialIcons
                name={showConfirmPass ? "visibility" : "visibility-off"}
                size={20}
                color="#ff5a5f"
              />
            </TouchableOpacity>
          </View>
        </>
      )}

      {currentStep === 2 && (
        <>
          <Text style={styles.label}>Account Number</Text>
          <View style={[styles.inputWrapper, styles.disabledInputWrapper]}>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={accountNo}
              editable={false}
            />
          </View>

          <Text style={styles.label}>House Number</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="House No"
              value={houseNo}
              onChangeText={setHouseNo}
            />
          </View>

          <Text style={styles.label}>Street *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Street"
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <Text style={styles.label}>Subdivision / Barangay *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Subdivision / Barangay"
              value={subdivision}
              onChangeText={setSubdivision}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Barangay"
              value={barangay}
              onChangeText={setBarangay}
            />
          </View>

          <Text style={styles.label}>City *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <Text style={styles.label}>Province *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Province"
              value={province}
              onChangeText={setProvince}
            />
          </View>

          <Text style={styles.label}>ZIP Code</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="ZIP"
              keyboardType="number-pad"
              value={zipCode}
              onChangeText={(text) => setZipCode(text.slice(0, 4))}
            />
          </View>
        </>
      )}

        {currentStep === 3 && (
          <View>
            {/* Scrollable T&C */}
            <View style={styles.termsBox}>
              <ScrollView>
                <Text style={[styles.label, { textAlign: "justify" }]}>
                  {TERMS_TEXT}
                </Text>
              </ScrollView>
            </View>

            {/* Agreement statement */}
            <Text style={[styles.label, { textAlign: "justify", marginTop: 12 }]}>
              I agree to the Terms and Conditions of the Manila Teachers’ Online Loan 
              Management System and certify that all information provided is true and 
              correct. I also acknowledge that I have read and fully understood the said 
              Terms and Conditions.
            </Text>

            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              style={styles.checkboxWrapper}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]} />
              <Text>I agree</Text>
            </TouchableOpacity>

          </View>
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

        {currentStep < steps.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextButton, isLoading && { opacity: 0.6 }]}
            onPress={() => {
              if (isLoading) return;

              if (currentStep === 0) handleNext();
              else if (currentStep === 1) handleNextStep2(password, confirmPassword);
              else if (currentStep === 2) setCurrentStep(prev => prev + 1); // move to T&C
            }}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? "Validating..." : "Next"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, isLoading && { opacity: 0.6 }]}
            onPress={() => {
              if (!agreedToTerms) {
                Toast.show({
                  type: "error",
                  text1: "You must agree to the Terms and Conditions",
                });
                return;
              }
              handleNextStep3();
            }}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? "Registering..." : "Register"}
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
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#ff5a5f",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#ff5a5f",
  },
  termsBox: {
    maxHeight: 200,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    marginBottom: 10
  },
});
