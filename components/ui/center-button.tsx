import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  size?: number;
  onPress?: () => void;
};

export default function CenterButton({ size = 70, onPress }: Props) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const showArc = useRef(new Animated.Value(0)).current;
  const circleAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const handlePress = () => {
    const toValue = expanded ? 0 : 1;

    rotateAnim.setValue(0);
    showArc.setValue(1);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(showArc, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.stagger(
      100,
      circleAnims.map((anim) =>
        Animated.spring(anim, { toValue, useNativeDriver: true, friction: 5 })
      )
    ).start();

    setExpanded(!expanded);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const opacity = showArc.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const positions = [
    { x: -70, y: -50 }, // left (security)
    { x: 0, y: -100 },  // center (loan)
    { x: 70, y: -50 },  // right (help)
  ];

  const icons = [
    { name: "shield-checkmark", color: "#ff5a5f", page: "/security" },
    { name: "cash-outline", color: "#ff5a5f", page: "/applyforloan" },
    { name: "help-circle-outline", color: "#ff5a5f", page: "/help" },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.outerContainer}>
        <Animated.View
          style={[
            styles.arc,
            {
              width: size + 2,
              height: size + 2,
              borderRadius: (size + 2) / 2,
              transform: [{ rotate: rotation }],
              opacity,
              borderTopColor: "#E9C589",
            },
          ]}
        />

        {positions.map((pos, index) => (
          <Animated.View
            key={index}
            style={[
              styles.extraCircle,
              {
                transform: [
                  {
                    translateX: circleAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, pos.x],
                    }),
                  },
                  {
                    translateY: circleAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, pos.y],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                router.push(icons[index].page as any);
                handlePress();
              }}
            >
              <Ionicons
                name={icons[index].name as any}
                size={32}
                color={icons[index].color}
              />
            </TouchableOpacity>
          </Animated.View>
        ))}

        <TouchableOpacity
          style={[
            styles.circle,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          onPress={handlePress}
        >
          <Image
            source={require("./mtmasola-icon.png")}
            style={{
              width: size,
              height: size,
              resizeMode: "contain",
              position: "absolute",
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  outerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#ff5a5f",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  arc: {
    position: "absolute",
    borderWidth: 4,
    borderColor: "transparent",
    borderTopColor: "#E9C589",
  },
  extraCircle: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 100,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#ff5a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
});
