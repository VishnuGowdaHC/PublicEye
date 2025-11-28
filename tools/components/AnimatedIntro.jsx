import { View, Animated, Easing, Image, StyleSheet } from "react-native";
import { useRef, useEffect } from "react";
import logo from "../../assets/logo.png";

export default function AnimatedSplash({ onFinish }) {
  // Native-only animations
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // JS-only animations (no native driver allowed)
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Native driver animations
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 5000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.15,
        duration: 5000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();

    // JS-driven glow animation (on separate wrapper)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false,
        }),
      ]),
      { iterations: 2 }
    ).start(() => {
      // Fade-out after glow
      Animated.timing(opacity, {
        toValue: 0,
        duration: 5000,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => onFinish?.());
    });
  }, []);

  // Glow interpolation (JS)
  const animatedBorderWidth = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  const animatedShadow = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* OUTER JS-ANIMATED WRAPPER (glow, border) */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            borderWidth: animatedBorderWidth,
            shadowOpacity: animatedShadow,
          },
        ]}
      >
        {/* INNER NATIVE-ANIMATED WRAPPER (scale + opacity) */}
        <Animated.View
          style={{
            transform: [{ scale }],
            opacity,
          }}
        >
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  outerGlow: {
    padding: 20,
    borderRadius: 200,
    borderColor: "#fff",
    shadowColor: "#fff",
    shadowRadius: 25,
    shadowOffset: { height: 0, width: 0 },
  },
  logo: {
    width: 140,
    height: 140,
  },
});
