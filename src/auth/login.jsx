import React, { useState } from 'react';
import { TextInput, Text, View, Pressable, ActivityIndicator, TouchableOpacity } from 'react-native';
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
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      console.log('Login successful', result.user.email);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="mb-4 border border-gray-300 rounded-md p-3"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="mb-4 border border-gray-300 rounded-md p-3"
      />
      <Pressable
        onPress={handleLogin}
        disabled={loading}
        className="bg-blue-600 rounded-md py-3 items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">Login</Text>
        )}
      </Pressable>
      <View className='flex justify-center items-center'>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')} 
          className="mt-4 justify-center items-center"
        >
          <Text className="text-blue-600">Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
      
      {error ? <Text className="text-red-600 mt-4">{error}</Text> : null}
    </View>
  );
}