import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportForm() {      
    return (

        <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
            <View className="flex-1 justify-center items-center px-6">
                <Text className="text-white text-xl mb-4">Report Form</Text>
            </View>
        </SafeAreaView>
    );
}
