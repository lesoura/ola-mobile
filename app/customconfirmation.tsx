import { BlurView } from "expo-blur";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ModalType = {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const CustomModalConfig: Record<string, (props: ModalType) => React.ReactNode> = {
  default: ({ title, message, onConfirm, onCancel }: ModalType) => (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <BlurView intensity={95} tint="light" style={styles.modalContainer}>
          <Image source={require("@/components/ui/mtmasola-icon.png")} style={styles.icon} />

          {title && <Text style={styles.title}>{title}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  ),
};

export default CustomModalConfig;

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    top: "30%",
    left: "10%",
    width: "80%",
    borderRadius: 25,
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContainer: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  icon: { width: 60, height: 60, marginBottom: 16, borderRadius: 30 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  message: { fontSize: 15, marginBottom: 16, textAlign: "center" },
  buttons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancel: { backgroundColor: "#ccc" },
  confirm: { backgroundColor: "#FF5A5F" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
