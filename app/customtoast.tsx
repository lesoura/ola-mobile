import { BlurView } from "expo-blur";
import * as React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// Type for each toast function
type ToastType = {
  text1?: string;
  text2?: string;
  [key: string]: any;
};

const CustomToastConfig: Record<string, (props: ToastType) => React.ReactNode> = {
  success: ({ text1, text2 }: ToastType) => (
    <BlurView intensity={95} tint="light" style={styles.toastContainer}>
      <Image source={require("@/components/ui/mtmasola-icon.png")} style={styles.icon} />
      <View style={[styles.content, { borderLeftColor: "#4BB543" }]}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </BlurView>
  ),

  error: ({ text1, text2 }: ToastType) => (
    <BlurView intensity={95} tint="light" style={styles.toastContainer}>
      <Image source={require("@/components/ui/mtmasola-icon.png")} style={styles.icon} />
      <View style={[styles.content, { borderLeftColor: "#FF5A5F" }]}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </BlurView>
  ),

  myCustom: ({ text1, text2 }: ToastType) => (
    <BlurView intensity={95} tint="dark" style={styles.toastContainer}>
      <Image source={require("@/components/ui/mtmasola-icon.png")} style={styles.icon} />
      <View style={[styles.content, { borderLeftColor: "#333" }]}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </BlurView>
  ),

  info: ({ text1, text2 }: ToastType) => (
    <BlurView intensity={95} tint="light" style={styles.toastContainer}>
      <Image source={require("@/components/ui/mtmasola-icon.png")} style={styles.icon} />
      <View style={[styles.content, { borderLeftColor: "#3498db" }]}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </BlurView>
  ),
};

export default CustomToastConfig;

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    width: "70%",
    marginHorizontal: 15,
    borderRadius: 40,
    paddingHorizontal: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  icon: {
    width: 45,
    height: 45,
    marginRight: 12,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    borderLeftWidth: 3,
    paddingLeft: 12,
    justifyContent: "center",
  },
  title: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
  message: {
    color: "#333",
    fontSize: 14,
    marginTop: 3,
  },
});
