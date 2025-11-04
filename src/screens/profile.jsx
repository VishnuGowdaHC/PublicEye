import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [fullName, setFullName] = useState('Rohan Sharma');
  const [age, setAge] = useState('28');
  const [address, setAddress] = useState('45, 1st Main, Koramangala, Bangalore');
  const [phoneNumber, setPhoneNumber] = useState('(+91) 98765 43210');

  const handleSaveChanges = () => {
    console.log('Saving changes...');
    // Add your save logic here
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-6">
        <TouchableOpacity className="mr-4">
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-white text-2xl font-semibold text-center mr-10">
          Profile
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Profile Image */}
        <View className="items-center mb-6">
          <View className="relative">
            <View className="w-52 h-52 rounded-full bg-gray-200 items-center justify-center">
              <Feather name="image" size={60} color="#d1d5db" />
            </View>
            <TouchableOpacity className="absolute bottom-2 right-2 bg-blue-600 w-12 h-12 rounded-full items-center justify-center">
              <Feather name="copy" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-2xl font-semibold mt-6">
            {fullName}
          </Text>
          <Text className="text-gray-400 text-base mt-1">
            rohan.sharma@example.com
          </Text>
        </View>

        {/* Full Name Input */}
        <View className="mb-5">
          <Text className="text-gray-400 text-sm mb-2">Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            className="bg-slate-800 text-white text-base px-5 py-4 rounded-xl border border-slate-700"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Age Input */}
        <View className="mb-5">
          <Text className="text-gray-400 text-sm mb-2">Age</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            className="bg-slate-800 text-white text-base px-5 py-4 rounded-xl border border-slate-700"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Address Input */}
        <View className="mb-5">
          <Text className="text-gray-400 text-sm mb-2">Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            className="bg-slate-800 text-white text-base px-5 py-4 rounded-xl border border-slate-700"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Phone Number Input */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-2">Phone Number</Text>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            className="bg-slate-800 text-white text-base px-5 py-4 rounded-xl border border-slate-700"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveChanges}
          className="bg-blue-600 py-5 rounded-full mb-8"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Save Changes
          </Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
}