import React from 'react';
import { View, Text } from 'react-native';

const HomeScreen = () => {
    return (
        <View className="flex-1 justify-center items-center bg-gray-100">
            <Text className="text-2xl font-bold">Welcome to Public Eye</Text>
            <Text className="text-base text-gray-600">Your homepage using NativeWind</Text>
        </View>
    );
};

export default HomeScreen;
