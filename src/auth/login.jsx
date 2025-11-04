import React, { useState } from 'react';
import { TextInput, Text, View, Pressable, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    console.log('Login button pressed');
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      console.log('Login successful');
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >

        <View className="flex-row items-center justify-between px-6 py-4">
          <Text className="text-white text-2xl font-bold">PublicEye</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-blue-500 text-base font-semibold">Sign up</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center px-6">
          <Text className="text-white text-4xl font-bold text-center mb-3">
            Welcome back
          </Text>
          <Text className="text-gray-400 text-base text-center mb-8">
            Please enter your email to sign in
          </Text>

          <View className="bg-gray-800 rounded-xl mb-4 px-4 py-4">
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="text-white text-base"
            />
          </View>

          <View className="bg-gray-800 rounded-xl mb-6 px-4 py-4">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="text-white text-base"
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="bg-blue-500 rounded-xl py-4 items-center mb-6"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Continue</Text>
            )}
          </Pressable>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-blue-500 text-center text-base">
              Don't have an account? Sign up here
            </Text>
          </TouchableOpacity>

          {error ? (
            <Text className="text-red-500 mt-4 text-center">{error}</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}