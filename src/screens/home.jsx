import React from 'react';
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
export default function HomeScreen() {
    const navigation = useNavigation();
  const reports = [
    {
      id: 1,
      title: 'Pothole on MG Road',
      time: '2 hours ago',
      status: 'Pending',
      votes: 2,
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      title: 'Broken Pavement in Koramangala',
      time: 'yesterday',
      status: 'Resolved',
      votes: 15,
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 3,
      title: 'Street Light Out in Indiranagar',
      time: '3 days ago',
      status: 'In Progress',
      votes: 8,
      image: 'https://via.placeholder.com/150'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-500';
      case 'Resolved': return 'text-green-500';
      case 'In Progress': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
  
      <View className="flex-row items-center justify-between px-4 py-4 bg-gray-800">
        <View className="flex-row items-center">
          <Ionicons name="eye-outline" size={32} color="#3B82F6" />
          <Text className="text-white text-2xl font-bold ml-2">PublicEye</Text>
        </View>
        <Ionicons name="notifications-outline" size={28} color="white" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {reports.map((report) => (
          <Pressable
            key={report.id}
            className="bg-gray-800 rounded-xl p-4 mb-4 flex-row"
          >
            <Image
              source={{ uri: report.image }}
              className="w-24 h-24 rounded-lg"
            />
            <View className="flex-1 ml-4">
              <Text className="text-white text-lg font-semibold">
                {report.title}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Reported {report.time}
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className={`font-semibold ${getStatusColor(report.status)}`}>
                  {report.status}
                </Text>
                <Text className="text-gray-400 ml-2">• {report.votes} votes</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable className="absolute bottom-5 right-5 bg-blue-500 rounded-full px-6 py-4 flex-row items-center shadow-lg"
        onPress={() => { navigation.navigate('ReportForm') }}
      > 
        <Ionicons name="add" size={24} color="white" />
        <Text className="text-white font-bold ml-2 text-base">Report Issue</Text>
      </Pressable>
    </SafeAreaView>
  );
}