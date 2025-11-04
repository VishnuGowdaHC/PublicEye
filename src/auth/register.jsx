import React, { useState } from 'react';
import { TextInput, Text, View, Pressable, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';


export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    console.log('Register button pressed');
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      navigation.replace('CreateProfile')
      console.log('Registration successful');
    } catch (err) {
      console.error('Registration error:', err.code, err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Text className="text-white text-2xl font-bold">PublicEye</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-blue-500 text-base font-semibold">Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center px-6">
          <Text className="text-white text-4xl font-bold text-center mb-3">
            Create Account
          </Text>
          <Text className="text-gray-400 text-base text-center mb-8">
            Please enter your details to sign up
          </Text>

          {/* Email Input */}
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

          {/* Password Input */}
          <View className="bg-gray-800 rounded-xl mb-4 px-4 py-4">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="text-white text-base"
            />
          </View>

          {/* Confirm Password Input */}
          <View className="bg-gray-800 rounded-xl mb-6 px-4 py-4">
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              className="text-white text-base"
            />
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="bg-blue-500 rounded-xl py-4 items-center mb-6"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Continue</Text>
            )}
          </Pressable>

          {/* Login Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-blue-500 text-center text-base">
              Already have an account? Sign in here
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {error ? (
            <Text className="text-red-500 mt-4 text-center">{error}</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}