import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseApp, firebaseAuth, db } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { getFirestore } from "firebase/firestore";

export default function RegisterScreen() {
  const auth = firebaseAuth;
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Account created successfully!");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      navigation.navigate("Login");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-6">Register</Text>

      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        onPress={handleRegister}
        disabled={loading}
        className={`p-3 rounded-lg mt-2 ${
          loading ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Creating..." : "Register"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text className="text-blue-600 text-center mt-4">
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}
