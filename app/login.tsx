import { useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import api from "./config/axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // scale animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputScale1 = useRef(new Animated.Value(1)).current;
  const inputScale2 = useRef(new Animated.Value(1)).current;

  const animateIn = (ref: Animated.Value) => {
    Animated.spring(ref, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = (ref: Animated.Value) => {
    Animated.spring(ref, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const router = useRouter(); // thêm dòng này vào trong component LoginScreen

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please enter your email or phone and password.");
      return;
    }

    const isEmail = identifier.includes("@");
    const payload = {
      email: isEmail ? identifier : undefined,
      phone: isEmail ? undefined : identifier,
      password,
    };

    try {
      const response = await api.post("/Auth/login", payload);
      const { token, refreshToken } = response.data;

      // Lưu token và refreshToken
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("refreshToken", refreshToken);

      // Không có user, nên bỏ dòng này nếu BE chưa trả về
      // await AsyncStorage.setItem("userInfo", JSON.stringify(user));

      router.push("/task");
    } catch (error: any) {
      Alert.alert(
        "Login failed",
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inner}>
          <Image
            source={require("../assets/zengarden-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Find your peace and stay focused 🌱
          </Text>

          <Animated.View
            style={[
              styles.animatedInput,
              { transform: [{ scale: inputScale1 }] },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Email or Phone"
              placeholderTextColor="#666"
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => animateIn(inputScale1)}
              onBlur={() => animateOut(inputScale1)}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.animatedInput,
              { transform: [{ scale: inputScale2 }] },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => animateIn(inputScale2)}
              onBlur={() => animateOut(inputScale2)}
            />
          </Animated.View>

          <Animated.View
            style={{ transform: [{ scale: buttonScale }], width: "100%" }}
          >
            <Pressable
              onPressIn={() => animateIn(buttonScale)}
              onPressOut={() => animateOut(buttonScale)}
              onPress={handleLogin}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FDF7",
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2F4F4F",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#5F9EA0",
    marginBottom: 24,
    textAlign: "center",
  },
  animatedInput: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#B0E0E6",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#7FC8A9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
